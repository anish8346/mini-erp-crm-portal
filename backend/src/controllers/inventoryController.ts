import { Request, Response, NextFunction } from 'express';
import { inventoryService } from '../services/inventoryService';
import { sendSuccess } from '../utils/response';

export class InventoryController {
  public async stockIn(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const productId = Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId;
      const result = await inventoryService.stockIn(productId, req.body, req.user!.id);
      sendSuccess(res, 'Stock inward added successfully', result, 201);
    } catch (error) {
      next(error);
    }
  }

  public async stockOut(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const productId = Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId;
      const result = await inventoryService.stockOut(productId, req.body, req.user!.id);
      sendSuccess(res, 'Stock outward issued successfully', result, 201);
    } catch (error) {
      next(error);
    }
  }

  public async getMovements(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await inventoryService.getMovements(req.query as any);
      sendSuccess(res, 'Stock movement history retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  public async getLowStockProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const result = await inventoryService.getLowStockProducts(page, limit);
      sendSuccess(res, 'Low stock products retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }
}

export const inventoryController = new InventoryController();
