import mongoose, { Schema } from 'mongoose';
import { DiscountType } from '../types/roles';

export interface IDiscount {
  _id: mongoose.Types.ObjectId;
  code: string;
  description?: string;
  type: DiscountType;
  value: number;
  maxRedemptions?: number;
  timesRedeemed: number;
  validFrom: Date;
  validUntil?: Date;
  active: boolean;
  isValid(): boolean;
  createdAt: Date;
  updatedAt: Date;
}

const discountSchema = new Schema<IDiscount>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(DiscountType),
      default: DiscountType.PERCENTAGE,
      required: true,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    maxRedemptions: {
      type: Number,
      default: null,
    },
    timesRedeemed: {
      type: Number,
      default: 0,
    },
    validFrom: {
      type: Date,
      default: Date.now,
    },
    validUntil: {
      type: Date,
      default: null,
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

discountSchema.methods.isValid = function (): boolean {
  if (!this.active) return false;
  const now = new Date();
  if (this.validFrom && now < this.validFrom) return false;
  if (this.validUntil && now > this.validUntil) return false;
  if (this.maxRedemptions !== null && this.maxRedemptions !== undefined && this.timesRedeemed >= this.maxRedemptions) {
    return false;
  }
  return true;
};

export const DiscountModel = mongoose.model<IDiscount>('Discount', discountSchema);
