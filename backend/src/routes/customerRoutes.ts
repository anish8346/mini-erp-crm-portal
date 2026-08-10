import { Router } from 'express';
import { Role } from '@prisma/client';
import { customerController } from '../controllers/customerController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/validateRequest';
import {
  createCustomerSchema,
  updateCustomerSchema,
  createFollowUpSchema,
} from '../validators/customerValidator';

const router = Router();

// All customer routes require token authentication
router.use(authenticateToken);

// 1. List Customers with Search, Filter & Pagination
router.get(
  '/',
  requireRole(Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS),
  (req, res, next) => customerController.getCustomers(req, res, next)
);

// 2. Create New Customer
router.post(
  '/',
  requireRole(Role.ADMIN, Role.SALES),
  validateBody(createCustomerSchema),
  (req, res, next) => customerController.createCustomer(req, res, next)
);

// 3. Get Single Customer Details
router.get(
  '/:id',
  requireRole(Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS),
  (req, res, next) => customerController.getCustomerById(req, res, next)
);

// 4. Update Customer
router.put(
  '/:id',
  requireRole(Role.ADMIN, Role.SALES),
  validateBody(updateCustomerSchema),
  (req, res, next) => customerController.updateCustomer(req, res, next)
);

// 5. Delete Customer (ADMIN Only)
router.delete(
  '/:id',
  requireRole(Role.ADMIN),
  (req, res, next) => customerController.deleteCustomer(req, res, next)
);

// 6. Log Customer Follow-Up
router.post(
  '/:id/follow-ups',
  requireRole(Role.ADMIN, Role.SALES),
  validateBody(createFollowUpSchema),
  (req, res, next) => customerController.addFollowUp(req, res, next)
);

// 7. Get Customer Follow-Up History
router.get(
  '/:id/follow-ups',
  requireRole(Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS),
  (req, res, next) => customerController.getFollowUps(req, res, next)
);

export default router;
