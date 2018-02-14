import * as Chance from 'chance';

import { Express, Request, Response } from '../../src';

const chance = new Chance();
let app: any;

describe('Express Application', () => {
  beforeEach(() => {
    app = new Express();
  });

  afterEach(() => {
    app.resetMocked();
  });

  describe('Test locals', () => {
    test('locals should be empty by default', () => {
      expect(app.locals).toEqual({});
    });

    test('locals should allow you to update it', () => {
      const userValue = chance.string();
      const authenticatedValue = chance.bool();
      app.setLocals('user', userValue);
      expect(app.locals).toHaveProperty('user', userValue);

      app.setLocals('authenticated', authenticatedValue);
      expect(app.locals).toHaveProperty('user', userValue);
      expect(app.locals).toHaveProperty('authenticated', authenticatedValue);
    });

    test('locals should be empty after reset', () => {
      const userValue = chance.string();
      app.setLocals('user', userValue);

      app.resetMocked();

      expect(app.locals).toEqual({});
    });
  });

  describe('Test mountpath', () => {
    test('mountpath should be empty by default', () => {
      expect(app.mountpath).toEqual('');
    });

    test('mountpath should allow you to update it', () => {
      const firstValue = chance.string();
      app.setMountPath(firstValue);
      expect(app.mountpath).toEqual(firstValue);

      const secondValue = chance.string();
      app.setMountPath(secondValue);
      expect(app.mountpath).toEqual(secondValue);
    });

    test('mountpath should be empty after reset', () => {
      const value = chance.string();
      app.setMountPath(value);

      app.resetMocked();

      expect(app.mountpath).toEqual('');
    });
  });


  test('Get', () => {
    app.get('/', (request: any, response: any) => {
      expect(app.get).toHaveBeenCalled();
      expect(app.get).toHaveBeenCalledWith('/', expect.anything());
      expect(request).toBeInstanceOf(Request);
      expect(response).toBeInstanceOf(Response);
    });
  });

  test('Get Settings', () => {
    app.set('title', 'My Site');
    const title = app.get('title');
    expect(title).toMatch('My Site');
  });

  test('Route', () => {
    app.route('/events')
      .get((request: any, response: any) => {
        expect(app.route).toHaveBeenCalled();
        expect(app.route).toHaveBeenCalledWith('/events');
        expect(app.get).toHaveBeenCalled();
        expect(app.get).toHaveBeenCalledWith(expect.anything());
        expect(request).toBeInstanceOf(Request);
        expect(response).toBeInstanceOf(Response);
      });
  });

  test('Set', () => {
    app.set('title', 'My Site');
    expect(app.set).toHaveBeenCalled();
    expect(app.set).toHaveBeenCalledWith('title', 'My Site');
  });

  test('Use', () => {
    app.use('/events');
    expect(app.use).toHaveBeenCalled();
    expect(app.use).toHaveBeenCalledWith('/events');
  });
});
