import { z } from 'zod';

// ===== 요청 스키마 =====
export const CreateKeywordSchema = z.object({
  phrase: z.string().min(1).max(100),
});

export const UpdateKeywordSchema = z.object({
  phrase: z.string().min(1).max(100).optional(),
});

export const ListKeywordsSchema = z.object({
  query: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const BulkCreateKeywordsSchema = z.object({
  phrases: z.array(z.string().min(1).max(100)).min(1).max(50),
});

export const KeywordSuggestionsSchema = z.object({
  seeds: z.array(z.string().min(1)).min(1).max(5),
  languageName: z.string().default('Korean'),
  locationCode: z.number().int().default(2410),
  limit: z.number().int().min(1).max(100).default(25),
  forceRefresh: z.boolean().default(false),
});

// ===== 응답 스키마 =====
export const KeywordSchema = z.object({
  id: z.string().uuid(),
  phrase: z.string(),
  normalized: z.string(),
  source: z.enum(['manual', 'dataforseo']),
  searchVolume: z.number().int().nullable(),
  cpc: z.number().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const KeywordListResponseSchema = z.object({
  items: z.array(KeywordSchema),
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
  hasMore: z.boolean(),
});

export const SuggestionItemSchema = z.object({
  keyword: z.string(),
  searchVolume: z.number().int().nullable(),
  cpc: z.number().nullable(),
  competition: z.string().nullable(),
});

export const KeywordSuggestionsResponseSchema = z.object({
  suggestions: z.array(SuggestionItemSchema),
  cached: z.boolean(),
  cacheExpiresAt: z.string().nullable(),
});

// ===== 타입 추출 =====
export type CreateKeywordInput = z.infer<typeof CreateKeywordSchema>;
export type UpdateKeywordInput = z.infer<typeof UpdateKeywordSchema>;
export type ListKeywordsInput = z.infer<typeof ListKeywordsSchema>;
export type BulkCreateKeywordsInput = z.infer<typeof BulkCreateKeywordsSchema>;
export type KeywordSuggestionsInput = z.infer<typeof KeywordSuggestionsSchema>;
export type Keyword = z.infer<typeof KeywordSchema>;
export type KeywordListResponse = z.infer<typeof KeywordListResponseSchema>;
export type SuggestionItem = z.infer<typeof SuggestionItemSchema>;
export type KeywordSuggestionsResponse = z.infer<typeof KeywordSuggestionsResponseSchema>;
