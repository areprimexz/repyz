/** Answer normalisation used when comparing typed answers with accepted answers. */

function unifyCharacters(value: string): string {
  return value
    .replace(/[\u2018\u2019\u02bc`]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/\u00a0/g, ' ');
}

/**
 * Strict comparison keeps letter case and punctuation, but tolerates
 * curly quotes, repeated spaces and spaces before punctuation.
 */
export function normalizeStrict(value: string): string {
  return unifyCharacters(value)
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.!?;:])/g, '$1')
    .trim();
}

/** Loose comparison also ignores letter case and a final . ! or ? */
export function normalizeLoose(value: string): string {
  return normalizeStrict(value)
    .toLowerCase()
    .replace(/[.!?]+$/, '')
    .trim();
}

export function answersMatch(given: string, accepted: string, mode: 'loose' | 'strict' = 'loose'): boolean {
  const normalize = mode === 'strict' ? normalizeStrict : normalizeLoose;
  const a = normalize(given);
  return a.length > 0 && a === normalize(accepted);
}
