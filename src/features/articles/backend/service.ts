import type { SupabaseClient } from '@supabase/supabase-js';
import {
  failure,
  success,
  type HandlerResult,
} from '@/backend/http/response';
import {
  ArticleTableRowSchema,
  ArticleResponseSchema,
  type ArticleResponse,
  type CreateArticleRequest,
  type UpdateArticleRequest,
  type ListArticlesQuery,
  type ListArticlesResponse,
  type DashboardStatsResponse,
} from '@/features/articles/backend/schema';
import {
  articleErrorCodes,
  type ArticleServiceError,
} from '@/features/articles/backend/error';
import { ensureProfile, getProfileIdByClerkId } from '@/features/profiles/backend/service';

const ARTICLES_TABLE = 'articles';

/**
 * Maps database row (snake_case) to API response (camelCase)
 */
const mapArticleRowToResponse = (row: unknown): ArticleResponse => {
  // Validate the database row
  const rowParse = ArticleTableRowSchema.safeParse(row);

  if (!rowParse.success) {
    throw new Error('Article row failed validation');
  }

  // Map snake_case to camelCase
  const mapped = {
    id: rowParse.data.id,
    profileId: rowParse.data.profile_id,
    title: rowParse.data.title,
    slug: rowParse.data.slug,
    keywords: rowParse.data.keywords,
    description: rowParse.data.description,
    content: rowParse.data.content,
    styleGuideId: rowParse.data.style_guide_id,
    tone: rowParse.data.tone,
    contentLength: rowParse.data.content_length,
    readingLevel: rowParse.data.reading_level,
    metaTitle: rowParse.data.meta_title,
    metaDescription: rowParse.data.meta_description,
    status: rowParse.data.status,
    publishedAt: rowParse.data.published_at,
    createdAt: rowParse.data.created_at,
    updatedAt: rowParse.data.updated_at,
  } satisfies ArticleResponse;

  // Validate the response
  const parsed = ArticleResponseSchema.safeParse(mapped);

  if (!parsed.success) {
    throw new Error('Article response failed validation');
  }

  return parsed.data;
};

/**
 * Creates a new article draft
 */
export const createArticle = async (
  client: SupabaseClient,
  clerkUserId: string,
  data: CreateArticleRequest,
): Promise<HandlerResult<ArticleResponse, ArticleServiceError, unknown>> => {
  // Ensure profile exists and get id
  const profile = await ensureProfile(client, clerkUserId);
  const profileId = profile?.id;
  if (!profileId) {
    return failure(500, articleErrorCodes.createError, 'Failed to resolve or create user profile');
  }
  // Map camelCase TypeScript to snake_case database columns
  const dbRecord = {
    profile_id: profileId,
    title: data.title,
    slug: data.slug,
    keywords: data.keywords,
    description: data.description || null,
    content: data.content,
    style_guide_id: data.styleGuideId || null,
    tone: data.tone || null,
    content_length: data.contentLength || null,
    reading_level: data.readingLevel || null,
    meta_title: data.metaTitle || null,
    meta_description: data.metaDescription || null,
    status: 'draft' as const,
  };

  const { data: savedData, error } = await client
    .from(ARTICLES_TABLE)
    .insert(dbRecord)
    .select('*')
    .single();

  if (error) {
    return failure(
      500,
      articleErrorCodes.createError,
      `Failed to create article: ${error.message}`,
    );
  }

  if (!savedData) {
    return failure(
      500,
      articleErrorCodes.createError,
      'Article was created but no data was returned',
    );
  }

  try {
    const mapped = mapArticleRowToResponse(savedData);
    return success(mapped, 201);
  } catch (err) {
    return failure(
      500,
      articleErrorCodes.validationError,
      'Article row failed validation.',
      err,
    );
  }
};

/**
 * Gets an article by ID
 * Only returns articles belonging to the specified user
 */
export const getArticleById = async (
  client: SupabaseClient,
  clerkUserId: string,
  articleId: string,
): Promise<HandlerResult<ArticleResponse, ArticleServiceError, unknown>> => {
  const profileId = await getProfileIdByClerkId(client, clerkUserId);
  if (!profileId) {
    return failure(404, articleErrorCodes.notFound, 'Profile not found');
  }
  const { data, error } = await client
    .from(ARTICLES_TABLE)
    .select('*')
    .eq('id', articleId)
    .eq('profile_id', profileId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return failure(404, articleErrorCodes.notFound, 'Article not found');
    }
    return failure(
      500,
      articleErrorCodes.fetchError,
      `Failed to fetch article: ${error.message}`,
    );
  }

  if (!data) {
    return failure(404, articleErrorCodes.notFound, 'Article not found');
  }

  try {
    const mapped = mapArticleRowToResponse(data);
    return success(mapped, 200);
  } catch (err) {
    return failure(
      500,
      articleErrorCodes.validationError,
      'Article row failed validation.',
      err,
    );
  }
};

/**
 * Updates an existing article
 * Only updates articles belonging to the specified user
 */
