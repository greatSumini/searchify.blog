import type { Hono } from 'hono';
import {
  failure,
} from '@/backend/http/response';
import { respondWithDomain, respondCreated } from '@/backend/http/mapper';
import {
  getLogger,
  getSupabase,
  getClerkUserId,
  type AppEnv,
} from '@/backend/hono/context';
import { CreateStyleGuideRequestSchema } from '@/features/onboarding/backend/schema';
import { createStyleGuide, listStyleGuides, getStyleGuideById, updateStyleGuide, deleteStyleGuide, markOnboardingCompleted } from './service';
import {
  styleGuideErrorCodes,
} from './error';

export const registerOnboardingRoutes = (app: Hono<AppEnv>) => {
  /**
   * POST /api/style-guides
   * Creates a new style guide for a user
   *
   * Request body: OnboardingFormData
   */
  app.post('/api/style-guides', async (c) => {
    const userId = getClerkUserId(c);

    // Parse and validate request body
    const body = await c.req.json();
    const parsedBody = CreateStyleGuideRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      return c.json(
        failure(
          400,
          styleGuideErrorCodes.validationError,
          'Invalid request body. Please check your input.',
          parsedBody.error.format(),
        ),
        400
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    // Create new style guide
    const result = await createStyleGuide(supabase, userId, parsedBody.data);

    if (result.ok) {
      logger.info('Style guide created successfully', { userId });
    }

    return respondCreated(c, result);
  });

  /**
   * GET /api/style-guides
   * Gets all style guides for a user
   */
  app.get('/api/style-guides', async (c) => {
    const userId = getClerkUserId(c);
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    // Get all style guides
    const result = await listStyleGuides(supabase, userId);

    if (result.ok) {
      logger.info('Style guides retrieved successfully', { userId, count: result.value.length });
    }

    return respondWithDomain(c, result);
  });

  /**
   * GET /api/style-guides/:id
   * Gets a single style guide by ID
   *
   * URL params: id (style guide ID)
   */
  app.get('/api/style-guides/:id', async (c) => {
    const userId = getClerkUserId(c);
    const guideId = c.req.param('id');

    if (!guideId) {
      return c.json(
        failure(
          400,
          styleGuideErrorCodes.validationError,
          'Style guide ID is required.',
        ),
        400
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    // Get style guide by ID
    const result = await getStyleGuideById(supabase, guideId, userId);

    if (result.ok) {
      logger.info('Style guide retrieved successfully', { userId, guideId });
    }

    return respondWithDomain(c, result);
  });

  /**
   * PATCH /api/style-guides/:id
   * Updates a style guide for a user
   *
   * URL params: id (style guide ID)
   * Request body: OnboardingFormData
   */
  app.patch('/api/style-guides/:id', async (c) => {
    const userId = getClerkUserId(c);
    const guideId = c.req.param('id');

    if (!guideId) {
      return c.json(
        failure(
          400,
          styleGuideErrorCodes.validationError,
          'Style guide ID is required.',
        ),
        400
      );
    }

    // Parse and validate request body
    const body = await c.req.json();
    const parsedBody = CreateStyleGuideRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      return c.json(
        failure(
          400,
          styleGuideErrorCodes.validationError,
          'Invalid request body. Please check your input.',
          parsedBody.error.format(),
        ),
        400
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    // Update style guide
    const result = await updateStyleGuide(supabase, guideId, userId, parsedBody.data);

    if (result.ok) {
      logger.info('Style guide updated successfully', { userId, guideId });
    }

    return respondWithDomain(c, result);
  });

  /**
   * DELETE /api/style-guides/:id
   * Deletes a style guide for a user
   *
   * URL params: id (style guide ID)
   */
  app.delete('/api/style-guides/:id', async (c) => {
    const userId = getClerkUserId(c);
    const guideId = c.req.param('id');

    if (!guideId) {
      return c.json(
        failure(
          400,
          styleGuideErrorCodes.validationError,
          'Style guide ID is required.',
        ),
        400
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    // Delete style guide
    const result = await deleteStyleGuide(supabase, guideId, userId);

    if (result.ok) {
      logger.info('Style guide deleted successfully', { userId, guideId });
    }

    return respondWithDomain(c, result);
  });

  /**
   * PATCH /api/onboarding/complete
   * Marks onboarding as completed for a user
   * This ensures the middleware can check completion status from DB
   */
  app.patch('/api/onboarding/complete', async (c) => {
    const userId = getClerkUserId(c);
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    // Update the onboarding_completed flag
    const result = await markOnboardingCompleted(supabase, userId);

    if (result.ok) {
      logger.info('Onboarding marked as completed', { userId });
    }

    return respondWithDomain(c, result);
  });
};
