import { createSessionToken, hashPassword, verifyPassword } from '../auth';

describe('auth utilities', () => {
  it('hashes passwords deterministically', () => {
    const firstHash = hashPassword('test-password');
    const secondHash = hashPassword('test-password');

    expect(firstHash).toEqual(secondHash);
    expect(firstHash).not.toEqual('test-password');
  });

  it('verifies passwords correctly', () => {
    const password = 'my-secret';
    const hash = hashPassword(password);

    expect(verifyPassword(password, hash)).toBe(true);
    expect(verifyPassword('wrong-password', hash)).toBe(false);
  });

  it('creates unique session tokens', () => {
    const tokenA = createSessionToken();
    const tokenB = createSessionToken();

    expect(tokenA).not.toEqual(tokenB);
    expect(typeof tokenA).toBe('string');
    expect(typeof tokenB).toBe('string');
  });
});
