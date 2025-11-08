export const styleGuideErrorCodes = {
  unauthorized: 'STYLE_GUIDE_UNAUTHORIZED',
  notFound: 'STYLE_GUIDE_NOT_FOUND',
  createError: 'STYLE_GUIDE_CREATE_ERROR',
  validationError: 'STYLE_GUIDE_VALIDATION_ERROR',
  upsertError: 'STYLE_GUIDE_UPSERT_ERROR',
  fetchError: 'STYLE_GUIDE_FETCH_ERROR',
} as const;

type StyleGuideErrorValue = (typeof styleGuideErrorCodes)[keyof typeof styleGuideErrorCodes];

export type StyleGuideServiceError = StyleGuideErrorValue;
