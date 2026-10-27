const express = require('jest-express');
const { createResponse, resetMocked } = require('jest-express');

describe('resetMocked() functionality', () => {
  it('resets call history and restores default chaining implementations on response', () => {
    const res = createResponse();

    // Override mock implementation and invoke it
    res.status.mockReturnValueOnce(undefined);
    res.status(201);
    expect(res.status).toHaveBeenCalledWith(201);

    // Call resetMocked on the response instance
    res.resetMocked();

    // Call history is cleared and default chaining is restored
    expect(res.status).not.toHaveBeenCalled();
    expect(res.status(404)).toBe(res);
    expect(res.statusCode).toBe(404);
  });

  it('resets module-level middleware mocks via top-level resetMocked()', () => {
    express.json();
    expect(express.json).toHaveBeenCalled();
    express.json.mockImplementation(() => undefined);

    resetMocked();

    expect(express.json).not.toHaveBeenCalled();
    expect(express.json()).toEqual(expect.any(Function));
  });
});
