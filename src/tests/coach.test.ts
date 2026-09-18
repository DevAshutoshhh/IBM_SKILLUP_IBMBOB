import { describe, expect, it } from 'vitest';
import {
  buildCoachPlan,
  buildDocumentActions,
  buildVerifyActions,
  buildApplyActions,
  coachCompletionPct,
  countCompleted,
} from '../utils/coach';
import { getOpportunity, OPPORTUNITIES } from '../data/opportunities';
import { matchOpportunity } from '../utils/matching';
import { buildInitialChecklist } from '../utils/readiness';
import { opportunity, profile } from './fixtures';
import type { CoachProgress } from '../types';

/* ------------------------------------------------------------------ */
/* buildDocumentActions                                                 */
/* ------------------------------------------------------------------ */

describe('buildDocumentActions', () => {
  it('produces a collect action for every not_available required document', () => {
    const opp = opportunity({
      requiredDocuments: ['identity_proof', 'income_certificate'],
      optionalDocuments: [],
    });
    const checklist = { identity_proof: 'not_available', income_certificate: 'not_available' };
    const actions = buildDocumentActions(opp, checklist);
    expect(actions).toHaveLength(2);
    expect(actions.every((a) => a.kind === 'collect_document')).toBe(true);
  });

  it('produces a renew action for a needs_renewal document', () => {
    const opp = opportunity({
      requiredDocuments: ['income_certificate'],
      optionalDocuments: [],
    });
    const checklist = { income_certificate: 'needs_renewal' };
    const actions = buildDocumentActions(opp, checklist);
    expect(actions).toHaveLength(1);
    expect(actions[0].kind).toBe('renew_document');
    expect(actions[0].id).toBe('renew_document:income_certificate');
  });

  it('omits documents that are already ready', () => {
    const opp = opportunity({
      requiredDocuments: ['identity_proof', 'photograph'],
      optionalDocuments: [],
    });
    const checklist = { identity_proof: 'ready', photograph: 'not_available' };
    const actions = buildDocumentActions(opp, checklist);
    expect(actions).toHaveLength(1);
    expect(actions[0].labelValues?.document).toBe('photograph');
  });

  it('omits documents that are not_applicable', () => {
    const opp = opportunity({
      requiredDocuments: ['disability_certificate'],
      optionalDocuments: [],
    });
    const checklist = { disability_certificate: 'not_applicable' };
    const actions = buildDocumentActions(opp, checklist);
    expect(actions).toHaveLength(0);
  });

  it('orders missing documents before expiring ones within required docs', () => {
    const opp = opportunity({
      requiredDocuments: ['income_certificate', 'identity_proof'],
      optionalDocuments: [],
    });
    const checklist = { income_certificate: 'needs_renewal', identity_proof: 'not_available' };
    const actions = buildDocumentActions(opp, checklist);
    expect(actions[0].kind).toBe('collect_document');
    expect(actions[1].kind).toBe('renew_document');
  });

  it('puts optional documents after required ones', () => {
    const opp = opportunity({
      requiredDocuments: [],
      optionalDocuments: ['photograph'],
    });
    const checklist = { photograph: 'not_available' };
    const actions = buildDocumentActions(opp, checklist);
    expect(actions).toHaveLength(1);
    expect(actions[0].priority).toBeGreaterThanOrEqual(10);
  });

  it('defaults a missing checklist entry to not_available', () => {
    const opp = opportunity({
      requiredDocuments: ['bank_account_proof'],
      optionalDocuments: [],
    });
    // Checklist deliberately has no entry for bank_account_proof
    const actions = buildDocumentActions(opp, {});
    expect(actions).toHaveLength(1);
    expect(actions[0].kind).toBe('collect_document');
  });

  it('assigns stable IDs that include the document name', () => {
    const opp = opportunity({
      requiredDocuments: ['fee_receipt'],
      optionalDocuments: [],
    });
    const checklist = { fee_receipt: 'not_available' };
    const actions = buildDocumentActions(opp, checklist);
    expect(actions[0].id).toBe('collect_document:fee_receipt');
  });
});

/* ------------------------------------------------------------------ */
/* buildVerifyActions                                                   */
/* ------------------------------------------------------------------ */

describe('buildVerifyActions', () => {
  it('creates one action per needs_verification factor', () => {
    const student = profile({ educationLevel: 'undergraduate', state: 'UP' });
    const scheme = getOpportunity('means-family-support-grant')!;
    const result = matchOpportunity(student, scheme);
    const verifyActions = buildVerifyActions(result);

    expect(verifyActions.length).toBe(result.needsVerification.length);
    verifyActions.forEach((a) => expect(a.kind).toBe('verify_condition'));
  });

  it('uses stable IDs based on factor id', () => {
    const student = profile({ educationLevel: 'undergraduate', state: 'UP' });
    const scheme = getOpportunity('means-family-support-grant')!;
    const result = matchOpportunity(student, scheme);
    const actions = buildVerifyActions(result);

    for (const action of actions) {
      expect(action.id).toMatch(/^verify_condition:/);
    }
  });

  it('produces no verify actions when all factors are confirmed', () => {
    const student = profile({
      educationLevel: 'postgraduate',
      studyArea: 'science',
      state: 'MH',
      incomeBand: 'two_5_to_5_lakh',
      marksBand: 'above_90',
      socialCategory: 'general',
      gender: 'female',
      supportNeeded: ['tuition'],
    });
    const scheme = getOpportunity('higher-education-research-grant')!;
    const result = matchOpportunity(student, scheme);
    expect(buildVerifyActions(result)).toHaveLength(0);
  });

  it('does not create verify actions for conflict factors', () => {
    const student = profile({ educationLevel: 'undergraduate', state: 'KL' });
    const scheme = getOpportunity('state-education-support-maharashtra')!;
    const result = matchOpportunity(student, scheme);
    // There IS a conflict (location), and no needs_verification items in the
    // location factor. Verify actions should correspond only to needsVerification.
    const actions = buildVerifyActions(result);
    expect(actions.length).toBe(result.needsVerification.length);
    // The conflict factor (location) must NOT appear as a verify action.
    expect(actions.some((a) => a.id === 'verify_condition:location')).toBe(false);
  });
});

