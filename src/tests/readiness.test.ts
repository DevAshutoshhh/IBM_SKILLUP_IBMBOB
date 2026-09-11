import { describe, expect, it } from 'vitest';
import {
  buildInitialChecklist,
  checklistDocuments,
  readinessFor,
  suggestedStatus,
  summariseReadiness,
} from '../utils/readiness';
import { opportunity, profile } from './fixtures';
import type { ChecklistState, DocumentId, DocumentStatus } from '../types';

const FOUR_DOCUMENTS: DocumentId[] = [
  'identity_proof',
  'income_certificate',
  'admission_proof',
  'bank_account_proof',
];

function checklistOf(status: DocumentStatus, documents = FOUR_DOCUMENTS): ChecklistState {
  return Object.fromEntries(documents.map((id) => [id, status]));
}

const scheme = opportunity({
  requiredDocuments: FOUR_DOCUMENTS,
  optionalDocuments: ['photograph'],
});

describe('a checklist with nothing ready', () => {
  it('scores 0 and lists every required document as a priority', () => {
    const summary = summariseReadiness(scheme, checklistOf('not_available'));

    expect(summary.score).toBe(0);
    expect(summary.readyCount).toBe(0);
    expect(summary.missingCount).toBe(4);
    expect(summary.priorities).toHaveLength(4);
  });

  it('treats an untouched checklist the same as an explicitly empty one', () => {
    expect(summariseReadiness(scheme, {}).score).toBe(0);
  });
});

describe('a checklist with everything ready', () => {
  it('scores 100 and has nothing left to do', () => {
    const summary = summariseReadiness(scheme, checklistOf('ready'));

    expect(summary.score).toBe(100);
    expect(summary.readyCount).toBe(4);
    expect(summary.missingCount).toBe(0);
    expect(summary.priorities).toHaveLength(0);
  });

  it('ignores optional documents when scoring', () => {
    const summary = summariseReadiness(scheme, {
      ...checklistOf('ready'),
      photograph: 'not_available',
    });

    expect(summary.score).toBe(100);
    expect(summary.requiredCount).toBe(4);
  });
});

describe('the "needs renewal" status', () => {
  it('counts as half a document, because the student has it but cannot use it yet', () => {
    const summary = summariseReadiness(scheme, {
      identity_proof: 'ready',
      income_certificate: 'needs_renewal',
      admission_proof: 'ready',
      bank_account_proof: 'ready',
    });

    expect(summary.score).toBe(88);
    expect(summary.renewalCount).toBe(1);
  });

  it('scores 50 when everything needs renewing', () => {
    expect(summariseReadiness(scheme, checklistOf('needs_renewal')).score).toBe(50);
  });

  it('lists missing documents before expiring ones in the next-actions order', () => {
    const summary = summariseReadiness(scheme, {
      identity_proof: 'needs_renewal',
      income_certificate: 'not_available',
      admission_proof: 'ready',
      bank_account_proof: 'ready',
    });

    expect(summary.priorities.map((item) => item.documentId)).toEqual([
      'income_certificate',
      'identity_proof',
    ]);
  });
});

describe('"not applicable" documents', () => {
  it('leaves them out of the score entirely', () => {
    const summary = summariseReadiness(scheme, {
      identity_proof: 'ready',
      income_certificate: 'ready',
      admission_proof: 'not_applicable',
      bank_account_proof: 'not_applicable',
    });

    expect(summary.score).toBe(100);
    expect(summary.notApplicableCount).toBe(2);
  });

  it('reports full readiness when nothing is left to collect', () => {
    expect(summariseReadiness(scheme, checklistOf('not_applicable')).score).toBe(100);
  });
});

describe('personalised starting checklists', () => {
  it('pre-marks a category certificate as not applicable for a General-category student', () => {
    expect(suggestedStatus('category_certificate', profile({ socialCategory: 'general' }))).toBe(
      'not_applicable',
    );
  });

  it('leaves the category certificate open when the student did not disclose a category', () => {
    expect(suggestedStatus('category_certificate', profile({ socialCategory: 'prefer_not_to_say' }))).toBeNull();
  });

  it('pre-marks a disability certificate as not applicable only when the student said no', () => {
    expect(suggestedStatus('disability_certificate', profile({ disability: 'no' }))).toBe('not_applicable');
    expect(suggestedStatus('disability_certificate', profile({ disability: 'prefer_not_to_say' }))).toBeNull();
  });

  it('builds a starting checklist covering every document the opportunity mentions', () => {
    const initial = buildInitialChecklist(scheme, profile());
    expect(Object.keys(initial)).toHaveLength(checklistDocuments(scheme).length);
  });

  it('falls back to a generated checklist for an opportunity the student has not opened', () => {
    const summary = readinessFor(scheme, {}, profile({ socialCategory: 'general' }));
    expect(summary.score).toBe(0);
    expect(summary.requiredCount).toBe(4);
  });
});
