import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';
import { UserRole } from '../types/roles';

const router = Router();

router.use(authenticate);
router.use(authorize(UserRole.ADMIN, UserRole.STAFF));

router.get('/summary', AnalyticsController.getSummary);
router.get('/revenue', AnalyticsController.getRevenueReport);

export default router;

