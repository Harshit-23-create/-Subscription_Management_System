import { QuotationModel, IQuotation } from '../models/Quotation.model';
import { CustomerModel } from '../models/Customer.model';
import { DiscountModel } from '../models/Discount.model';
import { TaxRateModel } from '../models/TaxRate.model';
import { QuotationStatus, DiscountType } from '../types/roles';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { calculateFinancialTotals, roundMoney } from '../utils/calculation';
import { AuditService } from './audit.service';
import { NotificationService } from './notification.service';

export class QuotationService {
  private static async generateQuotationNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await QuotationModel.countDocuments();
    return `QUO-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  public static async createQuotation(data: any, operator?: any): Promise<IQuotation> {
    const customer = await CustomerModel.findById(data.customerId);
    if (!customer) throw new NotFoundError('Customer');

    // Calculate items
    const items = data.items.map((item: any) => ({
      ...item,
      subtotal: roundMoney(item.unitPrice * item.quantity),
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

    const quotationNumber = await this.generateQuotationNumber();

    const quotation = await QuotationModel.create({
      quotationNumber,
      customerId: customer._id,
      items,
      subtotal: totals.subtotal,
      discountId: data.discountId,
      discountAmount: totals.discountAmount,
      taxRateId: data.taxRateId,
      taxAmount: totals.taxAmount,
      totalAmount: totals.totalAmount,
      currency: customer.currency || 'USD',
      validUntil: data.validUntil,
      status: QuotationStatus.DRAFT,
      notes: data.notes,
      terms: data.terms,
    });

    if (operator) {
      await AuditService.record({
        userId: operator.userId,
        userEmail: operator.email,
        userRole: operator.role,
        action: 'QUOTATION_CREATED',
        entity: 'Quotation',
        entityId: quotation._id.toString(),
        details: { quotationNumber, totalAmount: quotation.totalAmount },
      });
    }

    return quotation;
  }

  public static async updateStatus(id: string, newStatus: QuotationStatus, operator?: any): Promise<IQuotation> {
    const quotation = await QuotationModel.findById(id).populate('customerId');
    if (!quotation) throw new NotFoundError('Quotation');

    const oldStatus = quotation.status;
    quotation.status = newStatus;
    await quotation.save();

    // If sent to customer, create notification
    if (newStatus === QuotationStatus.SENT && quotation.customerId) {
      const customer: any = quotation.customerId;
      await NotificationService.send({
        recipientId: customer._id,
        recipientEmail: customer.email,
        title: `Quotation ${quotation.quotationNumber} is ready`,
        message: `Your quotation ${quotation.quotationNumber} for $${quotation.totalAmount.toFixed(2)} is ready for review. Valid until ${new Date(quotation.validUntil).toLocaleDateString()}.`,
        type: 'QUOTATION',
      });
    }

    if (operator) {
      await AuditService.record({
        userId: operator.userId,
        userEmail: operator.email,
        userRole: operator.role,
        action: 'QUOTATION_STATUS_UPDATED',
        entity: 'Quotation',
        entityId: quotation._id.toString(),
        details: { from: oldStatus, to: newStatus },
      });
    }

    return quotation;
  }

  public static async getById(id: string) {
    const quotation = await QuotationModel.findById(id)
      .populate('customerId')
      .populate('discountId')
      .populate('taxRateId')
      .populate('items.planId');
    if (!quotation) throw new NotFoundError('Quotation');
    return quotation;
  }

  public static async listQuotations(query: {
    page?: number;
    limit?: number;
    customerId?: string;
    status?: string;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (query.customerId) filter.customerId = query.customerId;
    if (query.status) filter.status = query.status;

    const [quotations, total] = await Promise.all([
      QuotationModel.find(filter)
        .populate('customerId', 'name email companyName customerCode')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      QuotationModel.countDocuments(filter),
    ]);

    return {
      quotations,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}

