import { describe, expect, it } from 'vitest';
import { bandForScore, matchAll, matchOpportunity, MAX_SCORE, profileCompletion } from '../utils/matching';
import { getOpportunity, OPPORTUNITIES } from '../data/opportunities';
import { opportunity, profile } from './fixtures';
import type { MatchFactorId } from '../types';

function factorFor(id: MatchFactorId, result: ReturnType<typeof matchOpportunity>) {
  const found = result.factors.find((item) => item.id === id);
  if (!found) throw new Error(`No factor produced for ${id}`);
  return found;
}

describe('weights', () => {
  it('the six factors add up to a 100-point scale', () => {
    expect(MAX_SCORE).toBe(100);
  });
});

describe('a strong eligibility match', () => {
  const postgraduate = profile({
    educationLevel: 'postgraduate',
    studyArea: 'science',
    state: 'MH',
    incomeBand: 'two_5_to_5_lakh',
    marksBand: 'above_90',
    socialCategory: 'general',
    gender: 'female',
    supportNeeded: ['tuition'],
  });

  it('scores a well-suited opportunity at the top of the scale', () => {
    const scheme = getOpportunity('higher-education-research-grant')!;
    const result = matchOpportunity(postgraduate, scheme);

    expect(result.score).toBe(100);
    expect(result.conflicts).toHaveLength(0);
    expect(result.needsVerification).toHaveLength(0);
    expect(result.nextStepKey).toBe('next_step_ready');
  });

  it('explains every confirmed reason rather than only giving a number', () => {
    const scheme = getOpportunity('higher-education-research-grant')!;
    const result = matchOpportunity(postgraduate, scheme);

    expect(result.confirmedReasons.length).toBeGreaterThanOrEqual(5);
    for (const reason of result.confirmedReasons) {
      expect(reason.messageKey).toMatch(/^match\./);
    }
  });

  it('is deterministic: the same inputs always produce the same score', () => {
    const scheme = getOpportunity('higher-education-research-grant')!;
    const first = matchOpportunity(postgraduate, scheme);
    const second = matchOpportunity(postgraduate, scheme);
    expect(second).toEqual(first);
  });
});

describe('a definite eligibility conflict', () => {
  it('flags a State scheme as a conflict for a student in another State', () => {
    const student = profile({ educationLevel: 'undergraduate', state: 'KL' });
    const scheme = getOpportunity('state-education-support-maharashtra')!;
    const result = matchOpportunity(student, scheme);

    const location = factorFor('location', result);
    expect(location.outcome).toBe('conflict');
    expect(location.points).toBe(0);
    expect(result.conflicts).toContain(location);
    expect(result.nextStepKey).toBe('next_step_blocked');
  });

  it('flags an income band that is clearly above the stated limit', () => {
    const student = profile({
      educationLevel: 'undergraduate',
      state: 'MH',
      incomeBand: 'above_8_lakh',
    });
    const scheme = getOpportunity('means-family-support-grant')!;
    const income = factorFor('income', matchOpportunity(student, scheme));

    expect(income.outcome).toBe('conflict');
    expect(income.points).toBe(0);
  });

  it('flags a marks band that is entirely below the stated minimum', () => {
    const student = profile({
      educationLevel: 'class_11_12',
      state: 'UP',
      marksBand: 'from_50_to_60',
    });
    const scheme = getOpportunity('merit-national-toppers')!;
    const academic = factorFor('academic', matchOpportunity(student, scheme));

    expect(academic.outcome).toBe('conflict');
    expect(academic.values).toMatchObject({ min: '75' });
  });

  it('never removes a conflicting opportunity from the results list', () => {
    const student = profile({ educationLevel: 'undergraduate', state: 'KL' });
    const results = matchAll(student, OPPORTUNITIES);

    expect(results).toHaveLength(OPPORTUNITIES.length);
    expect(results.some((item) => item.opportunityId === 'state-education-support-maharashtra')).toBe(true);
  });
});

describe('unknown optional information', () => {
  it('treats an unanswered income question as something to verify, not a rejection', () => {
    const student = profile({ educationLevel: 'undergraduate', state: 'BR' });
    const scheme = getOpportunity('means-family-support-grant')!;
    const income = factorFor('income', matchOpportunity(student, scheme));

    expect(income.outcome).toBe('needs_verification');
    expect(income.points).toBe(income.maxPoints / 2);
  });

  it('treats an unanswered marks question as something to verify', () => {
    const student = profile({ educationLevel: 'class_11_12', state: 'UP', marksBand: 'not_sure' });
    const academic = factorFor('academic', matchOpportunity(student, getOpportunity('merit-national-toppers')!));

    expect(academic.outcome).toBe('needs_verification');
    expect(academic.messageKey).toBe('match.academic.unknown');
  });

  it('does not penalise a student who has stated no support preference', () => {
    const student = profile({ educationLevel: 'undergraduate', state: 'BR', supportNeeded: [] });
    const support = factorFor('support', matchOpportunity(student, opportunity()));

    expect(support.outcome).toBe('neutral');
    expect(support.points).toBe(support.maxPoints);
  });

  it('records a partial support match proportionally', () => {
    const student = profile({
      educationLevel: 'undergraduate',
      state: 'BR',
      supportNeeded: ['tuition', 'living_expenses'],
    });
    const support = factorFor('support', matchOpportunity(student, opportunity({ supportTypes: ['tuition'] })));

    expect(support.outcome).toBe('confirmed');
    expect(support.points).toBe(support.maxPoints / 2);
    expect(support.values).toMatchObject({ matched: '1', total: '2' });
  });
});

