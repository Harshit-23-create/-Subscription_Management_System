import mongoose, { Schema } from 'mongoose';
import { QuotationStatus } from '../types/roles';

export interface IQuotationItem {
  description: string;
  planId?: mongoose.Types.ObjectId;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface IQuotation {
  _id: mongoose.Types.ObjectId;
  quotationNumber: string;
  customerId: mongoose.Types.ObjectId;
  items: IQuotationItem[];
  subtotal: number;
  discountId?: mongoose.Types.ObjectId;
  discountAmount: number;
  taxRateId?: mongoose.Types.ObjectId;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  validUntil: Date;
  status: QuotationStatus;
  notes?: string;
  terms?: string;
  convertedSubscriptionId?: mongoose.Types.ObjectId;
  convertedInvoiceId?: mongoose.Types.ObjectId;
  convertedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const quotationItemSchema = new Schema<IQuotationItem>(
  {
    description: { type: String, required: true },
    planId: { type: Schema.Types.ObjectId, ref: 'Plan' },
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const quotationSchema = new Schema<IQuotation>(
  {
    quotationNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true,
    },
    items: {
      type: [quotationItemSchema],
      required: true,
      default: [],
    },
    subtotal: {
      type: Number,
      required: true,
      default: 0,
    },
    discountId: {
      type: Schema.Types.ObjectId,
      ref: 'Discount',
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    taxRateId: {
      type: Schema.Types.ObjectId,
      ref: 'TaxRate',
    },
    taxAmount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    validUntil: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(QuotationStatus),
      default: QuotationStatus.DRAFT,
      index: true,
    },
    notes: {
      type: String,
    },
    terms: {
      type: String,
      default: 'Payment due upon acceptance or as stated in invoice.',
    },
    convertedSubscriptionId: {
      type: Schema.Types.ObjectId,
      ref: 'Subscription',
    },
    convertedInvoiceId: {
      type: Schema.Types.ObjectId,
      ref: 'Invoice',
    },
    convertedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const QuotationModel = mongoose.model<IQuotation>('Quotation', quotationSchema);
