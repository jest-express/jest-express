import * as Chance from 'chance';

import { Response } from '../../src';

const chance = new Chance();
let response: any;

describe('Express Response', () => {
  beforeEach(() => {
    response = new Response();
  });

  afterEach(() => {
    response.resetMocked();
  });

  test('render', () => {
    response.render('title');
    expect(response.render).toHaveBeenCalled();
    expect(response.render).toHaveBeenCalledWith('title');
  });

  test('send', () => {
    response.send('title');
    expect(response.send).toHaveBeenCalled();
    expect(response.send).toHaveBeenCalledWith('title', );
  });

  test('status', () => {
    response.status(200)
      .send('title');
    expect(response.status).toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.send).toHaveBeenCalled();
    expect(response.send).toHaveBeenCalledWith('title');
  });

  test('type', () => {
    response.type('title');
    expect(response.type).toHaveBeenCalled();
    expect(response.type).toHaveBeenCalledWith('title');
  });

  test('write', () => {
    response.write('title');
    expect(response.write).toHaveBeenCalled();
    expect(response.write).toHaveBeenCalledWith('title');
  });

  test('end', () => {
    response.end('title');
    expect(response.end).toHaveBeenCalled();
    expect(response.end).toHaveBeenCalledWith('title');
  });
});
