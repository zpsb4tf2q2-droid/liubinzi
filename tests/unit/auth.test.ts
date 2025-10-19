import { describe, it, expect } from 'vitest';
import { validateCredentials, serializeSessionCookie, clearSessionCookie, SESSION_COOKIE_NAME } from '../../lib/auth';


describe('auth utilities', () => {
  it('validates demo credentials', () => {
    expect(validateCredentials('demo', 'demo')).toBe(true);
    expect(validateCredentials('demo', 'wrong')).toBe(false);
  });

  it('serializes a session cookie', () => {
    const cookie = serializeSessionCookie(60);
    expect(cookie).toContain(`${SESSION_COOKIE_NAME}=1`);
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('Path=/');
    expect(cookie).toContain('SameSite=Lax');
    expect(cookie).toMatch(/Max-Age=60/);
  });

  it('clears a session cookie', () => {
    const cookie = clearSessionCookie();
    expect(cookie).toContain(`${SESSION_COOKIE_NAME}=`);
    expect(cookie).toContain('Max-Age=0');
  });
});
