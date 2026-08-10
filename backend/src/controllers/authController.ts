import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';
import { sendSuccess } from '../utils/response';

export class AuthController {
  public async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.login(req.body);
      sendSuccess(res, 'Login successful', result);
    } catch (error) {
      next(error);
    }
  }

  public async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await authService.getProfile(req.user!.id);
      sendSuccess(res, 'Profile retrieved successfully', { user });
    } catch (error) {
      next(error);
    }
  }

  public async protectedTest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      sendSuccess(res, `Access granted to protected endpoint for role ${req.user!.role}`, {
        user: req.user,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
