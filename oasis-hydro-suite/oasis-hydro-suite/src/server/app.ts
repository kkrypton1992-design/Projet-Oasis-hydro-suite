/**
 * OASIS HYDRO SUITE — Fabrique d'Application Express
 * Séparée du démarrage HTTP/Vite pour permettre les tests d'intégration Supertest isolés.
 */

import express, { Express } from 'express';
import { errorHandlerMiddleware } from './middleware/errorHandler.ts';
import { requestLoggerMiddleware } from './middleware/requestLogger.ts';
import { ApiDependencies, createApiRouter } from './routes/apiRouter.ts';

export function createApiApp(customDeps?: Partial<ApiDependencies>): Express {
  const app = express();

  app.disable('x-powered-by');
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  app.use(express.json({ limit: '15mb' }));
  app.use(requestLoggerMiddleware);

  app.use('/api', createApiRouter(customDeps));

  app.use(errorHandlerMiddleware);

  return app;
}
