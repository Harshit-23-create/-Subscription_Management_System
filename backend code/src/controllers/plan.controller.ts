import { Request, Response, NextFunction } from 'express';
import { PlanService } from '../services/plan.service';
import { sendResponse } from '../utils/response';

export class PlanController {
  public static async createPlan(req: Request, res: Response, next: NextFunction) {
    try {
      const plan = await PlanService.createPlan(req.body, req.user);
      return sendResponse({
        res,
        statusCode: 201,
        message: 'Plan created successfully',
        data: plan,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async updatePlan(req: Request, res: Response, next: NextFunction) {
    try {
      const plan = await PlanService.updatePlan(req.params.id as string, req.body, req.user);
      return sendResponse({
        res,
        message: 'Plan updated successfully',
        data: plan,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getPlanById(req: Request, res: Response, next: NextFunction) {
    try {
      const plan = await PlanService.getPlanById(req.params.id as string);
      return sendResponse({
        res,
        data: plan,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async listPlans(req: Request, res: Response, next: NextFunction) {
    try {
      const { plans, total, page, limit, totalPages } = await PlanService.listPlans(req.query as any);
      return sendResponse({
        res,
        data: plans,
        meta: { total, page, limit, totalPages },
      });
    } catch (err) {
      next(err);
    }
  }
}
