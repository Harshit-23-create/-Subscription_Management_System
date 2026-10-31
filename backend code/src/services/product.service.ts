import { ProductModel, IProduct } from '../models/Product.model';
import { PlanModel } from '../models/Plan.model';
import { NotFoundError, ConflictError } from '../utils/errors';
import { AuditService } from './audit.service';

export class ProductService {
  public static async createProduct(data: any, operator?: any): Promise<IProduct> {
    const existing = await ProductModel.findOne({ sku: data.sku.toUpperCase() });
    if (existing) {
      throw new ConflictError(`Product with SKU '${data.sku}' already exists`);
    }

    const product = await ProductModel.create({
      ...data,
      sku: data.sku.toUpperCase(),
    });

    if (operator) {
      await AuditService.record({
        userId: operator.userId,
        userEmail: operator.email,
        userRole: operator.role,
        action: 'PRODUCT_CREATED',
        entity: 'Product',
        entityId: product._id.toString(),
        details: { sku: product.sku, name: product.name },
      });
    }

    return product;
  }

  public static async updateProduct(id: string, data: any, operator?: any): Promise<IProduct> {
    const product = await ProductModel.findById(id);
    if (!product) throw new NotFoundError('Product');

    if (data.sku && data.sku.toUpperCase() !== product.sku) {
      const existing = await ProductModel.findOne({ sku: data.sku.toUpperCase(), _id: { $ne: id } });
      if (existing) throw new ConflictError(`SKU '${data.sku}' is already taken`);
      data.sku = data.sku.toUpperCase();
    }

    Object.assign(product, data);
    await product.save();

    if (operator) {
      await AuditService.record({
        userId: operator.userId,
        userEmail: operator.email,
        userRole: operator.role,
        action: 'PRODUCT_UPDATED',
        entity: 'Product',
        entityId: product._id.toString(),
        details: data,
      });
    }

    return product;
  }

  public static async getProductById(id: string) {
    const product = await ProductModel.findById(id);
    if (!product) throw new NotFoundError('Product');

    const plans = await PlanModel.find({ productId: id, active: true });
    return { product, plans };
  }

  public static async listProducts(query: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    active?: boolean;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (query.category) filter.category = query.category;
    if (typeof query.active === 'boolean') filter.active = query.active;
    if (query.search) {
      const regex = new RegExp(query.search, 'i');
      filter.$or = [{ name: regex }, { sku: regex }, { description: regex }];
    }

    const [products, total] = await Promise.all([
      ProductModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      ProductModel.countDocuments(filter),
    ]);

    return {
      products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}

