import { describe, expect, it } from 'vitest';
import { createNext, createRequest, createResponse } from 'vitest-express';
import { createUserHandler, getUserByIdHandler } from '../src/routes/users.js';
import { InMemoryUserService } from '../src/services/user-service.js';
import { HttpError } from '../src/types.js';

/**
 * Route Handler Unit Tests
 *
 * Demonstrates how to unit-test an Express route handler directly in isolation
 * using `createRequest()`, `createResponse()`, and `createNext()`.
 *
 * Why unit test handlers directly?
 * - Fast: no HTTP server or socket overhead.
 * - Isolated: easy to provide custom request parameters, body, or headers.
 * - Explicit: assert directly on response status, headers, and body.
 */
describe('User route handlers', () => {
  it('creates a user when valid body is provided (POST /users)', async () => {
    // 1. Arrange: create an isolated service and mock request/response/next objects
    const userService = new InMemoryUserService();
    const handler = createUserHandler(userService);

    const req = createRequest('/users', { method: 'POST' });
    req.setBody({ name: 'Grace Hopper', email: 'grace@example.com' });

    const res = createResponse();
    const next = createNext();

    // 2. Act: invoke the handler directly
    await handler(req, res, next);

    // 3. Assert: check response status code and JSON payload
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.statusCode).toBe(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Grace Hopper',
        email: 'grace@example.com',
      }),
    );
    expect(res.body).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: 'Grace Hopper',
        email: 'grace@example.com',
      }),
    );

    // Ensure next() was not called since the response was sent
    expect(next).not.toHaveBeenCalled();
  });

  it('forwards HttpError (400) to next() when name is missing', async () => {
    const userService = new InMemoryUserService();
    const handler = createUserHandler(userService);

    const req = createRequest('/users', { method: 'POST' });
    req.setBody({ email: 'missing-name@example.com' });

    const res = createResponse();
    const next = createNext();

    await handler(req, res, next);

    // When validation fails, the handler forwards an error to next(err)
    expect(next).toHaveBeenCalledWith(expect.any(HttpError));
    expect(next.mock.calls[0]?.[0]).toMatchObject({ status: 400, message: 'Name is required' });

    // No response should have been sent
    expect(res.json).not.toHaveBeenCalled();
  });

  it('returns a user by ID when found (GET /users/:id)', async () => {
    const userService = new InMemoryUserService();
    const handler = getUserByIdHandler(userService);

    const req = createRequest('/users/1', { method: 'GET' });
    req.setParams('id', '1');

    const res = createResponse();
    const next = createNext();

    await handler(req, res, next);

    expect(res.json).toHaveBeenCalledWith({
      id: '1',
      name: 'Alice',
      email: 'alice@example.com',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('forwards HttpError (404) to next() when user does not exist', async () => {
    const userService = new InMemoryUserService();
    const handler = getUserByIdHandler(userService);

    const req = createRequest('/users/999', { method: 'GET' });
    req.setParams('id', '999');

    const res = createResponse();
    const next = createNext();

    await handler(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(HttpError));
    expect(next.mock.calls[0]?.[0]).toMatchObject({ status: 404, message: 'User 999 not found' });
    expect(res.json).not.toHaveBeenCalled();
  });
});
