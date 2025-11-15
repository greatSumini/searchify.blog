import type { Hono } from 'hono';
import {
  failure,
  success,
} from '@/backend/http/response';
import { respondWithDomain, respondCreated } from '@/backend/http/mapper';
import {
  getLogger,
  getSupabase,
  getConfig,
  getClerkUserId,
  type AppEnv,
} from '@/backend/hono/context';
import {
  CreateArticleRequestSchema,
  UpdateArticleRequestSchema,
  GenerateArticleRequestSchema,
  ListArticlesQuerySchema,
} from '@/features/articles/backend/schema';
import {
  createArticle,
  getArticleById,
  updateArticle,
  deleteArticle,
  listArticles,
  getDashboardStats,
} from './service';
import {
  articleErrorCodes,
} from './error';
import { generateArticleContent } from './ai-service';
import { checkQuota, incrementQuota } from './quota-service';
import { generateUniqueSlug } from '@/lib/slug';

export const registerArticlesRoutes = (app: Hono<AppEnv>) => {
  /**
   * GET /api/articles
   * Lists articles with pagination, filtering, and sorting
   *
   * Query params: limit, offset, status, sortBy, sortOrder
   */
  app.get('/api/articles', async (c) => {
    const userId = getClerkUserId(c);

    // Parse and validate query parameters
    const queryParams = c.req.query();
    const parsedQuery = ListArticlesQuerySchema.safeParse(queryParams);

    if (!parsedQuery.success) {
      return c.json(
        failure(
          400,
          articleErrorCodes.validationError,
          'Invalid query parameters. Please check your input.',
          parsedQuery.error.format(),
        ),
        400
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    // List articles
    const result = await listArticles(supabase, userId, parsedQuery.data);

    if (result.ok) {
      logger.info('Articles listed successfully', {
        userId,
        count: result.data.articles.length,
        total: result.data.total,
      });
    }

    return respondWithDomain(c, result);
  });

  /**
   * GET /api/articles/stats
   * Gets dashboard statistics for the current user
   */
  app.get('/api/articles/stats', async (c) => {
    const userId = getClerkUserId(c);

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    // Get dashboard stats
    const result = await getDashboardStats(supabase, userId);

    if (result.ok) {
      logger.info('Dashboard stats retrieved successfully', { userId });
    }

    return respondWithDomain(c, result);
  });

  /**
   * POST /api/articles/draft
   * Creates a new article draft
   *
   * Request body: CreateArticleRequest
   */
  app.post('/api/articles/draft', async (c) => {
    const userId = getClerkUserId(c);

    // Parse and validate request body
    const body = await c.req.json();
    const parsedBody = CreateArticleRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      return c.json(
        failure(
          400,
          articleErrorCodes.validationError,
          'Invalid request body. Please check your input.',
          parsedBody.error.format(),
        ),
        400
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    // Create article draft
    const result = await createArticle(supabase, userId, parsedBody.data);

    if (result.ok) {
      logger.info('Article draft created successfully', { userId, articleId: result.data.id });
    }

    return respondCreated(c, result);
  });

  /**
   * GET /api/articles/:id
   * Gets an article by ID
   *
   * URL params: id (article UUID)
   */
  app.get('/api/articles/:id', async (c) => {
    const userId = getClerkUserId(c);
    const articleId = c.req.param('id');

    if (!articleId) {
      return c.json(
        failure(
          400,
          articleErrorCodes.validationError,
          'Article ID is required.',
        ),
        400
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    // Get article
    const result = await getArticleById(supabase, userId, articleId);

    if (result.ok) {
      logger.info('Article retrieved successfully', { userId, articleId });
    }

    return respondWithDomain(c, result);
  });

  /**
   * PATCH /api/articles/:id
   * Updates an article
   *
   * URL params: id (article UUID)
   * Request body: UpdateArticleRequest
   */
  app.patch('/api/articles/:id', async (c) => {
    const userId = getClerkUserId(c);
    const articleId = c.req.param('id');

    if (!articleId) {
      return c.json(
        failure(
          400,
          articleErrorCodes.validationError,
          'Article ID is required.',
        ),
        400
      );
    }

    // Parse and validate request body
    const body = await c.req.json();
    const parsedBody = UpdateArticleRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      return c.json(
        failure(
          400,
          articleErrorCodes.validationError,
          'Invalid request body. Please check your input.',
          parsedBody.error.format(),
        ),
        400
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

    if (result.ok) {
      logger.info('Article updated successfully', { userId, articleId });
    }

    return respondWithDomain(c, result);
  });

  /**
   * DELETE /api/articles/:id
   * Deletes an article
   *
   * URL params: id (article UUID)
   */
  app.delete('/api/articles/:id', async (c) => {
    const userId = getClerkUserId(c);
    const articleId = c.req.param('id');

    if (!articleId) {
      return c.json(
        failure(
          400,
          articleErrorCodes.validationError,
          'Article ID is required.',
        ),
        400
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    // Delete article
    const result = await deleteArticle(supabase, userId, articleId);

    if (result.ok) {
      logger.info('Article deleted successfully', { userId, articleId });
    }

    return respondWithDomain(c, result);
  });

  /**
   * POST /api/articles/generate
   * Generates a new article using AI (Google Gemini)
   *
   * Request body: GenerateArticleRequest
   */
  app.post('/api/articles/generate', async (c) => {
    const userId = getClerkUserId(c);

    // Parse and validate request body
    const body = await c.req.json();
    const parsedBody = GenerateArticleRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      return c.json(
        failure(
          400,
          articleErrorCodes.validationError,
          'Invalid request body. Please check your input.',
          parsedBody.error.format(),
        ),
        400
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);
    const config = getConfig(c);

    // Step 1: Check quota
    const quotaCheckResult = await checkQuota(supabase, userId);

    if (!quotaCheckResult.ok) {
      return respondWithDomain(c, quotaCheckResult);
    }

    if (!quotaCheckResult.data.allowed) {
      return c.json(
        failure(
          429,
          articleErrorCodes.quotaExceeded,
          `Generation quota exceeded. You have used ${quotaCheckResult.data.currentCount}/${quotaCheckResult.data.limit} generations.`,
          {
            tier: quotaCheckResult.data.tier,
            currentCount: quotaCheckResult.data.currentCount,
            limit: quotaCheckResult.data.limit,
          },
        ),
        429
      );
    }

    // Step 2: Generate article content using AI
    const generationResult = await generateArticleContent(
      supabase,
      userId,
      config.google.generativeAiApiKey,
      parsedBody.data,
    );

    if (!generationResult.ok) {
      return respondWithDomain(c, generationResult);
    }

    const generatedContent = generationResult.data;

    // Step 3: Create article in database
    const slug = generateUniqueSlug(generatedContent.title);

    const createArticleData = {
      title: generatedContent.title,
      slug,
      keywords: generatedContent.keywords,
      description: generatedContent.metaDescription,
      content: generatedContent.content,
      styleGuideId: parsedBody.data.styleGuideId,
      metaTitle: generatedContent.title,
      metaDescription: generatedContent.metaDescription,
    };

    const articleResult = await createArticle(supabase, userId, createArticleData);

    if (!articleResult.ok) {
      return respondWithDomain(c, articleResult);
    }

    // Step 4: Increment quota
    const incrementResult = await incrementQuota(supabase, userId);

    if (!incrementResult.ok) {
      logger.warn('Failed to increment quota after article creation');
      // Continue anyway since article was created successfully
    }

    const quotaRemaining = incrementResult.ok
      ? incrementResult.data.remaining
      : quotaCheckResult.data.remaining - 1;

    logger.info('Article generated successfully', {
      userId,
      articleId: articleResult.data.id,
      quotaRemaining,
    });

    // Return response
    return c.json(
      success(
        {
          article: articleResult.data,
          generatedContent,
          quotaRemaining,
        },
        201,
      ),
      201
    );
  });
};
