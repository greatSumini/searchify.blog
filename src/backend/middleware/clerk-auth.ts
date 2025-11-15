import type { MiddlewareHandler } from 'hono';
import type { AppEnv } from '@/backend/hono/context';
import { failure } from '@/backend/http/response';

/**
 * Clerk Authentication Middleware
 *
 * Extracts Clerk user ID from x-clerk-user-id header and injects it into context.
 * This middleware should be applied to all routes that require authentication.
 *
 * Usage:
 * ```typescript
 * app.use('/api/*', withClerkAuth());
 * ```
 *
 * Then access the user ID in routes:
 * ```typescript
 * const clerkUserId = getClerkUserId(c);
 * ```
 */
export const withClerkAuth = (): MiddlewareHandler<AppEnv> => {
  return async (c, next) => {
    const userId = c.req.header('x-clerk-user-id');

    if (!userId) {
      return c.json(
        failure(
          401,
          'UNAUTHORIZED',
          'Authentication required. Please provide x-clerk-user-id header.'
        ),
        401
      );
    }

    // Inject Clerk user ID into context for downstream use
    c.set('clerkUserId', userId);

    await next();
  };
};
