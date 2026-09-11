import { getIncomeRange, getMarksRange } from '../data/bands';
import {
  ALL_INDIA,
  type MatchFactor,
  type MatchResult,
  type NextStepKey,
  type Opportunity,
  type SpecialCondition,
  type StudentProfile,
} from '../types';

/**
 * Deterministic, explainable rule-based matching.
 *
 * Design rules that the whole application depends on:
 *
 * 1. The same profile and the same opportunity always produce the same score.
 *    Nothing here is random, time-dependent or model-driven.
 * 2. A missing answer or "prefer not to say" NEVER disqualifies a student. It
 *    produces a `needs_verification` factor worth half the weight, so the
 *    student still sees the opportunity and is told exactly what to check.
 * 3. Only a clear contradiction between a stated answer and a stated condition
 *    produces a `conflict`, which scores zero for that factor.
 * 4. The resulting percentage is a preparation aid. It is never presented as an
 *    official eligibility decision.
 */

export const MATCH_WEIGHTS = {
  education_level: 25,
  location: 15,
  income: 20,
  eligibility: 15,
  academic: 10,
  support: 15,
} as const;

/** Fraction of a weight awarded when a condition cannot be confirmed either way. */
const UNVERIFIED_CREDIT = 0.5;

export const MAX_SCORE = Object.values(MATCH_WEIGHTS).reduce((sum, weight) => sum + weight, 0);

function factor(
  id: MatchFactor['id'],
  outcome: MatchFactor['outcome'],
  points: number,
  messageKey: string,
  values?: Record<string, string>,
): MatchFactor {
  return { id, outcome, points, maxPoints: MATCH_WEIGHTS[id], messageKey, values };
}

/* ------------------------------------------------------------------ */
/* Individual factors                                                  */
/* ------------------------------------------------------------------ */

function scoreEducation(profile: StudentProfile, opportunity: Opportunity): MatchFactor {
  const weight = MATCH_WEIGHTS.education_level;
  if (!profile.educationLevel) {
    return factor('education_level', 'needs_verification', weight * UNVERIFIED_CREDIT, 'match.education.unknown');
  }
  if (opportunity.educationLevels.includes(profile.educationLevel)) {
    return factor('education_level', 'confirmed', weight, 'match.education.match', {
      level: `@education.${profile.educationLevel}`,
    });
  }
  return factor('education_level', 'conflict', 0, 'match.education.conflict', {
    level: `@education.${profile.educationLevel}`,
  });
}

function scoreLocation(profile: StudentProfile, opportunity: Opportunity): MatchFactor {
  const weight = MATCH_WEIGHTS.location;
  if (opportunity.locations.includes(ALL_INDIA)) {
    return factor('location', 'confirmed', weight, 'match.location.allIndia');
  }
  if (!profile.state) {
    return factor('location', 'needs_verification', weight * UNVERIFIED_CREDIT, 'match.location.unknown');
  }
  if (opportunity.locations.includes(profile.state)) {
    return factor('location', 'confirmed', weight, 'match.location.match', {
      state: `#state:${profile.state}`,
    });
  }
  return factor('location', 'conflict', 0, 'match.location.conflict', {
    state: `#state:${profile.state}`,
  });
}

function scoreIncome(profile: StudentProfile, opportunity: Opportunity): MatchFactor {
  const weight = MATCH_WEIGHTS.income;
  const limit = opportunity.income.maxAnnualIncome;

  if (limit === null) {
    return factor('income', 'confirmed', weight, 'match.income.noLimit');
  }
  const limitText = `#money:${limit}`;

  if (!profile.incomeBand || profile.incomeBand === 'prefer_not_to_say') {
    return factor('income', 'needs_verification', weight * UNVERIFIED_CREDIT, 'match.income.undisclosed', {
      limit: limitText,
    });
  }
  const range = getIncomeRange(profile.incomeBand);
  if (!range) {
    return factor('income', 'needs_verification', weight * UNVERIFIED_CREDIT, 'match.income.undisclosed', {
      limit: limitText,
    });
  }
  if (range.max <= limit) {
    return factor('income', 'confirmed', weight, 'match.income.within', { limit: limitText });
  }
  if (range.min >= limit) {
    return factor('income', 'conflict', 0, 'match.income.above', { limit: limitText });
  }
  return factor('income', 'needs_verification', weight * UNVERIFIED_CREDIT, 'match.income.overlap', {
    limit: limitText,
  });
}

