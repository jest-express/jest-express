import * as Chance from 'chance';
import { next } from '../../src/next';

const chance = new Chance();

describe('Express Next', () => {
  afterEach(() => {
    next.mockReset();
  });

  test('should be able to assert calls to Next', () => {
    const firstValue = chance.string();
    next(firstValue);
    expect(next).toHaveBeenCalledWith(firstValue);

    const secondValue = chance.string();
    next(secondValue);
    expect(next).toHaveBeenCalledWith(secondValue);
  });

  test('should be able to reset call count', () => {
    const value = chance.string();
    next(value);

    next.mockReset();

    expect(next).not.toHaveBeenCalled();
  });
});
