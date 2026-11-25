// How the app writes numbers and durations. Weights and steps are exact to 2 decimals (the API's limit), so a
// number never shows more than 2; the language picks the separator (2.5 in English, 2,5 in Polish).
export function formatDecimal(value: number, language: string) {
  return new Intl.NumberFormat(language, { maximumFractionDigits: 2 }).format(value);
}

// `45 s` below a minute, `1:30` from a minute up (project scope, Routines → Limits).
export function formatSeconds(seconds: number) {
  if (seconds < 60) {
    return `${seconds} s`;
  }
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

// A typed decimal, with either a point or a comma (the iPad's Polish keyboard has only the comma). NaN for anything
// else, which the zod schema then rejects like any other bad number.
export function parseDecimal(text: string) {
  const normalised = text.trim().replace(',', '.');
  return /^\d+(\.\d+)?$/.test(normalised) ? Number(normalised) : Number.NaN;
}

// A typed whole number; NaN for anything else (a sign, a decimal, a letter).
export function parseWholeNumber(text: string) {
  const trimmed = text.trim();
  return /^\d+$/.test(trimmed) ? Number(trimmed) : Number.NaN;
}