type ConditionOutcome = 'confirmed' | 'needs_verification' | 'conflict';

function evaluateCondition(condition: SpecialCondition, profile: StudentProfile): ConditionOutcome {
  switch (condition.kind) {
    case 'social_category': {
      if (!profile.socialCategory || profile.socialCategory === 'prefer_not_to_say') return 'needs_verification';
      return condition.anyOf.includes(profile.socialCategory) ? 'confirmed' : 'conflict';
    }
    case 'gender': {
      if (!profile.gender || profile.gender === 'prefer_not_to_say') return 'needs_verification';
      return condition.anyOf.includes(profile.gender) ? 'confirmed' : 'conflict';
    }
    case 'disability': {
      if (profile.disability === 'prefer_not_to_say') return 'needs_verification';
      return profile.disability === 'yes' ? 'confirmed' : 'conflict';
    }
    case 'minority': {
      if (profile.minority === 'prefer_not_to_say') return 'needs_verification';
      return profile.minority === 'yes' ? 'confirmed' : 'conflict';
    }
    case 'locality': {
      if (profile.locality === 'prefer_not_to_say') return 'needs_verification';
      return condition.anyOf.includes(profile.locality) ? 'confirmed' : 'conflict';
    }
    case 'study_area': {
      if (!profile.studyArea || profile.studyArea === 'not_sure') return 'needs_verification';
      return condition.anyOf.includes(profile.studyArea) ? 'confirmed' : 'conflict';
    }
    default:
      return 'needs_verification';
  }
}

/** A short i18n key naming the condition, used in explanation sentences. */
function conditionKey(condition: SpecialCondition): string {
  return `@condition.${condition.kind}`;
}

function scoreEligibility(profile: StudentProfile, opportunity: Opportunity): MatchFactor {
  const weight = MATCH_WEIGHTS.eligibility;
  const conditions = opportunity.specialConditions;

  if (conditions.length === 0) {
    return factor('eligibility', 'confirmed', weight, 'match.eligibility.open');
  }

  const outcomes = conditions.map((condition) => ({
    condition,
    outcome: evaluateCondition(condition, profile),
  }));

  const conflicting = outcomes.filter((entry) => entry.outcome === 'conflict');
  if (conflicting.length > 0) {
    return factor('eligibility', 'conflict', 0, 'match.eligibility.conflict', {
      conditions: conflicting.map((entry) => conditionKey(entry.condition)).join('|'),
    });
  }

  const unverified = outcomes.filter((entry) => entry.outcome === 'needs_verification');
  if (unverified.length > 0) {
    return factor('eligibility', 'needs_verification', weight * UNVERIFIED_CREDIT, 'match.eligibility.unknown', {
      conditions: unverified.map((entry) => conditionKey(entry.condition)).join('|'),
    });
  }

  return factor('eligibility', 'confirmed', weight, 'match.eligibility.match', {
    conditions: outcomes.map((entry) => conditionKey(entry.condition)).join('|'),
  });
}

function scoreAcademic(profile: StudentProfile, opportunity: Opportunity): MatchFactor {
  const weight = MATCH_WEIGHTS.academic;
  const minimum = opportunity.marks.minPercentage;

  if (minimum === null) {
    return factor('academic', 'confirmed', weight, 'match.academic.noCutoff');
  }
  const minText = String(minimum);

  if (!profile.marksBand || profile.marksBand === 'not_sure') {
    return factor('academic', 'needs_verification', weight * UNVERIFIED_CREDIT, 'match.academic.unknown', {
      min: minText,
    });
  }
  const range = getMarksRange(profile.marksBand);
  if (!range) {
    return factor('academic', 'needs_verification', weight * UNVERIFIED_CREDIT, 'match.academic.unknown', {
      min: minText,
    });
  }
  if (range.min >= minimum) {
    return factor('academic', 'confirmed', weight, 'match.academic.meets', { min: minText });
  }
  if (range.max <= minimum) {
    return factor('academic', 'conflict', 0, 'match.academic.below', { min: minText });
  }
  return factor('academic', 'needs_verification', weight * UNVERIFIED_CREDIT, 'match.academic.overlap', {
    min: minText,
  });
}

