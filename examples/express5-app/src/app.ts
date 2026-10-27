import type { Express } from 'express';
import express from 'express';
import { requireAuth } from './middleware/auth.js';
import { errorHandler, notFoundHandler } from './middleware/error-handlers.js';
import { createUsersRouter } from './routes/users.js';
import { defaultUserService, type UserService } from './services/user-service.js';

export interface AppOptions {
  userService?: UserService;
}

export function createApp(options: AppOptions = {}): Express {
  const app = express();

  // Parse incoming JSON request bodies
  app.use(express.json());

  // Public health check endpoint
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // Protected users API routes
  app.use('/users', requireAuth, createUsersRouter(options.userService ?? defaultUserService));

  // Catch-all 404 handler for unknown routes
  app.use(notFoundHandler);

  // Centralized error-handling middleware
  app.use(errorHandler);

  return app;
}
