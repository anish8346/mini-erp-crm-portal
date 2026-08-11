import { Request, Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboardService';
import { sendSuccess } from '../utils/response';

export class DashboardController {
  public async getMetrics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await dashboardService.getMetrics();
      sendSuccess(res, 'Dashboard metrics retrieved successfully', data);
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();
