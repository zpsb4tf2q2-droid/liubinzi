import { IncomingMessage, ServerResponse } from 'http';
import requestListener from '../src/index';

export default function handler(req: IncomingMessage, res: ServerResponse) {
  return requestListener(req, res);
}
