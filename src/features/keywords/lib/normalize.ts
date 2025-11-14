/**
 * Normalizes a keyword phrase for deduplication and search.
 *
 * Rules:
 * 1. Unicode normalization (NFC) - handles Korean character composition
 * 2. Lowercase conversion
 * 3. Trim whitespace
 * 4. Collapse multiple spaces to single space
 *
 * @example
 * normalizeKeyword("React.js  Framework") // "react.js framework"
 * normalizeKeyword("키워드  관리") // "키워드 관리"
 */
export function normalizeKeyword(phrase: string): string {
  return phrase
    .normalize('NFC')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * Validates a keyword phrase.
 *
 * Rules:
 * - Min length: 1 character (after trim)
 * - Max length: 100 characters
 * - No special characters only (must contain alphanumeric or Korean)
 */
export function validateKeywordPhrase(phrase: string): {
  valid: boolean;
  error?: string;
} {
  const trimmed = phrase.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: 'Keyword cannot be empty' };
  }

  if (trimmed.length > 100) {
    return { valid: false, error: 'Keyword cannot exceed 100 characters' };
  }

  // Must contain at least one alphanumeric or Korean character
  if (!/[a-zA-Z0-9가-힣]/.test(trimmed)) {
    return { valid: false, error: 'Keyword must contain at least one alphanumeric or Korean character' };
  }

  return { valid: true };
}
