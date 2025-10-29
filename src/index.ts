import http, { IncomingMessage, Server, ServerResponse } from 'http';

const port = Number(process.env.PORT) || 3000;

const handleHealthCheck = (res: ServerResponse) => {
  const responseBody = JSON.stringify({ status: 'ok' });
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(responseBody),
  });
  res.end(responseBody);
};

const handleNotFound = (res: ServerResponse) => {
  res.writeHead(404, {
    'Content-Type': 'application/json',
  });
  res.end(JSON.stringify({ error: 'Not found' }));
};

export const requestListener = (req: IncomingMessage, res: ServerResponse) => {
  if (req.method === 'GET' && req.url === '/health') {
    handleHealthCheck(res);
    return;
  }

  handleNotFound(res);
};

export const createServer = (): Server => http.createServer(requestListener);

export const startServer = (listenPort: number = port): Server => {
  const server = createServer();

  server.listen(listenPort, () => {
    console.log(`Server is listening on port ${listenPort}`);
  });

  return server;
};

if (require.main === module) {
  startServer();
}

export default requestListener;
