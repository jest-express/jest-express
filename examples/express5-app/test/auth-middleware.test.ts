import { describe, expect, it } from 'vitest';
import { createNext, createRequest, createResponse } from 'vitest-express';
import { requireAuth } from '../src/middleware/auth.js';
import { HttpError } from '../src/types.js';

/**
 * Auth Middleware Unit Tests
 *
 * Demonstrates testing Express middleware calling `next()` on success
 * and `next(err)` on failure using `createNext()`.
 */
describe('Auth middleware (requireAuth)', () => {
  it('calls next() with no arguments when a valid Bearer token is provided', () => {
    // 1. Arrange: create mock request with Authorization header
    const req = createRequest('/users');
    req.setHeaders('Authorization', 'Bearer secret-token');

    const res = createResponse();
    const next = createNext();

    // 2. Act: invoke middleware
    requireAuth(req, res, next);

    // 3. Assert: next() was called with zero arguments (continuing the chain)
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('calls next(HttpError) with 401 when Authorization header is missing', () => {
    const req = createRequest('/users'); // No Authorization header
    const res = createResponse();
    const next = createNext();

    requireAuth(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(expect.any(HttpError));
    expect(next.mock.calls[0]?.[0]).toMatchObject({
      status: 401,
      message: expect.stringMatching(/missing authorization header/i),
    });
  });

  it('calls next(HttpError) with 401 when Authorization format is not Bearer', () => {
    const req = createRequest('/users');
    req.setHeaders('Authorization', 'Basic dXNlcjpwYXNz');

    const res = createResponse();
    const next = createNext();

    requireAuth(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(expect.any(HttpError));
    expect(next.mock.calls[0]?.[0]).toMatchObject({
      status: 401,
      message: expect.stringMatching(/invalid token format/i),
    });
  });

  it('calls next(HttpError) with 403 when Bearer token is incorrect', () => {
    const req = createRequest('/users');
    req.setHeaders('Authorization', 'Bearer wrong-token');

    const res = createResponse();
    const next = createNext();

    requireAuth(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(expect.any(HttpError));
    expect(next.mock.calls[0]?.[0]).toMatchObject({
      status: 403,
      message: expect.stringMatching(/invalid token/i),
    });
  });
});
