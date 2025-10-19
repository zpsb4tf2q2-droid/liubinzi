export const SESSION_COOKIE_NAME = 'session';

export function validateCredentials(username: string, password: string): boolean {
  // Simple demo validation for sample tests
  return username === 'demo' && password === 'demo';
}

export function serializeSessionCookie(maxAgeSeconds = 60 * 60) {
  const expires = new Date(Date.now() + maxAgeSeconds * 1000).toUTCString();
  // HttpOnly cookie for demo purposes (not secure in production without Secure flag over HTTPS)
  return `${SESSION_COOKIE_NAME}=1; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}; Expires=${expires}`;
}

export function clearSessionCookie() {
  const expires = new Date(0).toUTCString();
  return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=${expires}`;
}
