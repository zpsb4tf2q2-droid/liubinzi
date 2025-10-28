import { add } from '../lib/sample';

describe('add', () => {
  it('returns the sum of two numbers', () => {
    expect(add(2, 3)).toBe(5);
  });
});
