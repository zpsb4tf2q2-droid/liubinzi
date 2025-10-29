import http, { IncomingMessage, ServerResponse } from 'http';
import { getAuthenticatedUser } from './lib/auth';
import { getGitCommitHash } from './lib/git';
import { sendErrorResponse, sendJsonResponse } from './lib/response';

const port = Number(process.env.PORT) || 3000;

const handleHealth = (res: ServerResponse): void => {
  sendJsonResponse(res, 200, {
    status: 'ok',
    commitHash: getGitCommitHash(),
    timestamp: new Date().toISOString(),
  });
};

const handleMe = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
  const user = await getAuthenticatedUser(req);

  if (!user) {
    sendErrorResponse(res, 401, 'Unauthorized');
    return;
  }

  sendJsonResponse(res, 200, { user });
};

const requestListener = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
  try {
    if (!req.url) {
      sendErrorResponse(res, 400, 'Bad Request');
      return;
    }

    const url = new URL(req.url, `http://${req.headers.host ?? 'localhost'}`);
    const { pathname } = url;

    if (req.method === 'GET' && pathname === '/api/health') {
      handleHealth(res);
      return;
    }

    if (req.method === 'GET' && pathname === '/api/me') {
      await handleMe(req, res);
      return;
    }

    sendErrorResponse(res, 404, 'Not Found');
  } catch (error) {
    console.error('Failed to process request', error);
    if (!res.headersSent) {
      sendErrorResponse(res, 500, 'Internal Server Error');
    } else {
      res.end();
    }
  }
};

export const createServer = (): http.Server => {
  return http.createServer((req, res) => {
    void requestListener(req, res);
  });
};

if (process.env.NODE_ENV !== 'test') {
  const server = createServer();
  server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });
}
