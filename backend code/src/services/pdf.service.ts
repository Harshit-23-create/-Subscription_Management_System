import PDFDocument from 'pdfkit';
import { env } from '../config/env';

export class PdfService {
  /**
   * Generates a professional PDF for an Invoice
   */
  public static async generateInvoicePdf(invoice: any, customer: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        const buffers: Buffer[] = [];

        doc.on('data', (chunk) => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', (err) => reject(err));

        // Company Header
        doc.fontSize(20).fillColor('#1E293B').text(env.COMPANY_NAME, 40, 40);
        doc.fontSize(9).fillColor('#64748B')
          .text(env.COMPANY_ADDRESS, 40, 68)
          .text(`Email: ${env.COMPANY_EMAIL} | Phone: ${env.COMPANY_PHONE}`, 40, 80)
          .text(`Tax ID: ${env.COMPANY_TAX_ID} | Website: ${env.COMPANY_WEBSITE}`, 40, 92);

        // Invoice Title & Meta
        doc.fontSize(22).fillColor('#2563EB').text('INVOICE', 400, 40, { align: 'right' });
        doc.fontSize(9).fillColor('#334155')
          .text(`Invoice #: ${invoice.invoiceNumber}`, 400, 68, { align: 'right' })
          .text(`Issue Date: ${new Date(invoice.issueDate).toLocaleDateString()}`, 400, 80, { align: 'right' })
          .text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 400, 92, { align: 'right' })
          .text(`Status: ${invoice.status}`, 400, 104, { align: 'right' });

        doc.moveTo(40, 125).lineTo(555, 125).strokeColor('#E2E8F0').stroke();

        // Customer Details
        doc.fontSize(11).fillColor('#1E293B').text('Billed To:', 40, 140);
        doc.fontSize(10).fillColor('#334155')
          .text(customer?.name || 'Valued Customer', 40, 155)
          .text(customer?.companyName || '', 40, 168)
          .text(customer?.email || '', 40, 181)
          .text(
            customer?.billingAddress?.street
              ? `${customer.billingAddress.street}, ${customer.billingAddress.city || ''} ${customer.billingAddress.state || ''} ${customer.billingAddress.country || ''}`
              : '',
            40,
            194
          );

        // Table Header
        const tableTop = 230;
        doc.rect(40, tableTop, 515, 24).fill('#F1F5F9');
        doc.fontSize(9).fillColor('#1E293B')
          .text('Description', 50, tableTop + 7)
          .text('Qty', 330, tableTop + 7, { width: 40, align: 'right' })
          .text('Unit Price', 380, tableTop + 7, { width: 70, align: 'right' })
          .text('Amount', 460, tableTop + 7, { width: 85, align: 'right' });

        let currentY = tableTop + 30;

        // Table Rows
        invoice.items.forEach((item: any) => {
          doc.fontSize(9).fillColor('#334155')
            .text(item.description, 50, currentY, { width: 270 })
            .text(item.quantity.toString(), 330, currentY, { width: 40, align: 'right' })
            .text(`$${Number(item.unitPrice).toFixed(2)}`, 380, currentY, { width: 70, align: 'right' })
            .text(`$${Number(item.amount).toFixed(2)}`, 460, currentY, { width: 85, align: 'right' });

          currentY += 22;
          doc.moveTo(40, currentY - 5).lineTo(555, currentY - 5).strokeColor('#F1F5F9').stroke();
        });

        // Summary Totals
        currentY += 15;
        const summaryX = 350;

        doc.fontSize(9).fillColor('#64748B').text('Subtotal:', summaryX, currentY);
        doc.fillColor('#1E293B').text(`$${Number(invoice.subtotal).toFixed(2)}`, 460, currentY, { width: 85, align: 'right' });
        currentY += 18;

        if (invoice.discountAmount > 0) {
          doc.fillColor('#64748B').text('Discount:', summaryX, currentY);
          doc.fillColor('#16A34A').text(`-$${Number(invoice.discountAmount).toFixed(2)}`, 460, currentY, { width: 85, align: 'right' });
          currentY += 18;
        }

        if (invoice.taxAmount > 0) {
          doc.fillColor('#64748B').text('Tax:', summaryX, currentY);
          doc.fillColor('#1E293B').text(`$${Number(invoice.taxAmount).toFixed(2)}`, 460, currentY, { width: 85, align: 'right' });
          currentY += 18;
        }

        doc.rect(summaryX - 10, currentY, 215, 24).fill('#F8FAFC');
        doc.fontSize(11).fillColor('#1E293B').text('Total Amount:', summaryX, currentY + 6);
        doc.text(`$${Number(invoice.totalAmount).toFixed(2)}`, 460, currentY + 6, { width: 85, align: 'right' });
        currentY += 32;

        doc.fontSize(9).fillColor('#64748B').text('Amount Paid:', summaryX, currentY);
        doc.fillColor('#1E293B').text(`$${Number(invoice.amountPaid).toFixed(2)}`, 460, currentY, { width: 85, align: 'right' });
        currentY += 18;

        doc.fontSize(10).fillColor('#DC2626').text('Amount Due:', summaryX, currentY);
        doc.fillColor('#DC2626').text(`$${Number(invoice.amountDue).toFixed(2)}`, 460, currentY, { width: 85, align: 'right' });

        // Notes and Terms
        if (invoice.notes || invoice.paymentTerms) {
          currentY += 40;
          doc.fontSize(9).fillColor('#1E293B').text('Terms & Notes:', 40, currentY);
          doc.fontSize(8).fillColor('#64748B')
            .text(invoice.paymentTerms ? `Payment Terms: ${invoice.paymentTerms}` : '', 40, currentY + 14)
            .text(invoice.notes || '', 40, currentY + 26);
        }

        // Footer
        doc.fontSize(8).fillColor('#94A3B8').text(
          `Thank you for your business! If you have questions about this invoice, contact ${env.COMPANY_EMAIL}.`,
          40,
          780,
          { align: 'center', width: 515 }
        );

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Generates a professional PDF for a Quotation
   */
  public static async generateQuotationPdf(quotation: any, customer: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        const buffers: Buffer[] = [];

        doc.on('data', (chunk) => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', (err) => reject(err));

        // Company Header
        doc.fontSize(20).fillColor('#1E293B').text(env.COMPANY_NAME, 40, 40);
        doc.fontSize(9).fillColor('#64748B')
          .text(env.COMPANY_ADDRESS, 40, 68)
          .text(`Email: ${env.COMPANY_EMAIL} | Phone: ${env.COMPANY_PHONE}`, 40, 80);

        // Quotation Title
        doc.fontSize(22).fillColor('#0284C7').text('QUOTATION', 400, 40, { align: 'right' });
        doc.fontSize(9).fillColor('#334155')
          .text(`Quote #: ${quotation.quotationNumber}`, 400, 68, { align: 'right' })
          .text(`Date: ${new Date(quotation.createdAt).toLocaleDateString()}`, 400, 80, { align: 'right' })
          .text(`Valid Until: ${new Date(quotation.validUntil).toLocaleDateString()}`, 400, 92, { align: 'right' })
          .text(`Status: ${quotation.status}`, 400, 104, { align: 'right' });

        doc.moveTo(40, 125).lineTo(555, 125).strokeColor('#E2E8F0').stroke();

        // Customer Details
        doc.fontSize(11).fillColor('#1E293B').text('Prepared For:', 40, 140);
        doc.fontSize(10).fillColor('#334155')
          .text(customer?.name || 'Prospect', 40, 155)
          .text(customer?.companyName || '', 40, 168)
          .text(customer?.email || '', 40, 181);

        // Items Table
        const tableTop = 220;
        doc.rect(40, tableTop, 515, 24).fill('#F1F5F9');
        doc.fontSize(9).fillColor('#1E293B')
          .text('Description', 50, tableTop + 7)
          .text('Qty', 330, tableTop + 7, { width: 40, align: 'right' })
          .text('Unit Price', 380, tableTop + 7, { width: 70, align: 'right' })
          .text('Subtotal', 460, tableTop + 7, { width: 85, align: 'right' });

        let currentY = tableTop + 30;

        quotation.items.forEach((item: any) => {
          doc.fontSize(9).fillColor('#334155')
            .text(item.description, 50, currentY, { width: 270 })
            .text(item.quantity.toString(), 330, currentY, { width: 40, align: 'right' })
            .text(`$${Number(item.unitPrice).toFixed(2)}`, 380, currentY, { width: 70, align: 'right' })
            .text(`$${Number(item.subtotal).toFixed(2)}`, 460, currentY, { width: 85, align: 'right' });

          currentY += 22;
          doc.moveTo(40, currentY - 5).lineTo(555, currentY - 5).strokeColor('#F1F5F9').stroke();
        });

        // Totals
        currentY += 15;
        const summaryX = 350;

        doc.fontSize(9).fillColor('#64748B').text('Subtotal:', summaryX, currentY);
        doc.fillColor('#1E293B').text(`$${Number(quotation.subtotal).toFixed(2)}`, 460, currentY, { width: 85, align: 'right' });
        currentY += 18;

        if (quotation.discountAmount > 0) {
          doc.fillColor('#64748B').text('Discount:', summaryX, currentY);
          doc.fillColor('#16A34A').text(`-$${Number(quotation.discountAmount).toFixed(2)}`, 460, currentY, { width: 85, align: 'right' });
          currentY += 18;
        }

        if (quotation.taxAmount > 0) {
          doc.fillColor('#64748B').text('Tax:', summaryX, currentY);
          doc.fillColor('#1E293B').text(`$${Number(quotation.taxAmount).toFixed(2)}`, 460, currentY, { width: 85, align: 'right' });
          currentY += 18;
        }

        doc.rect(summaryX - 10, currentY, 215, 24).fill('#F8FAFC');
        doc.fontSize(11).fillColor('#1E293B').text('Total Quote:', summaryX, currentY + 6);
        doc.text(`$${Number(quotation.totalAmount).toFixed(2)}`, 460, currentY + 6, { width: 85, align: 'right' });

        if (quotation.terms) {
          currentY += 45;
          doc.fontSize(9).fillColor('#1E293B').text('Terms & Conditions:', 40, currentY);
          doc.fontSize(8).fillColor('#64748B').text(quotation.terms, 40, currentY + 14, { width: 515 });
        }

        doc.fontSize(8).fillColor('#94A3B8').text(
          'To accept this quotation, please reach out to our sales department.',
          40,
          780,
          { align: 'center', width: 515 }
        );

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Generates a professional Payment Receipt PDF
   */
  public static async generateReceiptPdf(payment: any, invoice: any, customer: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        const buffers: Buffer[] = [];

        doc.on('data', (chunk) => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', (err) => reject(err));

        // Company Header
        doc.fontSize(20).fillColor('#1E293B').text(env.COMPANY_NAME, 40, 40);
        doc.fontSize(9).fillColor('#64748B')
          .text(env.COMPANY_ADDRESS, 40, 68)
          .text(`Email: ${env.COMPANY_EMAIL}`, 40, 80);

        // Receipt Title
        doc.fontSize(22).fillColor('#16A34A').text('RECEIPT', 400, 40, { align: 'right' });
        doc.fontSize(9).fillColor('#334155')
          .text(`Receipt #: ${payment.paymentNumber}`, 400, 68, { align: 'right' })
          .text(`Payment Date: ${new Date(payment.paymentDate).toLocaleDateString()}`, 400, 80, { align: 'right' })
          .text(`Status: ${payment.status}`, 400, 92, { align: 'right' });

        doc.moveTo(40, 125).lineTo(555, 125).strokeColor('#E2E8F0').stroke();

        doc.fontSize(11).fillColor('#1E293B').text('Received From:', 40, 140);
        doc.fontSize(10).fillColor('#334155')
          .text(customer?.name || 'Customer', 40, 155)
          .text(customer?.companyName || '', 40, 168)
          .text(customer?.email || '', 40, 181);

        const boxTop = 220;
        doc.rect(40, boxTop, 515, 130).fill('#F8FAFC');
        doc.rect(40, boxTop, 515, 130).strokeColor('#E2E8F0').stroke();

        doc.fontSize(10).fillColor('#475569')
          .text('Payment Details', 60, boxTop + 15)
          .text('Invoice Ref:', 60, boxTop + 40)
          .text('Payment Method:', 60, boxTop + 60)
          .text('Transaction Ref:', 60, boxTop + 80)
          .text('Amount Paid:', 60, boxTop + 100);

        doc.fillColor('#0F172A')
          .text(invoice?.invoiceNumber || 'N/A', 200, boxTop + 40)
          .text(payment.paymentMethod, 200, boxTop + 60)
          .text(payment.transactionReference, 200, boxTop + 80);

        doc.fontSize(14).fillColor('#16A34A')
          .text(`$${Number(payment.amount).toFixed(2)} ${payment.currency}`, 200, boxTop + 98);

        doc.fontSize(8).fillColor('#94A3B8').text(
          'This receipt confirms payment received. Keep this for your financial records.',
          40,
          780,
          { align: 'center', width: 515 }
        );

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}

