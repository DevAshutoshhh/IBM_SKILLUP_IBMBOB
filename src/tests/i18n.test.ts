import { describe, expect, it } from 'vitest';
import { createTranslator, explainFactor, formatDate, pick, translate } from '../i18n';
import { en } from '../i18n/en';
import { hi } from '../i18n/hi';
import { matchOpportunity } from '../utils/matching';
import { getOpportunity } from '../data/opportunities';
import { profile } from './fixtures';

describe('translation lookup', () => {
  it('returns the Hindi string when one exists', () => {
    expect(translate('hi', 'app.name')).toBe('साथीसेतु');
    expect(translate('en', 'app.name')).toBe('SaathiSetu');
  });

  it('interpolates named values into a template', () => {
    expect(translate('en', 'common.stepOf', { current: 2, total: 5 })).toBe('Step 2 of 5');
    expect(translate('hi', 'common.stepOf', { current: 2, total: 5 })).toBe('चरण 2 / 5');
  });

  it('leaves a placeholder alone when no value is supplied for it', () => {
    expect(translate('en', 'common.stepOf', { current: 2 })).toBe('Step 2 of {total}');
  });
});

describe('translation fallback', () => {
  it('falls back to English for a key the Hindi locale does not define', () => {
    expect(hi['error.details']).toBeUndefined();
    expect(translate('hi', 'error.details')).toBe(en['error.details']);
  });

  it('returns the key itself for a string that exists in no locale, rather than crashing', () => {
    expect(translate('en', 'this.key.does.not.exist')).toBe('this.key.does.not.exist');
    expect(translate('hi', 'this.key.does.not.exist')).toBe('this.key.does.not.exist');
  });

  it('falls back for an unrecognised language code', () => {
    expect(translate('de' as 'en', 'app.name')).toBe('SaathiSetu');
  });

  it('defines every English key that the Hindi locale claims to translate', () => {
    const englishKeys = new Set(Object.keys(en));
    const orphans = Object.keys(hi).filter((key) => !englishKeys.has(key));
    expect(orphans).toEqual([]);
  });

  it('translates the great majority of the interface into Hindi', () => {
    const coverage = Object.keys(en).filter((key) => key in hi).length / Object.keys(en).length;
    expect(coverage).toBeGreaterThan(0.95);
  });
});

describe('bilingual data', () => {
  it('picks the requested language and falls back to English if a translation is blank', () => {
    expect(pick({ en: 'Income certificate', hi: 'आय प्रमाणपत्र' }, 'hi')).toBe('आय प्रमाणपत्र');
    expect(pick({ en: 'Income certificate', hi: '' }, 'hi')).toBe('Income certificate');
  });
});

describe('match explanations', () => {
  const student = profile({
    educationLevel: 'undergraduate',
    state: 'MH',
    incomeBand: 'below_1_lakh',
    supportNeeded: ['tuition'],
  });

  it('resolves education-level tokens into readable prose in both languages', () => {
    const result = matchOpportunity(student, getOpportunity('state-education-support-maharashtra')!);
    const education = result.factors.find((factor) => factor.id === 'education_level')!;

    expect(explainFactor(education, 'en')).toBe(
      'You are studying at Undergraduate degree level, which this opportunity covers.',
    );
    expect(explainFactor(education, 'hi')).toContain('स्नातक');
  });

  it('resolves a State code into the State name in the current language', () => {
    const result = matchOpportunity(student, getOpportunity('state-education-support-maharashtra')!);
    const location = result.factors.find((factor) => factor.id === 'location')!;

    expect(explainFactor(location, 'en')).toContain('Maharashtra');
    expect(explainFactor(location, 'hi')).toContain('महाराष्ट्र');
  });

  it('formats a rupee limit using the local unit word', () => {
    const result = matchOpportunity(student, getOpportunity('means-family-support-grant')!);
    const income = result.factors.find((factor) => factor.id === 'income')!;

    expect(explainFactor(income, 'en')).toContain('₹2.5 lakh');
    expect(explainFactor(income, 'hi')).toContain('₹2.5 लाख');
  });

  it('never leaves a raw token in a rendered explanation', () => {
    const result = matchOpportunity(student, getOpportunity('women-technical-education')!);
    for (const factor of result.factors) {
      const sentence = explainFactor(factor, 'en');
      expect(sentence).not.toMatch(/[@#]/);
      expect(sentence).not.toMatch(/\{\w+\}/);
    }
  });
});

describe('the translator helper', () => {
  it('binds a language once so components do not have to pass it around', () => {
    const t = createTranslator('hi');
    expect(t('nav.home')).toBe('होम');
  });
});

describe('date formatting', () => {
  it('formats an ISO date for the chosen locale', () => {
    expect(formatDate('2027-01-31', 'en')).toContain('2027');
    expect(formatDate('2027-01-31', 'hi')).toContain('2027');
  });

  it('returns the original value for an unparseable date rather than "Invalid Date"', () => {
    expect(formatDate('not-a-date', 'en')).toBe('not-a-date');
  });
});
