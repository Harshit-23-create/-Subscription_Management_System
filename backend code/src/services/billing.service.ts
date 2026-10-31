import { InvoiceModel, IInvoice } from '../models/Invoice.model';
import { CustomerModel } from '../models/Customer.model';
import { QuotationModel } from '../models/Quotation.model';
import { DiscountModel } from '../models/Discount.model';
import { TaxRateModel } from '../models/TaxRate.model';
import { InvoiceStatus, QuotationStatus, DiscountType } from '../types/roles';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { calculateFinancialTotals, roundMoney } from '../utils/calculation';
import { CustomerService } from './customer.service';
import { AuditService } from './audit.service';
import { NotificationService } from './notification.service';

export class BillingService {
  public static async generateInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await InvoiceModel.countDocuments();
    return `INV-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  public static async createInvoice(data: any, operator?: any): Promise<IInvoice> {
    const customer = await CustomerModel.findById(data.customerId);
    if (!customer) throw new NotFoundError('Customer');

    const items = data.items.map((item: any) => ({
      ...item,
      amount: roundMoney(item.unitPrice * item.quantity),
    }));

    let discountPercentage = 0;
    let discountFixed = 0;
    if (data.discountId) {
      const discount = await DiscountModel.findById(data.discountId);
      if (discount && discount.isValid()) {
        if (discount.type === DiscountType.PERCENTAGE) {
          discountPercentage = discount.value;
        } else {
          discountFixed = discount.value;
        }
      }
    }

    let taxPercentage = 0;
    let isTaxInclusive = false;
    if (data.taxRateId) {
      const taxRate = await TaxRateModel.findById(data.taxRateId);
      if (taxRate && taxRate.active) {
        taxPercentage = taxRate.percentage;
        isTaxInclusive = taxRate.isInclusive;
      }
    }

    const totals = calculateFinancialTotals({
      items,
      discountPercentage,
      discountFixed,
      taxPercentage,
      isTaxInclusive,
    });

    const invoiceNumber = await this.generateInvoiceNumber();

    const invoice = await InvoiceModel.create({
      invoiceNumber,
      customerId: customer._id,
      subscriptionId: data.subscriptionId,
      quotationId: data.quotationId,
      items,
      subtotal: totals.subtotal,
      discountId: data.discountId,
      discountAmount: totals.discountAmount,
      taxRateId: data.taxRateId,
      taxAmount: totals.taxAmount,
      totalAmount: totals.totalAmount,
      amountPaid: 0,
      amountDue: totals.totalAmount,
      currency: customer.currency || 'USD',
      issueDate: new Date(),
      dueDate: data.dueDate,
      status: InvoiceStatus.OPEN,
      notes: data.notes,
      paymentTerms: data.paymentTerms || 'Net 15 days',
    });

    // Update customer balance
    await CustomerService.recalculateBalance(customer._id.toString());

    // Send notification
    await NotificationService.send({
      recipientId: customer._id,
      recipientEmail: customer.email,
      title: `New Invoice Issued: ${invoice.invoiceNumber}`,
      message: `An invoice for $${invoice.totalAmount.toFixed(2)} has been generated and is due on ${new Date(invoice.dueDate).toLocaleDateString()}.`,
      type: 'INVOICE',
      metadata: { invoiceId: invoice._id, invoiceNumber: invoice.invoiceNumber },
    });

    if (operator) {
      await AuditService.record({
        userId: operator.userId,
        userEmail: operator.email,
        userRole: operator.role,
        action: 'INVOICE_CREATED',
        entity: 'Invoice',
        entityId: invoice._id.toString(),
        details: { invoiceNumber, totalAmount: invoice.totalAmount },
      });
    }

    return invoice;
  }

  public static async createFromQuotation(quotationId: string, operator?: any): Promise<IInvoice> {
    const quotation = await QuotationModel.findById(quotationId);
    if (!quotation) throw new NotFoundError('Quotation');

    if (quotation.status === QuotationStatus.CONVERTED) {
      throw new BadRequestError('Quotation has already been converted');
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 15);

    const invoice = await this.createInvoice(
      {
        customerId: quotation.customerId.toString(),
        quotationId: quotation._id.toString(),
        items: quotation.items.map((i) => ({
          description: i.description,
          planId: i.planId?.toString(),
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
        discountId: quotation.discountId?.toString(),
        taxRateId: quotation.taxRateId?.toString(),
        dueDate,
        notes: quotation.notes,
        paymentTerms: quotation.terms,
      },
      operator
    );

    quotation.status = QuotationStatus.CONVERTED;
    quotation.convertedInvoiceId = invoice._id;
    quotation.convertedAt = new Date();
    await quotation.save();

    return invoice;
  }

  public static async updateInvoiceStatus(id: string, newStatus: InvoiceStatus, operator?: any): Promise<IInvoice> {
    const invoice = await InvoiceModel.findById(id);
    if (!invoice) throw new NotFoundError('Invoice');

    const oldStatus = invoice.status;
    invoice.status = newStatus;
    await invoice.save();

    // Recalculate customer balance
    await CustomerService.recalculateBalance(invoice.customerId.toString());

    if (operator) {
      await AuditService.record({
        userId: operator.userId,
        userEmail: operator.email,
        userRole: operator.role,
        action: 'INVOICE_STATUS_UPDATED',
        entity: 'Invoice',
        entityId: invoice._id.toString(),
        details: { from: oldStatus, to: newStatus },
      });
    }

    return invoice;
  }

  public static async getInvoiceById(id: string) {
    const invoice = await InvoiceModel.findById(id)
      .populate('customerId')
      .populate('subscriptionId')
      .populate('quotationId')
      .populate('discountId')
      .populate('taxRateId');
    if (!invoice) throw new NotFoundError('Invoice');
    return invoice;
  }

  public static async listInvoices(query: {
    page?: number;
    limit?: number;
    customerId?: string;
    subscriptionId?: string;
    status?: string;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (query.customerId) filter.customerId = query.customerId;
    if (query.subscriptionId) filter.subscriptionId = query.subscriptionId;
    if (query.status) filter.status = query.status;

    const [invoices, total] = await Promise.all([
      InvoiceModel.find(filter)
        .populate('customerId', 'name email companyName customerCode')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      InvoiceModel.countDocuments(filter),
    ]);

    return {
      invoices,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}

