import { SubscriptionModel, ISubscription } from '../models/Subscription.model';
import { CustomerModel } from '../models/Customer.model';
import { PlanModel } from '../models/Plan.model';
import { SubscriptionStatus, BillingInterval } from '../types/roles';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { computeNextBillingDate, roundMoney } from '../utils/calculation';
import { BillingService } from './billing.service';
import { AuditService } from './audit.service';
import { NotificationService } from './notification.service';

export class SubscriptionService {
  private static async generateSubscriptionNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await SubscriptionModel.countDocuments();
    return `SUB-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  public static async createSubscription(data: any, operator?: any): Promise<ISubscription> {
    const customer = await CustomerModel.findById(data.customerId);
    if (!customer) throw new NotFoundError('Customer');

    const plan = await PlanModel.findById(data.planId).populate('productId');
    if (!plan || !plan.active) throw new BadRequestError('Plan is invalid or inactive');

    const interval = data.billingInterval || plan.billingInterval;
    const startDate = data.startDate || new Date();
    const currentPeriodStart = new Date(startDate);
    const currentPeriodEnd = computeNextBillingDate(currentPeriodStart, interval);

    let status = SubscriptionStatus.ACTIVE;
    let trialEnd: Date | undefined = undefined;

    if (plan.trialPeriodDays > 0) {
      status = SubscriptionStatus.TRIALING;
      trialEnd = new Date(startDate);
      trialEnd.setDate(trialEnd.getDate() + plan.trialPeriodDays);
    }

    const subscriptionNumber = await this.generateSubscriptionNumber();

    const subscription = await SubscriptionModel.create({
      subscriptionNumber,
      customerId: customer._id,
      planId: plan._id,
      quantity: data.quantity || 1,
      billingInterval: interval,
      unitPrice: plan.price,
      currency: plan.currency || customer.currency || 'USD',
      discountId: data.discountId,
      taxRateId: data.taxRateId,
      status,
      startDate,
      currentPeriodStart,
      currentPeriodEnd,
      trialEnd,
      cancelAtPeriodEnd: false,
      autoRenew: data.autoRenew !== undefined ? data.autoRenew : true,
      metadata: data.metadata || {},
    });

    // Generate initial invoice if not in trial
    if (status !== SubscriptionStatus.TRIALING) {
      const invoiceDueDate = new Date(currentPeriodStart);
      invoiceDueDate.setDate(invoiceDueDate.getDate() + 7);

      const invoice = await BillingService.createInvoice(
        {
          customerId: customer._id.toString(),
          subscriptionId: subscription._id.toString(),
          items: [
            {
              description: `Subscription: ${plan.name} (${interval})`,
              planId: plan._id.toString(),
              quantity: subscription.quantity,
              unitPrice: plan.price,
            },
          ],
          discountId: data.discountId?.toString(),
          taxRateId: data.taxRateId?.toString(),
          dueDate: invoiceDueDate,
          notes: `Automatic invoice for subscription ${subscriptionNumber}`,
        },
        operator
      );

      subscription.latestInvoiceId = invoice._id;
      await subscription.save();
    }

    // Send notification
    await NotificationService.send({
      recipientId: customer._id,
      recipientEmail: customer.email,
      title: `Subscription Activated: ${plan.name}`,
      message: `Your subscription to ${plan.name} (${subscription.subscriptionNumber}) is now ${subscription.status}.`,
      type: 'SUBSCRIPTION',
      metadata: { subscriptionId: subscription._id, subscriptionNumber },
    });

    if (operator) {
      await AuditService.record({
        userId: operator.userId,
        userEmail: operator.email,
        userRole: operator.role,
        action: 'SUBSCRIPTION_CREATED',
        entity: 'Subscription',
        entityId: subscription._id.toString(),
        details: { subscriptionNumber, planName: plan.name, interval },
      });
    }

    return subscription;
  }

  public static async renewSubscription(subscriptionId: string): Promise<ISubscription> {
    const subscription = await SubscriptionModel.findById(subscriptionId).populate('planId customerId');
    if (!subscription) throw new NotFoundError('Subscription');

    if (subscription.status !== SubscriptionStatus.ACTIVE && subscription.status !== SubscriptionStatus.TRIALING) {
      throw new BadRequestError(`Cannot renew subscription with status ${subscription.status}`);
    }

    const plan: any = subscription.planId;
    const customer: any = subscription.customerId;

    // Advance period
    subscription.currentPeriodStart = new Date(subscription.currentPeriodEnd);
    subscription.currentPeriodEnd = computeNextBillingDate(
      subscription.currentPeriodStart,
      subscription.billingInterval
    );
    subscription.status = SubscriptionStatus.ACTIVE;

    // Create renewal invoice
    const invoiceDueDate = new Date(subscription.currentPeriodStart);
    invoiceDueDate.setDate(invoiceDueDate.getDate() + 7);

    const invoice = await BillingService.createInvoice({
      customerId: customer._id.toString(),
      subscriptionId: subscription._id.toString(),
      items: [
        {
          description: `Subscription Renewal: ${plan.name} (${subscription.billingInterval})`,
          planId: plan._id.toString(),
          quantity: subscription.quantity,
          unitPrice: subscription.unitPrice,
        },
      ],
      discountId: subscription.discountId?.toString(),
      taxRateId: subscription.taxRateId?.toString(),
      dueDate: invoiceDueDate,
      notes: `Recurring billing for ${subscription.subscriptionNumber}`,
    });

    subscription.latestInvoiceId = invoice._id;
    await subscription.save();

    await NotificationService.send({
      recipientId: customer._id,
      recipientEmail: customer.email,
      title: `Subscription Renewed: ${plan.name}`,
      message: `Your subscription ${subscription.subscriptionNumber} was renewed for the period ending ${subscription.currentPeriodEnd.toLocaleDateString()}.`,
      type: 'SUBSCRIPTION',
    });

    await AuditService.record({
      action: 'SUBSCRIPTION_RENEWED',
      entity: 'Subscription',
      entityId: subscription._id.toString(),
      details: { newPeriodEnd: subscription.currentPeriodEnd },
    });

    return subscription;
  }

  public static async pauseSubscription(id: string, operator?: any): Promise<ISubscription> {
    const subscription = await SubscriptionModel.findById(id).populate('customerId');
    if (!subscription) throw new NotFoundError('Subscription');

    if (subscription.status !== SubscriptionStatus.ACTIVE) {
      throw new BadRequestError('Only active subscriptions can be paused');
    }

    subscription.status = SubscriptionStatus.PAUSED;
    subscription.pausedAt = new Date();
    await subscription.save();

    if (subscription.customerId) {
      const customer: any = subscription.customerId;
      await NotificationService.send({
        recipientId: customer._id,
        recipientEmail: customer.email,
        title: `Subscription Paused`,
        message: `Your subscription ${subscription.subscriptionNumber} has been temporarily paused.`,
        type: 'SUBSCRIPTION',
      });
    }

    if (operator) {
      await AuditService.record({
        userId: operator.userId,
        userEmail: operator.email,
        userRole: operator.role,
        action: 'SUBSCRIPTION_PAUSED',
        entity: 'Subscription',
        entityId: subscription._id.toString(),
      });
    }

    return subscription;
  }

  public static async resumeSubscription(id: string, operator?: any): Promise<ISubscription> {
    const subscription = await SubscriptionModel.findById(id).populate('customerId');
    if (!subscription) throw new NotFoundError('Subscription');

    if (subscription.status !== SubscriptionStatus.PAUSED) {
      throw new BadRequestError('Only paused subscriptions can be resumed');
    }

    subscription.status = SubscriptionStatus.ACTIVE;
    subscription.pausedAt = undefined;
    await subscription.save();

    if (subscription.customerId) {
      const customer: any = subscription.customerId;
      await NotificationService.send({
        recipientId: customer._id,
        recipientEmail: customer.email,
        title: `Subscription Resumed`,
        message: `Your subscription ${subscription.subscriptionNumber} is now active again.`,
        type: 'SUBSCRIPTION',
      });
    }

    if (operator) {
      await AuditService.record({
        userId: operator.userId,
        userEmail: operator.email,
        userRole: operator.role,
        action: 'SUBSCRIPTION_RESUMED',
        entity: 'Subscription',
        entityId: subscription._id.toString(),
      });
    }

    return subscription;
  }

  public static async cancelSubscription(
    id: string,
    options: { cancelAtPeriodEnd?: boolean; reason?: string },
    operator?: any
  ): Promise<ISubscription> {
    const subscription = await SubscriptionModel.findById(id).populate('customerId');
    if (!subscription) throw new NotFoundError('Subscription');

    if (subscription.status === SubscriptionStatus.CANCELED) {
      throw new BadRequestError('Subscription is already canceled');
    }

    if (options.cancelAtPeriodEnd) {
      subscription.cancelAtPeriodEnd = true;
      subscription.cancellationReason = options.reason;
    } else {
      subscription.status = SubscriptionStatus.CANCELED;
      subscription.canceledAt = new Date();
      subscription.cancellationReason = options.reason;
      subscription.autoRenew = false;
    }

    await subscription.save();

    if (subscription.customerId) {
      const customer: any = subscription.customerId;
      await NotificationService.send({
        recipientId: customer._id,
        recipientEmail: customer.email,
        title: `Subscription Cancellation`,
        message: options.cancelAtPeriodEnd
          ? `Your subscription ${subscription.subscriptionNumber} will cancel at the end of the billing period on ${subscription.currentPeriodEnd.toLocaleDateString()}.`
          : `Your subscription ${subscription.subscriptionNumber} has been canceled immediately.`,
        type: 'SUBSCRIPTION',
      });
    }

    if (operator) {
      await AuditService.record({
        userId: operator.userId,
        userEmail: operator.email,
        userRole: operator.role,
        action: 'SUBSCRIPTION_CANCELED',
        entity: 'Subscription',
        entityId: subscription._id.toString(),
        details: { cancelAtPeriodEnd: options.cancelAtPeriodEnd, reason: options.reason },
      });
    }

    return subscription;
  }

  public static async changePlan(
    id: string,
    newPlanId: string,
    prorate: boolean = true,
    operator?: any
  ): Promise<ISubscription> {
    const subscription = await SubscriptionModel.findById(id).populate('customerId');
    if (!subscription) throw new NotFoundError('Subscription');

    const newPlan = await PlanModel.findById(newPlanId);
    if (!newPlan || !newPlan.active) throw new BadRequestError('Target plan is invalid or inactive');

    const oldPlanId = subscription.planId;
    subscription.planId = newPlan._id;
    subscription.unitPrice = newPlan.price;
    subscription.billingInterval = newPlan.billingInterval;

    await subscription.save();

    if (operator) {
      await AuditService.record({
        userId: operator.userId,
        userEmail: operator.email,
        userRole: operator.role,
        action: 'SUBSCRIPTION_PLAN_CHANGED',
        entity: 'Subscription',
        entityId: subscription._id.toString(),
        details: { fromPlan: oldPlanId, toPlan: newPlan._id, newPrice: newPlan.price },
      });
    }

    return subscription;
  }

  public static async getById(id: string) {
    const subscription = await SubscriptionModel.findById(id)
      .populate('customerId')
      .populate({ path: 'planId', populate: { path: 'productId' } })
      .populate('latestInvoiceId')
      .populate('discountId')
      .populate('taxRateId');
    if (!subscription) throw new NotFoundError('Subscription');
    return subscription;
  }

  public static async listSubscriptions(query: {
    page?: number;
    limit?: number;
    customerId?: string;
    planId?: string;
    status?: string;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (query.customerId) filter.customerId = query.customerId;
    if (query.planId) filter.planId = query.planId;
    if (query.status) filter.status = query.status;

    const [subscriptions, total] = await Promise.all([
      SubscriptionModel.find(filter)
        .populate('customerId', 'name email companyName customerCode')
        .populate('planId', 'name code price billingInterval')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      SubscriptionModel.countDocuments(filter),
    ]);

    return {
      subscriptions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}

