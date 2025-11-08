import { z } from 'zod';

// Article status enum
export const ArticleStatusSchema = z.enum(['draft', 'published', 'archived']);

// Reuse enums from style_guides (defined in onboarding schema)
export const ContentToneSchema = z.enum([
  'professional',
  'friendly',
  'inspirational',
  'educational',
]);

export const ContentLengthSchema = z.enum(['short', 'medium', 'long']);

export const ReadingLevelSchema = z.enum([
  'beginner',
  'intermediate',
  'advanced',
]);

// Create Article Request Schema
export const CreateArticleRequestSchema = z.object({
  title: z
    .string()
    .min(1, '제목을 입력해주세요')
    .max(200, '제목은 200자 이내로 입력해주세요'),
  slug: z
    .string()
    .min(1, 'URL 슬러그를 입력해주세요')
    .max(200, '슬러그는 200자 이내로 입력해주세요')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      '슬러그는 소문자, 숫자, 하이픈(-)만 사용 가능합니다',
    ),
  keywords: z.array(z.string()).default([]),
  description: z.string().max(500, '설명은 500자 이내로 입력해주세요').optional(),
  content: z.string().min(1, '내용을 입력해주세요'),
  styleGuideId: z.string().uuid('유효하지 않은 스타일 가이드 ID입니다').optional(),
  tone: ContentToneSchema.optional(),
  contentLength: ContentLengthSchema.optional(),
  readingLevel: ReadingLevelSchema.optional(),
  metaTitle: z.string().max(60, 'Meta 제목은 60자 이내로 입력해주세요').optional(),
  metaDescription: z
    .string()
    .max(160, 'Meta 설명은 160자 이내로 입력해주세요')
    .optional(),
});

export type CreateArticleRequest = z.infer<typeof CreateArticleRequestSchema>;

// Update Article Request Schema
export const UpdateArticleRequestSchema = z.object({
  title: z
    .string()
    .min(1, '제목을 입력해주세요')
    .max(200, '제목은 200자 이내로 입력해주세요')
    .optional(),
  slug: z
    .string()
    .min(1, 'URL 슬러그를 입력해주세요')
    .max(200, '슬러그는 200자 이내로 입력해주세요')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      '슬러그는 소문자, 숫자, 하이픈(-)만 사용 가능합니다',
    )
    .optional(),
  keywords: z.array(z.string()).optional(),
  description: z.string().max(500, '설명은 500자 이내로 입력해주세요').optional(),
  content: z.string().min(1, '내용을 입력해주세요').optional(),
  styleGuideId: z.string().uuid('유효하지 않은 스타일 가이드 ID입니다').optional(),
  tone: ContentToneSchema.optional(),
  contentLength: ContentLengthSchema.optional(),
  readingLevel: ReadingLevelSchema.optional(),
  metaTitle: z.string().max(60, 'Meta 제목은 60자 이내로 입력해주세요').optional(),
  metaDescription: z
    .string()
    .max(160, 'Meta 설명은 160자 이내로 입력해주세요')
    .optional(),
  status: ArticleStatusSchema.optional(),
});

export type UpdateArticleRequest = z.infer<typeof UpdateArticleRequestSchema>;

// Database row schema (snake_case to match database columns)
export const ArticleTableRowSchema = z.object({
  id: z.string().uuid(),
  clerk_user_id: z.string(),
  title: z.string(),
  slug: z.string(),
  keywords: z.array(z.string()),
  description: z.string().nullable(),
  content: z.string(),
  style_guide_id: z.string().uuid().nullable(),
  tone: ContentToneSchema.nullable(),
  content_length: ContentLengthSchema.nullable(),
  reading_level: ReadingLevelSchema.nullable(),
  meta_title: z.string().nullable(),
  meta_description: z.string().nullable(),
  status: ArticleStatusSchema,
  published_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type ArticleRow = z.infer<typeof ArticleTableRowSchema>;

// Response schema (camelCase for API responses)
export const ArticleResponseSchema = z.object({
  id: z.string().uuid(),
  clerkUserId: z.string(),
  title: z.string(),
  slug: z.string(),
  keywords: z.array(z.string()),
  description: z.string().nullable(),
  content: z.string(),
  styleGuideId: z.string().uuid().nullable(),
  tone: ContentToneSchema.nullable(),
  contentLength: ContentLengthSchema.nullable(),
  readingLevel: ReadingLevelSchema.nullable(),
  metaTitle: z.string().nullable(),
  metaDescription: z.string().nullable(),
  status: ArticleStatusSchema,
  publishedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ArticleResponse = z.infer<typeof ArticleResponseSchema>;
