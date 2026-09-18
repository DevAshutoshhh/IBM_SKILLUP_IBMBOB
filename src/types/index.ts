/**
 * SaathiSetu domain types.
 *
 * Everything the app stores is deliberately coarse-grained: bands and
 * categories rather than exact figures, so that no directly identifying
 * information is ever held in the browser.
 */

export type Language = 'en' | 'hi';

/** A short string that exists in both supported languages. */
export interface Bilingual {
  en: string;
  hi: string;
}

export type EducationLevel =
  | 'class_9_10'
  | 'class_11_12'
  | 'iti_diploma'
  | 'undergraduate'
  | 'postgraduate'
  | 'doctoral';

export type StudyArea =
  | 'science'
  | 'commerce'
  | 'arts_humanities'
  | 'engineering'
  | 'medical_health'
  | 'management'
  | 'vocational'
  | 'other'
  | 'not_sure';

export type IncomeBand =
  | 'below_1_lakh'
  | 'one_to_2_5_lakh'
  | 'two_5_to_5_lakh'
  | 'five_to_8_lakh'
  | 'above_8_lakh'
  | 'prefer_not_to_say';

export type MarksBand =
  | 'below_50'
  | 'from_50_to_60'
  | 'from_60_to_75'
  | 'from_75_to_90'
  | 'above_90'
  | 'not_sure';

export type SocialCategory =
  | 'general'
  | 'ews'
  | 'obc'
  | 'sc'
  | 'st'
  | 'prefer_not_to_say';

export type Gender = 'female' | 'male' | 'other' | 'prefer_not_to_say';

/** Optional yes/no answers always allow an explicit "not answered" value. */
export type OptionalFlag = 'yes' | 'no' | 'prefer_not_to_say';

export type Locality = 'rural' | 'urban' | 'prefer_not_to_say';

export type SupportType =
  | 'tuition'
  | 'living_expenses'
  | 'study_materials'
  | 'digital_learning'
  | 'skill_development'
  | 'internship_career';

/** Short code for an Indian State / Union Territory, or the wildcard. */
export type StateCode = string;

export const ALL_INDIA: StateCode = 'ALL_INDIA';

export interface StudentProfile {
  educationLevel: EducationLevel | null;
  studyArea: StudyArea | null;
  state: StateCode | null;
  incomeBand: IncomeBand | null;
  marksBand: MarksBand | null;
  socialCategory: SocialCategory | null;
  gender: Gender | null;
  disability: OptionalFlag;
  minority: OptionalFlag;
  locality: Locality;
  supportNeeded: SupportType[];
  /** ISO timestamp of the last edit, used by the dashboard. */
  updatedAt: string | null;
}

/* ------------------------------------------------------------------ */
/* Opportunities                                                       */
/* ------------------------------------------------------------------ */

export type SupportCategory =
  | 'merit'
  | 'means'
  | 'post_matric'
  | 'women_technical'
  | 'disability'
  | 'minority'
  | 'rural'
  | 'digital'
  | 'vocational'
  | 'internship'
  | 'higher_education'
  | 'state_scheme';

export type DocumentId =
  | 'identity_proof'
  | 'student_id'
  | 'admission_proof'
  | 'previous_marksheet'
  | 'current_academic_record'
  | 'income_certificate'
  | 'domicile_certificate'
  | 'category_certificate'
  | 'disability_certificate'
  | 'minority_certificate'
  | 'fee_receipt'
  | 'bank_account_proof'
  | 'photograph'
  | 'personal_statement'
  | 'recommendation_letter';

export interface DocumentDefinition {
  id: DocumentId;
  label: Bilingual;
  /** Plain-language reason the document is usually asked for. */
  why: Bilingual;
  /** Documents that commonly carry a validity period and expire. */
  expires: boolean;
}

/** A condition on an attribute the student may have chosen not to disclose. */
export type SpecialCondition =
  | { kind: 'social_category'; anyOf: SocialCategory[] }
  | { kind: 'gender'; anyOf: Gender[] }
  | { kind: 'disability' }
  | { kind: 'minority' }
  | { kind: 'locality'; anyOf: Locality[] }
  | { kind: 'study_area'; anyOf: StudyArea[] };

export interface IncomeCondition {
  /** Upper limit of annual family income in rupees; null means no limit stated. */
  maxAnnualIncome: number | null;
  label: Bilingual;
}

export interface MarksCondition {
  /** Minimum aggregate percentage; null means no academic cut-off stated. */
  minPercentage: number | null;
  label: Bilingual;
}

