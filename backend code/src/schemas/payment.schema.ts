import { z } from 'zod';
import { PaymentMethod } from '../types/roles';
import { objectIdSchema, paginationQuerySchema } from './common.schema';

export const recordPaymentSchema = z.object({
  customerId: objectIdSchema,
  invoiceId: objectIdSchema,
  amount: z.number().positive('Payment amount must be greater than zero'),
  paymentMethod: z.nativeEnum(PaymentMethod).default(PaymentMethod.CREDIT_CARD),
  transactionReference: z.string().optional(),
  notes: z.string().optional(),
});

export const refundPaymentSchema = z.object({
  amount: z.number().positive('Refund amount must be positive'),
  reason: z.string().min(1, 'Reason for refund is required'),
});

export const listPaymentQuerySchema = paginationQuerySchema.extend({
  customerId: objectIdSchema.optional(),
  invoiceId: objectIdSchema.optional(),
  paymentMethod: z.nativeEnum(PaymentMethod).optional(),
});

