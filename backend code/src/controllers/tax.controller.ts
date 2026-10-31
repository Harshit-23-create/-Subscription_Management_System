import { Request, Response, NextFunction } from 'express';
import { TaxService } from '../services/tax.service';
import { sendResponse } from '../utils/response';

export class TaxController {
  public static async createTaxRate(req: Request, res: Response, next: NextFunction) {
    try {
      const taxRate = await TaxService.createTaxRate(req.body, req.user);
      return sendResponse({
        res,
        statusCode: 201,
        message: 'Tax rate created successfully',
        data: taxRate,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async updateTaxRate(req: Request, res: Response, next: NextFunction) {
    try {
      const taxRate = await TaxService.updateTaxRate(req.params.id as string, req.body, req.user);
      return sendResponse({
        res,
        message: 'Tax rate updated successfully',
        data: taxRate,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async listTaxRates(req: Request, res: Response, next: NextFunction) {
    try {
      const { taxRates, total, page, limit, totalPages } = await TaxService.listTaxRates(req.query as any);
      return sendResponse({
        res,
        data: taxRates,
        meta: { total, page, limit, totalPages },
      });
    } catch (err) {
      next(err);
    }
  }
}
