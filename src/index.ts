import http, { IncomingMessage, ServerResponse } from 'http';
import {
  assertDatabaseConnection,
  closeDatabasePool,
} from './lib/database';

const port = Number(process.env.PORT) || 3000;

const sendJsonResponse = (
  res: ServerResponse,
  statusCode: number,
  payload: Record<string, unknown>,
): void => {
  const responseBody = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(responseBody),
  });
  res.end(responseBody);
};

const handleHealthCheck = async (res: ServerResponse): Promise<void> => {
  try {
    await assertDatabaseConnection();
    sendJsonResponse(res, 200, { status: 'ok' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    sendJsonResponse(res, 500, {
      status: 'error',
      message,
    });
  }
};

const handleNotFound = (res: ServerResponse): void => {
  sendJsonResponse(res, 404, { error: 'Not found' });
};

const requestListener = (req: IncomingMessage, res: ServerResponse): void => {
  if (!req.url || !req.headers.host) {
    handleNotFound(res);
    return;
  }

  const requestUrl = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'GET' && requestUrl.pathname === '/health') {
    void handleHealthCheck(res);
    return;
  }

  handleNotFound(res);
};

const server = http.createServer(requestListener);

let isShuttingDown = false;

const gracefulShutdown = (signal: NodeJS.Signals): void => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;

  console.log(`Received ${signal}. Shutting down gracefully.`);

  server.close(async (closeError) => {
    if (closeError) {
      console.error('Error closing HTTP server', closeError);
    }

    try {
      await closeDatabasePool();
    } catch (error) {
      console.error('Error closing database connections', error);
    } finally {
      process.exit(closeError ? 1 : 0);
    }
  });
};

(['SIGINT', 'SIGTERM'] as const).forEach((signal) => {
  process.on(signal, () => gracefulShutdown(signal));
});

server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
