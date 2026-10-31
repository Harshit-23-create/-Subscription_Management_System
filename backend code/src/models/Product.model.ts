import mongoose, { Schema } from 'mongoose';

export interface IProduct {
  _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  sku: string;
  category?: string;
  active: boolean;
  features: string[];
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    category: {
      type: String,
      trim: true,
      default: 'SaaS',
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

productSchema.index({ name: 'text', description: 'text', sku: 'text' });

export const ProductModel = mongoose.model<IProduct>('Product', productSchema);
