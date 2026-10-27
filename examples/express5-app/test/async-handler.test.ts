import { describe, expect, it, vi } from 'vitest';
import express, { createNext, createRequest, createResponse } from 'vitest-express';
import { listUsersHandler } from '../src/routes/users.js';
import type { UserService } from '../src/services/user-service.js';

/**
 * Async Handler Unit Tests
 *
 * Demonstrates how to test async Express route handlers and verify that
 * thrown errors or promise rejections are forwarded to `next(err)`.
 */
describe('Async route handlers', () => {
  const failingService = (error: Error): UserService => ({
    list: vi.fn().mockRejectedValue(error),
    findById: vi.fn(),
    create: vi.fn(),
  });

  it('rejects when called directly, because Express is what forwards the error', async () => {
    // listUsersHandler has no try/catch: in Express 5 a rejected promise from a handler is
    // forwarded to next(err) by Express itself. Called directly, the handler just rejects.
    const dbError = new Error('Database connection failed');
    const handler = listUsersHandler(failingService(dbError));
    const res = createResponse();
    const next = createNext();

    await expect(handler(createRequest('/users'), res, next)).rejects.toBe(dbError);
    expect(res.json).not.toHaveBeenCalled();
  });

  it('forwards the rejection to next(err) when registered on an app, like Express 5', async () => {
    // Registering the handler on a vitest-express app runs it the way Express 5 does,
    // including forwarding the rejection to next(err), recorded on app.next.
    const app = express();
    const dbError = new Error('Database connection failed');

    app.get('/users', listUsersHandler(failingService(dbError)));

    // The rejection is forwarded asynchronously, so wait for it rather than awaiting app.get().
    await vi.waitFor(() => {
      expect(app.next).toHaveBeenCalledWith(dbError);
    });
    expect(app.response.json).not.toHaveBeenCalled();
  });
});
