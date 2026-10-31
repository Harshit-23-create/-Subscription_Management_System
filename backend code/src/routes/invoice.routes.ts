import { Router } from 'express';
import { InvoiceController } from '../controllers/invoice.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validate.middleware';
import { UserRole } from '../types/roles';
import {
  createInvoiceSchema,
  updateInvoiceStatusSchema,
  listInvoiceQuerySchema,
} from '../schemas/invoice.schema';
import { idParamSchema } from '../schemas/common.schema';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorize(UserRole.ADMIN, UserRole.STAFF),
  validate({ body: createInvoiceSchema }),
  InvoiceController.createInvoice
);

router.get(
  '/',
  authorize(UserRole.ADMIN, UserRole.STAFF),
  validate({ query: listInvoiceQuerySchema }),
  InvoiceController.listInvoices
);

router.get(
  '/:id',
  validate({ params: idParamSchema }),
  InvoiceController.getInvoiceById
);

router.patch(
  '/:id/status',
  authorize(UserRole.ADMIN, UserRole.STAFF),
  validate({ params: idParamSchema, body: updateInvoiceStatusSchema }),
  InvoiceController.updateInvoiceStatus
);

router.get(
  '/:id/pdf',
  validate({ params: idParamSchema }),
  InvoiceController.downloadPdf
);

export default router;

