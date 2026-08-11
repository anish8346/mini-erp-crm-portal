import { Router } from 'express';
import { Role } from '@prisma/client';
import { userController } from '../controllers/userController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/validateRequest';
import { updateUserSchema } from '../validators/userValidator';

const router = Router();

// All user management routes require token authentication and ADMIN role
router.use(authenticateToken);
router.use(requireRole(Role.ADMIN));

// 1. List All Users
router.get('/', (req, res, next) => userController.getUsers(req, res, next));

// 2. Update User Role / Status
router.patch('/:id', validateBody(updateUserSchema), (req, res, next) =>
  userController.updateUser(req, res, next)
);

export default router;
