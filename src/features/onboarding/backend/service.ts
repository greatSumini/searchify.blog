import type { SupabaseClient } from '@supabase/supabase-js';
import {
  domainFailure,
  domainSuccess,
  type DomainResult,
} from '@/backend/domain/result';
import {
  StyleGuideTableRowSchema,
  StyleGuideResponseSchema,
  type StyleGuideResponse,
  type CreateStyleGuideRequest,
} from '@/features/onboarding/backend/schema';
import {
  styleGuideErrorCodes,
  type StyleGuideDomainError,
} from '@/features/onboarding/backend/error';

const STYLE_GUIDES_TABLE = 'style_guides';
import { ensureProfile, getProfileIdByClerkId } from '@/features/profiles/backend/service';

/**
 * Creates a new style guide for a user
 * Always creates a new record (users can have multiple style guides)
 */
export const createStyleGuide = async (
  client: SupabaseClient,
  clerkUserId: string,
  data: CreateStyleGuideRequest,
): Promise<DomainResult<StyleGuideResponse, StyleGuideDomainError>> => {
  // Resolve profile_id for this Clerk user (create minimal profile if absent)
  const profile = await ensureProfile(client, clerkUserId);
  const profileId = profile?.id;
  if (!profileId) {
    return domainFailure({
      code: styleGuideErrorCodes.upsertError,
      message: 'Failed to resolve or create user profile.',
    });
  }
  // Map camelCase TypeScript to snake_case database columns
  const dbRecord = {
    profile_id: profileId,
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
    is_default: false, // New guides are not default by default
  };

  // Use INSERT to always create a new record
  const { data: savedData, error } = await client
    .from(STYLE_GUIDES_TABLE)
    .insert(dbRecord)
    .select('*')
    .single();

  if (error) {
    return domainFailure({
      code: styleGuideErrorCodes.upsertError,
      message: `Failed to save style guide: ${error.message}`,
    });
  }

  if (!savedData) {
    return domainFailure({
      code: styleGuideErrorCodes.upsertError,
      message: 'Style guide was saved but no data was returned',
    });
  }

  // Validate the database row
  const rowParse = StyleGuideTableRowSchema.safeParse(savedData);

  if (!rowParse.success) {
    return domainFailure({
      code: styleGuideErrorCodes.validationError,
      message: 'Style guide row failed validation.',
      details: rowParse.error.format(),
    });
  }

  // Map snake_case database columns to camelCase response
  const mapped = {
    id: rowParse.data.id,
    profileId: rowParse.data.profile_id,
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
    return domainFailure({
      code: styleGuideErrorCodes.validationError,
      message: 'Style guide response failed validation.',
      details: parsed.error.format(),
    });
  }

  return domainSuccess(parsed.data);
};

/**
 * Gets all style guides for a user
 * Returns all style guides ordered by creation date (newest first)
 */
export const listStyleGuides = async (
  client: SupabaseClient,
  clerkUserId: string,
): Promise<DomainResult<StyleGuideResponse[], StyleGuideDomainError>> => {
  const profileId = await getProfileIdByClerkId(client, clerkUserId);
  if (!profileId) {
    return domainFailure({ code: styleGuideErrorCodes.notFound, message: 'Profile not found' });
  }
  const { data, error } = await client
    .from(STYLE_GUIDES_TABLE)
    .select('*')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false });

  if (error) {
    return domainFailure({
      code: styleGuideErrorCodes.fetchError,
      message: `Failed to fetch style guides: ${error.message}`,
    });
  }

  if (!data || data.length === 0) {
    return domainSuccess([]);
  }

  // Validate and map each row
  const mappedGuides: StyleGuideResponse[] = [];
  for (const row of data) {
    const rowParse = StyleGuideTableRowSchema.safeParse(row);

    if (!rowParse.success) {
      return domainFailure({
        code: styleGuideErrorCodes.validationError,
        message: 'Style guide row failed validation.',
        details: rowParse.error.format(),
      });
    }

    const mapped = {
      id: rowParse.data.id,
      profileId: rowParse.data.profile_id,
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

    const parsed = StyleGuideResponseSchema.safeParse(mapped);

    if (!parsed.success) {
      return domainFailure({
        code: styleGuideErrorCodes.validationError,
        message: 'Style guide response failed validation.',
        details: parsed.error.format(),
      });
    }

    mappedGuides.push(parsed.data);
  }

  return domainSuccess(mappedGuides);
};

/**
 * Gets a single style guide by ID
 * Used for viewing/editing a specific guide
 */
