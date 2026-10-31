import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types/roles';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';

export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('User is not authenticated'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `User role '${req.user.role}' is not authorized to access this resource. Required: ${allowedRoles.join(', ')}`
        )
      );
    }

    return next();
  };
};

export const requireOwnershipOrStaff = (customerIdExtractor?: (req: Request) => string | undefined) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }

    // Admins and Staff have global access
    if (req.user.role === UserRole.ADMIN || req.user.role === UserRole.STAFF) {
      return next();
    }

    // Customer role must match customerId
    if (req.user.role === UserRole.CUSTOMER) {
      const targetCustomerId = customerIdExtractor ? customerIdExtractor(req) : (req.params.customerId || req.query.customerId || req.body.customerId);
      if (req.user.customerId && targetCustomerId && req.user.customerId.toString() === targetCustomerId.toString()) {
        return next();
      }
      return next(new ForbiddenError('You can only access records belonging to your own account'));
    }

    return next(new ForbiddenError('Access denied'));
  };
};

