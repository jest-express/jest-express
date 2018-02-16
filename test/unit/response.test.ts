import * as Chance from 'chance';

import { Response } from '../../src/response';

const chance = new Chance();
let response: any;

describe('Express Response', () => {
  beforeEach(() => {
    response = new Response();
  });

  afterEach(() => {
    response.resetMocked();
  });

  describe('Test headersSent', () => {
    test('headersSent should be false by default', () => {
      expect(response.headersSent).toEqual(false);
    });

    test('headersSent should allow you to update it', () => {
      response.setHeadersSent(true);
      expect(response.headersSent).toEqual(true);

      response.setHeadersSent(false);
      expect(response.headersSent).toEqual(false);
    });

    test('headersSent should be VALUE after reset', () => {
      response.setHeadersSent(true);
      response.resetMocked();

      expect(response.headersSent).toEqual(false);
    });
  });

  describe('Test locals', () => {
    test('locals should be empty by default', () => {
      expect(response.locals).toEqual({});
    });

    test('locals should allow you to update it', () => {
      const userValue = chance.string();
      const authenticatedValue = chance.bool();
      response.setLocals('user', userValue);
      expect(response.locals).toHaveProperty('user', userValue);

      response.setLocals('authenticated', authenticatedValue);
      expect(response.locals).toHaveProperty('user', userValue);
      expect(response.locals).toHaveProperty('authenticated', authenticatedValue);
    });

    test('locals should be empty after reset', () => {
      const userValue = chance.string();
      response.setLocals('user', userValue);
      response.resetMocked();

      expect(response.locals).toEqual({});
    });
  });

  describe('Test append', () => {
    test('append should have no calls by default', () => {
      expect(response.append).not.toHaveBeenCalled();
    });

    test('append should be called and match called with', () => {
      const value = chance.string();
      response.append(value);

      expect(response.append).toHaveBeenCalled();
      expect(response.append).toHaveBeenCalledWith(value);
    });

    test('append should have no call after reset', () => {
      const value = chance.string();
      response.append(value);

      response.resetMocked();
      expect(response.append).not.toHaveBeenCalled();
    });
  });

  describe('Test attachment', () => {
    test('attachment should have no calls by default', () => {
      expect(response.attachment).not.toHaveBeenCalled();
    });

    test('attachment should be called and match called with', () => {
      const value = chance.string();
      response.attachment(value);

      expect(response.attachment).toHaveBeenCalled();
      expect(response.attachment).toHaveBeenCalledWith(value);
    });

    test('attachment should have no call after reset', () => {
      const value = chance.string();
      response.attachment(value);

      response.resetMocked();
      expect(response.attachment).not.toHaveBeenCalled();
    });
  });

  describe('Test cookie', () => {
    test('cookie should have no calls by default', () => {
      expect(response.cookie).not.toHaveBeenCalled();
    });

    test('cookie should be called and match called with', () => {
      const value = chance.string();
      response.cookie(value);

      expect(response.cookie).toHaveBeenCalled();
      expect(response.cookie).toHaveBeenCalledWith(value);
    });

    test('cookie should have no call after reset', () => {
      const value = chance.string();
      response.cookie(value);

      response.resetMocked();
      expect(response.cookie).not.toHaveBeenCalled();
    });
  });

  describe('Test clearCookie', () => {
    test('clearCookie should have no calls by default', () => {
      expect(response.clearCookie).not.toHaveBeenCalled();
    });

    test('clearCookie should be called and match called with', () => {
      const value = chance.string();
      response.clearCookie(value);

      expect(response.clearCookie).toHaveBeenCalled();
      expect(response.clearCookie).toHaveBeenCalledWith(value);
    });

    test('clearCookie should have no call after reset', () => {
      const value = chance.string();
      response.clearCookie(value);

      response.resetMocked();
      expect(response.clearCookie).not.toHaveBeenCalled();
    });
  });

  describe('Test download', () => {
    test('download should have no calls by default', () => {
      expect(response.download).not.toHaveBeenCalled();
    });

    test('download should be called and match called with', () => {
      const value = chance.string();
      response.download(value);

      expect(response.download).toHaveBeenCalled();
      expect(response.download).toHaveBeenCalledWith(value);
    });

    test('download should have no call after reset', () => {
      const value = chance.string();
      response.download(value);

      response.resetMocked();
      expect(response.download).not.toHaveBeenCalled();
    });
  });

  describe('Test end', () => {
    test('end should have no calls by default', () => {
      expect(response.end).not.toHaveBeenCalled();
    });

    test('end should be called and match called with', () => {
      const value = chance.string();
      response.end(value);

      expect(response.end).toHaveBeenCalled();
      expect(response.end).toHaveBeenCalledWith(value);
    });

    test('end should have no call after reset', () => {
      const value = chance.string();
      response.end(value);

      response.resetMocked();
      expect(response.end).not.toHaveBeenCalled();
    });
  });

  describe('Test format', () => {
    test('format should have no calls by default', () => {
      expect(response.format).not.toHaveBeenCalled();
    });

    test('format should be called and match called with', () => {
      const value = chance.string();
      response.format(value);

      expect(response.format).toHaveBeenCalled();
      expect(response.format).toHaveBeenCalledWith(value);
    });

    test('format should have no call after reset', () => {
      const value = chance.string();
      response.format(value);

      response.resetMocked();
      expect(response.format).not.toHaveBeenCalled();
    });
  });

  describe('Test get', () => {
    test('get should have no calls by default', () => {
      expect(response.get).not.toHaveBeenCalled();
    });

    test('get should be called and match called with', () => {
      const value = chance.string();
      response.get(value);

      expect(response.get).toHaveBeenCalled();
      expect(response.get).toHaveBeenCalledWith(value);
    });

    test('get should have no call after reset', () => {
      const value = chance.string();
      response.get(value);

      response.resetMocked();
      expect(response.get).not.toHaveBeenCalled();
    });
  });

  describe('Test json', () => {
    test('json should have no calls by default', () => {
      expect(response.json).not.toHaveBeenCalled();
    });

    test('json should be called and match called with', () => {
      const value = chance.string();
      response.json(value);

      expect(response.json).toHaveBeenCalled();
      expect(response.json).toHaveBeenCalledWith(value);
    });

    test('json should have no call after reset', () => {
      const value = chance.string();
      response.json(value);

      response.resetMocked();
      expect(response.json).not.toHaveBeenCalled();
    });
  });

  describe('Test jsonp', () => {
    test('jsonp should have no calls by default', () => {
      expect(response.jsonp).not.toHaveBeenCalled();
    });

    test('jsonp should be called and match called with', () => {
      const value = chance.string();
      response.jsonp(value);

      expect(response.jsonp).toHaveBeenCalled();
      expect(response.jsonp).toHaveBeenCalledWith(value);
    });

    test('jsonp should have no call after reset', () => {
      const value = chance.string();
      response.jsonp(value);

      response.resetMocked();
      expect(response.jsonp).not.toHaveBeenCalled();
    });
  });

  describe('Test links', () => {
    test('links should have no calls by default', () => {
      expect(response.links).not.toHaveBeenCalled();
    });

    test('links should be called and match called with', () => {
      const value = chance.string();
      response.links(value);

      expect(response.links).toHaveBeenCalled();
      expect(response.links).toHaveBeenCalledWith(value);
    });

    test('links should have no call after reset', () => {
      const value = chance.string();
      response.links(value);

      response.resetMocked();
      expect(response.links).not.toHaveBeenCalled();
    });
  });

  describe('Test location', () => {
    test('location should have no calls by default', () => {
      expect(response.location).not.toHaveBeenCalled();
    });

    test('location should be called and match called with', () => {
      const value = chance.string();
      response.location(value);

      expect(response.location).toHaveBeenCalled();
      expect(response.location).toHaveBeenCalledWith(value);
    });

    test('location should have no call after reset', () => {
      const value = chance.string();
      response.location(value);

      response.resetMocked();
      expect(response.location).not.toHaveBeenCalled();
    });
  });

  describe('Test redirect', () => {
    test('redirect should have no calls by default', () => {
      expect(response.redirect).not.toHaveBeenCalled();
    });

    test('redirect should be called and match called with', () => {
      const value = chance.string();
      response.redirect(value);

      expect(response.redirect).toHaveBeenCalled();
      expect(response.redirect).toHaveBeenCalledWith(value);
    });

    test('redirect should have no call after reset', () => {
      const value = chance.string();
      response.redirect(value);

      response.resetMocked();
      expect(response.redirect).not.toHaveBeenCalled();
    });
  });

  describe('Test render', () => {
    test('render should have no calls by default', () => {
      expect(response.render).not.toHaveBeenCalled();
    });

    test('render should be called and match called with', () => {
      const value = chance.string();
      response.render(value);

      expect(response.render).toHaveBeenCalled();
      expect(response.render).toHaveBeenCalledWith(value);
    });

    test('render should have no call after reset', () => {
      const value = chance.string();
      response.render(value);

      response.resetMocked();
      expect(response.render).not.toHaveBeenCalled();
    });
  });

  describe('Test send', () => {
    test('send should have no calls by default', () => {
      expect(response.send).not.toHaveBeenCalled();
    });

    test('send should be called and match called with', () => {
      const value = chance.string();
      response.send(value);

      expect(response.send).toHaveBeenCalled();
      expect(response.send).toHaveBeenCalledWith(value);
    });

    test('send should have no call after reset', () => {
      const value = chance.string();
      response.send(value);

      response.resetMocked();
      expect(response.send).not.toHaveBeenCalled();
    });
  });

  describe('Test sendFile', () => {
    test('sendFile should have no calls by default', () => {
      expect(response.sendFile).not.toHaveBeenCalled();
    });

    test('sendFile should be called and match called with', () => {
      const value = chance.string();
      response.sendFile(value);

      expect(response.sendFile).toHaveBeenCalled();
      expect(response.sendFile).toHaveBeenCalledWith(value);
    });

    test('sendFile should have no call after reset', () => {
      const value = chance.string();
      response.sendFile(value);

      response.resetMocked();
      expect(response.sendFile).not.toHaveBeenCalled();
    });
  });

  describe('Test sendStatus', () => {
    test('sendStatus should have no calls by default', () => {
      expect(response.sendStatus).not.toHaveBeenCalled();
    });

    test('sendStatus should be called and match called with', () => {
      const value = chance.string();
      response.sendStatus(value);

      expect(response.sendStatus).toHaveBeenCalled();
      expect(response.sendStatus).toHaveBeenCalledWith(value);
    });

    test('sendStatus should have no call after reset', () => {
      const value = chance.string();
      response.sendStatus(value);

      response.resetMocked();
      expect(response.sendStatus).not.toHaveBeenCalled();
    });
  });

  describe('Test set', () => {
    test('set should have no calls by default', () => {
      expect(response.set).not.toHaveBeenCalled();
    });

    test('set should be called and match called with', () => {
      const value = chance.string();
      response.set(value);

      expect(response.set).toHaveBeenCalled();
      expect(response.set).toHaveBeenCalledWith(value);
    });

    test('set should have no call after reset', () => {
      const value = chance.string();
      response.set(value);

      response.resetMocked();
      expect(response.set).not.toHaveBeenCalled();
    });
  });

  describe('Test status', () => {
    test('status should have no calls by default', () => {
      expect(response.status).not.toHaveBeenCalled();
    });

    test('status should be called and match called with, end should be callable', () => {
      const code = chance.natural({ min: 100, max: 999 });

      response.status(code).end();

      expect(response.status).toHaveBeenCalled();
      expect(response.status).toHaveBeenCalledWith(code);
      expect(response.end).toHaveBeenCalled();
    });

    test('status should be called and match called with, send should be callable', () => {
      const code = chance.natural({ min: 100, max: 999 });
      const value = chance.string();

      response.status(code)
        .send(value);

      expect(response.status).toHaveBeenCalled();
      expect(response.status).toHaveBeenCalledWith(code);
      expect(response.send).toHaveBeenCalled();
      expect(response.send).toHaveBeenCalledWith(value);
    });

    test('status should be called and match called with, sendFile should be callable', () => {
      const code = chance.natural({ min: 100, max: 999 });
      const value = chance.string();

      response.status(code)
        .sendFile(value);

      expect(response.status).toHaveBeenCalled();
      expect(response.status).toHaveBeenCalledWith(code);
      expect(response.sendFile).toHaveBeenCalled();
      expect(response.sendFile).toHaveBeenCalledWith(value);
    });

    test('status should have no call after reset', () => {
      const value = chance.string();
      response.status(value);

      response.resetMocked();
      expect(response.status).not.toHaveBeenCalled();
    });
  });

  describe('Test type', () => {
    test('type should have no calls by default', () => {
      expect(response.type).not.toHaveBeenCalled();
    });

    test('type should be called and match called with', () => {
      const value = chance.string();
      response.type(value);

      expect(response.type).toHaveBeenCalled();
      expect(response.type).toHaveBeenCalledWith(value);
    });

    test('type should have no call after reset', () => {
      const value = chance.string();
      response.type(value);

      response.resetMocked();
      expect(response.type).not.toHaveBeenCalled();
    });
  });

  describe('Test vary', () => {
    test('vary should have no calls by default', () => {
      expect(response.vary).not.toHaveBeenCalled();
    });

    test('vary should be called and match called with', () => {
      const value = chance.string();
      response.vary(value);

      expect(response.vary).toHaveBeenCalled();
      expect(response.vary).toHaveBeenCalledWith(value);
    });

    test('vary should have no call after reset', () => {
      const value = chance.string();
      response.vary(value);

      response.resetMocked();
      expect(response.vary).not.toHaveBeenCalled();
    });
  });
});
