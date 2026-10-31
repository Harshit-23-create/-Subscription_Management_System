import { Request, Response, NextFunction } from 'express';
import { SubscriptionService } from '../services/subscription.service';
import { sendResponse } from '../utils/response';

export class SubscriptionController {
  public static async createSubscription(req: Request, res: Response, next: NextFunction) {
    try {
      const subscription = await SubscriptionService.createSubscription(req.body, req.user);
      return sendResponse({
        res,
        statusCode: 201,
        message: 'Subscription created successfully',
        data: subscription,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async renewSubscription(req: Request, res: Response, next: NextFunction) {
    try {
      const subscription = await SubscriptionService.renewSubscription(req.params.id as string);
      return sendResponse({
        res,
        message: 'Subscription renewed successfully',
        data: subscription,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async pauseSubscription(req: Request, res: Response, next: NextFunction) {
    try {
      const subscription = await SubscriptionService.pauseSubscription(req.params.id as string, req.user);
      return sendResponse({
        res,
        message: 'Subscription paused successfully',
        data: subscription,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async resumeSubscription(req: Request, res: Response, next: NextFunction) {
    try {
      const subscription = await SubscriptionService.resumeSubscription(req.params.id as string, req.user);
      return sendResponse({
        res,
        message: 'Subscription resumed successfully',
        data: subscription,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async cancelSubscription(req: Request, res: Response, next: NextFunction) {
    try {
      const subscription = await SubscriptionService.cancelSubscription(
        req.params.id as string,
        {
          cancelAtPeriodEnd: req.body.cancelAtPeriodEnd,
          reason: req.body.reason,
        },
        req.user
      );
      return sendResponse({
        res,
        message: 'Subscription canceled successfully',
        data: subscription,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async changePlan(req: Request, res: Response, next: NextFunction) {
    try {
      const subscription = await SubscriptionService.changePlan(
        req.params.id as string,
        req.body.planId,
        req.body.prorate,
        req.user
      );
      return sendResponse({
        res,
        message: 'Subscription plan changed successfully',
        data: subscription,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const subscription = await SubscriptionService.getById(req.params.id as string);
      return sendResponse({
        res,
        data: subscription,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async listSubscriptions(req: Request, res: Response, next: NextFunction) {
    try {
      const { subscriptions, total, page, limit, totalPages } = await SubscriptionService.listSubscriptions(
        req.query as any
      );
      return sendResponse({
        res,
        data: subscriptions,
        meta: { total, page, limit, totalPages },
      });
    } catch (err) {
      next(err);
    }
  }
}