describe('"prefer not to say"', () => {
  it('never turns an undisclosed social category into a conflict', () => {
    const student = profile({
      educationLevel: 'undergraduate',
      state: 'OD',
      socialCategory: 'prefer_not_to_say',
      incomeBand: 'below_1_lakh',
    });
    const result = matchOpportunity(student, getOpportunity('post-matric-category-support')!);
    const eligibility = factorFor('eligibility', result);

    expect(eligibility.outcome).toBe('needs_verification');
    expect(result.conflicts).toHaveLength(0);
    expect(result.nextStepKey).toBe('next_step_verify');
  });

  it('never turns an undisclosed income band into a conflict', () => {
    const student = profile({
      educationLevel: 'undergraduate',
      state: 'OD',
      incomeBand: 'prefer_not_to_say',
    });
    const income = factorFor('income', matchOpportunity(student, getOpportunity('means-family-support-grant')!));

    expect(income.outcome).toBe('needs_verification');
    expect(income.messageKey).toBe('match.income.undisclosed');
  });

  it('never turns an undisclosed disability answer into a conflict', () => {
    const student = profile({ educationLevel: 'undergraduate', state: 'OD', disability: 'prefer_not_to_say' });
    const result = matchOpportunity(student, getOpportunity('students-with-disabilities')!);

    expect(factorFor('eligibility', result).outcome).toBe('needs_verification');
    expect(result.conflicts).toHaveLength(0);
  });

  it('still scores an undisclosed answer above a stated conflict', () => {
    const scheme = getOpportunity('students-with-disabilities')!;
    const undisclosed = matchOpportunity(
      profile({ educationLevel: 'undergraduate', state: 'OD', disability: 'prefer_not_to_say' }),
      scheme,
    );
    const stated = matchOpportunity(
      profile({ educationLevel: 'undergraduate', state: 'OD', disability: 'no' }),
      scheme,
    );

    expect(undisclosed.score).toBeGreaterThan(stated.score);
  });
});

describe('score boundaries', () => {
  it('produces 0 when every factor conflicts', () => {
    const student = profile({
      educationLevel: 'doctoral',
      state: 'KL',
      incomeBand: 'above_8_lakh',
      marksBand: 'below_50',
      gender: 'male',
      supportNeeded: ['tuition'],
    });
    const impossible = opportunity({
      educationLevels: ['class_9_10'],
      locations: ['MH'],
      income: { maxAnnualIncome: 100_000, label: { en: 'Up to ₹1 lakh', hi: '₹1 लाख तक' } },
      specialConditions: [{ kind: 'gender', anyOf: ['female'] }],
      marks: { minPercentage: 90, label: { en: 'At least 90%', hi: 'कम से कम 90%' } },
      supportTypes: ['digital_learning'],
    });

    const result = matchOpportunity(student, impossible);
    expect(result.score).toBe(0);
    expect(result.conflicts).toHaveLength(5);
    expect(result.nextStepKey).toBe('next_step_blocked');
  });

  it('produces 100 when every factor is confirmed', () => {
    const student = profile({
      educationLevel: 'undergraduate',
      state: 'MH',
      incomeBand: 'below_1_lakh',
      marksBand: 'above_90',
      gender: 'female',
      supportNeeded: ['tuition'],
    });
    const perfect = opportunity({
      educationLevels: ['undergraduate'],
      locations: ['MH'],
      income: { maxAnnualIncome: 500_000, label: { en: 'Up to ₹5 lakh', hi: '₹5 लाख तक' } },
      specialConditions: [{ kind: 'gender', anyOf: ['female'] }],
      marks: { minPercentage: 60, label: { en: 'At least 60%', hi: 'कम से कम 60%' } },
      supportTypes: ['tuition'],
    });

    expect(matchOpportunity(student, perfect).score).toBe(100);
  });

  it('keeps every score in the demonstration dataset within 0-100', () => {
    const student = profile({ educationLevel: 'undergraduate', state: 'MH', incomeBand: 'below_1_lakh' });
    for (const result of matchAll(student, OPPORTUNITIES)) {
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    }
  });

  it('sorts results by score, highest first, with a stable tie-break', () => {
    const student = profile({ educationLevel: 'undergraduate', state: 'MH', incomeBand: 'below_1_lakh' });
    const scores = matchAll(student, OPPORTUNITIES).map((item) => item.score);
    expect([...scores].sort((a, b) => b - a)).toEqual(scores);
  });

  it('bands a score, treating any conflict as a weak fit', () => {
    expect(bandForScore(85, false)).toBe('strong');
    expect(bandForScore(55, false)).toBe('moderate');
    expect(bandForScore(20, false)).toBe('low');
    expect(bandForScore(95, true)).toBe('low');
  });
});

describe('profile completion', () => {
  it('reports 0% for an untouched profile and 100% for a full one', () => {
    expect(profileCompletion(profile())).toBe(0);
    expect(
      profileCompletion(
        profile({
          educationLevel: 'undergraduate',
          studyArea: 'science',
          state: 'MH',
          incomeBand: 'below_1_lakh',
          marksBand: 'above_90',
          socialCategory: 'general',
          gender: 'female',
          supportNeeded: ['tuition'],
        }),
      ),
    ).toBe(100);
  });
});
