export const keywordErrorCodes = {
  // CRUD errors
  fetchError: 'KEYWORD_FETCH_ERROR',
  createError: 'KEYWORD_CREATE_ERROR',
  updateError: 'KEYWORD_UPDATE_ERROR',
  deleteError: 'KEYWORD_DELETE_ERROR',
  notFound: 'KEYWORD_NOT_FOUND',

  // Bulk operation errors
  bulkInsertError: 'KEYWORD_BULK_INSERT_ERROR',
  bulkInsertPartialSuccess: 'KEYWORD_BULK_INSERT_PARTIAL_SUCCESS',

  // Validation errors
  invalidPhrase: 'INVALID_KEYWORD_PHRASE',
  duplicatePhrase: 'DUPLICATE_KEYWORD_PHRASE',
  duplicateNormalized: 'DUPLICATE_KEYWORD_NORMALIZED',

  // DataForSEO errors
  dataForSEOError: 'DATAFORSEO_API_ERROR',
  dataForSEORateLimit: 'DATAFORSEO_RATE_LIMIT',
  dataForSEOTimeout: 'DATAFORSEO_TIMEOUT',
  dataForSEOInvalidCredentials: 'DATAFORSEO_INVALID_CREDENTIALS',

  // Cache errors
  cacheReadError: 'CACHE_READ_ERROR',
  cacheWriteError: 'CACHE_WRITE_ERROR',
} as const;

export type KeywordServiceError = (typeof keywordErrorCodes)[keyof typeof keywordErrorCodes];
