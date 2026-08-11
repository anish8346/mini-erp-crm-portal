import { Router } from 'express';
import { Role } from '@prisma/client';
import { inventoryController } from '../controllers/inventoryController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/validateRequest';
import { stockMovementSchema } from '../validators/inventoryValidator';

const router = Router();

// All inventory routes require token authentication
router.use(authenticateToken);

// 1. Get Stock Movements Audit History
router.get(
  '/movements',
  requireRole(Role.ADMIN, Role.WAREHOUSE, Role.SALES, Role.ACCOUNTS),
  (req, res, next) => inventoryController.getMovements(req, res, next)
);

// 2. Get Low Stock Products (currentStock <= minimumStock)
router.get(
  '/low-stock',
  requireRole(Role.ADMIN, Role.WAREHOUSE, Role.SALES, Role.ACCOUNTS),
  (req, res, next) => inventoryController.getLowStockProducts(req, res, next)
);

// 3. Stock IN (Increase stock & log IN movement)
router.post(
  '/:productId/stock-in',
  requireRole(Role.ADMIN, Role.WAREHOUSE),
  validateBody(stockMovementSchema),
  (req, res, next) => inventoryController.stockIn(req, res, next)
);

// 4. Stock OUT (Decrease stock & log OUT movement)
router.post(
  '/:productId/stock-out',
  requireRole(Role.ADMIN, Role.WAREHOUSE),
  validateBody(stockMovementSchema),
  (req, res, next) => inventoryController.stockOut(req, res, next)
);

export default router;
