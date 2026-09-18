import { describe, expect, it, vi } from 'vitest';
import {
  clearState,
  describeStoredData,
  EMPTY_PROFILE,
  INITIAL_STATE,
  loadState,
  saveState,
  STORAGE_KEY,
  storageAvailable,
} from '../utils/storage';
import type { AppState } from '../types';

function stateWith(overrides: Partial<AppState> = {}): AppState {
  return { ...INITIAL_STATE, ...overrides };
}

describe('localStorage persistence', () => {
  it('starts from a clean, empty state when nothing has been stored', () => {
    expect(loadState()).toEqual(INITIAL_STATE);
  });

  it('round-trips a profile, bookmarks and checklists through localStorage', () => {
    const saved = stateWith({
      profile: { ...EMPTY_PROFILE, educationLevel: 'undergraduate', state: 'MH', supportNeeded: ['tuition'] },
      bookmarks: ['merit-national-toppers'],
      selectedOpportunityId: 'merit-national-toppers',
      checklists: { 'merit-national-toppers': { identity_proof: 'ready' } },
      language: 'hi',
    });

    expect(saveState(saved)).toBe(true);
    expect(loadState()).toEqual(saved);
  });

  it('writes to one namespaced key and nothing else', () => {
    saveState(stateWith({ bookmarks: ['digital-learning-access'] }));

    expect(window.localStorage.length).toBe(1);
    expect(window.localStorage.key(0)).toBe(STORAGE_KEY);
  });

  it('removes every trace of the student when the data is deleted', () => {
    saveState(stateWith({ bookmarks: ['digital-learning-access'], language: 'hi' }));
    clearState();

    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(loadState()).toEqual(INITIAL_STATE);
  });

  it('recovers from corrupted stored data instead of crashing', () => {
    window.localStorage.setItem(STORAGE_KEY, '{ this is not json');
    expect(loadState()).toEqual(INITIAL_STATE);
  });

  it('fills in missing fields when loading a state saved by an older version', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ profile: { educationLevel: 'doctoral' } }));
    const loaded = loadState();

    expect(loaded.profile.educationLevel).toBe('doctoral');
    expect(loaded.profile.disability).toBe('prefer_not_to_say');
    expect(loaded.bookmarks).toEqual([]);
    expect(loaded.language).toBe('en');
  });

  it('never restores more than three comparison entries', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ compareIds: ['a', 'b', 'c', 'd', 'e'] }));
    expect(loadState().compareIds).toHaveLength(3);
  });

  it('keeps working when the browser blocks storage entirely', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    expect(storageAvailable()).toBe(false);
    expect(saveState(INITIAL_STATE)).toBe(false);
    expect(loadState()).toEqual(INITIAL_STATE);

    setItem.mockRestore();
  });
});

describe('the stored-data inventory shown in the privacy panel', () => {
  it('counts only answers the student actually gave', () => {
    const inventory = describeStoredData(
      stateWith({
        profile: { ...EMPTY_PROFILE, educationLevel: 'undergraduate', state: 'MH' },
        bookmarks: ['a', 'b'],
        checklists: { a: { identity_proof: 'ready' } },
        selectedOpportunityId: 'a',
      }),
    );

    expect(inventory).toEqual([
      { key: 'privacy.item.profile', count: 2 },
      { key: 'privacy.item.bookmarks', count: 2 },
      { key: 'privacy.item.checklists', count: 1 },
      { key: 'privacy.item.selection', count: 1 },
      { key: 'privacy.item.coach', count: 0 },
    ]);
  });

  it('does not count "prefer not to say" as data the student disclosed', () => {
    const inventory = describeStoredData(stateWith({ profile: EMPTY_PROFILE }));
    expect(inventory[0]).toEqual({ key: 'privacy.item.profile', count: 0 });
  });
});
