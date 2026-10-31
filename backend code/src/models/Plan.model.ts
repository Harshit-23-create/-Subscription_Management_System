import mongoose, { Schema } from 'mongoose';
import { BillingInterval } from '../types/roles';

export interface IPlan {
  _id: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  code: string;
  name: string;
  description?: string;
  billingInterval: BillingInterval;
  price: number;
  currency: string;
  trialPeriodDays: number;
  active: boolean;
  features: string[];
  createdAt: Date;
  updatedAt: Date;
}

const planSchema = new Schema<IPlan>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    billingInterval: {
      type: String,
      enum: Object.values(BillingInterval),
      default: BillingInterval.MONTHLY,
      required: true,
      index: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
    },
    trialPeriodDays: {
      type: Number,
      default: 0,
      min: 0,
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
    features: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const PlanModel = mongoose.model<IPlan>('Plan', planSchema);
