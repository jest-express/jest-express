const { createRequest, createResponse, createNext } = require('jest-express');
const { getUserHandler, createUserHandler } = require('../src/routes/users');

describe('Route handlers with createRequest and createResponse', () => {
  it('handles GET /users/:id successfully for an existing user', () => {
    const mockService = {
      findById: jest
        .fn()
        .mockReturnValue({ id: '42', name: 'Grace Hopper', email: 'grace@example.com' }),
    };
    const handler = getUserHandler(mockService);
    const req = createRequest('/users/42');
    req.setParams('id', '42');
    const res = createResponse();
    const next = createNext();

    handler(req, res, next);

    expect(mockService.findById).toHaveBeenCalledWith('42');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.statusCode).toBe(200);
    expect(res.json).toHaveBeenCalledWith({
      id: '42',
      name: 'Grace Hopper',
      email: 'grace@example.com',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('forwards error to next(err) when user is not found', () => {
    const mockService = {
      findById: jest.fn().mockReturnValue(null),
    };
    const handler = getUserHandler(mockService);
    const req = createRequest('/users/99');
    req.setParams('id', '99');
    const res = createResponse();
    const next = createNext();

    handler(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'User not found: 99',
        status: 404,
      }),
    );
    expect(res.json).not.toHaveBeenCalled();
  });

  it('handles POST /users and returns 201 with created user', () => {
    const mockService = {
      create: jest.fn().mockImplementation((data) => ({ id: '100', ...data })),
    };
    const handler = createUserHandler(mockService);
    const req = createRequest('/users', { method: 'POST' });
    req.setBody({ name: 'Ada Lovelace', email: 'ada@example.com' });
    const res = createResponse();
    const next = createNext();

    handler(req, res, next);

    expect(mockService.create).toHaveBeenCalledWith({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      id: '100',
      name: 'Ada Lovelace',
      email: 'ada@example.com',
    });
    expect(next).not.toHaveBeenCalled();
  });
});
