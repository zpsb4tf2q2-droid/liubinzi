import * as SentryBrowser from '@sentry/browser';

export interface BrowserSentryOptions {
  dsn?: string;
  environment?: string;
  release?: string;
  tracesSampleRate?: number;
}

let browserSentryInitialized = false;

const resolveEnv = (key: string): string | undefined => {
  if (typeof process !== 'undefined' && typeof process === 'object' && process.env) {
    return (process.env as Record<string, string | undefined>)[key];
  }

  return undefined;
};

export const initBrowserSentry = (options: BrowserSentryOptions = {}): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  const dsn = options.dsn ?? (window as typeof window & { SENTRY_DSN?: string }).SENTRY_DSN;

  if (!dsn) {
    return false;
  }

  if (browserSentryInitialized) {
    return true;
  }

  const sampleRate =
    typeof options.tracesSampleRate === 'number' && !Number.isNaN(options.tracesSampleRate)
      ? Math.max(0, Math.min(1, options.tracesSampleRate))
      : undefined;

  SentryBrowser.init({
    dsn,
    environment: options.environment ?? resolveEnv('SENTRY_ENV') ?? resolveEnv('NODE_ENV') ?? 'development',
    release: options.release,
    tracesSampleRate: sampleRate,
  });

  browserSentryInitialized = true;
  return true;
};
