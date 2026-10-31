import { SubscriptionModel } from '../models/Subscription.model';
import { QuotationModel } from '../models/Quotation.model';
import { InvoiceModel } from '../models/Invoice.model';
import { SubscriptionStatus, QuotationStatus, InvoiceStatus } from '../types/roles';
import { SubscriptionService } from '../services/subscription.service';
import { NotificationService } from '../services/notification.service';
import { logger } from '../utils/logger';
import { env } from '../config/env';

export class BackgroundScheduler {
  private static timer: NodeJS.Timeout | null = null;

  public static start() {
    if (!env.ENABLE_CRON_JOBS) {
      logger.info('Background scheduler is disabled by config.');
      return;
    }

    logger.info(`Starting Background Scheduler (interval: ${env.CRON_INTERVAL_MS}ms)`);
    this.runCycle();

    this.timer = setInterval(() => {
      this.runCycle();
    }, env.CRON_INTERVAL_MS);
  }

  public static stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      logger.info('Background scheduler stopped.');
    }
  }

  public static async runCycle() {
    try {
      await this.processRenewals();
      await this.processCancellations();
      await this.processTrialExpirations();
      await this.processQuotationExpirations();
    } catch (err: any) {
      logger.error('Error during scheduler cycle:', err.message);
    }
  }

  private static async processRenewals() {
    const now = new Date();
    const dueSubscriptions = await SubscriptionModel.find({
      status: SubscriptionStatus.ACTIVE,
      autoRenew: true,
      cancelAtPeriodEnd: false,
      currentPeriodEnd: { $lte: now },
    });

    for (const sub of dueSubscriptions) {
      try {
        await SubscriptionService.renewSubscription(sub._id.toString());
        logger.info(`[Scheduler] Auto-renewed subscription: ${sub.subscriptionNumber}`);
      } catch (err: any) {
        logger.error(`[Scheduler] Failed to renew subscription ${sub.subscriptionNumber}:`, err.message);
      }
    }
  }

  private static async processCancellations() {
    const now = new Date();
    const cancelingSubs = await SubscriptionModel.find({
      status: SubscriptionStatus.ACTIVE,
      cancelAtPeriodEnd: true,
      currentPeriodEnd: { $lte: now },
    });

    for (const sub of cancelingSubs) {
      sub.status = SubscriptionStatus.CANCELED;
      sub.canceledAt = now;
      sub.autoRenew = false;
      await sub.save();
      logger.info(`[Scheduler] Expired period-end cancellation for: ${sub.subscriptionNumber}`);
    }
  }

  private static async processTrialExpirations() {
    const now = new Date();
    const trialEnding = await SubscriptionModel.find({
      status: SubscriptionStatus.TRIALING,
      trialEnd: { $lte: now },
    });

    for (const sub of trialEnding) {
      try {
        if (sub.autoRenew) {
          await SubscriptionService.renewSubscription(sub._id.toString());
          logger.info(`[Scheduler] Converted trialing subscription to active: ${sub.subscriptionNumber}`);
        } else {
          sub.status = SubscriptionStatus.EXPIRED;
          await sub.save();
          logger.info(`[Scheduler] Expired non-renewing trial: ${sub.subscriptionNumber}`);
        }
      } catch (err: any) {
        logger.error(`[Scheduler] Failed trial transition for ${sub.subscriptionNumber}:`, err.message);
      }
    }
  }

  private static async processQuotationExpirations() {
    const now = new Date();
    const expiredQuotes = await QuotationModel.updateMany(
      {
        status: QuotationStatus.SENT,
        validUntil: { $lte: now },
      },
      {
        status: QuotationStatus.EXPIRED,
      }
    );

    if (expiredQuotes.modifiedCount > 0) {
      logger.info(`[Scheduler] Marked ${expiredQuotes.modifiedCount} quotation(s) as EXPIRED.`);
    }
  }
}

