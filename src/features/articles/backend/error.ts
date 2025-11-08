export const articleErrorCodes = {
  unauthorized: 'ARTICLE_UNAUTHORIZED',
  notFound: 'ARTICLE_NOT_FOUND',
  validationError: 'ARTICLE_VALIDATION_ERROR',
  createError: 'ARTICLE_CREATE_ERROR',
  updateError: 'ARTICLE_UPDATE_ERROR',
  deleteError: 'ARTICLE_DELETE_ERROR',
  fetchError: 'ARTICLE_FETCH_ERROR',
  quotaExceeded: 'QUOTA_EXCEEDED',
  aiGenerationFailed: 'AI_GENERATION_FAILED',
  styleGuideNotFound: 'STYLE_GUIDE_NOT_FOUND',
  quotaCheckFailed: 'QUOTA_CHECK_FAILED',
  quotaIncrementFailed: 'QUOTA_INCREMENT_FAILED',
} as const;

type ArticleErrorValue =
  (typeof articleErrorCodes)[keyof typeof articleErrorCodes];

export type ArticleServiceError = ArticleErrorValue;
