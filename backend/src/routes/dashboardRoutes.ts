import { Router } from 'express';
import { Role } from '@prisma/client';
import { dashboardController } from '../controllers/dashboardController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';

const router = Router();

// Dashboard routes require token authentication and can be accessed by all roles
router.use(authenticateToken);

router.get(
  '/metrics',
  requireRole(Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS),
  (req, res, next) => dashboardController.getMetrics(req, res, next)
);

export default router;
