import { Request, Response, NextFunction } from 'express';
import { productService } from '../services/productService';
import { sendSuccess } from '../utils/response';

export class ProductController {
  public async createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await productService.createProduct(req.body);
      sendSuccess(res, 'Product created successfully', { product }, 201);
    } catch (error) {
      next(error);
    }
  }

  public async getProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await productService.getProducts(req.query as any);
      sendSuccess(res, 'Products retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  public async getProductById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const productId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const product = await productService.getProductById(productId);
      sendSuccess(res, 'Product details retrieved successfully', { product });
    } catch (error) {
      next(error);
    }
  }

  public async updateProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const productId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const product = await productService.updateProduct(productId, req.body);
      sendSuccess(res, 'Product updated successfully', { product });
    } catch (error) {
      next(error);
    }
  }

  public async deleteProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const productId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      await productService.deleteProduct(productId);
      sendSuccess(res, 'Product deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const productController = new ProductController();
