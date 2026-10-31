import { Request, Response, NextFunction } from 'express';
import { BillingService } from '../services/billing.service';
import { PdfService } from '../services/pdf.service';
import { sendResponse } from '../utils/response';

export class InvoiceController {
  public static async createInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const invoice = await BillingService.createInvoice(req.body, req.user);
      return sendResponse({
        res,
        statusCode: 201,
        message: 'Invoice created successfully',
        data: invoice,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async updateInvoiceStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const invoice = await BillingService.updateInvoiceStatus(req.params.id as string, req.body.status, req.user);
      return sendResponse({
        res,
        message: 'Invoice status updated successfully',
        data: invoice,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getInvoiceById(req: Request, res: Response, next: NextFunction) {
    try {
      const invoice = await BillingService.getInvoiceById(req.params.id as string);
      return sendResponse({
        res,
        data: invoice,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async listInvoices(req: Request, res: Response, next: NextFunction) {
    try {
      const { invoices, total, page, limit, totalPages } = await BillingService.listInvoices(req.query as any);
      return sendResponse({
        res,
        data: invoices,
        meta: { total, page, limit, totalPages },
      });
    } catch (err) {
      next(err);
    }
  }

  public static async downloadPdf(req: Request, res: Response, next: NextFunction) {
    try {
      const invoice: any = await BillingService.getInvoiceById(req.params.id as string);
      const pdfBuffer = await PdfService.generateInvoicePdf(invoice, invoice.customerId);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="Invoice-${invoice.invoiceNumber}.pdf"`);
      res.send(pdfBuffer);
    } catch (err) {
      next(err);
    }
  }
}
