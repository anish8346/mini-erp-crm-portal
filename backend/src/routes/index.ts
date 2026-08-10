import { Router } from 'express';
import healthRoutes from './healthRoutes';

const apiRouter = Router();

// Mount routes
apiRouter.use('/', healthRoutes);

export default apiRouter;
