import { Request, Response, NextFunction } from 'express';
import { QuotationService } from '../services/quotation.service';
import { BillingService } from '../services/billing.service';
import { PdfService } from '../services/pdf.service';
import { sendResponse } from '../utils/response';

export class QuotationController {
  public static async createQuotation(req: Request, res: Response, next: NextFunction) {
    try {
      const quotation = await QuotationService.createQuotation(req.body, req.user);
      return sendResponse({
        res,
        statusCode: 201,
        message: 'Quotation created successfully',
        data: quotation,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const quotation = await QuotationService.updateStatus(req.params.id as string, req.body.status, req.user);
      return sendResponse({
        res,
        message: 'Quotation status updated successfully',
        data: quotation,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async convertToInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const invoice = await BillingService.createFromQuotation(req.params.id as string, req.user);
      return sendResponse({
        res,
        statusCode: 201,
        message: 'Quotation converted to Invoice successfully',
        data: invoice,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const quotation = await QuotationService.getById(req.params.id as string);
      return sendResponse({
        res,
        data: quotation,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async listQuotations(req: Request, res: Response, next: NextFunction) {
    try {
      const { quotations, total, page, limit, totalPages } = await QuotationService.listQuotations(req.query as any);
      return sendResponse({
        res,
        data: quotations,
        meta: { total, page, limit, totalPages },
      });
    } catch (err) {
      next(err);
    }
  }

  public static async downloadPdf(req: Request, res: Response, next: NextFunction) {
    try {
      const quotation: any = await QuotationService.getById(req.params.id as string);
      const pdfBuffer = await PdfService.generateQuotationPdf(quotation, quotation.customerId);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="Quotation-${quotation.quotationNumber}.pdf"`);
      res.send(pdfBuffer);
    } catch (err) {
      next(err);
    }
  }
}
