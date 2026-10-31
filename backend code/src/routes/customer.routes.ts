import { Router } from 'express';
import { CustomerController } from '../controllers/customer.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validate.middleware';
import { UserRole } from '../types/roles';
import {
  createCustomerSchema,
  updateCustomerSchema,
  listCustomerQuerySchema,
} from '../schemas/customer.schema';
import { idParamSchema } from '../schemas/common.schema';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorize(UserRole.ADMIN, UserRole.STAFF),
  validate({ body: createCustomerSchema }),
  CustomerController.createCustomer
);

router.get(
  '/',
  authorize(UserRole.ADMIN, UserRole.STAFF),
  validate({ query: listCustomerQuerySchema }),
  CustomerController.listCustomers
);

router.get(
  '/:id',
  authorize(UserRole.ADMIN, UserRole.STAFF),
  validate({ params: idParamSchema }),
  CustomerController.getCustomerById
);

router.put(
  '/:id',
  authorize(UserRole.ADMIN, UserRole.STAFF),
  validate({ params: idParamSchema, body: updateCustomerSchema }),
  CustomerController.updateCustomer
);

export default router;

