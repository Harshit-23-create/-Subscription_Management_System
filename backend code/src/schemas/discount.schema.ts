import { z } from 'zod';
import { DiscountType } from '../types/roles';
import { paginationQuerySchema } from './common.schema';

export const createDiscountSchema = z.object({
  code: z.string().min(2, 'Discount code must be at least 2 chars').toUpperCase(),
  description: z.string().optional(),
  type: z.nativeEnum(DiscountType).default(DiscountType.PERCENTAGE),
  value: z.number().positive('Discount value must be positive'),
  maxRedemptions: z.number().int().positive().optional(),
  validFrom: z.string().datetime().or(z.date()).optional().transform((v) => (v ? new Date(v) : new Date())),
  validUntil: z.string().datetime().or(z.date()).optional().transform((v) => (v ? new Date(v) : undefined)),
  active: z.boolean().optional().default(true),
});

export const updateDiscountSchema = createDiscountSchema.partial();

export const listDiscountQuerySchema = paginationQuerySchema.extend({
  active: z.coerce.boolean().optional(),
});

