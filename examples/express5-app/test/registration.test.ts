import { describe, expect, it, vi } from 'vitest';
import { requireAuth } from '../src/middleware/auth.js';
import { errorHandler, notFoundHandler } from '../src/middleware/error-handlers.js';

/**
 * Middleware Registration Tests
 *
 * Demonstrates the README's recipe for mocking the 'express' module with `vi.mock('express')`
 * to verify middleware registration and route mounting on `app` or `Router`.
 *
 * Spreading `express` ensures both default and named imports (`import express, { Router, json } from 'express'`)
 * resolve to vitest-express mocks.
 */
vi.mock('express', async () => {
  const { default: express } = await import('vitest-express');
  return { ...express, default: express };
});

describe('Middleware registration with mocked Express', () => {
  it('registers all required middleware and routes in createApp()', async () => {
    // Dynamically import the module under test inside the test to assert on fresh mocks
    const { createApp } = await import('../src/app.js');
    const { default: express } = await import('express');

    const app = createApp();

    // 1. Verify the JSON body parser was mounted. express.json() returns the same
    //    pass-through middleware every time, so this checks the exact function registered.
    expect(app.use).toHaveBeenCalledWith(express.json());

    // 2. Verify /health route was registered
    expect(app.get).toHaveBeenCalledWith('/health', expect.any(Function));

    // 3. Verify /users route was mounted with auth middleware and router
    expect(app.use).toHaveBeenCalledWith(
      '/users',
      requireAuth,
      expect.objectContaining({ get: expect.any(Function), post: expect.any(Function) }),
    );

    // 4. Verify 404 catch-all handler was mounted
    expect(app.use).toHaveBeenCalledWith(notFoundHandler);

    // 5. Verify centralized error handler was mounted
    expect(app.use).toHaveBeenCalledWith(errorHandler);
  });

  it('registers expected HTTP routes on createUsersRouter()', async () => {
    const { createUsersRouter } = await import('../src/routes/users.js');

    const router = createUsersRouter();

    // Verify GET / (list users) route registration
    expect(router.get).toHaveBeenCalledWith('/', expect.any(Function));

    // Verify GET /:id (get user by id) route registration
    expect(router.get).toHaveBeenCalledWith('/:id', expect.any(Function));

    // Verify POST / (create user) route registration
    expect(router.post).toHaveBeenCalledWith('/', expect.any(Function));
  });
});
