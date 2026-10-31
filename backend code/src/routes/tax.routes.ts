import { Router } from 'express';
import { TaxController } from '../controllers/tax.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validate.middleware';
import { UserRole } from '../types/roles';
import {
  createTaxRateSchema,
  updateTaxRateSchema,
  listTaxRateQuerySchema,
} from '../schemas/tax.schema';
import { idParamSchema } from '../schemas/common.schema';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorize(UserRole.ADMIN),
  validate({ body: createTaxRateSchema }),
  TaxController.createTaxRate
);

router.get(
  '/',
  authorize(UserRole.ADMIN, UserRole.STAFF),
  validate({ query: listTaxRateQuerySchema }),
  TaxController.listTaxRates
);

router.put(
  '/:id',
  authorize(UserRole.ADMIN),
  validate({ params: idParamSchema, body: updateTaxRateSchema }),
  TaxController.updateTaxRate
);

export default router;

