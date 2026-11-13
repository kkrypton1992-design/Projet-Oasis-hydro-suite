/**
 * OASIS HYDRO SUITE — Logger Structuré JSON
 */

export type LogLevel = 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  service: string;
  message: string;
  requestId?: string;
  context?: Record<string, unknown>;
}

function writeLog(
  level: LogLevel,
  message: string,
  context?: Record<string, unknown>,
  requestId?: string
): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    service: 'oasis-hydro-suite-api',
    message,
    ...(requestId ? { requestId } : {}),
    ...(context ? { context } : {})
  };

  if (process.env.NODE_ENV === 'test') {
    return;
  }

  const line = JSON.stringify(entry);
  if (level === 'error') {
    console.error(line);
  } else if (level === 'warn') {
    console.warn(line);
  } else {
    console.log(line);
  }
}

export const logger = {
  info: (message: string, context?: Record<string, unknown>, requestId?: string) =>
    writeLog('info', message, context, requestId),
  warn: (message: string, context?: Record<string, unknown>, requestId?: string) =>
    writeLog('warn', message, context, requestId),
  error: (message: string, context?: Record<string, unknown>, requestId?: string) =>
    writeLog('error', message, context, requestId)
};
