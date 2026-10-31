import { Request, Response, NextFunction } from 'express';
import { PortalService } from '../services/portal.service';
import { BillingService } from '../services/billing.service';
import { PdfService } from '../services/pdf.service';
import { sendResponse } from '../utils/response';
import { BadRequestError, ForbiddenError } from '../utils/errors';

export class PortalController {
  private static ensureCustomerId(req: Request): string {
    const customerId = req.user?.customerId;
    if (!customerId) {
      throw new BadRequestError('User account is not linked to any Customer record');
    }
    return customerId;
  }

  public static async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = PortalController.ensureCustomerId(req);
      const dashboard = await PortalService.getCustomerDashboard(customerId);
      return sendResponse({
        res,
        data: dashboard,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getSubscriptions(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = PortalController.ensureCustomerId(req);
      const subscriptions = await PortalService.getCustomerSubscriptions(customerId);
      return sendResponse({
        res,
        data: subscriptions,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getInvoices(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = PortalController.ensureCustomerId(req);
      const invoices = await PortalService.getCustomerInvoices(customerId);
      return sendResponse({
        res,
        data: invoices,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = PortalController.ensureCustomerId(req);
      const payments = await PortalService.getCustomerPayments(customerId);
      return sendResponse({
        res,
        data: payments,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getQuotations(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = PortalController.ensureCustomerId(req);
      const quotations = await PortalService.getCustomerQuotations(customerId);
      return sendResponse({
        res,
        data: quotations,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async downloadInvoicePdf(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = PortalController.ensureCustomerId(req);
      const invoice: any = await BillingService.getInvoiceById(req.params.id as string);

      if (invoice.customerId._id.toString() !== customerId) {
        throw new ForbiddenError('You can only download your own invoices');
      }

      const pdfBuffer = await PdfService.generateInvoicePdf(invoice, invoice.customerId);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="Invoice-${invoice.invoiceNumber}.pdf"`);
      res.send(pdfBuffer);
    } catch (err) {
      next(err);
    }
  }
}
