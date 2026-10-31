import { z } from 'zod';
import { BillingInterval } from '../types/roles';
import { objectIdSchema, paginationQuerySchema } from './common.schema';

export const createPlanSchema = z.object({
  productId: objectIdSchema,
  code: z.string().min(1, 'Plan code is required').toUpperCase(),
  name: z.string().min(1, 'Plan name is required'),
  description: z.string().optional(),
  billingInterval: z.nativeEnum(BillingInterval).default(BillingInterval.MONTHLY),
  price: z.number().min(0, 'Price must be non-negative'),
  currency: z.string().min(3).max(3).optional().default('USD'),
  trialPeriodDays: z.number().int().min(0).optional().default(0),
  active: z.boolean().optional().default(true),
  features: z.array(z.string()).optional().default([]),
});

export const updatePlanSchema = createPlanSchema.partial();

export const listPlanQuerySchema = paginationQuerySchema.extend({
  productId: objectIdSchema.optional(),
  billingInterval: z.nativeEnum(BillingInterval).optional(),
  active: z.coerce.boolean().optional(),
});

