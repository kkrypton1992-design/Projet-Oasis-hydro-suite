/**
 * OASIS HYDRO SUITE — Gestionnaire Global d'Erreurs Express
 * Format JSON uniforme sans fuite de traces internes en production.
 */

import { NextFunction, Response } from 'express';
import { AppError } from '../errors.ts';
import { logger } from '../logger.ts';
import { RequestWithId } from './requestLogger.ts';

export function errorHandlerMiddleware(
  err: unknown,
  req: RequestWithId,
  res: Response,
  _next: NextFunction
): void {
  const requestId = req.requestId;

  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({
      error: {
        code: 'MALFORMED_JSON',
        message: 'Corps de requête JSON syntaxiquement invalide.',
        requestId
      }
    });
    return;
  }

  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error(err.message, { code: err.code, details: err.details }, requestId);
    } else {
      logger.warn(err.message, { code: err.code, statusCode: err.statusCode }, requestId);
    }

    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err.details !== undefined ? { details: err.details } : {}),
        requestId
      }
    });
    return;
  }

  const message =
    err instanceof Error ? err.message : 'Une erreur interne inattendue est survenue.';
  logger.error(
    'Unhandled server error',
    {
      path: req.path,
      method: req.method,
      errorMessage: message,
      stack: err instanceof Error ? err.stack : undefined
    },
    requestId
  );

  res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: process.env.NODE_ENV === 'production' ? 'Erreur interne du serveur.' : message,
      requestId
    }
  });
}
