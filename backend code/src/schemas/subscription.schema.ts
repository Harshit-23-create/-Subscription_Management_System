import { z } from 'zod';
import { SubscriptionStatus, BillingInterval } from '../types/roles';
import { objectIdSchema, paginationQuerySchema } from './common.schema';

export const createSubscriptionSchema = z.object({
  customerId: objectIdSchema,
  planId: objectIdSchema,
  quantity: z.number().int().min(1).default(1),
  billingInterval: z.nativeEnum(BillingInterval).optional(),
  discountId: objectIdSchema.optional(),
  taxRateId: objectIdSchema.optional(),
  startDate: z.string().datetime().or(z.date()).optional().transform((v) => (v ? new Date(v) : new Date())),
  autoRenew: z.boolean().optional().default(true),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const updateSubscriptionPlanSchema = z.object({
  planId: objectIdSchema,
  prorate: z.boolean().optional().default(true),
});

export const cancelSubscriptionSchema = z.object({
  cancelAtPeriodEnd: z.boolean().optional().default(false),
  reason: z.string().optional(),
});

export const listSubscriptionQuerySchema = paginationQuerySchema.extend({
  customerId: objectIdSchema.optional(),
  planId: objectIdSchema.optional(),
  status: z.nativeEnum(SubscriptionStatus).optional(),
});

