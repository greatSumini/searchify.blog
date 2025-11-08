// Re-export backend schemas for use in frontend (React Query hooks, etc.)
export {
  CreateArticleRequestSchema,
  UpdateArticleRequestSchema,
  ArticleResponseSchema,
  ArticleStatusSchema,
  ContentToneSchema,
  ContentLengthSchema,
  ReadingLevelSchema,
  GenerateArticleRequestSchema,
  GenerateArticleResponseSchema,
  AIGeneratedContentSchema,
  type CreateArticleRequest,
  type UpdateArticleRequest,
  type ArticleResponse,
  type GenerateArticleRequest,
  type GenerateArticleResponse,
  type AIGeneratedContent,
} from '@/features/articles/backend/schema';
