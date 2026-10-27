import Chance from 'chance';
import { describe, expect, test } from 'vitest';

import { createNext } from '../../src/next';

const chance = new Chance();

describe('Express Next', () => {
  test('should be able to assert calls to Next', () => {
    const next = createNext();
    const firstValue = chance.string();
    next(firstValue);
    expect(next).toHaveBeenCalledWith(firstValue);

    const secondValue = chance.string();
    next(secondValue);
    expect(next).toHaveBeenCalledWith(secondValue);
  });

  test('createNext() returns a new mock each time', () => {
    const first = createNext();
    const second = createNext();

    first();

    expect(first).not.toBe(second);
    expect(second).not.toHaveBeenCalled();
  });
});
