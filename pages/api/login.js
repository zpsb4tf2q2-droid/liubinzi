import { validateCredentials, serializeSessionCookie } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const nextUrl = (req.query && req.query.next) || '/protected';

  // Parse form-encoded body
  let body = '';
  await new Promise((resolve) => {
    req.on('data', (chunk) => (body += chunk));
    req.on('end', resolve);
  });

  const params = new URLSearchParams(body);
  const username = params.get('username') || '';
  const password = params.get('password') || '';

  if (!validateCredentials(username, password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  res.setHeader('Set-Cookie', serializeSessionCookie());
  res.writeHead(302, { Location: nextUrl }).end();
}
