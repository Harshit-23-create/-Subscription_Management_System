import mongoose, { Schema } from 'mongoose';
import { SubscriptionStatus, BillingInterval } from '../types/roles';

export interface ISubscription {
  _id: mongoose.Types.ObjectId;
  subscriptionNumber: string;
  customerId: mongoose.Types.ObjectId;
  planId: mongoose.Types.ObjectId;
  quantity: number;
  billingInterval: BillingInterval;
  unitPrice: number;
  currency: string;
  discountId?: mongoose.Types.ObjectId;
  taxRateId?: mongoose.Types.ObjectId;
  status: SubscriptionStatus;
  startDate: Date;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  trialEnd?: Date;
  pausedAt?: Date;
  canceledAt?: Date;
  cancelAtPeriodEnd: boolean;
  cancellationReason?: string;
  autoRenew: boolean;
  latestInvoiceId?: mongoose.Types.ObjectId;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    subscriptionNumber: {
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
    planId: {
      type: Schema.Types.ObjectId,
      ref: 'Plan',
      required: true,
      index: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
    billingInterval: {
      type: String,
      enum: Object.values(BillingInterval),
      required: true,
      default: BillingInterval.MONTHLY,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
    },
    discountId: {
      type: Schema.Types.ObjectId,
      ref: 'Discount',
    },
    taxRateId: {
      type: Schema.Types.ObjectId,
      ref: 'TaxRate',
    },
    status: {
      type: String,
      enum: Object.values(SubscriptionStatus),
      default: SubscriptionStatus.ACTIVE,
      index: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    currentPeriodStart: {
      type: Date,
      required: true,
      default: Date.now,
    },
    currentPeriodEnd: {
      type: Date,
      required: true,
      index: true,
    },
    trialEnd: {
      type: Date,
    },
    pausedAt: {
      type: Date,
    },
    canceledAt: {
      type: Date,
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },
    cancellationReason: {
      type: String,
    },
    autoRenew: {
      type: Boolean,
      default: true,
    },
    latestInvoiceId: {
      type: Schema.Types.ObjectId,
      ref: 'Invoice',
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

export const SubscriptionModel = mongoose.model<ISubscription>('Subscription', subscriptionSchema);
