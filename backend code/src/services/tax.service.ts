import { TaxRateModel, ITaxRate } from '../models/TaxRate.model';
import { NotFoundError } from '../utils/errors';
import { AuditService } from './audit.service';

export class TaxService {
  public static async createTaxRate(data: any, operator?: any): Promise<ITaxRate> {
    const taxRate = await TaxRateModel.create(data);

    if (operator) {
      await AuditService.record({
        userId: operator.userId,
        userEmail: operator.email,
        userRole: operator.role,
        action: 'TAX_RATE_CREATED',
        entity: 'TaxRate',
        entityId: taxRate._id.toString(),
        details: { name: taxRate.name, percentage: taxRate.percentage },
      });
    }

    return taxRate;
  }

  public static async updateTaxRate(id: string, data: any, operator?: any): Promise<ITaxRate> {
    const taxRate = await TaxRateModel.findById(id);
    if (!taxRate) throw new NotFoundError('Tax Rate');

    Object.assign(taxRate, data);
    await taxRate.save();

    if (operator) {
      await AuditService.record({
        userId: operator.userId,
        userEmail: operator.email,
        userRole: operator.role,
        action: 'TAX_RATE_UPDATED',
        entity: 'TaxRate',
        entityId: taxRate._id.toString(),
        details: data,
      });
    }

    return taxRate;
  }

  public static async listTaxRates(query: { page?: number; limit?: number; jurisdiction?: string; active?: boolean }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (query.jurisdiction) filter.jurisdiction = query.jurisdiction;
    if (typeof query.active === 'boolean') filter.active = query.active;

    const [taxRates, total] = await Promise.all([
      TaxRateModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      TaxRateModel.countDocuments(filter),
    ]);

    return {
      taxRates,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}

