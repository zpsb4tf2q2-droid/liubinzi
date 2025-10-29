import http, { type IncomingMessage, type ServerResponse } from 'http';
import { createHash, randomUUID } from 'crypto';
import type { Logger } from 'pino';

import {
  attachUserContext,
  createRequestLogger,
  getRootLogger,
  type UserLogContext,
} from './observability/logger';
import { captureException, initSentry } from './observability/sentry';

interface HandlerContext {
  requestId: string;
  logger: Logger;
  user?: UserLogContext;
}

const port = Number(process.env.PORT) || 3000;

const rootLogger = getRootLogger();
const sentryEnabled = initSentry();

if (sentryEnabled) {
  rootLogger.info({ event: 'observability.sentry.enabled' }, 'Sentry instrumentation enabled');
} else {
  rootLogger.debug(
    { event: 'observability.sentry.disabled' },
    'Sentry instrumentation disabled (missing SENTRY_DSN)',
  );
}

const respondWithJson = (res: ServerResponse, statusCode: number, body: unknown): void => {
  const payload = JSON.stringify(body);

  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload),
  });

  res.end(payload);
};

const respondWithError = (res: ServerResponse, statusCode: number, message: string): void => {
  respondWithJson(res, statusCode, { error: message });
};

const readRequestBody = async (req: IncomingMessage, limitBytes = 1_048_576): Promise<string> => {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let bytes = 0;
    let completed = false;

    const cleanup = () => {
      req.removeListener('data', onData);
      req.removeListener('end', onEnd);
      req.removeListener('error', onError);
      req.removeListener('close', onClose);
    };

    const onError = (error: Error) => {
      if (completed) {
        return;
      }
      completed = true;
      cleanup();
      reject(error);
    };

    const onClose = () => {
      if (completed) {
        return;
      }
      completed = true;
      cleanup();
      reject(new Error('Request terminated before completion'));
    };

    const onData = (chunk: Buffer) => {
      if (completed) {
        return;
      }

      bytes += chunk.length;

      if (bytes > limitBytes) {
        completed = true;
        cleanup();
        const error = new Error('Request body too large');
        (error as NodeJS.ErrnoException).code = 'PAYLOAD_TOO_LARGE';
        reject(error);
        req.destroy();
        return;
      }

      chunks.push(chunk);
    };

    const onEnd = () => {
      if (completed) {
        return;
      }
      completed = true;
      cleanup();
      resolve(Buffer.concat(chunks).toString('utf8'));
    };

    req.on('data', onData);
    req.on('end', onEnd);
    req.on('error', onError);
    req.on('close', onClose);
  });
};

const extractPathname = (req: IncomingMessage): string => {
  const rawUrl = req.url ?? '/';

  try {
    const url = new URL(rawUrl, `http://${req.headers.host ?? 'localhost'}`);
    return url.pathname;
  } catch (error) {
    rootLogger.warn({ event: 'http.request.invalid_url', rawUrl, error: String(error) });
    return rawUrl.split('?')[0] ?? rawUrl;
  }
};

const deriveStableUserId = (identifier: string): string => {
  return `user_${createHash('sha256').update(identifier).digest('hex').slice(0, 12)}`;
};

const handleHealthCheck = (res: ServerResponse, context: HandlerContext): void => {
  context.logger.debug({ event: 'health.check' }, 'Responding to health check');
  respondWithJson(res, 200, { status: 'ok' });
};

const handleNotFound = (res: ServerResponse, context: HandlerContext, pathname: string): void => {
  context.logger.warn({ event: 'http.request.not_found', pathname }, 'Route not found');
  respondWithError(res, 404, 'Not found');
};

const handleServerError = (res: ServerResponse): void => {
  respondWithError(res, 500, 'Internal server error');
};

