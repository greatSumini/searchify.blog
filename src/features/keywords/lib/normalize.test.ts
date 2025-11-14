import { describe, it, expect } from 'vitest';
import { normalizeKeyword, validateKeywordPhrase } from './normalize';

describe('normalizeKeyword', () => {
  it('should convert to lowercase', () => {
    expect(normalizeKeyword('React')).toBe('react');
    expect(normalizeKeyword('JAVASCRIPT')).toBe('javascript');
  });

  it('should trim whitespace', () => {
    expect(normalizeKeyword('  keyword  ')).toBe('keyword');
  });

  it('should collapse multiple spaces', () => {
    expect(normalizeKeyword('React  Framework')).toBe('react framework');
    expect(normalizeKeyword('키워드   관리')).toBe('키워드 관리');
  });

  it('should normalize Unicode (NFC)', () => {
    expect(normalizeKeyword('Café')).toBe('café');
  });

  it('should handle mixed cases', () => {
    expect(normalizeKeyword('  React.js  Framework  ')).toBe('react.js framework');
  });
});

describe('validateKeywordPhrase', () => {
  it('should accept valid phrases', () => {
    expect(validateKeywordPhrase('React').valid).toBe(true);
    expect(validateKeywordPhrase('키워드 관리').valid).toBe(true);
    expect(validateKeywordPhrase('SEO 2024').valid).toBe(true);
  });

  it('should reject empty phrases', () => {
    const result = validateKeywordPhrase('   ');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('empty');
  });

  it('should reject too long phrases', () => {
    const result = validateKeywordPhrase('a'.repeat(101));
    expect(result.valid).toBe(false);
    expect(result.error).toContain('100 characters');
  });

  it('should reject special characters only', () => {
    const result = validateKeywordPhrase('!@#$%');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('alphanumeric');
  });
});
