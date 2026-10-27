const { createRequest, createResponse, createNext } = require('jest-express');
const { requireAuth } = require('../src/middleware/auth');

describe('Middleware testing with createNext and error propagation', () => {
  it('calls next() without error when a valid bearer token is provided', () => {
    const req = createRequest('/users', {
      headers: {
        authorization: 'Bearer valid-jwt-token',
      },
    });
    const res = createResponse();
    const next = createNext();

    requireAuth(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.user).toEqual({ token: 'valid-jwt-token' });
  });

  it('calls next(err) with 401 when Authorization header is missing', () => {
    const req = createRequest('/users');
    const res = createResponse();
    const next = createNext();

    requireAuth(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Unauthorized: missing authorization header',
        status: 401,
      }),
    );
  });

  it('calls next(err) with 401 when token format is not Bearer', () => {
    const req = createRequest('/users', {
      headers: {
        authorization: 'Basic abc123',
      },
    });
    const res = createResponse();
    const next = createNext();

    requireAuth(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Unauthorized: invalid token format',
        status: 401,
      }),
    );
  });
});
