import { Router } from 'express';
import healthRoutes from './healthRoutes';
import authRoutes from './authRoutes';
import customerRoutes from './customerRoutes';
import productRoutes from './productRoutes';
import inventoryRoutes from './inventoryRoutes';
import challanRoutes from './challanRoutes';

const apiRouter = Router();

// Mount system routes
apiRouter.use('/', healthRoutes);

// Mount authentication routes
apiRouter.use('/auth', authRoutes);

// Mount customer CRM routes
apiRouter.use('/customers', customerRoutes);

// Mount product catalog routes
apiRouter.use('/products', productRoutes);

// Mount inventory & stock movement routes
apiRouter.use('/inventory', inventoryRoutes);

// Mount sales delivery challan routes
apiRouter.use('/challans', challanRoutes);

export default apiRouter;
