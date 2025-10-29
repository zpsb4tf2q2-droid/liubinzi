import { ServerResponse } from 'http';

export const sendJsonResponse = (
  res: ServerResponse,
  statusCode: number,
  payload: unknown
): void => {
  const body = JSON.stringify(payload);

  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store',
  });

  res.end(body);
};

interface ErrorResponseOptions {
  code?: string;
  details?: Record<string, unknown>;
}

interface ErrorPayload {
  error: {
    message: string;
    statusCode: number;
    code?: string;
    details?: Record<string, unknown>;
  };
}

export const sendErrorResponse = (
  res: ServerResponse,
  statusCode: number,
  message: string,
  options: ErrorResponseOptions = {}
): void => {
  const errorPayload: ErrorPayload = {
    error: {
      message,
      statusCode,
    },
  };

  if (options.code) {
    errorPayload.error.code = options.code;
  }

  if (options.details) {
    errorPayload.error.details = options.details;
  }

  sendJsonResponse(res, statusCode, errorPayload);
};
