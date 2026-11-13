/**
 * OASIS HYDRO SUITE — Middleware de Traçabilité & Logs HTTP
 */

import { randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { logger } from '../logger.ts';

export interface RequestWithId extends Request {
  requestId?: string;
}

export function requestLoggerMiddleware(
  req: RequestWithId,
  res: Response,
  next: NextFunction
): void {
  const incomingId = req.header('x-request-id');
  const requestId = incomingId && incomingId.trim().length > 0 ? incomingId.trim() : randomUUID();
  req.requestId = requestId;
  res.setHeader('x-request-id', requestId);

  const start = Date.now();
  res.on('finish', () => {
    if (req.path.startsWith('/api')) {
      logger.info(
        `${req.method} ${req.originalUrl}`,
        {
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          durationMs: Date.now() - start
        },
        requestId
      );
    }
  });

  next();
}