export interface Opportunity {
  id: string;
  name: Bilingual;
  provider: Bilingual;
  description: Bilingual;
  category: SupportCategory;
  supportTypes: SupportType[];
  educationLevels: EducationLevel[];
  /** `[ALL_INDIA]` or a list of State/UT codes. */
  locations: StateCode[];
  income: IncomeCondition;
  specialConditions: SpecialCondition[];
  marks: MarksCondition;
  requiredDocuments: DocumentId[];
  optionalDocuments: DocumentId[];
  applicationSteps: Bilingual[];
  officialUrl: string;
  /** ISO date, or null when the demo dataset cannot state a date. */
  deadline: string | null;
  lastVerified: string;
  tags: string[];
  /** Always true in this prototype: the dataset is illustrative. */
  isDemoData: true;
}

/* ------------------------------------------------------------------ */
/* Matching                                                            */
/* ------------------------------------------------------------------ */

export type MatchFactorId =
  | 'education_level'
  | 'location'
  | 'income'
  | 'eligibility'
  | 'academic'
  | 'support';

export type MatchOutcome = 'confirmed' | 'needs_verification' | 'conflict' | 'neutral';

export interface MatchFactor {
  id: MatchFactorId;
  outcome: MatchOutcome;
  /** Points awarded out of `maxPoints`. */
  points: number;
  maxPoints: number;
  /** i18n key for the explanation sentence. */
  messageKey: string;
  /** Interpolation values for the message. */
  values?: Record<string, string>;
}

export type NextStepKey =
  | 'next_step_blocked'
  | 'next_step_verify'
  | 'next_step_prepare'
  | 'next_step_ready';

export interface MatchResult {
  opportunityId: string;
  /** 0-100, rounded. A preparation aid — never an official decision. */
  score: number;
  factors: MatchFactor[];
  confirmedReasons: MatchFactor[];
  needsVerification: MatchFactor[];
  conflicts: MatchFactor[];
  nextStepKey: NextStepKey;
}

/* ------------------------------------------------------------------ */
/* Document readiness                                                  */
/* ------------------------------------------------------------------ */

export type DocumentStatus = 'ready' | 'needs_renewal' | 'not_available' | 'not_applicable';

/** Map of document id -> status, stored per opportunity. */
export type ChecklistState = Partial<Record<DocumentId, DocumentStatus>>;

/** All checklists, keyed by opportunity id. */
export type ChecklistStore = Record<string, ChecklistState>;

export interface ChecklistItemSummary {
  documentId: DocumentId;
  status: DocumentStatus;
  required: boolean;
}

export interface ReadinessSummary {
  /** 0-100. Required documents only; "not applicable" items are excluded. */
  score: number;
  readyCount: number;
  renewalCount: number;
  missingCount: number;
  notApplicableCount: number;
  requiredCount: number;
  /** Required documents that are missing or expiring, most urgent first. */
  priorities: ChecklistItemSummary[];
  items: ChecklistItemSummary[];
}

/* ------------------------------------------------------------------ */
/* App state                                                           */
/* ------------------------------------------------------------------ */

export type PageId =
  | 'home'
  | 'profile'
  | 'matches'
  | 'compare'
  | 'documents'
  | 'plan'
  | 'coach'
  | 'dashboard';

/* ------------------------------------------------------------------ */
/* Application Coach                                                    */
/* ------------------------------------------------------------------ */

/**
 * Each coaching action has a stable ID so completion state can be stored
 * without coupling it to the ordered list index.
 */
export type CoachActionKind =
  | 'verify_condition'  // confirm an eligibility condition on the official portal
  | 'collect_document'  // gather a missing document
  | 'renew_document'    // renew an expiring document
  | 'check_official'    // open the official page and verify current rules
  | 'apply';            // submit the application

export interface CoachAction {
  /** Stable ID: e.g. "verify_condition:gender", "collect_document:income_certificate" */
  id: string;
  kind: CoachActionKind;
  /** i18n key for the action label (rendered by CoachPage, not by this type) */
  labelKey: string;
  /** Interpolation values for labelKey */
  labelValues?: Record<string, string>;
  /** i18n key explaining *why* this action is needed */
  whyKey: string;
  whyValues?: Record<string, string>;
  /** Priority order within its section — lower is more urgent */
  priority: number;
}

/** Map of coachActionId -> completed boolean, per opportunity */
export type CoachProgress = Partial<Record<string, boolean>>;

/** All coach progress records, keyed by opportunityId */
export type CoachStore = Record<string, CoachProgress>;

export interface AppState {
  profile: StudentProfile;
  bookmarks: string[];
  compareIds: string[];
  selectedOpportunityId: string | null;
  checklists: ChecklistStore;
  coachProgress: CoachStore;
  language: Language;
}
