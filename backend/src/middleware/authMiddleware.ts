import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { verifyToken } from '../utils/jwt';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { prisma } from '../config/prisma';

export async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Access token required');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedError('Access token missing');
    }

    let decoded: any;
    try {
      decoded = verifyToken(token);
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        throw new UnauthorizedError('Token has expired');
      }
      throw new UnauthorizedError('Invalid access token');
    }

    // Verify user exists and is active in DB
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError('User account associated with token no longer exists');
    }

    if (!user.isActive) {
      throw new ForbiddenError('User account is inactive. Please contact administrator.');
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    next(error);
  }
}

export function requireRole(...allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('User unauthenticated'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Forbidden access. Required role: [${allowedRoles.join(', ')}], current role: ${req.user.role}`
        )
      );
    }

    next();
  };
}
