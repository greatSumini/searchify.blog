import type { SupabaseClient } from '@supabase/supabase-js';
import {
  failure,
  success,
  type HandlerResult,
} from '@/backend/http/response';
import {
  articleErrorCodes,
  type ArticleServiceError,
} from '@/features/articles/backend/error';

const GENERATION_QUOTA_TABLE = 'generation_quota';

// Quota limits per tier
const QUOTA_LIMITS = {
  free: 10,
  pro: 100,
} as const;

type TierType = 'free' | 'pro';

interface QuotaRow {
  id: string;
  clerk_user_id: string;
  tier: TierType;
  generation_count: number;
  last_reset_at: string;
  created_at: string;
  updated_at: string;
}

interface QuotaCheckResult {
  allowed: boolean;
  tier: TierType;
  currentCount: number;
  limit: number;
  remaining: number;
}

/**
 * Gets or creates quota record for user
 */
const getOrCreateQuotaRecord = async (
  client: SupabaseClient,
  clerkUserId: string,
): Promise<QuotaRow | null> => {
  // Try to get existing record
  const { data: existing } = await client
    .from(GENERATION_QUOTA_TABLE)
    .select('*')
    .eq('clerk_user_id', clerkUserId)
    .single();

  if (existing) {
    return existing as QuotaRow;
  }

  // Create new record if doesn't exist
  const { data: newRecord, error } = await client
    .from(GENERATION_QUOTA_TABLE)
    .insert({
      clerk_user_id: clerkUserId,
      tier: 'free',
      generation_count: 0,
    })
    .select('*')
    .single();

  if (error || !newRecord) {
    return null;
  }

  return newRecord as QuotaRow;
};

/**
 * Checks if user has available quota
 * Returns quota information including remaining count
 */
export const checkQuota = async (
  client: SupabaseClient,
  clerkUserId: string,
): Promise<HandlerResult<QuotaCheckResult, ArticleServiceError, unknown>> => {
  try {
    const quota = await getOrCreateQuotaRecord(client, clerkUserId);

    if (!quota) {
      return failure(
        500,
        articleErrorCodes.quotaCheckFailed,
        'Failed to retrieve or create quota record',
      );
    }

    const tier = quota.tier as TierType;
    const limit = QUOTA_LIMITS[tier];
    const currentCount = quota.generation_count;
    const remaining = Math.max(0, limit - currentCount);
    const allowed = currentCount < limit;

    return success(
      {
        allowed,
        tier,
        currentCount,
        limit,
        remaining,
      },
      200,
    );
  } catch (error) {
    return failure(
      500,
      articleErrorCodes.quotaCheckFailed,
      `Quota check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error,
    );
  }
};

/**
 * Increments generation count for user
 * Uses atomic update to prevent race conditions
 */
export const incrementQuota = async (
  client: SupabaseClient,
  clerkUserId: string,
): Promise<HandlerResult<{ newCount: number; remaining: number }, ArticleServiceError, unknown>> => {
  try {
    // Get current quota to determine tier
    const quota = await getOrCreateQuotaRecord(client, clerkUserId);

    if (!quota) {
      return failure(
        500,
        articleErrorCodes.quotaIncrementFailed,
        'Failed to retrieve quota record',
      );
    }

    const tier = quota.tier as TierType;
    const limit = QUOTA_LIMITS[tier];

    // Atomic increment using PostgreSQL
    const { data, error } = await client
      .from(GENERATION_QUOTA_TABLE)
      .update({
        generation_count: quota.generation_count + 1,
      })
      .eq('clerk_user_id', clerkUserId)
      .eq('generation_count', quota.generation_count) // Ensure no race condition
      .select('generation_count')
      .single();

    if (error || !data) {
      return failure(
        500,
        articleErrorCodes.quotaIncrementFailed,
        `Failed to increment quota: ${error?.message || 'Unknown error'}`,
      );
    }

    const newCount = data.generation_count;
    const remaining = Math.max(0, limit - newCount);

    return success({ newCount, remaining }, 200);
  } catch (error) {
    return failure(
      500,
      articleErrorCodes.quotaIncrementFailed,
      `Quota increment failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error,
    );
  }
};

/**
 * Gets quota status for user (without creating record)
 */
export const getQuotaStatus = async (
  client: SupabaseClient,
  clerkUserId: string,
): Promise<HandlerResult<QuotaCheckResult, ArticleServiceError, unknown>> => {
  try {
    const { data: quota } = await client
      .from(GENERATION_QUOTA_TABLE)
      .select('*')
      .eq('clerk_user_id', clerkUserId)
      .single();

    if (!quota) {
      // Return default free tier status
      return success(
        {
          allowed: true,
          tier: 'free',
          currentCount: 0,
          limit: QUOTA_LIMITS.free,
          remaining: QUOTA_LIMITS.free,
        },
        200,
      );
    }

    const tier = quota.tier as TierType;
    const limit = QUOTA_LIMITS[tier];
    const currentCount = quota.generation_count;
    const remaining = Math.max(0, limit - currentCount);
    const allowed = currentCount < limit;

    return success(
      {
        allowed,
        tier,
        currentCount,
        limit,
        remaining,
      },
      200,
    );
  } catch (error) {
    return failure(
      500,
      articleErrorCodes.quotaCheckFailed,
      `Failed to get quota status: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error,
    );
  }
};
