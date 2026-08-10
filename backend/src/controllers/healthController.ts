import { Request, Response, NextFunction } from 'express';
import { healthService } from '../services/healthService';
import { sendSuccess } from '../utils/response';

export class HealthController {
  public async getHealth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await healthService.getHealthStatus();
      sendSuccess(res, 'API is running', data);
    } catch (error) {
      next(error);
    }
  }
}

export const healthController = new HealthController();
