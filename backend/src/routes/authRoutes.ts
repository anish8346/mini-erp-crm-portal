import { Router } from 'express';
import { Role } from '@prisma/client';
import { authController } from '../controllers/authController';
import { validateBody } from '../middleware/validateRequest';
import { loginSchema } from '../validators/authValidator';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';

const router = Router();

// Public Authentication Endpoints
router.post('/login', validateBody(loginSchema), (req, res, next) =>
  authController.login(req, res, next)
);

// Protected Auth Endpoints
router.get('/me', authenticateToken, (req, res, next) =>
  authController.getMe(req, res, next)
);

// Protected Test Endpoints for Role Verification
router.get('/test/admin', authenticateToken, requireRole(Role.ADMIN), (req, res, next) =>
  authController.protectedTest(req, res, next)
);

router.get('/test/sales', authenticateToken, requireRole(Role.SALES, Role.ADMIN), (req, res, next) =>
  authController.protectedTest(req, res, next)
);

router.get('/test/warehouse', authenticateToken, requireRole(Role.WAREHOUSE, Role.ADMIN), (req, res, next) =>
  authController.protectedTest(req, res, next)
);

router.get('/test/accounts', authenticateToken, requireRole(Role.ACCOUNTS, Role.ADMIN), (req, res, next) =>
  authController.protectedTest(req, res, next)
);

export default router;
