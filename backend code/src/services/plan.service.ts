import { PlanModel, IPlan } from '../models/Plan.model';
import { ProductModel } from '../models/Product.model';
import { NotFoundError, ConflictError } from '../utils/errors';
import { AuditService } from './audit.service';

export class PlanService {
  public static async createPlan(data: any, operator?: any): Promise<IPlan> {
    const product = await ProductModel.findById(data.productId);
    if (!product) throw new NotFoundError('Associated Product');

    const existing = await PlanModel.findOne({ code: data.code.toUpperCase() });
    if (existing) {
      throw new ConflictError(`Plan with code '${data.code}' already exists`);
    }

    const plan = await PlanModel.create({
      ...data,
      code: data.code.toUpperCase(),
    });

    if (operator) {
      await AuditService.record({
        userId: operator.userId,
        userEmail: operator.email,
        userRole: operator.role,
        action: 'PLAN_CREATED',
        entity: 'Plan',
        entityId: plan._id.toString(),
        details: { code: plan.code, price: plan.price, interval: plan.billingInterval },
      });
    }

    return plan;
  }

  public static async updatePlan(id: string, data: any, operator?: any): Promise<IPlan> {
    const plan = await PlanModel.findById(id);
    if (!plan) throw new NotFoundError('Plan');

    if (data.code && data.code.toUpperCase() !== plan.code) {
      const existing = await PlanModel.findOne({ code: data.code.toUpperCase(), _id: { $ne: id } });
      if (existing) throw new ConflictError(`Plan code '${data.code}' already exists`);
      data.code = data.code.toUpperCase();
    }

    Object.assign(plan, data);
    await plan.save();

    if (operator) {
      await AuditService.record({
        userId: operator.userId,
        userEmail: operator.email,
        userRole: operator.role,
        action: 'PLAN_UPDATED',
        entity: 'Plan',
        entityId: plan._id.toString(),
        details: data,
      });
    }

    return plan;
  }

  public static async getPlanById(id: string) {
    const plan = await PlanModel.findById(id).populate('productId');
    if (!plan) throw new NotFoundError('Plan');
    return plan;
  }

  public static async listPlans(query: {
    page?: number;
    limit?: number;
    productId?: string;
    billingInterval?: string;
    active?: boolean;
    search?: string;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (query.productId) filter.productId = query.productId;
    if (query.billingInterval) filter.billingInterval = query.billingInterval;
    if (typeof query.active === 'boolean') filter.active = query.active;
    if (query.search) {
      const regex = new RegExp(query.search, 'i');
      filter.$or = [{ name: regex }, { code: regex }];
    }

    const [plans, total] = await Promise.all([
      PlanModel.find(filter).populate('productId').sort({ createdAt: -1 }).skip(skip).limit(limit),
      PlanModel.countDocuments(filter),
    ]);

    return {
      plans,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}

