import { Express } from '../../src';
import src from '../../src';

describe('Exporter', () => {
  test('Default export should be a instance of Express', () => {
    expect(src()).toBeInstanceOf(Express);
  });
});
