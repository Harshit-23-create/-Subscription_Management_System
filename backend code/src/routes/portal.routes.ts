import { Router } from 'express';
import { PortalController } from '../controllers/portal.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';
import { UserRole } from '../types/roles';
import { validate } from '../middleware/validate.middleware';
import { idParamSchema } from '../schemas/common.schema';

const router = Router();

router.use(authenticate);
router.use(authorize(UserRole.CUSTOMER, UserRole.ADMIN));

router.get('/dashboard', PortalController.getDashboard);
router.get('/subscriptions', PortalController.getSubscriptions);
router.get('/invoices', PortalController.getInvoices);
router.get('/invoices/:id/pdf', validate({ params: idParamSchema }), PortalController.downloadInvoicePdf);
router.get('/payments', PortalController.getPayments);
router.get('/quotations', PortalController.getQuotations);

export default router;

