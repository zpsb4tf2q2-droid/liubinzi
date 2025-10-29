import type { Logger } from 'pino';

describe('observability utilities', () => {
  describe('Sentry integration', () => {
    const sentryMock = {
      init: jest.fn(),
      captureException: jest.fn(),
      flush: jest.fn().mockResolvedValue(true),
      close: jest.fn().mockResolvedValue(true),
    };

    beforeEach(() => {
      jest.resetModules();
      jest.clearAllMocks();
      delete process.env.SENTRY_DSN;
      delete process.env.SENTRY_TRACES_SAMPLE_RATE;
      delete process.env.SENTRY_ENV;
      jest.doMock('@sentry/node', () => sentryMock);
    });

    afterEach(() => {
      jest.dontMock('@sentry/node');
    });

    it('remains inert when SENTRY_DSN is not provided', async () => {
      const sentryModule = await import('../observability/sentry');

      expect(sentryModule.initSentry()).toBe(false);
      expect(sentryModule.isSentryEnabled()).toBe(false);
      expect(sentryMock.init).not.toHaveBeenCalled();

      expect(() => sentryModule.captureException(new Error('boom'))).not.toThrow();
    });

    it('initializes and forwards exceptions when enabled', async () => {
      process.env.SENTRY_DSN = 'https://examplePublicKey@o0.ingest.sentry.io/0';
      process.env.SENTRY_TRACES_SAMPLE_RATE = '0.6';

      const sentryModule = await import('../observability/sentry');

      expect(sentryModule.initSentry()).toBe(true);
      expect(sentryMock.init).toHaveBeenCalledTimes(1);

      const error = new Error('boom');
      sentryModule.captureException(error, { requestId: 'abc123' });

      expect(sentryMock.captureException).toHaveBeenCalledWith(error, {
        extra: { requestId: 'abc123' },
      });

      // Subsequent calls should not reinvoke initialization
      expect(sentryModule.initSentry()).toBe(true);
      expect(sentryMock.init).toHaveBeenCalledTimes(1);
    });
  });

  describe('structured logging', () => {
    afterEach(() => {
      delete process.env.LOGGING_ENABLED;
      delete process.env.LOG_LEVEL;
      jest.resetModules();
    });

    it('captures request metadata in bindings', async () => {
      jest.resetModules();
      const { createRequestLogger } = await import('../observability/logger');

      const logger = createRequestLogger({
        requestId: 'req-123',
        method: 'POST',
        url: '/auth/login',
      });

      expect(logger.bindings()).toMatchObject({
        requestId: 'req-123',
        http: { method: 'POST', url: '/auth/login' },
      });
    });

    it('degrades gracefully when logging is disabled', async () => {
      process.env.LOGGING_ENABLED = 'false';
      jest.resetModules();
      const { createRequestLogger, isLoggingEnabled } = await import('../observability/logger');

      expect(isLoggingEnabled()).toBe(false);

      const logger = createRequestLogger({ requestId: 'silent' });
      expect(() => logger.info('this should not throw')).not.toThrow();
    });

    it('attaches sanitized user context', async () => {
      jest.resetModules();
      const { attachUserContext, createRequestLogger } = await import('../observability/logger');

      const baseLogger: Logger = createRequestLogger({ requestId: 'user-req' });
      const userLogger = attachUserContext(baseLogger, { id: 'user_abc123', roles: [] });

      expect(userLogger.bindings()).toMatchObject({
        requestId: 'user-req',
        user: { id: 'user_abc123' },
      });
    });
  });
});
