import mongoose, { Schema } from 'mongoose';
import { NotificationChannel } from '../types/roles';

export interface INotification {
  _id: mongoose.Types.ObjectId;
  recipientId: mongoose.Types.ObjectId;
  recipientEmail?: string;
  title: string;
  message: string;
  type: 'INVOICE' | 'PAYMENT' | 'SUBSCRIPTION' | 'QUOTATION' | 'SYSTEM';
  channel: NotificationChannel;
  isRead: boolean;
  metadata?: Record<string, any>;
  sentAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipientId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    recipientEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['INVOICE', 'PAYMENT', 'SUBSCRIPTION', 'QUOTATION', 'SYSTEM'],
      default: 'SYSTEM',
      index: true,
    },
    channel: {
      type: String,
      enum: Object.values(NotificationChannel),
      default: NotificationChannel.IN_APP,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const NotificationModel = mongoose.model<INotification>('Notification', notificationSchema);
