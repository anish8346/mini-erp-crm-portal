import { Router } from 'express';
import { Role } from '@prisma/client';
import { productController } from '../controllers/productController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/validateRequest';
import { createProductSchema, updateProductSchema } from '../validators/productValidator';

const router = Router();

// All product routes require token authentication
router.use(authenticateToken);

// 1. List Products with Search, Category Filter, Low Stock Filter & Pagination
router.get(
  '/',
  requireRole(Role.ADMIN, Role.WAREHOUSE, Role.SALES, Role.ACCOUNTS),
  (req, res, next) => productController.getProducts(req, res, next)
);

// 2. Create New Product (ADMIN & WAREHOUSE)
router.post(
  '/',
  requireRole(Role.ADMIN, Role.WAREHOUSE),
  validateBody(createProductSchema),
  (req, res, next) => productController.createProduct(req, res, next)
);

// 3. Get Single Product Details by ID
router.get(
  '/:id',
  requireRole(Role.ADMIN, Role.WAREHOUSE, Role.SALES, Role.ACCOUNTS),
  (req, res, next) => productController.getProductById(req, res, next)
);

// 4. Update Product Details (ADMIN & WAREHOUSE)
router.put(
  '/:id',
  requireRole(Role.ADMIN, Role.WAREHOUSE),
  validateBody(updateProductSchema),
  (req, res, next) => productController.updateProduct(req, res, next)
);

// 5. Delete Product (ADMIN & WAREHOUSE)
router.delete(
  '/:id',
  requireRole(Role.ADMIN, Role.WAREHOUSE),
  (req, res, next) => productController.deleteProduct(req, res, next)
);

export default router;
