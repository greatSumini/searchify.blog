import { generateObject } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  failure,
  success,
  type HandlerResult,
} from '@/backend/http/response';
import {
  AIGeneratedContentSchema,
  type AIGeneratedContent,
  type GenerateArticleRequest,
} from '@/features/articles/backend/schema';
import {
  articleErrorCodes,
  type ArticleServiceError,
} from '@/features/articles/backend/error';
import type { StyleGuideResponse } from '@/features/onboarding/backend/schema';

const STYLE_GUIDES_TABLE = 'style_guides';

/**
 * Gets style guide by ID or default style guide for user
 */
const getStyleGuide = async (
  client: SupabaseClient,
  clerkUserId: string,
  styleGuideId?: string,
): Promise<StyleGuideResponse | null> => {
  let query = client.from(STYLE_GUIDES_TABLE).select('*').eq('clerk_user_id', clerkUserId);

  if (styleGuideId) {
    query = query.eq('id', styleGuideId);
  } else {
    query = query.eq('is_default', true);
  }

  const { data, error } = await query.single();

  if (error || !data) {
    return null;
  }

  // Map snake_case to camelCase
  return {
    id: data.id,
    clerkUserId: data.clerk_user_id,
    brandName: data.brand_name,
    brandDescription: data.brand_description,
    personality: data.personality,
    formality: data.formality,
    targetAudience: data.target_audience,
    painPoints: data.pain_points,
    language: data.language,
    tone: data.tone,
    contentLength: data.content_length,
    readingLevel: data.reading_level,
    notes: data.notes,
    isDefault: data.is_default,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
};

/**
 * Builds AI prompt based on topic, style guide, and keywords
 */
const buildPrompt = (
  topic: string,
  styleGuide: StyleGuideResponse | null,
  keywords: string[],
  additionalInstructions?: string,
): string => {
  const language = styleGuide?.language || 'ko';
  const isKorean = language === 'ko';

  const contentLengthGuide = {
    short: isKorean ? '1000-1500자' : '500-800 words',
    medium: isKorean ? '2000-3000자' : '1000-1500 words',
    long: isKorean ? '4000-6000자' : '2000-3000 words',
  };

  const readingLevelGuide = {
    beginner: isKorean ? '초보자도 쉽게 이해할 수 있는' : 'beginner-friendly',
    intermediate: isKorean ? '중급 수준의' : 'intermediate-level',
    advanced: isKorean ? '전문적이고 심화된' : 'advanced and in-depth',
  };

  const toneGuide = {
    professional: isKorean ? '전문적이고 신뢰감 있는' : 'professional and trustworthy',
    friendly: isKorean ? '친근하고 대화하는 듯한' : 'friendly and conversational',
    inspirational: isKorean ? '영감을 주고 동기부여하는' : 'inspirational and motivating',
    educational: isKorean ? '교육적이고 정보 전달에 충실한' : 'educational and informative',
  };

  const promptTemplate = isKorean
    ? `
당신은 전문 블로그 콘텐츠 작가입니다. 다음 조건에 맞춰 고품질 블로그 글을 작성해주세요.

**주제**: ${topic}

**브랜드 정보**:
${styleGuide ? `- 브랜드명: ${styleGuide.brandName}
- 브랜드 설명: ${styleGuide.brandDescription}
- 브랜드 성격: ${styleGuide.personality.join(', ')}
- 격식 수준: ${styleGuide.formality}
- 타겟 독자: ${styleGuide.targetAudience}
- 독자의 고민: ${styleGuide.painPoints}` : '일반적인 블로그 스타일로 작성'}

**작성 스타일**:
- 어조: ${styleGuide ? toneGuide[styleGuide.tone] : '친근하고 전문적인'}
- 글 길이: ${styleGuide ? contentLengthGuide[styleGuide.contentLength] : '2000-3000자'}
- 난이도: ${styleGuide ? readingLevelGuide[styleGuide.readingLevel] : '중급 수준의'}

**키워드**: ${keywords.length > 0 ? keywords.join(', ') : '주제와 관련된 키워드를 자연스럽게 포함'}

${additionalInstructions ? `**추가 지시사항**: ${additionalInstructions}` : ''}

**작성 요구사항**:
1. 제목은 SEO에 최적화되고 클릭을 유도할 수 있도록 작성
2. 본문은 Markdown 형식으로 작성 (제목, 소제목, 목록, 강조 등 활용)
3. 서론, 본론, 결론 구조를 갖추되 자연스럽게 전개
4. 실용적이고 실행 가능한 정보 제공
5. 독자의 고민을 해결하는 데 집중
6. Meta Description은 160자 이내로 요약
7. 주요 키워드를 자연스럽게 본문에 포함
8. 소제목(headings)은 명확하고 구조적으로 구성

**출력 형식**:
- title: 블로그 글 제목
- content: Markdown 형식의 본문 (제목 제외)
- metaDescription: SEO를 위한 메타 설명 (160자 이내)
- keywords: 관련 키워드 배열 (5-10개)
- headings: 본문의 주요 소제목 배열
`
    : `
You are a professional blog content writer. Create a high-quality blog post according to the following requirements.

**Topic**: ${topic}

**Brand Information**:
${styleGuide ? `- Brand Name: ${styleGuide.brandName}
- Brand Description: ${styleGuide.brandDescription}
- Brand Personality: ${styleGuide.personality.join(', ')}
- Formality Level: ${styleGuide.formality}
- Target Audience: ${styleGuide.targetAudience}
- Audience Pain Points: ${styleGuide.painPoints}` : 'Write in a general blog style'}

**Writing Style**:
- Tone: ${styleGuide ? toneGuide[styleGuide.tone] : 'friendly and professional'}
- Content Length: ${styleGuide ? contentLengthGuide[styleGuide.contentLength] : '1000-1500 words'}
- Reading Level: ${styleGuide ? readingLevelGuide[styleGuide.readingLevel] : 'intermediate-level'}

**Keywords**: ${keywords.length > 0 ? keywords.join(', ') : 'Naturally include relevant keywords'}

${additionalInstructions ? `**Additional Instructions**: ${additionalInstructions}` : ''}

**Writing Requirements**:
1. Create an SEO-optimized title that encourages clicks
2. Write the body in Markdown format (use headings, subheadings, lists, emphasis, etc.)
3. Structure with introduction, body, and conclusion in a natural flow
4. Provide practical and actionable information
5. Focus on solving the reader's pain points
6. Summarize in Meta Description (max 160 characters)
7. Naturally incorporate main keywords throughout the content
8. Organize headings clearly and structurally

**Output Format**:
- title: Blog post title
- content: Markdown-formatted body (excluding title)
- metaDescription: SEO meta description (max 160 chars)
- keywords: Array of relevant keywords (5-10)
- headings: Array of main subheadings from the content
`;

  return promptTemplate;
};

/**
 * Generates article content using Google Gemini
 */
export const generateArticleContent = async (
  client: SupabaseClient,
  clerkUserId: string,
  apiKey: string,
  request: GenerateArticleRequest,
): Promise<HandlerResult<AIGeneratedContent, ArticleServiceError, unknown>> => {
  try {
    // Get style guide if provided
    const styleGuide = await getStyleGuide(
      client,
      clerkUserId,
      request.styleGuideId,
    );

    if (request.styleGuideId && !styleGuide) {
      return failure(
        404,
        articleErrorCodes.styleGuideNotFound,
        'Style guide not found',
      );
    }

    // Build prompt
    const prompt = buildPrompt(
      request.topic,
      styleGuide,
      request.keywords || [],
      request.additionalInstructions,
    );

    // Call Gemini API using generateObject for structured output
    const google = createGoogleGenerativeAI({
      apiKey,
    });

    const { object } = await generateObject({
      model: google('gemini-2.0-flash-exp'),
      schema: AIGeneratedContentSchema,
      prompt,
    });

    return success(object);
  } catch (error) {
    return failure(
      500,
      articleErrorCodes.aiGenerationFailed,
      `AI generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error,
    );
  }
};
