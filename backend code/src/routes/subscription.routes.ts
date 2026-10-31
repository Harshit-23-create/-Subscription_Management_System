import { Router } from 'express';
import { SubscriptionController } from '../controllers/subscription.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validate.middleware';
import { UserRole } from '../types/roles';
import {
  createSubscriptionSchema,
  updateSubscriptionPlanSchema,
  cancelSubscriptionSchema,
  listSubscriptionQuerySchema,
} from '../schemas/subscription.schema';
import { idParamSchema } from '../schemas/common.schema';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorize(UserRole.ADMIN, UserRole.STAFF),
  validate({ body: createSubscriptionSchema }),
  SubscriptionController.createSubscription
);

router.get(
  '/',
  authorize(UserRole.ADMIN, UserRole.STAFF),
  validate({ query: listSubscriptionQuerySchema }),
  SubscriptionController.listSubscriptions
);

router.get(
  '/:id',
  validate({ params: idParamSchema }),
  SubscriptionController.getById
);

router.post(
  '/:id/renew',
  authorize(UserRole.ADMIN, UserRole.STAFF),
  validate({ params: idParamSchema }),
  SubscriptionController.renewSubscription
);

router.post(
  '/:id/pause',
  authorize(UserRole.ADMIN, UserRole.STAFF),
  validate({ params: idParamSchema }),
  SubscriptionController.pauseSubscription
);

router.post(
  '/:id/resume',
  authorize(UserRole.ADMIN, UserRole.STAFF),
  validate({ params: idParamSchema }),
  SubscriptionController.resumeSubscription
);

router.post(
  '/:id/cancel',
  authorize(UserRole.ADMIN, UserRole.STAFF, UserRole.CUSTOMER),
  validate({ params: idParamSchema, body: cancelSubscriptionSchema }),
  SubscriptionController.cancelSubscription
);

router.post(
  '/:id/change-plan',
  authorize(UserRole.ADMIN, UserRole.STAFF),
  validate({ params: idParamSchema, body: updateSubscriptionPlanSchema }),
  SubscriptionController.changePlan
);

export default router;