/* ------------------------------------------------------------------ */
/* buildApplyActions                                                    */
/* ------------------------------------------------------------------ */

describe('buildApplyActions', () => {
  it('always returns exactly two actions: check_official and apply', () => {
    const actions = buildApplyActions();
    expect(actions).toHaveLength(2);
    expect(actions[0].kind).toBe('check_official');
    expect(actions[1].kind).toBe('apply');
  });

  it('uses stable IDs', () => {
    const actions = buildApplyActions();
    expect(actions[0].id).toBe('check_official');
    expect(actions[1].id).toBe('apply');
  });
});

/* ------------------------------------------------------------------ */
/* buildCoachPlan                                                       */
/* ------------------------------------------------------------------ */

describe('buildCoachPlan', () => {
  it('allActions equals the sum of the three sections', () => {
    const student = profile({ educationLevel: 'undergraduate', state: 'MH' });
    const opp = getOpportunity('means-family-support-grant')!;
    const result = matchOpportunity(student, opp);
    const checklist = buildInitialChecklist(opp, student) as Record<string, string>;
    const plan = buildCoachPlan(opp, result, checklist);

    expect(plan.allActions.length).toBe(
      plan.verifyActions.length + plan.documentActions.length + plan.applyActions.length,
    );
  });

  it('always has at least two apply actions (check_official + apply)', () => {
    const student = profile({ educationLevel: 'undergraduate', state: 'MH' });
    const opp = getOpportunity('means-family-support-grant')!;
    const result = matchOpportunity(student, opp);
    const checklist = buildInitialChecklist(opp, student) as Record<string, string>;
    const plan = buildCoachPlan(opp, result, checklist);

    expect(plan.applyActions).toHaveLength(2);
  });

  it('produces a non-empty plan for every opportunity in the dataset', () => {
    const student = profile({ educationLevel: 'undergraduate', state: 'MH' });
    for (const opp of OPPORTUNITIES) {
      const result = matchOpportunity(student, opp);
      const checklist = buildInitialChecklist(opp, student) as Record<string, string>;
      const plan = buildCoachPlan(opp, result, checklist);
      // Must always have at least the two apply actions.
      expect(plan.allActions.length).toBeGreaterThanOrEqual(2);
    }
  });
});

/* ------------------------------------------------------------------ */
/* countCompleted / coachCompletionPct                                  */
/* ------------------------------------------------------------------ */

describe('countCompleted', () => {
  it('returns 0 when no actions are marked done', () => {
    const student = profile({ educationLevel: 'undergraduate', state: 'MH' });
    const opp = getOpportunity('means-family-support-grant')!;
    const result = matchOpportunity(student, opp);
    const checklist = buildInitialChecklist(opp, student) as Record<string, string>;
    const plan = buildCoachPlan(opp, result, checklist);
    expect(countCompleted(plan.allActions, {})).toBe(0);
  });

  it('counts exactly the marked-done actions', () => {
    const student = profile({ educationLevel: 'undergraduate', state: 'MH' });
    const opp = getOpportunity('means-family-support-grant')!;
    const result = matchOpportunity(student, opp);
    const checklist = buildInitialChecklist(opp, student) as Record<string, string>;
    const plan = buildCoachPlan(opp, result, checklist);

    const progress: CoachProgress = {
      check_official: true,
      apply: true,
    };
    expect(countCompleted(plan.allActions, progress)).toBe(2);
  });
});

describe('coachCompletionPct', () => {
  it('returns 100 when action list is empty', () => {
    expect(coachCompletionPct([], {})).toBe(100);
  });

  it('returns 0 when nothing is done', () => {
    const actions = buildApplyActions();
    expect(coachCompletionPct(actions, {})).toBe(0);
  });

  it('returns 50 when half the actions are done', () => {
    const actions = buildApplyActions(); // 2 actions
    const progress: CoachProgress = { check_official: true };
    expect(coachCompletionPct(actions, progress)).toBe(50);
  });

  it('returns 100 when all actions are done', () => {
    const actions = buildApplyActions();
    const progress: CoachProgress = { check_official: true, apply: true };
    expect(coachCompletionPct(actions, progress)).toBe(100);
  });

  it('stays within 0-100 for every opportunity in the dataset', () => {
    const student = profile({ educationLevel: 'undergraduate', state: 'MH' });
    for (const opp of OPPORTUNITIES) {
      const result = matchOpportunity(student, opp);
      const checklist = buildInitialChecklist(opp, student) as Record<string, string>;
      const { allActions } = buildCoachPlan(opp, result, checklist);
      const pct = coachCompletionPct(allActions, {});
      expect(pct).toBeGreaterThanOrEqual(0);
      expect(pct).toBeLessThanOrEqual(100);
    }
  });
});
