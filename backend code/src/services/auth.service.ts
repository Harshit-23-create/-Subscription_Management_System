import jwt from 'jsonwebtoken';
import { UserModel, IUser } from '../models/User.model';
import { CustomerModel } from '../models/Customer.model';
import { env } from '../config/env';
import { UserRole } from '../types/roles';
import { BadRequestError, UnauthorizedError, NotFoundError, ConflictError } from '../utils/errors';
import { AuthUserPayload } from '../types';
import { AuditService } from './audit.service';

export class AuthService {
  private static generateTokens(user: IUser) {
    const payload: AuthUserPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      customerId: user.customerId?.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
    };

    const accessToken = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as any,
    });

    const refreshToken = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.REFRESH_TOKEN_EXPIRES_IN as any,
    });

    return { accessToken, refreshToken, user: payload };
  }

  public static async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: UserRole;
    customerId?: string;
  }) {
    const existing = await UserModel.findOne({ email: data.email.toLowerCase() });
    if (existing) {
      throw new ConflictError('A user with this email already exists');
    }

    let customerIdObj: any = null;
    if (data.customerId) {
      const customer = await CustomerModel.findById(data.customerId);
      if (!customer) throw new NotFoundError('Referenced Customer');
      customerIdObj = customer._id;
    }

    const user = await UserModel.create({
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role || UserRole.CUSTOMER,
      customerId: customerIdObj,
    });

    // If customerId is provided, link customer to user
    if (customerIdObj) {
      await CustomerModel.findByIdAndUpdate(customerIdObj, { userId: user._id });
    }

    await AuditService.record({
      userId: user._id,
      userEmail: user.email,
      userRole: user.role,
      action: 'USER_REGISTERED',
      entity: 'User',
      entityId: user._id.toString(),
    });

    return this.generateTokens(user);
  }

  public static async login(credentials: { email: string; password: string }, ip?: string) {
    const user = await UserModel.findOne({ email: credentials.email.toLowerCase() }).select('+password');
    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isMatch = await user.comparePassword(credentials.password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    user.lastLogin = new Date();
    await user.save();

    await AuditService.record({
      userId: user._id,
      userEmail: user.email,
      userRole: user.role,
      action: 'USER_LOGIN',
      entity: 'User',
      entityId: user._id.toString(),
      ipAddress: ip,
    });

    return this.generateTokens(user);
  }

  public static async refreshToken(token: string) {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as AuthUserPayload;
      const user = await UserModel.findById(decoded.userId);
      if (!user || !user.isActive) {
        throw new UnauthorizedError('User account not found or disabled');
      }
      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }

  public static async getProfile(userId: string) {
    const user = await UserModel.findById(userId).populate('customerId');
    if (!user) throw new NotFoundError('User');
    return user;
  }

  public static async changePassword(userId: string, currentPass: string, newPass: string) {
    const user = await UserModel.findById(userId).select('+password');
    if (!user) throw new NotFoundError('User');

    const isMatch = await user.comparePassword(currentPass);
    if (!isMatch) {
      throw new BadRequestError('Current password does not match');
    }

    user.password = newPass;
    await user.save();

    await AuditService.record({
      userId: user._id,
      userEmail: user.email,
      userRole: user.role,
      action: 'PASSWORD_CHANGED',
      entity: 'User',
      entityId: user._id.toString(),
    });

    return { message: 'Password updated successfully' };
  }

  public static async listUsers(query: { page?: number; limit?: number; role?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (query.role) filter.role = query.role;

    const [users, total] = await Promise.all([
      UserModel.find(filter).populate('customerId').sort({ createdAt: -1 }).skip(skip).limit(limit),
      UserModel.countDocuments(filter),
    ]);

    return { users, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}

