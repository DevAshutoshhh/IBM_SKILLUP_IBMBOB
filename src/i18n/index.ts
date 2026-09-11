import { formatIncomeLimit } from '../data/bands';
import { getStateLabel } from '../data/states';
import type { Bilingual, Language, MatchFactor } from '../types';
import { en, type TranslationDictionary } from './en';
import { hi } from './hi';

export type { TranslationKey } from './en';

const DICTIONARIES: Record<Language, TranslationDictionary> = {
  en: en as unknown as TranslationDictionary,
  hi,
};

export const LANGUAGES: { code: Language; label: string; htmlLang: string }[] = [
  { code: 'en', label: 'English', htmlLang: 'en-IN' },
  { code: 'hi', label: 'हिंदी', htmlLang: 'hi-IN' },
];

export type TranslateValues = Record<string, string | number>;

/**
 * Looks a key up in the requested language and falls back to English when a
 * locale is incomplete. A key that exists nowhere is returned unchanged, which
 * makes a missing string obvious in development without ever crashing a page.
 */
export function translate(language: Language, key: string, values?: TranslateValues): string {
  const dictionary = DICTIONARIES[language] ?? DICTIONARIES.en;
  const template = dictionary[key] ?? DICTIONARIES.en[key] ?? key;
  if (!values) return template;

  return template.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = values[name];
    return value === undefined ? match : String(value);
  });
}

export type Translator = (key: string, values?: TranslateValues) => string;

export function createTranslator(language: Language): Translator {
  return (key, values) => translate(language, key, values);
}

/** Picks the right half of a bilingual data string. */
export function pick(text: Bilingual, language: Language): string {
  return language === 'hi' ? text.hi || text.en : text.en;
}

/* ------------------------------------------------------------------ */
/* Match-explanation rendering                                         */
/* ------------------------------------------------------------------ */

/**
 * The matching engine is language-free: it emits tokens instead of prose.
 *
 *   `@some.key`   -> translated string
 *   `#state:MH`   -> State/UT name in the current language
 *   `#money:5e5`  -> rupee figure formatted for the current language
 *   `a|b`         -> a list, joined with the locale's list separator
 *
 * Resolving them here keeps the engine testable and the translations in one
 * place.
 */
function resolveToken(token: string, language: Language): string {
  if (token.startsWith('@')) return translate(language, token.slice(1));
  if (token.startsWith('#state:')) {
    const code = token.slice('#state:'.length);
    const label = getStateLabel(code);
    return label ? pick(label, language) : code;
  }
  if (token.startsWith('#money:')) {
    const amount = Number(token.slice('#money:'.length));
    return Number.isFinite(amount) ? formatIncomeLimit(amount, language) : token;
  }
  return token;
}

function resolveValue(raw: string, language: Language): string {
  const separator = language === 'hi' ? ', ' : ', ';
  return raw
    .split('|')
    .map((token) => resolveToken(token, language))
    .join(separator);
}

/** Turns a match factor into the sentence a student reads. */
export function explainFactor(factor: MatchFactor, language: Language): string {
  const resolved: TranslateValues = {};
  for (const [name, raw] of Object.entries(factor.values ?? {})) {
    resolved[name] = resolveValue(raw, language);
  }
  return translate(language, factor.messageKey, resolved);
}

/** Locale-aware date formatting for plans and dashboards. */
export function formatDate(iso: string, language: Language): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(language === 'hi' ? 'hi-IN' : 'en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}
