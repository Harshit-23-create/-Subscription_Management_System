import { CustomerModel } from '../models/Customer.model';
import { SubscriptionModel } from '../models/Subscription.model';
import { InvoiceModel } from '../models/Invoice.model';
import { PaymentModel } from '../models/Payment.model';
import { QuotationModel } from '../models/Quotation.model';
import { SubscriptionStatus, InvoiceStatus, PaymentStatus } from '../types/roles';
import { roundMoney } from '../utils/calculation';

export class AnalyticsService {
  public static async getExecutiveSummary() {
    const [
      totalCustomers,
      activeCustomers,
      subscriptions,
      invoices,
      payments,
      quotationsCount,
    ] = await Promise.all([
      CustomerModel.countDocuments(),
      CustomerModel.countDocuments({ status: 'ACTIVE' }),
      SubscriptionModel.find(),
      InvoiceModel.find(),
      PaymentModel.find({ status: PaymentStatus.SUCCESS }),
      QuotationModel.countDocuments(),
    ]);

    // Active subscriptions
    const activeSubs = subscriptions.filter((s: any) => s.status === SubscriptionStatus.ACTIVE);
    const trialingSubs = subscriptions.filter((s: any) => s.status === SubscriptionStatus.TRIALING);
    const canceledSubs = subscriptions.filter((s: any) => s.status === SubscriptionStatus.CANCELED);
    const pausedSubs = subscriptions.filter((s: any) => s.status === SubscriptionStatus.PAUSED);

    // Calculate MRR (Monthly Recurring Revenue)
    let mrr = 0;
    activeSubs.forEach((sub: any) => {
      let monthlyContribution = 0;
      switch (sub.billingInterval) {
        case 'WEEKLY':
          monthlyContribution = (sub.unitPrice * sub.quantity * 52) / 12;
          break;
        case 'MONTHLY':
          monthlyContribution = sub.unitPrice * sub.quantity;
          break;
        case 'QUARTERLY':
          monthlyContribution = (sub.unitPrice * sub.quantity) / 3;
          break;
        case 'YEARLY':
          monthlyContribution = (sub.unitPrice * sub.quantity) / 12;
          break;
      }
      mrr += monthlyContribution;
    });
    mrr = roundMoney(mrr);
    const arr = roundMoney(mrr * 12);

    // Total collected revenue
    const totalCollectedRevenue = roundMoney(
      payments.reduce((acc: number, p: any) => acc + (p.amount - p.refundedAmount), 0)
    );

    // Outstanding invoices & balance
    const openInvoices = invoices.filter((i: any) => i.status === InvoiceStatus.OPEN);
    const totalOutstandingDue = roundMoney(openInvoices.reduce((acc: number, i: any) => acc + i.amountDue, 0));

    // Overdue invoices (open & dueDate < now)
    const now = new Date();
    const overdueInvoices = openInvoices.filter((i: any) => new Date(i.dueDate) < now);
    const overdueAmount = roundMoney(overdueInvoices.reduce((acc: number, i: any) => acc + i.amountDue, 0));

    // Churn rate calculation (canceled / total ever created)
    const churnRate = subscriptions.length > 0 ? roundMoney((canceledSubs.length / subscriptions.length) * 100) : 0;

    return {
      kpis: {
        mrr,
        arr,
        totalCollectedRevenue,
        totalOutstandingDue,
        overdueAmount,
        activeSubscriptionsCount: activeSubs.length,
        trialingSubscriptionsCount: trialingSubs.length,
        churnRatePercentage: churnRate,
      },
      counts: {
        totalCustomers,
        activeCustomers,
        totalSubscriptions: subscriptions.length,
        activeSubscriptions: activeSubs.length,
        pausedSubscriptions: pausedSubs.length,
        canceledSubscriptions: canceledSubs.length,
        totalInvoices: invoices.length,
        openInvoices: openInvoices.length,
        overdueInvoices: overdueInvoices.length,
        paidInvoices: invoices.filter((i: any) => i.status === InvoiceStatus.PAID).length,
        quotationsCount,
      },
    };
  }

  public static async getRevenueReport(period: 'daily' | 'monthly' = 'monthly') {
    const matchCondition: any = { status: 'SUCCESS' };

    const groupFormat = period === 'daily' ? '%Y-%m-%d' : '%Y-%m';

    const revenueOverTime = await PaymentModel.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: '$paymentDate' } },
          totalRevenue: { $sum: '$amount' },
          refundedTotal: { $sum: '$refundedAmount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          period: '$_id',
          grossRevenue: { $round: ['$totalRevenue', 2] },
          refunded: { $round: ['$refundedTotal', 2] },
          netRevenue: { $round: [{ $subtract: ['$totalRevenue', '$refundedTotal'] }, 2] },
          transactionCount: '$count',
        },
      },
    ]);

    return revenueOverTime;
  }
}
