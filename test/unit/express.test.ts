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
