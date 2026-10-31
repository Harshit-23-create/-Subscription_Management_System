import { Request, Response, NextFunction } from 'express';
import { PaymentService } from '../services/payment.service';
import { BillingService } from '../services/billing.service';
import { PdfService } from '../services/pdf.service';
import { sendResponse } from '../utils/response';

export class PaymentController {
  public static async recordPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const payment = await PaymentService.recordPayment(req.body, req.user);
      return sendResponse({
        res,
        statusCode: 201,
        message: 'Payment recorded successfully',
        data: payment,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async refundPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const payment = await PaymentService.refundPayment(req.params.id as string, req.body, req.user);
      return sendResponse({
        res,
        message: 'Payment refund processed successfully',
        data: payment,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getPaymentById(req: Request, res: Response, next: NextFunction) {
    try {
      const payment = await PaymentService.getPaymentById(req.params.id as string);
      return sendResponse({
        res,
        data: payment,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async listPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const { payments, total, page, limit, totalPages } = await PaymentService.listPayments(req.query as any);
      return sendResponse({
        res,
        data: payments,
        meta: { total, page, limit, totalPages },
      });
    } catch (err) {
      next(err);
    }
  }

  public static async downloadReceipt(req: Request, res: Response, next: NextFunction) {
    try {
      const payment: any = await PaymentService.getPaymentById(req.params.id as string);
      const invoice = await BillingService.getInvoiceById(payment.invoiceId._id.toString());
      const pdfBuffer = await PdfService.generateReceiptPdf(payment, invoice, payment.customerId);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="Receipt-${payment.paymentNumber}.pdf"`);
      res.send(pdfBuffer);
    } catch (err) {
      next(err);
    }
  }
}
