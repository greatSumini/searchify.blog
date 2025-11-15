import { Hono } from 'hono';
import { errorBoundary } from '@/backend/middleware/error';
import { withAppContext } from '@/backend/middleware/context';
import { withSupabase } from '@/backend/middleware/supabase';
import { withClerkAuth } from '@/backend/middleware/clerk-auth';
import { registerExampleRoutes } from '@/features/example/backend/route';
import { registerOnboardingRoutes } from '@/features/onboarding/backend/route';
import { registerArticlesRoutes } from '@/features/articles/backend/route';
import { registerProfilesRoutes } from '@/features/profiles/backend/route';
import { registerKeywordsRoutes } from '@/features/keywords/backend/route';
import type { AppEnv } from '@/backend/hono/context';

let singletonApp: Hono<AppEnv> | null = null;

export const createHonoApp = () => {
  // In development, always recreate the app to support HMR
  // In production, use singleton pattern for performance
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (!isDevelopment && singletonApp) {
    return singletonApp;
  }

  const app = new Hono<AppEnv>();

  // Global middleware (applied to all routes)
  app.use('*', errorBoundary());
  app.use('*', withAppContext());
  app.use('*', withSupabase());

  // Authentication middleware (applied to all /api routes)
  app.use('/api/*', withClerkAuth());

  registerExampleRoutes(app);
  registerOnboardingRoutes(app);
  registerArticlesRoutes(app);
  registerProfilesRoutes(app);
  registerKeywordsRoutes(app);

  // Only cache in production
  if (!isDevelopment) {
    singletonApp = app;
  }

  return app;
};
