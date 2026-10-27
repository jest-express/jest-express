import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { InMemoryUserService } from '../src/services/user-service.js';

/**
 * Supertest Integration Tests
 *
 * Demonstrates when to use `supertest` with real Express vs `vitest-express` unit tests.
 *
 * - Use `vitest-express` for unit tests:
 *   Fast, zero-overhead testing of individual middleware, route handlers, error handlers,
 *   and route registration assertions without starting a real HTTP server.
 *
 * - Use `supertest` for integration tests:
 *   Validates the end-to-end HTTP pipeline against a real Express application instance,
 *   including URL routing, JSON body-parser stream parsing, nested routers, and
 *   middleware cascading through the real Node.js HTTP stack.
 */
describe('Express 5 App Integration (Supertest)', () => {
  const token = 'Bearer secret-token';

  it('GET /health returns 200 OK without authentication', async () => {
    const app = createApp();

    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/application\/json/);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('GET /users returns 401 Unauthorized when token is missing', async () => {
    const app = createApp();

    const response = await request(app).get('/users');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: 'Unauthorized: missing authorization header',
    });
  });

  it('GET /users returns 200 with user list when authenticated', async () => {
    const app = createApp();

    const response = await request(app).get('/users').set('Authorization', token);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('users');
    expect(Array.isArray(response.body.users)).toBe(true);
    expect(response.body.users.length).toBeGreaterThanOrEqual(2);
  });

  it('POST /users creates a new user with 201 Created and allows fetching by ID', async () => {
    const userService = new InMemoryUserService();
    const app = createApp({ userService });

    // 1. Create a user
    const createResponse = await request(app)
      .post('/users')
      .set('Authorization', token)
      .send({ name: 'Margaret Hamilton', email: 'margaret@example.com' });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: 'Margaret Hamilton',
        email: 'margaret@example.com',
      }),
    );

    const createdId = createResponse.body.id;

    // 2. Fetch the created user
    const getResponse = await request(app).get(`/users/${createdId}`).set('Authorization', token);

    expect(getResponse.status).toBe(200);
    expect(getResponse.body).toEqual({
      id: createdId,
      name: 'Margaret Hamilton',
      email: 'margaret@example.com',
    });
  });

  it('POST /users returns 400 Bad Request on invalid input', async () => {
    const app = createApp();

    const response = await request(app)
      .post('/users')
      .set('Authorization', token)
      .send({ name: '', email: 'not-an-email' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Name is required',
    });
  });

  it('GET /unknown-path returns 404 with route error', async () => {
    const app = createApp();

    const response = await request(app).get('/non-existent-route');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: 'Route not found: GET /non-existent-route',
    });
  });
});
