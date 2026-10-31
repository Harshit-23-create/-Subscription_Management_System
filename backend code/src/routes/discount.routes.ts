import { Router } from 'express';
import { DiscountController } from '../controllers/discount.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validate.middleware';
import { UserRole } from '../types/roles';
import {
  createDiscountSchema,
  updateDiscountSchema,
  listDiscountQuerySchema,
} from '../schemas/discount.schema';
import { idParamSchema } from '../schemas/common.schema';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorize(UserRole.ADMIN),
  validate({ body: createDiscountSchema }),
  DiscountController.createDiscount
);

router.get(
  '/',
  authorize(UserRole.ADMIN, UserRole.STAFF),
  validate({ query: listDiscountQuerySchema }),
  DiscountController.listDiscounts
);

router.get(
  '/code/:code',
  DiscountController.getByCode
);

router.put(
  '/:id',
  authorize(UserRole.ADMIN),
  validate({ params: idParamSchema, body: updateDiscountSchema }),
  DiscountController.updateDiscount
);

export default router;

