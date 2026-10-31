import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service';
import { sendResponse } from '../utils/response';

export class ProductController {
  public static async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await ProductService.createProduct(req.body, req.user);
      return sendResponse({
        res,
        statusCode: 201,
        message: 'Product created successfully',
        data: product,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await ProductService.updateProduct(req.params.id as string, req.body, req.user);
      return sendResponse({
        res,
        message: 'Product updated successfully',
        data: product,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getProductById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ProductService.getProductById(req.params.id as string);
      return sendResponse({
        res,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async listProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { products, total, page, limit, totalPages } = await ProductService.listProducts(req.query as any);
      return sendResponse({
        res,
        data: products,
        meta: { total, page, limit, totalPages },
      });
    } catch (err) {
      next(err);
    }
  }
}
