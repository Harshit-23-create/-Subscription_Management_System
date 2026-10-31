import { Router } from 'express';
import { QuotationController } from '../controllers/quotation.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validate.middleware';
import { UserRole } from '../types/roles';
import {
  createQuotationSchema,
  updateQuotationStatusSchema,
  listQuotationQuerySchema,
} from '../schemas/quotation.schema';
import { idParamSchema } from '../schemas/common.schema';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorize(UserRole.ADMIN, UserRole.STAFF),
  validate({ body: createQuotationSchema }),
  QuotationController.createQuotation
);

router.get(
  '/',
  authorize(UserRole.ADMIN, UserRole.STAFF),
  validate({ query: listQuotationQuerySchema }),
  QuotationController.listQuotations
);

router.get(
  '/:id',
  validate({ params: idParamSchema }),
  QuotationController.getById
);

router.patch(
  '/:id/status',
  authorize(UserRole.ADMIN, UserRole.STAFF, UserRole.CUSTOMER),
  validate({ params: idParamSchema, body: updateQuotationStatusSchema }),
  QuotationController.updateStatus
);

router.post(
  '/:id/convert-to-invoice',
  authorize(UserRole.ADMIN, UserRole.STAFF),
  validate({ params: idParamSchema }),
  QuotationController.convertToInvoice
);

router.get(
  '/:id/pdf',
  validate({ params: idParamSchema }),
  QuotationController.downloadPdf
);

export default router;

