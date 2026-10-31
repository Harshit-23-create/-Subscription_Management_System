import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analytics.service';
import { sendResponse } from '../utils/response';

export class AnalyticsController {
  public static async getSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const summary = await AnalyticsService.getExecutiveSummary();
      return sendResponse({
        res,
        data: summary,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getRevenueReport(req: Request, res: Response, next: NextFunction) {
    try {
      const period = (req.query.period as 'daily' | 'monthly') || 'monthly';
      const report = await AnalyticsService.getRevenueReport(period);
      return sendResponse({
        res,
        data: report,
      });
    } catch (err) {
      next(err);
    }
  }
}

