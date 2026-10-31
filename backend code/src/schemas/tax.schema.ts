import { z } from 'zod';
import { paginationQuerySchema } from './common.schema';

export const createTaxRateSchema = z.object({
  name: z.string().min(1, 'Tax rate name is required'),
  jurisdiction: z.string().min(1, 'Jurisdiction is required'),
  percentage: z.number().min(0, 'Percentage cannot be negative').max(100, 'Max tax rate is 100%'),
  isInclusive: z.boolean().optional().default(false),
  active: z.boolean().optional().default(true),
});

export const updateTaxRateSchema = createTaxRateSchema.partial();

export const listTaxRateQuerySchema = paginationQuerySchema.extend({
  jurisdiction: z.string().optional(),
  active: z.coerce.boolean().optional(),
});

