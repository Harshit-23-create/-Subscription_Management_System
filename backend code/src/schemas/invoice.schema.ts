import { z } from 'zod';
import { InvoiceStatus } from '../types/roles';
import { objectIdSchema, paginationQuerySchema } from './common.schema';

const invoiceItemInputSchema = z.object({
  description: z.string().min(1, 'Item description is required'),
  planId: objectIdSchema.optional(),
  quantity: z.number().int().min(1).default(1),
  unitPrice: z.number().min(0, 'Unit price must be non-negative'),
});

export const createInvoiceSchema = z.object({
  customerId: objectIdSchema,
  subscriptionId: objectIdSchema.optional(),
  quotationId: objectIdSchema.optional(),
  items: z.array(invoiceItemInputSchema).min(1, 'Invoice must have at least one item'),
  discountId: objectIdSchema.optional(),
  taxRateId: objectIdSchema.optional(),
  dueDate: z.string().datetime().or(z.date()).transform((v) => new Date(v)),
  notes: z.string().optional(),
  paymentTerms: z.string().optional(),
});

export const updateInvoiceStatusSchema = z.object({
  status: z.nativeEnum(InvoiceStatus),
});

export const listInvoiceQuerySchema = paginationQuerySchema.extend({
  customerId: objectIdSchema.optional(),
  subscriptionId: objectIdSchema.optional(),
  status: z.nativeEnum(InvoiceStatus).optional(),
});

