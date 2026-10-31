import mongoose, { Schema } from 'mongoose';
import { InvoiceStatus } from '../types/roles';

export interface IInvoiceItem {
  description: string;
  planId?: mongoose.Types.ObjectId;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface IInvoice {
  _id: mongoose.Types.ObjectId;
  invoiceNumber: string;
  customerId: mongoose.Types.ObjectId;
  subscriptionId?: mongoose.Types.ObjectId;
  quotationId?: mongoose.Types.ObjectId;
  items: IInvoiceItem[];
  subtotal: number;
  discountId?: mongoose.Types.ObjectId;
  discountAmount: number;
  taxRateId?: mongoose.Types.ObjectId;
  taxAmount: number;
  totalAmount: number;
  amountPaid: number;
  amountDue: number;
  currency: string;
  issueDate: Date;
  dueDate: Date;
  paidAt?: Date;
  status: InvoiceStatus;
  notes?: string;
  paymentTerms?: string;
  createdAt: Date;
  updatedAt: Date;
}

const invoiceItemSchema = new Schema<IInvoiceItem>(
  {
    description: { type: String, required: true },
    planId: { type: Schema.Types.ObjectId, ref: 'Plan' },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    amount: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const invoiceSchema = new Schema<IInvoice>(
  {
    invoiceNumber: {
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
    subscriptionId: {
      type: Schema.Types.ObjectId,
      ref: 'Subscription',
      index: true,
    },
    quotationId: {
      type: Schema.Types.ObjectId,
      ref: 'Quotation',
    },
    items: {
      type: [invoiceItemSchema],
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
    amountPaid: {
      type: Number,
      default: 0,
    },
    amountDue: {
      type: Number,
      required: true,
      default: 0,
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: true,
      index: true,
    },
    paidAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: Object.values(InvoiceStatus),
      default: InvoiceStatus.OPEN,
      index: true,
    },
    notes: {
      type: String,
    },
    paymentTerms: {
      type: String,
      default: 'Net 15 days',
    },
  },
  {
    timestamps: true,
  }
);

export const InvoiceModel = mongoose.model<IInvoice>('Invoice', invoiceSchema);
