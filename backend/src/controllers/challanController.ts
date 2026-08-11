import { Request, Response, NextFunction } from 'express';
import { challanService } from '../services/challanService';
import { sendSuccess } from '../utils/response';

export class ChallanController {
  public async createChallan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const challan = await challanService.createChallan(req.body, req.user!.id);
      sendSuccess(res, 'Sales delivery challan draft created successfully', { challan }, 201);
    } catch (error) {
      next(error);
    }
  }

  public async getChallans(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await challanService.getChallans(req.query as any);
      sendSuccess(res, 'Challans retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  public async getChallanById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const challanId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const challan = await challanService.getChallanById(challanId);
      sendSuccess(res, 'Challan details retrieved successfully', { challan });
    } catch (error) {
      next(error);
    }
  }

  public async confirmChallan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const challanId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const challan = await challanService.confirmChallan(challanId, req.user!.id);
      sendSuccess(res, 'Challan confirmed successfully', { challan });
    } catch (error) {
      next(error);
    }
  }

  public async cancelChallan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const challanId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const challan = await challanService.cancelChallan(challanId, req.user!.id);
      sendSuccess(res, 'Challan cancelled successfully', { challan });
    } catch (error) {
      next(error);
    }
  }
}

export const challanController = new ChallanController();
