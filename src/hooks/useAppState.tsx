import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createTranslator, type Translator } from '../i18n';
import {
  clearState,
  EMPTY_PROFILE,
  INITIAL_STATE,
  loadState,
  saveState,
  storageAvailable,
} from '../utils/storage';
import { buildInitialChecklist } from '../utils/readiness';
import { getOpportunity } from '../data/opportunities';
import type {
  AppState,
  DocumentId,
  DocumentStatus,
  Language,
  StudentProfile,
} from '../types';

// CoachStore is manipulated directly via plain objects; no extra import needed.

export const MAX_COMPARE = 3;

interface AppStateContextValue {
  state: AppState;
  language: Language;
  t: Translator;
  canPersist: boolean;
  setLanguage: (language: Language) => void;
  updateProfile: (patch: Partial<StudentProfile>) => void;
  resetProfile: () => void;
  toggleBookmark: (opportunityId: string) => void;
  toggleCompare: (opportunityId: string) => void;
  clearCompare: () => void;
  selectOpportunity: (opportunityId: string | null) => void;
  setDocumentStatus: (opportunityId: string, documentId: DocumentId, status: DocumentStatus) => void;
  setCoachActionDone: (opportunityId: string, actionId: string, done: boolean) => void;
  resetCoachProgress: (opportunityId: string) => void;
  deleteAllData: () => void;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => loadState());
  const [canPersist] = useState<boolean>(() => storageAvailable());
  const skipNextSave = useRef(false);

  // A single write on every change keeps localStorage and memory in step
  // without scattering storage calls through the component tree.
  useEffect(() => {
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    saveState(state);
  }, [state]);

  useEffect(() => {
    document.documentElement.lang = state.language === 'hi' ? 'hi-IN' : 'en-IN';
  }, [state.language]);

  const setLanguage = useCallback((language: Language) => {
    setState((current) => ({ ...current, language }));
  }, []);

  const updateProfile = useCallback((patch: Partial<StudentProfile>) => {
    setState((current) => ({
      ...current,
      profile: { ...current.profile, ...patch, updatedAt: new Date().toISOString() },
    }));
  }, []);

  const resetProfile = useCallback(() => {
    setState((current) => ({ ...current, profile: EMPTY_PROFILE }));
  }, []);

  const toggleBookmark = useCallback((opportunityId: string) => {
    setState((current) => ({
      ...current,
      bookmarks: current.bookmarks.includes(opportunityId)
        ? current.bookmarks.filter((id) => id !== opportunityId)
        : [...current.bookmarks, opportunityId],
    }));
  }, []);

  const toggleCompare = useCallback((opportunityId: string) => {
    setState((current) => {
      if (current.compareIds.includes(opportunityId)) {
        return { ...current, compareIds: current.compareIds.filter((id) => id !== opportunityId) };
      }
      if (current.compareIds.length >= MAX_COMPARE) return current;
      return { ...current, compareIds: [...current.compareIds, opportunityId] };
    });
  }, []);

  const clearCompare = useCallback(() => {
    setState((current) => ({ ...current, compareIds: [] }));
  }, []);

  const selectOpportunity = useCallback((opportunityId: string | null) => {
    setState((current) => {
      if (!opportunityId) return { ...current, selectedOpportunityId: null };
      const opportunity = getOpportunity(opportunityId);
      const checklists = { ...current.checklists };
      // Seed the checklist the first time an application is chosen so the
      // student sees sensible "not applicable" defaults straight away.
      if (opportunity && !checklists[opportunityId]) {
        checklists[opportunityId] = buildInitialChecklist(opportunity, current.profile);
      }
      return { ...current, selectedOpportunityId: opportunityId, checklists };
    });
  }, []);

  const setDocumentStatus = useCallback(
    (opportunityId: string, documentId: DocumentId, status: DocumentStatus) => {
      setState((current) => ({
        ...current,
        checklists: {
          ...current.checklists,
          [opportunityId]: { ...(current.checklists[opportunityId] ?? {}), [documentId]: status },
        },
      }));
    },
    [],
  );

  const setCoachActionDone = useCallback(
    (opportunityId: string, actionId: string, done: boolean) => {
      setState((current) => ({
        ...current,
        coachProgress: {
          ...current.coachProgress,
          [opportunityId]: {
            ...(current.coachProgress[opportunityId] ?? {}),
            [actionId]: done,
          },
        },
      }));
    },
    [],
  );

  const resetCoachProgress = useCallback((opportunityId: string) => {
    setState((current) => ({
      ...current,
      coachProgress: {
        ...current.coachProgress,
        [opportunityId]: {},
      },
    }));
  }, []);

  const deleteAllData = useCallback(() => {
    clearState();
    // Updating in-memory state normally triggers persistence. Skip that one
    // write so "delete everything" leaves no SaathiSetu key behind.
    skipNextSave.current = true;
    setState((current) => ({ ...INITIAL_STATE, language: current.language }));
  }, []);

  const t = useMemo(() => createTranslator(state.language), [state.language]);

  const value = useMemo<AppStateContextValue>(
    () => ({
      state,
      language: state.language,
      t,
      canPersist,
      setLanguage,
      updateProfile,
      resetProfile,
      toggleBookmark,
      toggleCompare,
      clearCompare,
      selectOpportunity,
      setDocumentStatus,
      setCoachActionDone,
      resetCoachProgress,
      deleteAllData,
    }),
    [
      state,
      t,
      canPersist,
      setLanguage,
      updateProfile,
      resetProfile,
      toggleBookmark,
      toggleCompare,
      clearCompare,
      selectOpportunity,
      setDocumentStatus,
      setCoachActionDone,
      resetCoachProgress,
      deleteAllData,
    ],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppStateContextValue {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used inside an AppStateProvider');
  }
  return context;
}

/** Convenience hook for components that only need translation. */
export function useTranslation(): { t: Translator; language: Language } {
  const { t, language } = useAppState();
  return { t, language };
}
