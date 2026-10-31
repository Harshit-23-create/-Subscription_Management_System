import { Router } from 'express';
import { PlanController } from '../controllers/plan.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validate.middleware';
import { UserRole } from '../types/roles';
import {
  createPlanSchema,
  updatePlanSchema,
  listPlanQuerySchema,
} from '../schemas/plan.schema';
import { idParamSchema } from '../schemas/common.schema';

const router = Router();

// Public can view plans
router.get(
  '/',
  validate({ query: listPlanQuerySchema }),
  PlanController.listPlans
);

router.get(
  '/:id',
  validate({ params: idParamSchema }),
  PlanController.getPlanById
);

// Admin/Staff only for modification
router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.STAFF),
  validate({ body: createPlanSchema }),
  PlanController.createPlan
);

router.put(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.STAFF),
  validate({ params: idParamSchema, body: updatePlanSchema }),
  PlanController.updatePlan
);

export default router;

