import mongoose, { Schema } from 'mongoose';

export interface ITaxRate {
  _id: mongoose.Types.ObjectId;
  name: string;
  jurisdiction: string;
  percentage: number;
  isInclusive: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const taxRateSchema = new Schema<ITaxRate>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    jurisdiction: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    isInclusive: {
      type: Boolean,
      default: false,
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

export const TaxRateModel = mongoose.model<ITaxRate>('TaxRate', taxRateSchema);
