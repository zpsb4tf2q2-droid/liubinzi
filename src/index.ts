import http, { IncomingMessage, ServerResponse } from 'http';

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

const requestListener = (req: IncomingMessage, res: ServerResponse) => {
  if (req.method === 'GET' && req.url === '/health') {
    handleHealthCheck(res);
    return;
  }

  handleNotFound(res);
};

const server = http.createServer(requestListener);

server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
