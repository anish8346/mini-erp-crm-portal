import { Router } from 'express';
import { Role } from '@prisma/client';
import { challanController } from '../controllers/challanController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/validateRequest';
import { createChallanSchema } from '../validators/challanValidator';

const router = Router();

// All challan routes require token authentication
router.use(authenticateToken);

// 1. List Challans with Search, Status Filter & Pagination
router.get(
  '/',
  requireRole(Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS),
  (req, res, next) => challanController.getChallans(req, res, next)
);

// 2. Create New Delivery Challan Draft (ADMIN & SALES)
router.post(
  '/',
  requireRole(Role.ADMIN, Role.SALES),
  validateBody(createChallanSchema),
  (req, res, next) => challanController.createChallan(req, res, next)
);

// 3. Get Single Challan Details by ID
router.get(
  '/:id',
  requireRole(Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS),
  (req, res, next) => challanController.getChallanById(req, res, next)
);

// 4. Confirm Challan
router.post(
  '/:id/confirm',
  requireRole(Role.ADMIN, Role.SALES, Role.ACCOUNTS, Role.WAREHOUSE),
  (req, res, next) => challanController.confirmChallan(req, res, next)
);

// 5. Cancel Challan
router.post(
  '/:id/cancel',
  requireRole(Role.ADMIN, Role.SALES),
  (req, res, next) => challanController.cancelChallan(req, res, next)
);

export default router;
