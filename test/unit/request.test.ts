import * as Chance from 'chance';

import { Request } from '../../src';

const chance = new Chance();
let request: any;

describe('Express Request', () => {
  beforeEach(() => {
    request = new Request();
  });

  afterEach(() => {
    request.resetMocked();
  });

  test('setQuery', () => {
    request.setQuery('title', 'My Site');
    expect(request.query['title']).toMatch('My Site');
  });

  test('setParams', () => {
    request.setParams('title', 'My Site');
    expect(request.params['title']).toMatch('My Site');
  });
});
