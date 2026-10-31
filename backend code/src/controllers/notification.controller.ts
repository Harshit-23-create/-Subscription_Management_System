import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notification.service';
import { sendResponse } from '../utils/response';

export class NotificationController {
  public static async getMyNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const recipientId = req.user?.customerId || req.user?.userId;
      const result = await NotificationService.getForRecipient(recipientId, page, limit);

      return sendResponse({
        res,
        data: result.notifications,
        meta: {
          total: result.total,
          unreadCount: result.unreadCount,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  public static async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const recipientId = req.user?.customerId || req.user?.userId;
      const updated = await NotificationService.markAsRead(req.params.id as string, recipientId);
      return sendResponse({
        res,
        message: 'Notification marked as read',
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const recipientId = req.user?.customerId || req.user?.userId;
      await NotificationService.markAllAsRead(recipientId);
      return sendResponse({
        res,
        message: 'All notifications marked as read',
      });
    } catch (err) {
      next(err);
    }
  }
}
