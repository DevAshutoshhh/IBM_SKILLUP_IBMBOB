import {
  type ChecklistItemSummary,
  type ChecklistState,
  type DocumentId,
  type DocumentStatus,
  type Opportunity,
  type ReadinessSummary,
  type StudentProfile,
} from '../types';

/**
 * Document readiness scoring.
 *
 * SaathiSetu never receives a document. The student simply tells the app what
 * they already have, and the app turns that into a score and an ordered list
 * of things to collect next.
 */

/** Contribution of each status towards the readiness score. */
const STATUS_WEIGHT: Record<Exclude<DocumentStatus, 'not_applicable'>, number> = {
  ready: 1,
  needs_renewal: 0.5,
  not_available: 0,
};

export const DEFAULT_STATUS: DocumentStatus = 'not_available';

/**
 * Documents a student cannot reasonably be expected to hold, given what they
 * told the wizard. Pre-marking these as "not applicable" avoids showing a
 * student a certificate they will never need.
 */
export function suggestedStatus(
  documentId: DocumentId,
  profile: StudentProfile,
): DocumentStatus | null {
  if (documentId === 'disability_certificate' && profile.disability === 'no') return 'not_applicable';
  if (documentId === 'minority_certificate' && profile.minority === 'no') return 'not_applicable';
  if (
    documentId === 'category_certificate' &&
    (profile.socialCategory === 'general' || profile.socialCategory === null)
  ) {
    return 'not_applicable';
  }
  return null;
}

/** Every document an opportunity mentions, required ones first. */
export function checklistDocuments(opportunity: Opportunity): { id: DocumentId; required: boolean }[] {
  const required = opportunity.requiredDocuments.map((id) => ({ id, required: true }));
  const optional = opportunity.optionalDocuments
    .filter((id) => !opportunity.requiredDocuments.includes(id))
    .map((id) => ({ id, required: false }));
  return [...required, ...optional];
}

/** Builds the starting checklist for an opportunity, honouring profile hints. */
export function buildInitialChecklist(
  opportunity: Opportunity,
  profile: StudentProfile,
): ChecklistState {
  const state: ChecklistState = {};
  for (const entry of checklistDocuments(opportunity)) {
    state[entry.id] = suggestedStatus(entry.id, profile) ?? DEFAULT_STATUS;
  }
  return state;
}

/** Orders the "do this next" list: missing documents before expiring ones. */
const PRIORITY_ORDER: DocumentStatus[] = ['not_available', 'needs_renewal', 'ready', 'not_applicable'];

export function summariseReadiness(
  opportunity: Opportunity,
  checklist: ChecklistState,
): ReadinessSummary {
  const entries = checklistDocuments(opportunity);

  const items: ChecklistItemSummary[] = entries.map((entry) => ({
    documentId: entry.id,
    required: entry.required,
    status: checklist[entry.id] ?? DEFAULT_STATUS,
  }));

  const requiredItems = items.filter((item) => item.required);
  const scored = requiredItems.filter((item) => item.status !== 'not_applicable');

  const earned = scored.reduce(
    (sum, item) => sum + STATUS_WEIGHT[item.status as Exclude<DocumentStatus, 'not_applicable'>],
    0,
  );
  // With nothing left to collect the student is, correctly, fully ready.
  const score = scored.length === 0 ? 100 : Math.round((earned / scored.length) * 100);

  const priorities = requiredItems
    .filter((item) => item.status === 'not_available' || item.status === 'needs_renewal')
    .sort((a, b) => PRIORITY_ORDER.indexOf(a.status) - PRIORITY_ORDER.indexOf(b.status));

  return {
    score,
    readyCount: items.filter((item) => item.status === 'ready').length,
    renewalCount: items.filter((item) => item.status === 'needs_renewal').length,
    missingCount: requiredItems.filter((item) => item.status === 'not_available').length,
    notApplicableCount: items.filter((item) => item.status === 'not_applicable').length,
    requiredCount: requiredItems.length,
    priorities,
    items,
  };
}

/** Readiness for an opportunity the student has not opened yet. */
export function readinessFor(
  opportunity: Opportunity,
  checklists: Record<string, ChecklistState>,
  profile: StudentProfile,
): ReadinessSummary {
  const saved = checklists[opportunity.id];
  return summariseReadiness(opportunity, saved ?? buildInitialChecklist(opportunity, profile));
}
