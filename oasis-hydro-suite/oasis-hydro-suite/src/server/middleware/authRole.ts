/**
 * OASIS HYDRO SUITE — Protection RBAC des Endpoints Critiques
 */

import { NextFunction, Request, Response } from 'express';
import { UserRoleSchema } from '../../shared/validation/schemas.ts';
import { UserRole } from '../../types/oasis.ts';
import { ForbiddenError, UnauthorizedError } from '../errors.ts';

export function requireRoles(allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const rawRole = req.header('x-user-role');
    const enforceStrict = process.env.ENFORCE_RBAC === 'true';

    if (!rawRole) {
      if (enforceStrict) {
        next(new UnauthorizedError('En-tête x-user-role manquant pour accéder à cette ressource.'));
        return;
      }
      // Compatibilité client si header absent hors mode strict, tout en validant dès qu'il est fourni
      next();
      return;
    }

    const parsed = UserRoleSchema.safeParse(rawRole);
    if (!parsed.success) {
      next(new ForbiddenError(`Rôle utilisateur non reconnu : "${rawRole}".`));
      return;
    }

    if (!allowedRoles.includes(parsed.data)) {
      next(
        new ForbiddenError(
          `Action refusée pour le rôle "${parsed.data}". Rôles autorisés : ${allowedRoles.join(', ')}.`
        )
      );
      return;
    }

    next();
  };
}
