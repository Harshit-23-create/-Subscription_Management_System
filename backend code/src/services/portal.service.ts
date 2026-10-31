import { CustomerModel } from '../models/Customer.model';
import { SubscriptionModel } from '../models/Subscription.model';
import { InvoiceModel } from '../models/Invoice.model';
import { PaymentModel } from '../models/Payment.model';
import { QuotationModel } from '../models/Quotation.model';
import { NotFoundError } from '../utils/errors';

export class PortalService {
  public static async getCustomerDashboard(customerId: string) {
    const customer = await CustomerModel.findById(customerId);
    if (!customer) throw new NotFoundError('Customer account');

    const [subscriptions, openInvoices, recentPayments] = await Promise.all([
      SubscriptionModel.find({ customerId: customerId as any } as any)
        .populate('planId')
        .sort({ createdAt: -1 }),
      InvoiceModel.find({ customerId: customerId as any, status: 'OPEN' } as any)
        .sort({ dueDate: 1 }),
      PaymentModel.find({ customerId: customerId as any } as any)
        .sort({ paymentDate: -1 })
        .limit(5),
    ]);

    const activeSubscriptionCount = subscriptions.filter((s: any) => s.status === 'ACTIVE').length;

    return {
      customer,
      stats: {
        activeSubscriptions: activeSubscriptionCount,
        openInvoicesCount: openInvoices.length,
        outstandingBalance: customer.balance,
      },
      subscriptions,
      openInvoices,
      recentPayments,
    };
  }

  public static async getCustomerSubscriptions(customerId: string) {
    return SubscriptionModel.find({ customerId: customerId as any } as any)
      .populate({ path: 'planId', populate: { path: 'productId' } })
      .sort({ createdAt: -1 });
  }

  public static async getCustomerInvoices(customerId: string) {
    return InvoiceModel.find({ customerId: customerId as any } as any).sort({ issueDate: -1 });
  }

  public static async getCustomerPayments(customerId: string) {
    return PaymentModel.find({ customerId: customerId as any } as any)
      .populate('invoiceId', 'invoiceNumber totalAmount')
      .sort({ paymentDate: -1 });
  }

  public static async getCustomerQuotations(customerId: string) {
    return QuotationModel.find({ customerId: customerId as any } as any).sort({ createdAt: -1 });
  }
}