export const updateArticle = async (
  client: SupabaseClient,
  clerkUserId: string,
  articleId: string,
  data: UpdateArticleRequest,
): Promise<HandlerResult<ArticleResponse, ArticleServiceError, unknown>> => {
  // Map camelCase TypeScript to snake_case database columns
  const updateData: Record<string, unknown> = {};

  if (data.title !== undefined) updateData.title = data.title;
  if (data.slug !== undefined) updateData.slug = data.slug;
  if (data.keywords !== undefined) updateData.keywords = data.keywords;
  if (data.description !== undefined)
    updateData.description = data.description || null;
  if (data.content !== undefined) updateData.content = data.content;
  if (data.styleGuideId !== undefined)
    updateData.style_guide_id = data.styleGuideId || null;
  if (data.tone !== undefined) updateData.tone = data.tone || null;
  if (data.contentLength !== undefined)
    updateData.content_length = data.contentLength || null;
  if (data.readingLevel !== undefined)
    updateData.reading_level = data.readingLevel || null;
  if (data.metaTitle !== undefined)
    updateData.meta_title = data.metaTitle || null;
  if (data.metaDescription !== undefined)
    updateData.meta_description = data.metaDescription || null;
  if (data.status !== undefined) {
    updateData.status = data.status;
    // If publishing for the first time, set published_at
    if (data.status === 'published') {
      updateData.published_at = new Date().toISOString();
    }
  }

  const profileId = await getProfileIdByClerkId(client, clerkUserId);
  if (!profileId) {
    return failure(404, articleErrorCodes.notFound, 'Profile not found');
  }
  const { data: updatedData, error } = await client
    .from(ARTICLES_TABLE)
    .update(updateData)
    .eq('id', articleId)
    .eq('profile_id', profileId)
    .select('*')
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return failure(404, articleErrorCodes.notFound, 'Article not found');
    }
    return failure(
      500,
      articleErrorCodes.updateError,
      `Failed to update article: ${error.message}`,
    );
  }

  if (!updatedData) {
    return failure(
      500,
      articleErrorCodes.updateError,
      'Article was updated but no data was returned',
    );
  }

  try {
    const mapped = mapArticleRowToResponse(updatedData);
    return success(mapped, 200);
  } catch (err) {
    return failure(
      500,
      articleErrorCodes.validationError,
      'Article row failed validation.',
      err,
    );
  }
};

/**
 * Deletes an article by ID
 * Only deletes articles belonging to the specified user
 */
export const deleteArticle = async (
  client: SupabaseClient,
  clerkUserId: string,
  articleId: string,
): Promise<HandlerResult<{ id: string }, ArticleServiceError, unknown>> => {
  const profileId = await getProfileIdByClerkId(client, clerkUserId);
  if (!profileId) {
    return failure(404, articleErrorCodes.notFound, 'Profile not found');
  }
  const { error } = await client
    .from(ARTICLES_TABLE)
    .delete()
    .eq('id', articleId)
    .eq('profile_id', profileId);

  if (error) {
    return failure(
      500,
      articleErrorCodes.deleteError,
      `Failed to delete article: ${error.message}`,
    );
  }

  return success({ id: articleId }, 200);
};

/**
 * Lists articles with pagination, filtering, and sorting
 */
export const listArticles = async (
  client: SupabaseClient,
  clerkUserId: string,
  query: ListArticlesQuery,
): Promise<HandlerResult<ListArticlesResponse, ArticleServiceError, unknown>> => {
  const profileId = await getProfileIdByClerkId(client, clerkUserId);
  if (!profileId) {
    return failure(404, articleErrorCodes.notFound, 'Profile not found');
  }

  // Build the base query
  let dbQuery = client
    .from(ARTICLES_TABLE)
    .select('*', { count: 'exact' })
    .eq('profile_id', profileId);

  // Apply status filter
  if (query.status !== 'all') {
    dbQuery = dbQuery.eq('status', query.status);
  }

  // Apply sorting
  const sortColumn = query.sortBy;
  const sortAscending = query.sortOrder === 'asc';
  dbQuery = dbQuery.order(sortColumn, { ascending: sortAscending });

  // Apply pagination
  const from = query.offset;
  const to = query.offset + query.limit - 1;
  dbQuery = dbQuery.range(from, to);

  const { data, error, count } = await dbQuery;

  if (error) {
    return failure(
      500,
      articleErrorCodes.fetchError,
      `Failed to fetch articles: ${error.message}`,
    );
  }

  if (!data) {
    return success({
      articles: [],
      total: 0,
      limit: query.limit,
      offset: query.offset,
    }, 200);
  }

  try {
    const articles = data.map((row) => mapArticleRowToResponse(row));
    return success({
      articles,
      total: count ?? 0,
      limit: query.limit,
      offset: query.offset,
    }, 200);
  } catch (err) {
    return failure(
      500,
      articleErrorCodes.validationError,
      'One or more article rows failed validation.',
      err,
    );
  }
};

/**
 * Gets dashboard statistics for the user
 */
export const getDashboardStats = async (
  client: SupabaseClient,
  clerkUserId: string,
): Promise<HandlerResult<DashboardStatsResponse, ArticleServiceError, unknown>> => {
  const profileId = await getProfileIdByClerkId(client, clerkUserId);
  if (!profileId) {
    return failure(404, articleErrorCodes.notFound, 'Profile not found');
  }

  // Get all articles for the user
  const { data, error } = await client
    .from(ARTICLES_TABLE)
    .select('status, created_at')
    .eq('profile_id', profileId);

  if (error) {
    return failure(
      500,
      articleErrorCodes.fetchError,
      `Failed to fetch dashboard stats: ${error.message}`,
    );
  }

  const articles = data || [];

  // Calculate stats
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthlyArticles = articles.filter((article) => {
    const createdAt = new Date(article.created_at);
    return (
      createdAt.getMonth() === currentMonth &&
      createdAt.getFullYear() === currentYear
    );
  }).length;

  const totalArticles = articles.length;
  const publishedArticles = articles.filter((a) => a.status === 'published').length;
  const draftArticles = articles.filter((a) => a.status === 'draft').length;

  // Estimate saved hours (assuming each article saves 2 hours on average)
  const savedHours = totalArticles * 2;

  return success({
    monthlyArticles,
    totalArticles,
    publishedArticles,
    draftArticles,
    savedHours,
  }, 200);
};
