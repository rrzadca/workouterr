import type { Language } from '../i18n/provide-i18n';

/** The locale whose conventions each language uses; en-GB writes "11 October 2026" and 24-hour time. */
export const localeByLanguage: Record<Language, string> = {
  en: 'en-GB',
};

/** Named number formats, so screens say what a number is and not how to print it */
export const numberFormats = {
  /** Weights and other measured values: 102.5, 1,250 */
  decimal: { maximumFractionDigits: 2 },
  /** Counts: sets, reps, sessions */
  integer: { maximumFractionDigits: 0 },
} satisfies Record<string, Intl.NumberFormatOptions>;

export type NumberFormat = keyof typeof numberFormats;

export const dateFormats = {
  /** Sunday, 11 October 2026 */
  long: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
  /** Sun 11 Oct */
  short: { weekday: 'short', day: 'numeric', month: 'short' },
  /** 11 Oct 2026 */
  medium: { day: 'numeric', month: 'short', year: 'numeric' },
  /** 18:05 */
  time: { hour: '2-digit', minute: '2-digit' },
} satisfies Record<string, Intl.DateTimeFormatOptions>;

export type DateFormat = keyof typeof dateFormats;
