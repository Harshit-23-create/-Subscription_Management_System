import { z } from 'zod';
import { paginationQuerySchema } from './common.schema';

export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  sku: z.string().min(1, 'SKU is required').toUpperCase(),
  category: z.string().optional().default('SaaS'),
  active: z.boolean().optional().default(true),
  features: z.array(z.string()).optional().default([]),
});

export const updateProductSchema = createProductSchema.partial();

export const listProductQuerySchema = paginationQuerySchema.extend({
  category: z.string().optional(),
  active: z.coerce.boolean().optional(),
});

