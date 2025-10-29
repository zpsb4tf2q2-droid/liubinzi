import pino, { type Logger } from 'pino';

type HttpContext = {
  method?: string;
  url?: string;
};

export interface RequestLoggerContext {
  requestId: string;
  method?: string;
  url?: string;
  user?: UserLogContext;
}

export interface UserLogContext {
  id: string;
  roles?: string[];
}

const LOG_LEVEL = process.env.LOG_LEVEL ?? (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

const LOGGING_ENABLED = (process.env.LOGGING_ENABLED ?? 'true').toLowerCase() !== 'false';

const rootLogger = pino({
  level: LOG_LEVEL,
  enabled: LOGGING_ENABLED,
  base: {
    service: process.env.SERVICE_NAME ?? 'liubinzi-service',
    environment: process.env.LOG_ENV ?? process.env.NODE_ENV ?? 'development',
  },
});

const buildHttpBindings = ({ method, url }: HttpContext): Record<string, unknown> | undefined => {
  const bindings: Record<string, unknown> = {};

  if (method) {
    bindings.method = method;
  }

  if (url) {
    bindings.url = url;
  }

  return Object.keys(bindings).length > 0 ? bindings : undefined;
};

const buildUserBindings = (user?: UserLogContext): Record<string, unknown> | undefined => {
  if (!user) {
    return undefined;
  }

  const bindings: Record<string, unknown> = {
    id: user.id,
  };

  if (user.roles && user.roles.length > 0) {
    bindings.roles = user.roles;
  }

  return bindings;
};

export const getRootLogger = (): Logger => rootLogger;

export const isLoggingEnabled = (): boolean => LOGGING_ENABLED;

export const createRequestLogger = (context: RequestLoggerContext): Logger => {
  const bindings: Record<string, unknown> = {
    requestId: context.requestId,
  };

  const httpBindings = buildHttpBindings({ method: context.method, url: context.url });
  if (httpBindings) {
    bindings.http = httpBindings;
  }

  const userBindings = buildUserBindings(context.user);
  if (userBindings) {
    bindings.user = userBindings;
  }

  return rootLogger.child(bindings);
};

export const attachUserContext = (logger: Logger, user: UserLogContext): Logger => {
  const bindings = buildUserBindings(user);

  if (!bindings) {
    return logger;
  }

  return logger.child({
    user: bindings,
  });
};
