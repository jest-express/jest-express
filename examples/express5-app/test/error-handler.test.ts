import type { RequestHandler } from 'express';
import { describe, expect, it } from 'vitest';
import express, { createNext, createRequest, createResponse } from 'vitest-express';
import { errorHandler, notFoundHandler } from '../src/middleware/error-handlers.js';
import { HttpError } from '../src/types.js';

/**
 * Error Handler Unit Tests
 *
 * Demonstrates testing 404 catch-alls and 4-argument Express error handlers:
 * 1. Directly with `createRequest()`, `createResponse()`, and `createNext()`.
 * 2. In a mock Express chain using `app.use(failingMiddleware, errorHandler)`.
 */
describe('Error handlers', () => {
  describe('notFoundHandler', () => {
    it('sets 404 status and returns route error JSON', () => {
      const req = createRequest('/unknown/path', { method: 'GET' });
      const res = createResponse();
      const next = createNext();

      notFoundHandler(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.statusCode).toBe(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Route not found: GET /unknown/path',
      });
      expect(res.body).toEqual({
        error: 'Route not found: GET /unknown/path',
      });
    });
  });

  describe('errorHandler (direct invocation)', () => {
    it('handles HttpError with custom status code', () => {
      const error = new HttpError(403, 'Forbidden access');
      const req = createRequest();
      const res = createResponse();
      const next = createNext();

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.statusCode).toBe(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden access' });
      expect(next).not.toHaveBeenCalled();
    });

    it('defaults to status 500 for generic unhandled errors', () => {
      const error = new Error('Unexpected database failure');
      const req = createRequest();
      const res = createResponse();
      const next = createNext();

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.statusCode).toBe(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unexpected database failure' });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('errorHandler (mock Express chain)', () => {
    it('handles an error forwarded by middleware in app.use()', () => {
      const app = express();
      const customError = new HttpError(401, 'Unauthorized');

      // Middleware that forwards an error
      const failingMiddleware: RequestHandler = (_req, _res, next) => next(customError);

      // Register both in the same registration chain so error handler catches it
      app.use(failingMiddleware, errorHandler);

      expect(app.next).toHaveBeenCalledWith(customError);
      expect(app.response.statusCode).toBe(401);
      expect(app.response.body).toEqual({ error: 'Unauthorized' });
    });
  });
});
