import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { sendResponse } from '../utils/response';

export class AuthController {
  public static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.register(req.body);
      return sendResponse({
        res,
        statusCode: 201,
        message: 'User registered successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
      const result = await AuthService.login(req.body, ip);
      return sendResponse({
        res,
        message: 'Login successful',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.refreshToken(req.body.refreshToken);
      return sendResponse({
        res,
        message: 'Token refreshed successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await AuthService.getProfile(req.user!.userId);
      return sendResponse({
        res,
        data: user,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.changePassword(
        req.user!.userId,
        req.body.currentPassword,
        req.body.newPassword
      );
      return sendResponse({
        res,
        message: result.message,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async listUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { users, total, page, limit, totalPages } = await AuthService.listUsers(req.query as any);
      return sendResponse({
        res,
        data: users,
        meta: { total, page, limit, totalPages },
      });
    } catch (err) {
      next(err);
    }
  }
}

