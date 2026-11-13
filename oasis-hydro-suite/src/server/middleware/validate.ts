/**
 * OASIS HYDRO SUITE — Middleware de Validation d'Entrée Zod
 */

import { NextFunction, Request, Response } from 'express';
import { ZodType } from 'zod';
import { ValidationError } from '../errors.ts';

export function validateBody<T>(schema: ZodType<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const formattedIssues = result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
        code: issue.code
      }));
      next(new ValidationError('Charge utile JSON invalide.', formattedIssues));
      return;
    }
    req.body = result.data;
    next();
  };
}
