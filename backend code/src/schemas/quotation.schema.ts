import { z } from 'zod';
import { QuotationStatus } from '../types/roles';
import { objectIdSchema, paginationQuerySchema } from './common.schema';

const quotationItemInputSchema = z.object({
  description: z.string().min(1, 'Item description is required'),
  planId: objectIdSchema.optional(),
  unitPrice: z.number().min(0, 'Unit price must be positive'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').default(1),
});

export const createQuotationSchema = z.object({
  customerId: objectIdSchema,
  items: z.array(quotationItemInputSchema).min(1, 'At least one item is required'),
  discountId: objectIdSchema.optional(),
  taxRateId: objectIdSchema.optional(),
  validUntil: z.string().datetime().or(z.date()).transform((val) => new Date(val)),
  notes: z.string().optional(),
  terms: z.string().optional(),
});

export const updateQuotationStatusSchema = z.object({
  status: z.nativeEnum(QuotationStatus),
});

export const listQuotationQuerySchema = paginationQuerySchema.extend({
  customerId: objectIdSchema.optional(),
  status: z.nativeEnum(QuotationStatus).optional(),
});

