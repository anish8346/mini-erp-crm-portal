import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { sendSuccess } from '../utils/response';
import { NotFoundError, BadRequestError } from '../utils/errors';

export class UserController {
  public async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      sendSuccess(res, 'Users retrieved successfully', { users });
    } catch (error) {
      next(error);
    }
  }

  public async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { role, isActive } = req.body;
      console.log('UpdateUser endpoint hit:', { id, role, isActive, reqUserId: req.user?.id });

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new NotFoundError(`User with ID '${id}' not found`);
      }

      // Prevent self-demotion or self-deactivation
      if (req.user!.id === id) {
        if (isActive === false) {
          throw new BadRequestError('You cannot deactivate your own user account.');
        }
        if (role && role !== user.role) {
          throw new BadRequestError('You cannot change your own user role.');
        }
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          ...(role !== undefined && { role }),
          ...(isActive !== undefined && { isActive }),
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      sendSuccess(res, 'User updated successfully', { user: updatedUser });
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
