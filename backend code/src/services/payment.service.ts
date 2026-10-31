import { PaymentModel, IPayment } from '../models/Payment.model';
import { InvoiceModel } from '../models/Invoice.model';
import { CustomerModel } from '../models/Customer.model';
import { PaymentMethod, PaymentStatus, InvoiceStatus } from '../types/roles';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { roundMoney } from '../utils/calculation';
import { CustomerService } from './customer.service';
import { AuditService } from './audit.service';
import { NotificationService } from './notification.service';
import { v4 as uuidv4 } from 'uuid';

export class PaymentService {
  private static async generatePaymentNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await PaymentModel.countDocuments();
    return `PAY-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  public static async recordPayment(data: {
    customerId: string;
    invoiceId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    transactionReference?: string;
    notes?: string;
  }, operator?: any): Promise<IPayment> {
    const customer = await CustomerModel.findById(data.customerId);
    if (!customer) throw new NotFoundError('Customer');

    const invoice = await InvoiceModel.findById(data.invoiceId);
    if (!invoice) throw new NotFoundError('Invoice');

    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestError('Invoice is already marked as PAID');
    }

    if (invoice.status === InvoiceStatus.VOID || invoice.status === InvoiceStatus.UNCOLLECTIBLE) {
      throw new BadRequestError(`Cannot record payment for invoice with status ${invoice.status}`);
    }

    const payAmount = roundMoney(data.amount);
    if (payAmount > invoice.amountDue) {
      throw new BadRequestError(`Payment amount ($${payAmount}) exceeds invoice outstanding balance ($${invoice.amountDue})`);
    }

    const paymentNumber = await this.generatePaymentNumber();
    const transactionRef = data.transactionReference || `TXN-${uuidv4().substring(0, 8).toUpperCase()}`;

    const payment = await PaymentModel.create({
      paymentNumber,
      customerId: customer._id,
      invoiceId: invoice._id,
      amount: payAmount,
      currency: invoice.currency || 'USD',
      paymentMethod: data.paymentMethod,
      status: PaymentStatus.SUCCESS,
      transactionReference: transactionRef,
      paymentDate: new Date(),
      notes: data.notes,
      recordedBy: operator?.userId,
    });

    // Update invoice amountPaid and amountDue
    invoice.amountPaid = roundMoney(invoice.amountPaid + payAmount);
    invoice.amountDue = roundMoney(Math.max(0, invoice.totalAmount - invoice.amountPaid));

    if (invoice.amountDue <= 0) {
      invoice.status = InvoiceStatus.PAID;
      invoice.paidAt = new Date();
    }
    await invoice.save();

    // Recalculate customer balance
    await CustomerService.recalculateBalance(customer._id.toString());

    // Send payment confirmation notification
    await NotificationService.send({
      recipientId: customer._id,
      recipientEmail: customer.email,
      title: `Payment Received: $${payAmount.toFixed(2)}`,
      message: `Your payment of $${payAmount.toFixed(2)} for invoice ${invoice.invoiceNumber} has been received. Remaining due: $${invoice.amountDue.toFixed(2)}.`,
      type: 'PAYMENT',
      metadata: { paymentId: payment._id, paymentNumber, invoiceId: invoice._id },
    });

    if (operator) {
      await AuditService.record({
        userId: operator.userId,
        userEmail: operator.email,
        userRole: operator.role,
        action: 'PAYMENT_RECORDED',
        entity: 'Payment',
        entityId: payment._id.toString(),
        details: { paymentNumber, amount: payAmount, invoiceNumber: invoice.invoiceNumber },
      });
    }

    return payment;
  }

  public static async refundPayment(
    paymentId: string,
    data: { amount: number; reason: string },
    operator?: any
  ): Promise<IPayment> {
    const payment = await PaymentModel.findById(paymentId);
    if (!payment) throw new NotFoundError('Payment');

    if (payment.status === PaymentStatus.REFUNDED) {
      throw new BadRequestError('Payment has already been refunded in full');
    }

    const refundAmount = roundMoney(data.amount);
    const availableToRefund = roundMoney(payment.amount - payment.refundedAmount);

    if (refundAmount > availableToRefund) {
      throw new BadRequestError(`Refund amount ($${refundAmount}) exceeds refundable balance ($${availableToRefund})`);
    }

    payment.refundedAmount = roundMoney(payment.refundedAmount + refundAmount);
    if (payment.refundedAmount >= payment.amount) {
      payment.status = PaymentStatus.REFUNDED;
    }
    await payment.save();

    // Update invoice amountPaid and amountDue
    const invoice = await InvoiceModel.findById(payment.invoiceId);
    if (invoice) {
      invoice.amountPaid = roundMoney(Math.max(0, invoice.amountPaid - refundAmount));
      invoice.amountDue = roundMoney(invoice.totalAmount - invoice.amountPaid);
      if (invoice.status === InvoiceStatus.PAID && invoice.amountDue > 0) {
        invoice.status = InvoiceStatus.OPEN;
      }
      await invoice.save();
      await CustomerService.recalculateBalance(invoice.customerId.toString());
    }

    if (operator) {
      await AuditService.record({
        userId: operator.userId,
        userEmail: operator.email,
        userRole: operator.role,
        action: 'PAYMENT_REFUNDED',
        entity: 'Payment',
        entityId: payment._id.toString(),
        details: { refundAmount, reason: data.reason },
      });
    }

    return payment;
  }

  public static async getPaymentById(id: string) {
    const payment = await PaymentModel.findById(id).populate('customerId').populate('invoiceId');
    if (!payment) throw new NotFoundError('Payment');
    return payment;
  }

  public static async listPayments(query: {
    page?: number;
    limit?: number;
    customerId?: string;
    invoiceId?: string;
    paymentMethod?: string;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (query.customerId) filter.customerId = query.customerId;
    if (query.invoiceId) filter.invoiceId = query.invoiceId;
    if (query.paymentMethod) filter.paymentMethod = query.paymentMethod;

    const [payments, total] = await Promise.all([
      PaymentModel.find(filter)
        .populate('customerId', 'name email companyName customerCode')
        .populate('invoiceId', 'invoiceNumber totalAmount amountDue status')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      PaymentModel.countDocuments(filter),
    ]);

    return {
      payments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}

