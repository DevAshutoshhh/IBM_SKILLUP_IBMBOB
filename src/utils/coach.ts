import type { CoachAction, CoachProgress, MatchResult, Opportunity } from '../types';
import { checklistDocuments } from './readiness';

/**
 * Sentinel prefix used in `whyKey` when the why-text is the document's own
 * bilingual `why` field rather than a flat i18n key.  The rendering layer
 * detects this prefix and resolves it via getDocument().
 */
export const DOCUMENT_WHY_PREFIX = 'doc:';

/**
 * Guided Application Coach — action-plan builder.
 *
 * Given an Opportunity, its MatchResult and the student's checklist for it,
 * this module produces an ordered list of CoachAction items. Each action has:
 *
 *   - a stable ID (used to store completion state in localStorage)
 *   - a kind (verify_condition | collect_document | renew_document |
 *             check_official | apply)
 *   - i18n keys for label and why, with interpolation values already resolved
 *     to the values the page will pass to the translator
 *   - a priority number (lower = more urgent, determines ordering within a section)
 *
 * Design rules:
 *   1. Nothing here is language-dependent. Keys and interpolation values are
 *      plain strings that the rendering layer feeds into the translator.
 *   2. Documents that are already "ready" or "not_applicable" are omitted.
 *   3. Missing documents are always listed before expiring ones.
 *   4. Verify-condition actions are one per unverified eligibility factor.
 *   5. The check_official and apply actions are always present at the end.
 *   6. No document is ever requested to be uploaded — these are tasks, not
 *      file-collection actions.
 */

/* ------------------------------------------------------------------ */
/* Document actions                                                    */
/* ------------------------------------------------------------------ */

/**
 * Builds one CoachAction per document that is either missing (not_available)
 * or needs renewal. Documents already marked ready or not_applicable are
 * skipped. Required documents come before optional ones; within each group
 * missing < renewal.
 */
export function buildDocumentActions(
  opportunity: Opportunity,
  checklist: Record<string, string>,
): CoachAction[] {
  const docs = checklistDocuments(opportunity);
  const actions: CoachAction[] = [];

  // Priority encoding: required=0/1, optional=10/11; 0/10=missing, 1/11=renewal
  for (const { id: docId, required } of docs) {
    const status = checklist[docId] ?? 'not_available';
    if (status === 'ready' || status === 'not_applicable') continue;

    const base = required ? 0 : 10;

    if (status === 'not_available') {
      actions.push({
        id: `collect_document:${docId}`,
        kind: 'collect_document',
        labelKey: 'coach.action.collect',
        labelValues: { document: docId },
        // DOCUMENT_WHY_PREFIX signals the renderer to call getDocument(id).why
        whyKey: `${DOCUMENT_WHY_PREFIX}${docId}`,
        priority: base,
      });
    } else if (status === 'needs_renewal') {
      actions.push({
        id: `renew_document:${docId}`,
        kind: 'renew_document',
        labelKey: 'coach.action.renew',
        labelValues: { document: docId },
        whyKey: `${DOCUMENT_WHY_PREFIX}${docId}`,
        priority: base + 1,
      });
    }
  }

  return actions.sort((a, b) => a.priority - b.priority);
}

/* ------------------------------------------------------------------ */
/* Eligibility-verification actions                                    */
/* ------------------------------------------------------------------ */

/**
 * Converts needs_verification MatchFactor items into CoachActions.
 * One action per unverified factor. Conflict factors are intentionally
 * excluded — the user is already warned in the UI that a conflict exists;
 * there is nothing to "complete" for a hard conflict.
 */
export function buildVerifyActions(result: MatchResult): CoachAction[] {
  return result.needsVerification.map((factor, index) => ({
    id: `verify_condition:${factor.id}`,
    kind: 'verify_condition' as const,
    labelKey: 'coach.action.verifyCondition',
    labelValues: { condition: `@condition.${factor.id}` },
    whyKey: factor.messageKey,
    whyValues: factor.values,
    priority: index,
  }));
}

/* ------------------------------------------------------------------ */
/* Application-step actions                                            */
/* ------------------------------------------------------------------ */

/**
 * The final section always contains:
 *   1. check_official — open the official page and verify rules/dates
 *   2. apply — submit the application
 */
export function buildApplyActions(): CoachAction[] {
  return [
    {
      id: 'check_official',
      kind: 'check_official',
      labelKey: 'coach.action.checkOfficial',
      whyKey: 'plan.step.checkOfficial',
      priority: 0,
    },
    {
      id: 'apply',
      kind: 'apply',
      labelKey: 'coach.action.apply',
      whyKey: 'plan.step.apply',
      priority: 1,
    },
  ];
}

/* ------------------------------------------------------------------ */
/* Progress calculation                                                */
/* ------------------------------------------------------------------ */

export interface CoachPlan {
  verifyActions: CoachAction[];
  documentActions: CoachAction[];
  applyActions: CoachAction[];
  allActions: CoachAction[];
}

/** Assemble the full ordered plan for one opportunity. */
export function buildCoachPlan(
  opportunity: Opportunity,
  result: MatchResult,
  checklist: Record<string, string>,
): CoachPlan {
  const verifyActions = buildVerifyActions(result);
  const documentActions = buildDocumentActions(opportunity, checklist);
  const applyActions = buildApplyActions();
  return {
    verifyActions,
    documentActions,
    applyActions,
    allActions: [...verifyActions, ...documentActions, ...applyActions],
  };
}

/** Count how many actions have been marked done. */
export function countCompleted(actions: CoachAction[], progress: CoachProgress): number {
  return actions.filter((a) => progress[a.id] === true).length;
}

/** 0-100 integer completion percentage. */
export function coachCompletionPct(actions: CoachAction[], progress: CoachProgress): number {
  if (actions.length === 0) return 100;
  return Math.round((countCompleted(actions, progress) / actions.length) * 100);
}
