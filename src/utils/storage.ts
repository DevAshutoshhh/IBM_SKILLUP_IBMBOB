import type { AppState, StudentProfile } from '../types';

/**
 * The only persistence layer in SaathiSetu.
 *
 * Everything lives in this browser's localStorage under a single namespaced
 * key. Nothing is sent anywhere: there is no backend, no analytics call and no
 * third-party script that could read it. Clearing the key removes every trace
 * the app has kept.
 */

export const STORAGE_KEY = 'saathisetu.state.v1';

export const EMPTY_PROFILE: StudentProfile = {
  educationLevel: null,
  studyArea: null,
  state: null,
  incomeBand: null,
  marksBand: null,
  socialCategory: null,
  gender: null,
  disability: 'prefer_not_to_say',
  minority: 'prefer_not_to_say',
  locality: 'prefer_not_to_say',
  supportNeeded: [],
  updatedAt: null,
};

export const INITIAL_STATE: AppState = {
  profile: EMPTY_PROFILE,
  bookmarks: [],
  compareIds: [],
  selectedOpportunityId: null,
  checklists: {},
  language: 'en',
};

function isStorageAvailable(): boolean {
  try {
    const probe = '__saathisetu_probe__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    // Private browsing modes and locked-down browsers throw here. The app must
    // still work — it simply will not remember anything between visits.
    return false;
  }
}

export const storageAvailable = (): boolean =>
  typeof window !== 'undefined' && isStorageAvailable();

/** Merges stored data over the defaults so older saved states stay loadable. */
function reconcile(raw: unknown): AppState {
  if (typeof raw !== 'object' || raw === null) return INITIAL_STATE;
  const value = raw as Partial<AppState>;

  return {
    profile: { ...EMPTY_PROFILE, ...(value.profile ?? {}) },
    bookmarks: Array.isArray(value.bookmarks) ? value.bookmarks.filter((id) => typeof id === 'string') : [],
    compareIds: Array.isArray(value.compareIds)
      ? value.compareIds.filter((id) => typeof id === 'string').slice(0, 3)
      : [],
    selectedOpportunityId:
      typeof value.selectedOpportunityId === 'string' ? value.selectedOpportunityId : null,
    checklists:
      typeof value.checklists === 'object' && value.checklists !== null ? value.checklists : {},
    language: value.language === 'hi' ? 'hi' : 'en',
  };
}

export function loadState(): AppState {
  if (!storageAvailable()) return INITIAL_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STATE;
    return reconcile(JSON.parse(raw));
  } catch {
    // Corrupted or hand-edited data should never break the app.
    return INITIAL_STATE;
  }
}

export function saveState(state: AppState): boolean {
  if (!storageAvailable()) return false;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

/** Removes every piece of data SaathiSetu has stored in this browser. */
export function clearState(): void {
  if (!storageAvailable()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing further to do: there is no other copy of the data anywhere.
  }
}

/** Plain-language inventory used by the privacy panel. */
export function describeStoredData(state: AppState): { key: string; count: number }[] {
  const profileAnswers = Object.entries(state.profile).filter(([field, value]) => {
    if (field === 'updatedAt') return false;
    if (Array.isArray(value)) return value.length > 0;
    return value !== null && value !== 'prefer_not_to_say';
  }).length;

  return [
    { key: 'privacy.item.profile', count: profileAnswers },
    { key: 'privacy.item.bookmarks', count: state.bookmarks.length },
    { key: 'privacy.item.checklists', count: Object.keys(state.checklists).length },
    { key: 'privacy.item.selection', count: state.selectedOpportunityId ? 1 : 0 },
  ];
}
