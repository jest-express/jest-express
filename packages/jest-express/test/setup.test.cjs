const express = require('jest-express');

test('the setup entry configures real Jest mocks for apps, requests and responses', () => {
  expect(typeof express).toBe('function');
  const app = express();
  const req = express.createRequest();
  const res = express.createResponse();

  for (const mock of [app.get, app.next, req.get, res.status]) {
    expect(jest.isMockFunction(mock)).toBe(true);
  }
  expect(res.status(201)).toBe(res);
});

test('res.status(404) still chains after resetMocked()', () => {
  const res = express.createResponse();
  res.status.mockReturnValueOnce(undefined);
  res.status(201);

  res.resetMocked();

  expect(res.status).not.toHaveBeenCalled();
  expect(res.status(404)).toBe(res);
  expect(res.statusCode).toBe(404);
});

test('each app has its own next mock', () => {
  const first = express();
  const second = express();

  first.next();

  expect(first.next).not.toBe(second.next);
  expect(second.next).not.toHaveBeenCalled();
});

test('a failed expect() inside a handler fails the test instead of becoming next(err)', () => {
  const app = express();

  expect(() =>
    app.get('/', () => {
      expect(1).toBe(2);
    }),
  ).toThrow();
  expect(app.next).not.toHaveBeenCalled();
});