function scoreSupport(profile: StudentProfile, opportunity: Opportunity): MatchFactor {
  const weight = MATCH_WEIGHTS.support;
  const requested = profile.supportNeeded;

  if (requested.length === 0) {
    return factor('support', 'neutral', weight, 'match.support.noPreference');
  }
  const matched = requested.filter((type) => opportunity.supportTypes.includes(type));

  if (matched.length === 0) {
    return factor('support', 'neutral', 0, 'match.support.none');
  }
  const points = (weight * matched.length) / requested.length;

  if (matched.length === requested.length) {
    return factor('support', 'confirmed', points, 'match.support.all');
  }
  return factor('support', 'confirmed', points, 'match.support.partial', {
    matched: String(matched.length),
    total: String(requested.length),
  });
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

function decideNextStep(score: number, conflicts: MatchFactor[], unverified: MatchFactor[]): NextStepKey {
  if (conflicts.length > 0) return 'next_step_blocked';
  if (unverified.length > 0) return 'next_step_verify';
  if (score >= 80) return 'next_step_ready';
  return 'next_step_prepare';
}

export function matchOpportunity(profile: StudentProfile, opportunity: Opportunity): MatchResult {
  const factors: MatchFactor[] = [
    scoreEducation(profile, opportunity),
    scoreLocation(profile, opportunity),
    scoreIncome(profile, opportunity),
    scoreEligibility(profile, opportunity),
    scoreAcademic(profile, opportunity),
    scoreSupport(profile, opportunity),
  ];

  const total = factors.reduce((sum, item) => sum + item.points, 0);
  const score = Math.max(0, Math.min(100, Math.round((total / MAX_SCORE) * 100)));

  const confirmedReasons = factors.filter((item) => item.outcome === 'confirmed');
  const needsVerification = factors.filter((item) => item.outcome === 'needs_verification');
  const conflicts = factors.filter((item) => item.outcome === 'conflict');

  return {
    opportunityId: opportunity.id,
    score,
    factors,
    confirmedReasons,
    needsVerification,
    conflicts,
    nextStepKey: decideNextStep(score, conflicts, needsVerification),
  };
}

/** Matches a profile against a list of opportunities, best score first. */
export function matchAll(profile: StudentProfile, opportunities: Opportunity[]): MatchResult[] {
  return opportunities
    .map((opportunity) => matchOpportunity(profile, opportunity))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      // Stable, deterministic tie-break so the order never shuffles between renders.
      return a.opportunityId.localeCompare(b.opportunityId);
    });
}

/** Band label used by the interface: high / moderate / low preparation fit. */
export type MatchBand = 'strong' | 'moderate' | 'low';

export function bandForScore(score: number, hasConflicts: boolean): MatchBand {
  if (hasConflicts) return 'low';
  if (score >= 70) return 'strong';
  if (score >= 40) return 'moderate';
  return 'low';
}

/** Fields that count towards the dashboard's profile-completion figure. */
const COMPLETION_FIELDS: (keyof StudentProfile)[] = [
  'educationLevel',
  'studyArea',
  'state',
  'incomeBand',
  'marksBand',
  'socialCategory',
  'gender',
  'supportNeeded',
];

export function profileCompletion(profile: StudentProfile): number {
  const answered = COMPLETION_FIELDS.filter((field) => {
    const value = profile[field];
    if (Array.isArray(value)) return value.length > 0;
    return value !== null && value !== undefined;
  }).length;
  return Math.round((answered / COMPLETION_FIELDS.length) * 100);
}

/** True once the wizard has collected enough to produce meaningful matches. */
export function isProfileUsable(profile: StudentProfile): boolean {
  return profile.educationLevel !== null && profile.state !== null;
}
