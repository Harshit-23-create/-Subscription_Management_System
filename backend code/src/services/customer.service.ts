import { CustomerModel, ICustomer } from '../models/Customer.model';
import { InvoiceModel } from '../models/Invoice.model';
import { SubscriptionModel } from '../models/Subscription.model';
import { NotFoundError, ConflictError } from '../utils/errors';
import { AuditService } from './audit.service';

export class CustomerService {
  private static async generateCustomerCode(): Promise<string> {
    const count = await CustomerModel.countDocuments();
    return `CUST-${String(count + 1).padStart(4, '0')}`;
  }

  public static async createCustomer(data: any, operatorUser?: any): Promise<ICustomer> {
    const existing = await CustomerModel.findOne({ email: data.email.toLowerCase() });
    if (existing) {
      throw new ConflictError('Customer with this email already exists');
    }

    const customerCode = await this.generateCustomerCode();
    const customer = await CustomerModel.create({
      ...data,
      customerCode,
      email: data.email.toLowerCase(),
    });

    if (operatorUser) {
      await AuditService.record({
        userId: operatorUser.userId,
        userEmail: operatorUser.email,
        userRole: operatorUser.role,
        action: 'CUSTOMER_CREATED',
        entity: 'Customer',
        entityId: customer._id.toString(),
        details: { customerCode, email: customer.email },
      });
    }

    return customer;
  }

  public static async updateCustomer(id: string, updateData: any, operatorUser?: any): Promise<ICustomer> {
    const customer = await CustomerModel.findById(id);
    if (!customer) throw new NotFoundError('Customer');

    if (updateData.email && updateData.email.toLowerCase() !== customer.email) {
      const emailTaken = await CustomerModel.findOne({ email: updateData.email.toLowerCase(), _id: { $ne: id } });
      if (emailTaken) throw new ConflictError('Email is already registered to another customer');
      updateData.email = updateData.email.toLowerCase();
    }

    Object.assign(customer, updateData);
    await customer.save();

    if (operatorUser) {
      await AuditService.record({
        userId: operatorUser.userId,
        userEmail: operatorUser.email,
        userRole: operatorUser.role,
        action: 'CUSTOMER_UPDATED',
        entity: 'Customer',
        entityId: customer._id.toString(),
        details: updateData,
      });
    }

    return customer;
  }

  public static async getCustomerById(id: string) {
    const customer = await CustomerModel.findById(id).populate('userId', 'email firstName lastName role');
    if (!customer) throw new NotFoundError('Customer');

    const [activeSubscriptions, openInvoices] = await Promise.all([
      SubscriptionModel.countDocuments({ customerId: id as any, status: 'ACTIVE' } as any),
      InvoiceModel.countDocuments({ customerId: id as any, status: 'OPEN' } as any),
    ]);

    return {
      customer,
      summary: {
        activeSubscriptions,
        openInvoices,
        balance: customer.balance,
      },
    };
  }

  public static async listCustomers(query: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (query.status) {
      filter.status = query.status;
    }

    if (query.search) {
      const regex = new RegExp(query.search, 'i');
      filter.$or = [
        { name: regex },
        { email: regex },
        { companyName: regex },
        { customerCode: regex },
      ];
    }

    const sortField = query.sortBy || 'createdAt';
    const sortDirection = query.sortOrder === 'asc' ? 1 : -1;

    const [customers, total] = await Promise.all([
      CustomerModel.find(filter)
        .sort({ [sortField]: sortDirection })
        .skip(skip)
        .limit(limit),
      CustomerModel.countDocuments(filter),
    ]);

    return {
      customers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  public static async recalculateBalance(customerId: string): Promise<number> {
    const openInvoices = await InvoiceModel.find({
      customerId: customerId as any,
      status: { $in: ['OPEN'] },
    } as any);

    const totalDue = openInvoices.reduce((acc: number, inv: any) => acc + inv.amountDue, 0);
    const roundedBalance = Math.round((totalDue + Number.EPSILON) * 100) / 100;

    await CustomerModel.findByIdAndUpdate(customerId, { balance: roundedBalance });
    return roundedBalance;
  }
}
