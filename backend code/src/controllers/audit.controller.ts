import { Request, Response, NextFunction } from 'express';
import { AuditService } from '../services/audit.service';
import { sendResponse } from '../utils/response';

export class AuditController {
  public static async listLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const { logs, total, page, limit, totalPages } = await AuditService.getLogs(req.query as any);
      return sendResponse({
        res,
        data: logs,
        meta: { total, page, limit, totalPages },
      });
    } catch (err) {
      next(err);
    }
  }
}

