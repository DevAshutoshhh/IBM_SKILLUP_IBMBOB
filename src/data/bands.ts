import type { IncomeBand, MarksBand } from '../types';

/**
 * Bands are stored as ranges rather than exact values. The matching engine
 * compares ranges against scheme limits, which lets it distinguish
 * "definitely inside the limit", "definitely outside" and "overlapping, so
 * the student must check their own figure".
 */

export interface NumericRange {
  /** Inclusive lower bound. */
  min: number;
  /** Exclusive upper bound; `Infinity` for an open-ended top band. */
  max: number;
}

export const INCOME_RANGES: Record<Exclude<IncomeBand, 'prefer_not_to_say'>, NumericRange> = {
  below_1_lakh: { min: 0, max: 100_000 },
  one_to_2_5_lakh: { min: 100_000, max: 250_000 },
  two_5_to_5_lakh: { min: 250_000, max: 500_000 },
  five_to_8_lakh: { min: 500_000, max: 800_000 },
  above_8_lakh: { min: 800_000, max: Infinity },
};

export const MARKS_RANGES: Record<Exclude<MarksBand, 'not_sure'>, NumericRange> = {
  below_50: { min: 0, max: 50 },
  from_50_to_60: { min: 50, max: 60 },
  from_60_to_75: { min: 60, max: 75 },
  from_75_to_90: { min: 75, max: 90 },
  above_90: { min: 90, max: 100.001 },
};

export const INCOME_BAND_ORDER: IncomeBand[] = [
  'below_1_lakh',
  'one_to_2_5_lakh',
  'two_5_to_5_lakh',
  'five_to_8_lakh',
  'above_8_lakh',
  'prefer_not_to_say',
];

export const MARKS_BAND_ORDER: MarksBand[] = [
  'below_50',
  'from_50_to_60',
  'from_60_to_75',
  'from_75_to_90',
  'above_90',
  'not_sure',
];

export function getIncomeRange(band: IncomeBand): NumericRange | null {
  if (band === 'prefer_not_to_say') return null;
  return INCOME_RANGES[band];
}

export function getMarksRange(band: MarksBand): NumericRange | null {
  if (band === 'not_sure') return null;
  return MARKS_RANGES[band];
}

/** Formats a rupee limit the way Indian scheme documents usually state it. */
export function formatIncomeLimit(rupees: number, language: 'en' | 'hi' = 'en'): string {
  const crore = language === 'hi' ? 'करोड़' : 'crore';
  const lakh = language === 'hi' ? 'लाख' : 'lakh';
  if (rupees >= 10_000_000) {
    return `₹${(rupees / 10_000_000).toFixed(rupees % 10_000_000 === 0 ? 0 : 1)} ${crore}`;
  }
  if (rupees >= 100_000) {
    return `₹${(rupees / 100_000).toFixed(rupees % 100_000 === 0 ? 0 : 1)} ${lakh}`;
  }
  return `₹${rupees.toLocaleString('en-IN')}`;
}
