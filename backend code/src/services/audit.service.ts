import { AuditLogModel } from '../models/AuditLog.model';
import { logger } from '../utils/logger';

export interface RecordAuditParams {
  userId?: any;
  userEmail?: string;
  userRole?: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditService {
  public static async record(params: RecordAuditParams) {
    try {
      await AuditLogModel.create(params);
    } catch (err: any) {
      logger.error('Failed to write audit log:', err.message);
    }
  }

  public static async getLogs(query: { page?: number; limit?: number; action?: string; entity?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (query.action) filter.action = query.action;
    if (query.entity) filter.entity = query.entity;

    const [logs, total] = await Promise.all([
      AuditLogModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      AuditLogModel.countDocuments(filter),
    ]);

    return {
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}

