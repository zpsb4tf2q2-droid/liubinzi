import { clearSessionCookie } from '../../../lib/auth';

export default function handler(req, res) {
  res.setHeader('Set-Cookie', clearSessionCookie());
  res.writeHead(302, { Location: '/' }).end();
}
