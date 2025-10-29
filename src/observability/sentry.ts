import * as Sentry from '@sentry/node';

const clampSampleRate = (value: number): number => {
  if (Number.isNaN(value)) {
    return 0;
  }

  if (value < 0) {
    return 0;
  }

  if (value > 1) {
    return 1;
  }

  return value;
};

let sentryInitialized = false;
let sentryEnabled = false;

export const initSentry = (): boolean => {
  const dsn = process.env.SENTRY_DSN;

  if (!dsn) {
    sentryEnabled = false;
    return false;
  }

  const tracesSampleRateEnv = process.env.SENTRY_TRACES_SAMPLE_RATE;
  const tracesSampleRate = tracesSampleRateEnv
    ? clampSampleRate(Number(tracesSampleRateEnv))
    : undefined;

  if (!sentryInitialized) {
    Sentry.init({
      dsn,
      environment: process.env.SENTRY_ENV ?? process.env.NODE_ENV ?? 'development',
      tracesSampleRate,
      autoSessionTracking: false,
    });
    sentryInitialized = true;
  }

  sentryEnabled = true;
  return true;
};

export const isSentryEnabled = (): boolean => sentryEnabled;

export const captureException = (error: unknown, context?: Record<string, unknown>): void => {
  if (!sentryEnabled) {
    return;
  }

  const err = error instanceof Error ? error : new Error(String(error));
  Sentry.captureException(err, context ? { extra: context } : undefined);
};

export const flushSentry = async (timeout?: number): Promise<boolean | void> => {
  if (!sentryEnabled) {
    return;
  }

  return Sentry.flush(timeout);
};

export const closeSentry = async (timeout?: number): Promise<boolean | void> => {
  if (!sentryEnabled) {
    return;
  }

  return Sentry.close(timeout);
};

export const resetSentryForTests = (): void => {
  sentryInitialized = false;
  sentryEnabled = false;
};
