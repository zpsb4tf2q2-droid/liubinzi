import pino from "pino"

const isServer = typeof window === "undefined"
const isDevelopment = process.env.NODE_ENV === "development"

const browserLogger = {
  info: (obj: any, msg?: string) => {
    if (msg) console.info(msg, obj)
    else console.info(obj)
  },
  warn: (obj: any, msg?: string) => {
    if (msg) console.warn(msg, obj)
    else console.warn(obj)
  },
  error: (obj: any, msg?: string) => {
    if (msg) console.error(msg, obj)
    else console.error(obj)
  },
  debug: (obj: any, msg?: string) => {
    if (isDevelopment) {
      if (msg) console.debug(msg, obj)
      else console.debug(obj)
    }
  },
}

const serverLogger = pino({
  level: isDevelopment ? "debug" : "info",
  transport: isDevelopment
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "HH:MM:ss Z",
          ignore: "pid,hostname",
        },
      }
    : undefined,
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() }
    },
  },
})

export const logger = isServer ? serverLogger : browserLogger

export function logInfo(message: string, context?: Record<string, any>) {
  if (context) {
    logger.info(context, message)
  } else {
    logger.info(message)
  }
}

export function logError(message: string, error?: unknown, context?: Record<string, any>) {
  const errorContext = {
    ...context,
    error: error instanceof Error 
      ? { 
          name: error.name, 
          message: error.message, 
          stack: error.stack 
        } 
      : error,
  }
  logger.error(errorContext, message)
}

export function logWarn(message: string, context?: Record<string, any>) {
  if (context) {
    logger.warn(context, message)
  } else {
    logger.warn(message)
  }
}

export function logDebug(message: string, context?: Record<string, any>) {
  if (context) {
    logger.debug(context, message)
  } else {
    logger.debug(message)
  }
}

export function createContextLogger(defaultContext: Record<string, any>) {
  return {
    info: (message: string, additionalContext?: Record<string, any>) =>
      logInfo(message, { ...defaultContext, ...additionalContext }),
    error: (message: string, error?: unknown, additionalContext?: Record<string, any>) =>
      logError(message, error, { ...defaultContext, ...additionalContext }),
    warn: (message: string, additionalContext?: Record<string, any>) =>
      logWarn(message, { ...defaultContext, ...additionalContext }),
    debug: (message: string, additionalContext?: Record<string, any>) =>
      logDebug(message, { ...defaultContext, ...additionalContext }),
  }
}
