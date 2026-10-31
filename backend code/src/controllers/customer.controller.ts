import { Request, Response, NextFunction } from 'express';
import { CustomerService } from '../services/customer.service';
import { sendResponse } from '../utils/response';

export class CustomerController {
  public static async createCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const customer = await CustomerService.createCustomer(req.body, req.user);
      return sendResponse({
        res,
        statusCode: 201,
        message: 'Customer created successfully',
        data: customer,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async updateCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const customer = await CustomerService.updateCustomer(req.params.id as string, req.body, req.user);
      return sendResponse({
        res,
        message: 'Customer updated successfully',
        data: customer,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getCustomerById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CustomerService.getCustomerById(req.params.id as string);
      return sendResponse({
        res,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async listCustomers(req: Request, res: Response, next: NextFunction) {
    try {
      const { customers, total, page, limit, totalPages } = await CustomerService.listCustomers(req.query as any);
      return sendResponse({
        res,
        data: customers,
        meta: { total, page, limit, totalPages },
      });
    } catch (err) {
      next(err);
    }
  }
}
