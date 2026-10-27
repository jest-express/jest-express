import Chance from 'chance';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { Application } from '../../src/application';

const chance = new Chance();
let app: Application;

describe('Application', () => {
  beforeEach(() => {
    app = new Application();
  });

  afterEach(() => {
    app.resetMocked();
  });

  test('Application does not expose the removed express.query middleware', () => {
    expect('query' in app).toBe(false);
    app.resetMocked();
    expect('query' in app).toBe(false);
  });

  describe('Test json', () => {
    test('json should have no calls by default', () => {
      expect(app.json).not.toHaveBeenCalled();
    });

    test('json should be called and match called with', () => {
      const options = {};

      app.json(options);

      expect(app.json).toHaveBeenCalled();
      expect(app.json).toHaveBeenCalledWith(options);
    });

    test('json should have no call after reset', () => {
      const options = {};

      app.json(options);

      app.resetMocked();

      expect(app.json).not.toHaveBeenCalled();
    });
  });

  describe('Test raw', () => {
    test('raw should have no calls by default', () => {
      expect(app.raw).not.toHaveBeenCalled();
    });

    test('raw should be called and match called with', () => {
      const options = {};

      app.raw(options);

      expect(app.raw).toHaveBeenCalled();
      expect(app.raw).toHaveBeenCalledWith(options);
    });

    test('raw should have no call after reset', () => {
      const options = {};

      app.raw(options);

      app.resetMocked();

      expect(app.raw).not.toHaveBeenCalled();
    });
  });

  describe('Test staticLoad', () => {
    test('staticLoad should have no calls by default', () => {
      expect(app.staticLoad).not.toHaveBeenCalled();
    });

    test('staticLoad should be called and match called with', () => {
      const root = chance.string();
      const options = {};

      app.staticLoad(root, options);

      expect(app.staticLoad).toHaveBeenCalled();
      expect(app.staticLoad).toHaveBeenCalledWith(root, options);
    });

    test('staticLoad should have no call after reset', () => {
      const root = chance.string();
      const options = {};

      app.staticLoad(root, options);

      app.resetMocked();

      expect(app.staticLoad).not.toHaveBeenCalled();
    });
  });

  describe('Test text', () => {
    test('text should have no calls by default', () => {
      expect(app.text).not.toHaveBeenCalled();
    });

    test('text should be called and match called with', () => {
      const options = {};

      app.text(options);

      expect(app.text).toHaveBeenCalled();
      expect(app.text).toHaveBeenCalledWith(options);
    });

    test('text should have no call after reset', () => {
      const options = {};

      app.text(options);

      app.resetMocked();

      expect(app.text).not.toHaveBeenCalled();
    });
  });

  describe('Test urlencoded', () => {
    test('urlencoded should have no calls by default', () => {
      expect(app.urlencoded).not.toHaveBeenCalled();
    });

    test('urlencoded should be called and match called with', () => {
      const options = {};

      app.urlencoded(options);

      expect(app.urlencoded).toHaveBeenCalled();
      expect(app.urlencoded).toHaveBeenCalledWith(options);
    });

    test('urlencoded should have no call after reset', () => {
      const options = {};

      app.urlencoded(options);

      app.resetMocked();

      expect(app.urlencoded).not.toHaveBeenCalled();
    });
  });
});
