import { describe, it, expect } from 'vitest';
import {
  CreateKeywordSchema,
  ListKeywordsSchema,
  BulkCreateKeywordsSchema,
  KeywordSuggestionsSchema,
} from './schema';

describe('CreateKeywordSchema', () => {
  it('should accept valid phrase', () => {
    const result = CreateKeywordSchema.safeParse({ phrase: 'React' });
    expect(result.success).toBe(true);
  });

  it('should reject empty phrase', () => {
    const result = CreateKeywordSchema.safeParse({ phrase: '' });
    expect(result.success).toBe(false);
  });

  it('should reject too long phrase', () => {
    const result = CreateKeywordSchema.safeParse({ phrase: 'a'.repeat(101) });
    expect(result.success).toBe(false);
  });
});

describe('ListKeywordsSchema', () => {
  it('should apply defaults', () => {
    const result = ListKeywordsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it('should coerce page and limit to numbers', () => {
    const result = ListKeywordsSchema.safeParse({ page: '2', limit: '50' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(50);
    }
  });

  it('should reject invalid page', () => {
    const result = ListKeywordsSchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });

  it('should reject limit over 100', () => {
    const result = ListKeywordsSchema.safeParse({ limit: 101 });
    expect(result.success).toBe(false);
  });
});

describe('BulkCreateKeywordsSchema', () => {
  it('should accept valid phrases array', () => {
    const result = BulkCreateKeywordsSchema.safeParse({
      phrases: ['React', 'Vue', 'Angular'],
    });
    expect(result.success).toBe(true);
  });

  it('should reject empty array', () => {
    const result = BulkCreateKeywordsSchema.safeParse({ phrases: [] });
    expect(result.success).toBe(false);
  });

  it('should reject over 50 phrases', () => {
    const result = BulkCreateKeywordsSchema.safeParse({
      phrases: Array(51).fill('keyword'),
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid phrase in array', () => {
    const result = BulkCreateKeywordsSchema.safeParse({
      phrases: ['valid', ''],
    });
    expect(result.success).toBe(false);
  });
});

describe('KeywordSuggestionsSchema', () => {
  it('should apply defaults', () => {
    const result = KeywordSuggestionsSchema.safeParse({ seeds: ['React'] });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.languageName).toBe('Korean');
      expect(result.data.locationCode).toBe(2410);
      expect(result.data.limit).toBe(25);
      expect(result.data.forceRefresh).toBe(false);
    }
  });

  it('should reject empty seeds array', () => {
    const result = KeywordSuggestionsSchema.safeParse({ seeds: [] });
    expect(result.success).toBe(false);
  });

  it('should reject over 5 seeds', () => {
    const result = KeywordSuggestionsSchema.safeParse({
      seeds: ['a', 'b', 'c', 'd', 'e', 'f'],
    });
    expect(result.success).toBe(false);
  });

  it('should accept custom parameters', () => {
    const result = KeywordSuggestionsSchema.safeParse({
      seeds: ['React', 'Vue'],
      languageName: 'English',
      locationCode: 2840,
      limit: 50,
      forceRefresh: true,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.languageName).toBe('English');
      expect(result.data.locationCode).toBe(2840);
      expect(result.data.limit).toBe(50);
      expect(result.data.forceRefresh).toBe(true);
    }
  });
});
