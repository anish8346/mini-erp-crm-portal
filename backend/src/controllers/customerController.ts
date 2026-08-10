import { Request, Response, NextFunction } from 'express';
import { customerService } from '../services/customerService';
import { sendSuccess } from '../utils/response';

export class CustomerController {
  public async createCustomer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const customer = await customerService.createCustomer(req.body);
      sendSuccess(res, 'Customer created successfully', { customer }, 201);
    } catch (error) {
      next(error);
    }
  }

  public async getCustomers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await customerService.getCustomers(req.query as any);
      sendSuccess(res, 'Customers retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  public async getCustomerById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const customerId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const customer = await customerService.getCustomerById(customerId);
      sendSuccess(res, 'Customer details retrieved successfully', { customer });
    } catch (error) {
      next(error);
    }
  }

  public async updateCustomer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const customerId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const customer = await customerService.updateCustomer(customerId, req.body);
      sendSuccess(res, 'Customer updated successfully', { customer });
    } catch (error) {
      next(error);
    }
  }

  public async deleteCustomer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const customerId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      await customerService.deleteCustomer(customerId);
      sendSuccess(res, 'Customer deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  public async addFollowUp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const customerId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const followUp = await customerService.addFollowUp(
        customerId,
        req.body,
        req.user!.id
      );
      sendSuccess(res, 'Follow-up logged successfully', { followUp }, 201);
    } catch (error) {
      next(error);
    }
  }

  public async getFollowUps(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const customerId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const followUps = await customerService.getFollowUps(customerId);
      sendSuccess(res, 'Customer follow-ups retrieved successfully', { followUps });
    } catch (error) {
      next(error);
    }
  }
}

export const customerController = new CustomerController();
