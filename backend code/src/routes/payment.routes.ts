import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validate.middleware';
import { UserRole } from '../types/roles';
import {
  recordPaymentSchema,
  refundPaymentSchema,
  listPaymentQuerySchema,
} from '../schemas/payment.schema';
import { idParamSchema } from '../schemas/common.schema';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorize(UserRole.ADMIN, UserRole.STAFF, UserRole.CUSTOMER),
  validate({ body: recordPaymentSchema }),
  PaymentController.recordPayment
);

router.get(
  '/',
  authorize(UserRole.ADMIN, UserRole.STAFF),
  validate({ query: listPaymentQuerySchema }),
  PaymentController.listPayments
);

router.get(
  '/:id',
  validate({ params: idParamSchema }),
  PaymentController.getPaymentById
);

router.post(
  '/:id/refund',
  authorize(UserRole.ADMIN),
  validate({ params: idParamSchema, body: refundPaymentSchema }),
  PaymentController.refundPayment
);

router.get(
  '/:id/receipt',
  validate({ params: idParamSchema }),
  PaymentController.downloadReceipt
);

export default router;

