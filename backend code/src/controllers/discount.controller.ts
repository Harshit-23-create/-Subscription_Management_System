import { Request, Response, NextFunction } from 'express';
import { DiscountService } from '../services/discount.service';
import { sendResponse } from '../utils/response';

export class DiscountController {
  public static async createDiscount(req: Request, res: Response, next: NextFunction) {
    try {
      const discount = await DiscountService.createDiscount(req.body, req.user);
      return sendResponse({
        res,
        statusCode: 201,
        message: 'Discount created successfully',
        data: discount,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async updateDiscount(req: Request, res: Response, next: NextFunction) {
    try {
      const discount = await DiscountService.updateDiscount(req.params.id as string, req.body, req.user);
      return sendResponse({
        res,
        message: 'Discount updated successfully',
        data: discount,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getByCode(req: Request, res: Response, next: NextFunction) {
    try {
      const discount = await DiscountService.getByCode(req.params.code as string);
      return sendResponse({
        res,
        data: discount,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async listDiscounts(req: Request, res: Response, next: NextFunction) {
    try {
      const { discounts, total, page, limit, totalPages } = await DiscountService.listDiscounts(req.query as any);
      return sendResponse({
        res,
        data: discounts,
        meta: { total, page, limit, totalPages },
      });
    } catch (err) {
      next(err);
    }
  }
}
