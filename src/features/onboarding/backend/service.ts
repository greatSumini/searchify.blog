import type { SupabaseClient } from '@supabase/supabase-js';
import {
  failure,
  success,
  type HandlerResult,
} from '@/backend/http/response';
import {
  StyleGuideTableRowSchema,
  StyleGuideResponseSchema,
  type StyleGuideResponse,
  type CreateStyleGuideRequest,
} from '@/features/onboarding/backend/schema';
import {
  styleGuideErrorCodes,
  type StyleGuideServiceError,
} from '@/features/onboarding/backend/error';

const STYLE_GUIDES_TABLE = 'style_guides';

/**
 * Creates or updates a style guide for a user
 * Uses UPSERT to handle repeat onboarding flows
 */
export const upsertStyleGuide = async (
  client: SupabaseClient,
  clerkUserId: string,
  data: CreateStyleGuideRequest,
): Promise<HandlerResult<StyleGuideResponse, StyleGuideServiceError, unknown>> => {
  // Map camelCase TypeScript to snake_case database columns
  const dbRecord = {
    clerk_user_id: clerkUserId,
    brand_name: data.brandName,
    brand_description: data.brandDescription,
    personality: data.personality,
    formality: data.formality,
    target_audience: data.targetAudience,
    pain_points: data.painPoints,
    language: data.language,
    tone: data.tone,
    content_length: data.contentLength,
    reading_level: data.readingLevel,
    notes: data.notes || null,
    is_default: true, // Always true for MVP (one guide per user)
  };

  // Use UPSERT to handle users going through onboarding multiple times
  const { data: savedData, error } = await client
    .from(STYLE_GUIDES_TABLE)
    .upsert(dbRecord, {
      onConflict: 'clerk_user_id', // Update if user already exists
      ignoreDuplicates: false,
    })
    .select('*')
    .single();

  if (error) {
    return failure(
      500,
      styleGuideErrorCodes.upsertError,
      `Failed to save style guide: ${error.message}`,
    );
  }

  if (!savedData) {
    return failure(
      500,
      styleGuideErrorCodes.upsertError,
      'Style guide was saved but no data was returned',
    );
  }

  // Validate the database row
  const rowParse = StyleGuideTableRowSchema.safeParse(savedData);

  if (!rowParse.success) {
    return failure(
      500,
      styleGuideErrorCodes.validationError,
      'Style guide row failed validation.',
      rowParse.error.format(),
    );
  }

  // Map snake_case database columns to camelCase response
  const mapped = {
    id: rowParse.data.id,
    clerkUserId: rowParse.data.clerk_user_id,
    brandName: rowParse.data.brand_name,
    brandDescription: rowParse.data.brand_description,
    personality: rowParse.data.personality,
    formality: rowParse.data.formality,
    targetAudience: rowParse.data.target_audience,
    painPoints: rowParse.data.pain_points,
    language: rowParse.data.language,
    tone: rowParse.data.tone,
    contentLength: rowParse.data.content_length,
    readingLevel: rowParse.data.reading_level,
    notes: rowParse.data.notes,
    isDefault: rowParse.data.is_default,
    createdAt: rowParse.data.created_at,
    updatedAt: rowParse.data.updated_at,
  } satisfies StyleGuideResponse;

  // Validate the response
  const parsed = StyleGuideResponseSchema.safeParse(mapped);

  if (!parsed.success) {
    return failure(
      500,
      styleGuideErrorCodes.validationError,
      'Style guide response failed validation.',
      parsed.error.format(),
    );
  }

  return success(parsed.data, 201);
};

/**
 * Gets the style guide for a user
 * Returns the user's default style guide (one guide per user in MVP)
 */
export const getStyleGuide = async (
  client: SupabaseClient,
  clerkUserId: string,
): Promise<HandlerResult<StyleGuideResponse, StyleGuideServiceError, unknown>> => {
  const { data, error } = await client
    .from(STYLE_GUIDES_TABLE)
    .select('*')
    .eq('clerk_user_id', clerkUserId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return failure(404, styleGuideErrorCodes.notFound, 'Style guide not found');
    }
    return failure(
      500,
      styleGuideErrorCodes.fetchError,
      `Failed to fetch style guide: ${error.message}`,
    );
  }

  if (!data) {
    return failure(404, styleGuideErrorCodes.notFound, 'Style guide not found');
  }

  // Validate the database row
  const rowParse = StyleGuideTableRowSchema.safeParse(data);

  if (!rowParse.success) {
    return failure(
      500,
      styleGuideErrorCodes.validationError,
      'Style guide row failed validation.',
      rowParse.error.format(),
    );
  }

  // Map snake_case database columns to camelCase response
  const mapped = {
    id: rowParse.data.id,
    clerkUserId: rowParse.data.clerk_user_id,
    brandName: rowParse.data.brand_name,
    brandDescription: rowParse.data.brand_description,
    personality: rowParse.data.personality,
    formality: rowParse.data.formality,
    targetAudience: rowParse.data.target_audience,
    painPoints: rowParse.data.pain_points,
    language: rowParse.data.language,
    tone: rowParse.data.tone,
    contentLength: rowParse.data.content_length,
    readingLevel: rowParse.data.reading_level,
    notes: rowParse.data.notes,
    isDefault: rowParse.data.is_default,
    createdAt: rowParse.data.created_at,
    updatedAt: rowParse.data.updated_at,
  } satisfies StyleGuideResponse;

  // Validate the response
  const parsed = StyleGuideResponseSchema.safeParse(mapped);

  if (!parsed.success) {
    return failure(
      500,
      styleGuideErrorCodes.validationError,
      'Style guide response failed validation.',
      parsed.error.format(),
    );
  }

  return success(parsed.data, 200);
};
