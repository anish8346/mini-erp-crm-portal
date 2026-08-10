import { Router } from 'express';
import healthRoutes from './healthRoutes';
import authRoutes from './authRoutes';
import customerRoutes from './customerRoutes';
import productRoutes from './productRoutes';

const apiRouter = Router();

// Mount system routes
apiRouter.use('/', healthRoutes);

// Mount authentication routes
apiRouter.use('/auth', authRoutes);

// Mount customer CRM routes
apiRouter.use('/customers', customerRoutes);

// Mount product catalog routes
apiRouter.use('/products', productRoutes);

export default apiRouter;
