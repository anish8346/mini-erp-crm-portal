import { Role } from '@prisma/client';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface JwtPayload {
  id: string;
  email: string;
  role: Role;
  name: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
