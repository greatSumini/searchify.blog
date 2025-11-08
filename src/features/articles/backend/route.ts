import type { Hono } from 'hono';
import {
  failure,
  respond,
  type ErrorResult,
} from '@/backend/http/response';
import {
  getLogger,
  getSupabase,
  type AppEnv,
} from '@/backend/hono/context';
import {
  CreateArticleRequestSchema,
  UpdateArticleRequestSchema,
} from '@/features/articles/backend/schema';
import {
  createArticle,
  getArticleById,
  updateArticle,
  deleteArticle,
} from './service';
import {
  articleErrorCodes,
  type ArticleServiceError,
} from './error';

export const registerArticlesRoutes = (app: Hono<AppEnv>) => {
  /**
   * POST /api/articles/draft
   * Creates a new article draft
   *
   * Request body: CreateArticleRequest
   * Headers: x-clerk-user-id (required)
   */
  app.post('/api/articles/draft', async (c) => {
    // Get userId from header (passed from server action)
    const userId = c.req.header('x-clerk-user-id');

    if (!userId) {
      return respond(
        c,
        failure(
          401,
          articleErrorCodes.unauthorized,
          'User ID is required. Please provide x-clerk-user-id header.',
        ),
      );
    }

    // Parse and validate request body
    const body = await c.req.json();
    const parsedBody = CreateArticleRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      return respond(
        c,
        failure(
          400,
          articleErrorCodes.validationError,
          'Invalid request body. Please check your input.',
          parsedBody.error.format(),
        ),
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    // Create article draft
    const result = await createArticle(supabase, userId, parsedBody.data);

    if (!result.ok) {
      const errorResult = result as ErrorResult<ArticleServiceError, unknown>;
      logger.error('Failed to create article draft', errorResult.error.message);
      return respond(c, result);
    }

    logger.info('Article draft created successfully', { userId, articleId: result.data.id });
    return respond(c, result);
  });

  /**
   * GET /api/articles/:id
   * Gets an article by ID
   *
   * URL params: id (article UUID)
   * Headers: x-clerk-user-id (required)
   */
  app.get('/api/articles/:id', async (c) => {
    // Get userId from header
    const userId = c.req.header('x-clerk-user-id');

    if (!userId) {
      return respond(
        c,
        failure(
          401,
          articleErrorCodes.unauthorized,
          'User ID is required. Please provide x-clerk-user-id header.',
        ),
      );
    }

    const articleId = c.req.param('id');

    if (!articleId) {
      return respond(
        c,
        failure(
          400,
          articleErrorCodes.validationError,
          'Article ID is required.',
        ),
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    // Get article
    const result = await getArticleById(supabase, userId, articleId);

    if (!result.ok) {
      const errorResult = result as ErrorResult<ArticleServiceError, unknown>;
      logger.error('Failed to get article', errorResult.error.message);
      return respond(c, result);
    }

    logger.info('Article retrieved successfully', { userId, articleId });
    return respond(c, result);
  });

  /**
   * PATCH /api/articles/:id
   * Updates an article
   *
   * URL params: id (article UUID)
   * Request body: UpdateArticleRequest
   * Headers: x-clerk-user-id (required)
   */
  app.patch('/api/articles/:id', async (c) => {
    // Get userId from header
    const userId = c.req.header('x-clerk-user-id');

    if (!userId) {
      return respond(
        c,
        failure(
          401,
          articleErrorCodes.unauthorized,
          'User ID is required. Please provide x-clerk-user-id header.',
        ),
      );
    }

    const articleId = c.req.param('id');

    if (!articleId) {
      return respond(
        c,
        failure(
          400,
          articleErrorCodes.validationError,
          'Article ID is required.',
        ),
      );
    }

    // Parse and validate request body
    const body = await c.req.json();
    const parsedBody = UpdateArticleRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      return respond(
        c,
        failure(
          400,
          articleErrorCodes.validationError,
          'Invalid request body. Please check your input.',
          parsedBody.error.format(),
        ),
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    // Update article
    const result = await updateArticle(
      supabase,
      userId,
      articleId,
      parsedBody.data,
    );

    if (!result.ok) {
      const errorResult = result as ErrorResult<ArticleServiceError, unknown>;
      logger.error('Failed to update article', errorResult.error.message);
      return respond(c, result);
    }

    logger.info('Article updated successfully', { userId, articleId });
    return respond(c, result);
  });

  /**
   * DELETE /api/articles/:id
   * Deletes an article
   *
   * URL params: id (article UUID)
   * Headers: x-clerk-user-id (required)
   */
  app.delete('/api/articles/:id', async (c) => {
    // Get userId from header
    const userId = c.req.header('x-clerk-user-id');

    if (!userId) {
      return respond(
        c,
        failure(
          401,
          articleErrorCodes.unauthorized,
          'User ID is required. Please provide x-clerk-user-id header.',
        ),
      );
    }

    const articleId = c.req.param('id');

    if (!articleId) {
      return respond(
        c,
        failure(
          400,
          articleErrorCodes.validationError,
          'Article ID is required.',
        ),
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    // Delete article
    const result = await deleteArticle(supabase, userId, articleId);

    if (!result.ok) {
      const errorResult = result as ErrorResult<ArticleServiceError, unknown>;
      logger.error('Failed to delete article', errorResult.error.message);
      return respond(c, result);
    }

    logger.info('Article deleted successfully', { userId, articleId });
    return respond(c, result);
  });
};