export const getStyleGuideById = async (
  client: SupabaseClient,
  guideId: string,
  clerkUserId: string,
): Promise<DomainResult<StyleGuideResponse, StyleGuideDomainError>> => {
  const profileId = await getProfileIdByClerkId(client, clerkUserId);
  if (!profileId) {
    return domainFailure({ code: styleGuideErrorCodes.notFound, message: 'Profile not found' });
  }
  const { data, error } = await client
    .from(STYLE_GUIDES_TABLE)
    .select('*')
    .eq('id', guideId)
    .eq('profile_id', profileId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return domainFailure({ code: styleGuideErrorCodes.notFound, message: 'Style guide not found' });
    }
    return domainFailure({
      code: styleGuideErrorCodes.fetchError,
      message: `Failed to fetch style guide: ${error.message}`,
    });
  }

  if (!data) {
    return domainFailure({ code: styleGuideErrorCodes.notFound, message: 'Style guide not found' });
  }

  // Validate the database row
  const rowParse = StyleGuideTableRowSchema.safeParse(data);

  if (!rowParse.success) {
    return domainFailure({
      code: styleGuideErrorCodes.validationError,
      message: 'Style guide row failed validation.',
      details: rowParse.error.format(),
    });
  }

  // Map snake_case database columns to camelCase response
  const mapped = {
    id: rowParse.data.id,
    profileId: rowParse.data.profile_id,
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
    return domainFailure({
      code: styleGuideErrorCodes.validationError,
      message: 'Style guide response failed validation.',
      details: parsed.error.format(),
    });
  }

  return domainSuccess(parsed.data);
};

/**
 * Updates a style guide for a user
 * Used when user edits their style guide after initial creation
 */
export const updateStyleGuide = async (
  client: SupabaseClient,
  guideId: string,
  clerkUserId: string,
  data: CreateStyleGuideRequest,
): Promise<DomainResult<StyleGuideResponse, StyleGuideDomainError>> => {
  // Map camelCase TypeScript to snake_case database columns
  const dbRecord = {
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
  };

  const profileId = await getProfileIdByClerkId(client, clerkUserId);
  if (!profileId) {
    return domainFailure({ code: styleGuideErrorCodes.notFound, message: 'Profile not found' });
  }
  const { data: updatedData, error } = await client
    .from(STYLE_GUIDES_TABLE)
    .update(dbRecord)
    .eq('id', guideId)
    .eq('profile_id', profileId)
    .select('*')
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return domainFailure({ code: styleGuideErrorCodes.notFound, message: 'Style guide not found' });
    }
    return domainFailure({
      code: styleGuideErrorCodes.upsertError,
      message: `Failed to update style guide: ${error.message}`,
    });
  }

  if (!updatedData) {
    return domainFailure({ code: styleGuideErrorCodes.notFound, message: 'Style guide not found' });
  }

  // Validate the database row
  const rowParse = StyleGuideTableRowSchema.safeParse(updatedData);

  if (!rowParse.success) {
    return domainFailure({
      code: styleGuideErrorCodes.validationError,
      message: 'Style guide row failed validation.',
      details: rowParse.error.format(),
    });
  }

  // Map snake_case database columns to camelCase response
  const mapped = {
    id: rowParse.data.id,
    profileId: rowParse.data.profile_id,
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
    return domainFailure({
      code: styleGuideErrorCodes.validationError,
      message: 'Style guide response failed validation.',
      details: parsed.error.format(),
    });
  }

  return domainSuccess(parsed.data);
};

/**
 * Deletes a style guide
 * Only the owner can delete their guide
 */
export const deleteStyleGuide = async (
  client: SupabaseClient,
  guideId: string,
  clerkUserId: string,
): Promise<DomainResult<{ success: boolean }, StyleGuideDomainError>> => {
  const profileId = await getProfileIdByClerkId(client, clerkUserId);
  if (!profileId) {
    return domainFailure({ code: styleGuideErrorCodes.notFound, message: 'Profile not found' });
  }
  const { error } = await client
    .from(STYLE_GUIDES_TABLE)
    .delete()
    .eq('id', guideId)
    .eq('profile_id', profileId);

  if (error) {
    if (error.code === 'PGRST116') {
      return domainFailure({ code: styleGuideErrorCodes.notFound, message: 'Style guide not found' });
    }
    return domainFailure({
      code: styleGuideErrorCodes.upsertError,
      message: `Failed to delete style guide: ${error.message}`,
    });
  }

  return domainSuccess({ success: true });
};

/**
 * Marks the onboarding as completed for a user
 * Updates the onboarding_completed flag in the style_guides table
 */
export const markOnboardingCompleted = async (
  client: SupabaseClient,
  clerkUserId: string,
): Promise<DomainResult<{ success: boolean }, StyleGuideDomainError>> => {
  const profileId = await getProfileIdByClerkId(client, clerkUserId);
  if (!profileId) {
    return domainFailure({ code: styleGuideErrorCodes.notFound, message: 'Profile not found' });
  }
  const { error } = await client
    .from(STYLE_GUIDES_TABLE)
    .update({ onboarding_completed: true })
    .eq('profile_id', profileId);

  if (error) {
    return domainFailure({
      code: styleGuideErrorCodes.upsertError,
      message: `Failed to update onboarding status: ${error.message}`,
    });
  }

  return domainSuccess({ success: true });
};
