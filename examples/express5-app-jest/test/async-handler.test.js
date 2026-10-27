const express = require('jest-express');
const { createRequest, createResponse, createNext } = require('jest-express');
const { listUsersHandler } = require('../src/routes/users');

describe('Async route handlers and Express 5 error propagation', () => {
  const dbError = new Error('Database connection failed');
  const failingService = {
    list: jest.fn().mockRejectedValue(dbError),
  };

  it('rejects when called directly outside Express', async () => {
    const handler = listUsersHandler(failingService);
    const req = createRequest('/users');
    const res = createResponse();
    const next = createNext();

    await expect(handler(req, res, next)).rejects.toBe(dbError);
    expect(res.json).not.toHaveBeenCalled();
  });

  it('forwards the rejection to app.next(err) when registered on an app, like Express 5', async () => {
    const app = express();
    const handler = listUsersHandler(failingService);

    app.get('/users', handler);

    // In Express 5 / jest-express, unhandled rejections from registered handlers
    // are forwarded to next(err), which records on app.next.
    await new Promise((resolve) => setImmediate(resolve));

    expect(app.next).toHaveBeenCalledWith(dbError);
    expect(app.response.json).not.toHaveBeenCalled();
  });
});
