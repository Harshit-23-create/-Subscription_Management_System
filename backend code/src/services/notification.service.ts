import { NotificationModel } from '../models/Notification.model';
import { NotificationChannel } from '../types/roles';
import { logger } from '../utils/logger';

export interface SendNotificationOptions {
  recipientId: any;
  recipientEmail?: string;
  title: string;
  message: string;
  type: 'INVOICE' | 'PAYMENT' | 'SUBSCRIPTION' | 'QUOTATION' | 'SYSTEM';
  channel?: NotificationChannel;
  metadata?: Record<string, any>;
}

export class NotificationService {
  public static async send(options: SendNotificationOptions) {
    try {
      const notification = await NotificationModel.create({
        recipientId: options.recipientId,
        recipientEmail: options.recipientEmail,
        title: options.title,
        message: options.message,
        type: options.type,
        channel: options.channel || NotificationChannel.IN_APP,
        metadata: options.metadata || {},
        sentAt: new Date(),
      });

      // If channel includes EMAIL, simulate email sending
      if (options.channel === NotificationChannel.EMAIL || options.recipientEmail) {
        logger.info(`[Email Notification Sent] To: ${options.recipientEmail} | Subject: ${options.title} | Body: ${options.message}`);
      }

      return notification;
    } catch (err: any) {
      logger.error('Failed to create notification:', err.message);
      return null;
    }
  }

  public static async getForRecipient(recipientId: any, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [notifications, total, unreadCount] = await Promise.all([
      NotificationModel.find({ recipientId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      NotificationModel.countDocuments({ recipientId }),
      NotificationModel.countDocuments({ recipientId, isRead: false }),
    ]);

    return {
      notifications,
      total,
      unreadCount,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  public static async markAsRead(notificationId: string, recipientId: any) {
    return NotificationModel.findOneAndUpdate(
      { _id: notificationId, recipientId },
      { isRead: true },
      { new: true }
    );
  }

  public static async markAllAsRead(recipientId: any) {
    return NotificationModel.updateMany({ recipientId, isRead: false }, { isRead: true });
  }
}

