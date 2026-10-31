import { Request } from 'express';
import { UserRole } from './roles';

export * from './roles';

export interface AuthUserPayload {
  userId: string;
  email: string;
  role: UserRole;
  customerId?: string;
  firstName?: string;
  lastName?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUserPayload;
      id?: string;
    }
  }
}

