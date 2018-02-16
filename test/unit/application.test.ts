import * as Chance from 'chance';

import { Application } from '../../src/application';

const chance = new Chance();
let app: any;

describe('Application', () => {
  beforeEach(() => {
    app = new Application();
  });

  afterEach(() => {
    app.resetMocked();
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
