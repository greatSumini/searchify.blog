import { z } from 'zod';

// Reuse style schema from onboarding
import { styleSchema } from '@/features/onboarding/lib/onboarding-schema';

// Article Draft Form Schema
export const articleDraftSchema = z.object({
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
  // Style overrides (optional - uses style guide defaults if not provided)
  tone: styleSchema.shape.tone.optional(),
  contentLength: styleSchema.shape.contentLength.optional(),
  readingLevel: styleSchema.shape.readingLevel.optional(),
  // SEO metadata
  metaTitle: z.string().max(60, 'Meta 제목은 60자 이내로 입력해주세요').optional(),
  metaDescription: z
    .string()
    .max(160, 'Meta 설명은 160자 이내로 입력해주세요')
    .optional(),
});

export type ArticleDraftFormData = z.infer<typeof articleDraftSchema>;

// Default values for the article draft form
export const defaultArticleDraftValues: ArticleDraftFormData = {
  title: '',
  slug: '',
  keywords: [],
  description: '',
  content: '',
  metaTitle: '',
  metaDescription: '',
};
