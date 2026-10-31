import { Router } from 'express';
import authRoutes from './auth.routes';
import customerRoutes from './customer.routes';
import productRoutes from './product.routes';
import planRoutes from './plan.routes';
import quotationRoutes from './quotation.routes';
import subscriptionRoutes from './subscription.routes';
import invoiceRoutes from './invoice.routes';
import paymentRoutes from './payment.routes';
import discountRoutes from './discount.routes';
import taxRoutes from './tax.routes';
import portalRoutes from './portal.routes';
import analyticsRoutes from './analytics.routes';
import notificationRoutes from './notification.routes';
import auditRoutes from './audit.routes';

const router = Router();

// Health Check
router.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Mount Resource Routes
router.use('/auth', authRoutes);
router.use('/customers', customerRoutes);
router.use('/products', productRoutes);
router.use('/plans', planRoutes);
router.use('/quotations', quotationRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/payments', paymentRoutes);
router.use('/discounts', discountRoutes);
router.use('/taxes', taxRoutes);
router.use('/portal', portalRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/notifications', notificationRoutes);
router.use('/audit-logs', auditRoutes);

export default router;