const handleLogin = async (
  req: IncomingMessage,
  res: ServerResponse,
  context: HandlerContext,
): Promise<void> => {
  let rawBody: string;

  try {
    rawBody = await readRequestBody(req);
  } catch (error) {
    const err = error as NodeJS.ErrnoException;

    if (err.code === 'PAYLOAD_TOO_LARGE') {
      context.logger.warn({ event: 'auth.login.payload_too_large' }, 'Login payload exceeded limit');
      respondWithError(res, 413, 'Payload too large');
      return;
    }

    throw err;
  }

  if (!rawBody) {
    context.logger.warn({ event: 'auth.login.missing_body' }, 'Login request missing body');
    respondWithError(res, 400, 'Request body required');
    return;
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(rawBody);
  } catch (error) {
    context.logger.warn(
      { event: 'auth.login.invalid_json', error: String(error) },
      'Failed to parse login payload JSON',
    );
    respondWithError(res, 400, 'Invalid JSON payload');
    return;
  }

  if (!parsed || typeof parsed !== 'object') {
    context.logger.warn({ event: 'auth.login.invalid_shape' }, 'Login payload is not an object');
    respondWithError(res, 400, 'Invalid payload');
    return;
  }

  const { email, password } = parsed as Record<string, unknown>;

  if (typeof email !== 'string' || typeof password !== 'string' || email.trim().length === 0) {
    context.logger.warn({ event: 'auth.login.missing_fields' }, 'Login payload missing credentials');
    respondWithError(res, 400, 'Email and password are required');
    return;
  }

  const sanitizedEmail = email.trim().toLowerCase();
  const userId = deriveStableUserId(sanitizedEmail);

  context.user = { id: userId };
  context.logger = attachUserContext(context.logger, context.user);

  context.logger.info({ event: 'auth.login.attempt' }, 'Processing authentication attempt');

  if (password !== 'password123') {
    context.logger.warn({ event: 'auth.login.failure' }, 'Authentication failed for user');
    respondWithError(res, 401, 'Invalid credentials');
    return;
  }

  context.logger.info({ event: 'auth.login.success' }, 'Authentication completed successfully');

  respondWithJson(res, 200, {
    status: 'authenticated',
    userId,
    requestId: context.requestId,
  });
};

const requestListener = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
  const method = req.method ?? 'GET';
  const pathname = extractPathname(req);
  const requestIdHeader = req.headers['x-request-id'];
  let requestId: string;

  if (typeof requestIdHeader === 'string') {
    requestId = requestIdHeader;
  } else if (Array.isArray(requestIdHeader) && requestIdHeader.length > 0) {
    requestId = requestIdHeader[0];
  } else {
    requestId = randomUUID();
  }

  res.setHeader('x-request-id', requestId);

  const context: HandlerContext = {
    requestId,
    logger: createRequestLogger({ requestId, method, url: pathname }),
  };

  context.logger.info({ event: 'http.request.received', method, pathname }, 'Incoming request');

  res.on('finish', () => {
    context.logger.info(
      {
        event: 'http.request.completed',
        statusCode: res.statusCode,
        contentLength: res.getHeader('Content-Length'),
      },
      'Request completed',
    );
  });

  try {
    if (method === 'GET' && pathname === '/health') {
      handleHealthCheck(res, context);
      return;
    }

    if (method === 'POST' && pathname === '/auth/login') {
      await handleLogin(req, res, context);
      return;
    }

    handleNotFound(res, context, pathname);
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));

    context.logger.error(
      { event: 'http.request.unhandled_exception', method, pathname, err },
      'Unhandled exception during request processing',
    );

    const sentryContext: Record<string, unknown> = {
      requestId,
      method,
      pathname,
    };

    if (context.user) {
      sentryContext.user = { id: context.user.id };
    }

    captureException(err, sentryContext);

    handleServerError(res);
  }
};

const server = http.createServer((req, res) => {
  void requestListener(req, res);
});

server.on('error', (error) => {
  rootLogger.error({ event: 'server.error', error }, 'HTTP server encountered an error');
  captureException(error, { scope: 'http-server' });
});

server.listen(port, () => {
  rootLogger.info({ event: 'server.listen', port }, `Server is listening on port ${port}`);
});
