import { DiscountModel, IDiscount } from '../models/Discount.model';
import { NotFoundError, ConflictError } from '../utils/errors';
import { AuditService } from './audit.service';

export class DiscountService {
  public static async createDiscount(data: any, operator?: any): Promise<IDiscount> {
    const code = data.code.toUpperCase();
    const existing = await DiscountModel.findOne({ code });
    if (existing) {
      throw new ConflictError(`Discount code '${code}' already exists`);
    }

    const discount = await DiscountModel.create({
      ...data,
      code,
    });

    if (operator) {
      await AuditService.record({
        userId: operator.userId,
        userEmail: operator.email,
        userRole: operator.role,
        action: 'DISCOUNT_CREATED',
        entity: 'Discount',
        entityId: discount._id.toString(),
        details: { code, type: discount.type, value: discount.value },
      });
    }

    return discount;
  }

  public static async updateDiscount(id: string, data: any, operator?: any): Promise<IDiscount> {
    const discount = await DiscountModel.findById(id);
    if (!discount) throw new NotFoundError('Discount');

    if (data.code && data.code.toUpperCase() !== discount.code) {
      const existing = await DiscountModel.findOne({ code: data.code.toUpperCase(), _id: { $ne: id } });
      if (existing) throw new ConflictError('Discount code already exists');
      data.code = data.code.toUpperCase();
    }

    Object.assign(discount, data);
    await discount.save();

    if (operator) {
      await AuditService.record({
        userId: operator.userId,
        userEmail: operator.email,
        userRole: operator.role,
        action: 'DISCOUNT_UPDATED',
        entity: 'Discount',
        entityId: discount._id.toString(),
        details: data,
      });
    }

    return discount;
  }

  public static async getByCode(code: string): Promise<IDiscount> {
    const discount = await DiscountModel.findOne({ code: code.toUpperCase() });
    if (!discount || !discount.isValid()) {
      throw new NotFoundError('Valid discount code');
    }
    return discount;
  }

  public static async listDiscounts(query: { page?: number; limit?: number; active?: boolean }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (typeof query.active === 'boolean') filter.active = query.active;

    const [discounts, total] = await Promise.all([
      DiscountModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      DiscountModel.countDocuments(filter),
    ]);

    return {
      discounts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}

