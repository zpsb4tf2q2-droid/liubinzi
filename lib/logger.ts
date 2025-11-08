type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogContext {
  [key: string]: unknown
}

function log(level: LogLevel, message: string, context?: LogContext) {
  const timestamp = new Date().toISOString()
  const logData = {
    timestamp,
    level,
    message,
    ...context,
  }

  if (process.env.NODE_ENV === 'development') {
    console[level === 'info' || level === 'debug' ? 'log' : level](
      `[${timestamp}] [${level.toUpperCase()}]`,
      message,
      context || ''
    )
  } else {
    console[level === 'error' ? 'error' : 'log'](JSON.stringify(logData))
  }
}

export const logger = {
  info: (message: string, context?: LogContext) => log('info', message, context),
  warn: (message: string, context?: LogContext) => log('warn', message, context),
  error: (message: string, context?: LogContext) => log('error', message, context),
  debug: (message: string, context?: LogContext) => log('debug', message, context),
}
