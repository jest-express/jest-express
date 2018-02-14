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

  describe('Test all', () => {
    test('all should have no calls by default', () => {
      expect(app.all).not.toHaveBeenCalled();
    });

    test('all should be called and match called with', () => {
      const path = chance.string();
      const callback = jest.fn();

      app.all(path, callback);

      expect(app.all).toHaveBeenCalled();
      expect(app.all).toHaveBeenCalledWith(path, callback);
    });

    test('all should have no call after reset', () => {
      const path = chance.string();
      const callback = jest.fn();
      app.all(path, callback);

      app.resetMocked();

      expect(app.all).not.toHaveBeenCalled();
    });
  });

  describe('Test delete', () => {
    test('delete should have no calls by default', () => {
      expect(app.delete).not.toHaveBeenCalled();
    });

    test('delete should be called and match called with', () => {
      const path = chance.string();
      const callback = jest.fn();

      app.delete(path, callback);

      expect(app.delete).toHaveBeenCalled();
      expect(app.delete).toHaveBeenCalledWith(path, callback);
    });

    test('delete should have no call after reset', () => {
      const path = chance.string();
      const callback = jest.fn();
      app.delete(path, callback);

      app.resetMocked();

      expect(app.delete).not.toHaveBeenCalled();
    });
  });

  describe('Test engine', () => {
    test('engine should have no calls by default', () => {
      expect(app.engine).not.toHaveBeenCalled();
    });

    test('engine should be called and match called with', () => {
      const path = chance.string();
      const callback = jest.fn();

      app.engine(path, callback);

      expect(app.engine).toHaveBeenCalled();
      expect(app.engine).toHaveBeenCalledWith(path, callback);
    });

    test('engine should have no call after reset', () => {
      const path = chance.string();
      const callback = jest.fn();
      app.engine(path, callback);

      app.resetMocked();

      expect(app.engine).not.toHaveBeenCalled();
    });
  });

  describe('Test listen', () => {
    test('listen should have no calls by default', () => {
      expect(app.listen).not.toHaveBeenCalled();
    });

    test('listen should be called and match called with', () => {
      const path = chance.string();
      const callback = jest.fn();

      app.listen(path, callback);

      expect(app.listen).toHaveBeenCalled();
      expect(app.listen).toHaveBeenCalledWith(path, callback);
    });

    test('listen should have no call after reset', () => {
      const path = chance.string();
      const callback = jest.fn();
      app.listen(path, callback);

      app.resetMocked();

      expect(app.listen).not.toHaveBeenCalled();
    });
  });

  describe('Test get', () => {
    test('get should have no calls by default', () => {
      expect(app.get).not.toHaveBeenCalled();
    });

    test('get should be called and match called with', () => {
      const path = chance.string();
      const callback = jest.fn();

      app.get(path, callback);

      expect(app.get).toHaveBeenCalled();
      expect(app.get).toHaveBeenCalledWith(path, callback);
      expect(callback).toHaveBeenCalled();
      expect(callback).toHaveBeenCalledWith(app.request, app.response);
    });

    test('get should have no call after reset', () => {
      const path = chance.string();
      const callback = jest.fn();
      app.get(path, callback);

      app.resetMocked();

      expect(app.get).not.toHaveBeenCalled();
    });
  });

  describe('Test post', () => {
    test('post should have no calls by default', () => {
      expect(app.post).not.toHaveBeenCalled();
    });

    test('post should be called and match called with', () => {
      const path = chance.string();
      const callback = jest.fn();

      app.post(path, callback);

      expect(app.post).toHaveBeenCalled();
      expect(app.post).toHaveBeenCalledWith(path, callback);
    });

    test('post should have no call after reset', () => {
      const path = chance.string();
      const callback = jest.fn();
      app.post(path, callback);

      app.resetMocked();

      expect(app.post).not.toHaveBeenCalled();
    });
  });

  describe('Test put', () => {
    test('put should have no calls by default', () => {
      expect(app.put).not.toHaveBeenCalled();
    });

    test('put should be called and match called with', () => {
      const path = chance.string();
      const callback = jest.fn();

      app.put(path, callback);

      expect(app.put).toHaveBeenCalled();
      expect(app.put).toHaveBeenCalledWith(path, callback);
    });

    test('put should have no call after reset', () => {
      const path = chance.string();
      const callback = jest.fn();
      app.put(path, callback);

      app.resetMocked();

      expect(app.put).not.toHaveBeenCalled();
    });
  });

  describe('Test delete', () => {
    test('delete should have no calls by default', () => {
      expect(app.delete).not.toHaveBeenCalled();
    });

    test('delete should be called and match called with', () => {
      const path = chance.string();
      const callback = jest.fn();

      app.delete(path, callback);

      expect(app.delete).toHaveBeenCalled();
      expect(app.delete).toHaveBeenCalledWith(path, callback);
    });

    test('put should have no call after reset', () => {
      const path = chance.string();
      const callback = jest.fn();
      app.delete(path, callback);

      app.resetMocked();

      expect(app.delete).not.toHaveBeenCalled();
    });
  });

  describe('Test connect', () => {
    test('connect should have no calls by default', () => {
      expect(app.connect).not.toHaveBeenCalled();
    });

    test('connect should be called and match called with', () => {
      const path = chance.string();
      const callback = jest.fn();

      app.connect(path, callback);

      expect(app.connect).toHaveBeenCalled();
      expect(app.connect).toHaveBeenCalledWith(path, callback);
    });

    test('connect should have no call after reset', () => {
      const path = chance.string();
      const callback = jest.fn();
      app.put(path, callback);

      app.resetMocked();

      expect(app.connect).not.toHaveBeenCalled();
    });
  });

  describe('Test options', () => {
    test('options should have no calls by default', () => {
      expect(app.options).not.toHaveBeenCalled();
    });

    test('options should be called and match called with', () => {
      const path = chance.string();
      const callback = jest.fn();

      app.options(path, callback);

      expect(app.options).toHaveBeenCalled();
      expect(app.options).toHaveBeenCalledWith(path, callback);
    });

    test('options should have no call after reset', () => {
      const path = chance.string();
      const callback = jest.fn();
      app.put(path, callback);

      app.resetMocked();

      expect(app.options).not.toHaveBeenCalled();
    });
  });

  describe('Test trace', () => {
    test('trace should have no calls by default', () => {
      expect(app.trace).not.toHaveBeenCalled();
    });

    test('trace should be called and match called with', () => {
      const path = chance.string();
      const callback = jest.fn();

      app.trace(path, callback);

      expect(app.trace).toHaveBeenCalled();
      expect(app.trace).toHaveBeenCalledWith(path, callback);
    });

    test('trace should have no call after reset', () => {
      const path = chance.string();
      const callback = jest.fn();
      app.trace(path, callback);

      app.resetMocked();

      expect(app.trace).not.toHaveBeenCalled();
    });
  });

  describe('Test patch', () => {
    test('put should have no calls by default', () => {
      expect(app.patch).not.toHaveBeenCalled();
    });

    test('patch should be called and match called with', () => {
      const path = chance.string();
      const callback = jest.fn();

      app.patch(path, callback);

      expect(app.patch).toHaveBeenCalled();
      expect(app.patch).toHaveBeenCalledWith(path, callback);
    });

    test('patch should have no call after reset', () => {
      const path = chance.string();
      const callback = jest.fn();
      app.patch(path, callback);

      app.resetMocked();

      expect(app.patch).not.toHaveBeenCalled();
    });
  });

  describe('Test param', () => {
    test('param should have no calls by default', () => {
      expect(app.param).not.toHaveBeenCalled();
    });

    test('param should be called and match called with', () => {
      const name = chance.string();
      const callback = jest.fn();

      app.param(name, callback);

      expect(app.param).toHaveBeenCalled();
      expect(app.param).toHaveBeenCalledWith(name, callback);
    });

    test('param should have no call after reset', () => {
      const name = chance.string();
      const callback = jest.fn();
      app.param(name, callback);

      app.resetMocked();

      expect(app.param).not.toHaveBeenCalled();
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
