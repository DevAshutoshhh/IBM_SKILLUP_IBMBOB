import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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
  deleteAllData: () => void;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => loadState());
  const [canPersist] = useState<boolean>(() => storageAvailable());

  // A single write on every change keeps localStorage and memory in step
  // without scattering storage calls through the component tree.
  useEffect(() => {
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

  const deleteAllData = useCallback(() => {
    clearState();
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
