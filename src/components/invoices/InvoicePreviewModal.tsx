import React from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Invoice } from '@/types';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Printer, Download, Send, CheckCircle2, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

interface InvoicePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onConfirmInvoice?: (id: string) => void;
  onCancelInvoice?: (id: string) => void;
}

export const InvoicePreviewModal: React.FC<InvoicePreviewModalProps> = ({
  isOpen,
  onClose,
  invoice,
  onConfirmInvoice,
  onCancelInvoice,
}) => {
  const { success, info } = useToast();

  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    info('PDF Generation UI Integration Point', `Invoice ${invoice.invoiceNumber}.pdf downloaded.`);
  };

  const handleSendInvoice = () => {
    success('Invoice Sent', `Dispatched invoice to ${invoice.customerEmail} with online payment link.`);
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} size="xl">
      <div className="space-y-6">
        {/* Action Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 no-print">
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-bold text-slate-900">{invoice.invoiceNumber}</h3>
            <StatusBadge status={invoice.status} />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="w-3.5 h-3.5 mr-1.5" />
              Print
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Download PDF
            </Button>
            <Button variant="outline" size="sm" onClick={handleSendInvoice}>
              <Send className="w-3.5 h-3.5 mr-1.5" />
              Send to Client
            </Button>

            {invoice.status === 'Draft' && onConfirmInvoice && (
              <Button variant="primary" size="sm" onClick={() => onConfirmInvoice(invoice.id)}>
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                Confirm Invoice
              </Button>
            )}

            {invoice.status !== 'Cancelled' && invoice.status !== 'Paid' && onCancelInvoice && (
              <Button variant="danger" size="sm" onClick={() => onCancelInvoice(invoice.id)}>
                <XCircle className="w-3.5 h-3.5 mr-1.5" />
                Cancel
              </Button>
            )}
          </div>
        </div>

        {/* Professional SaaS Tax Invoice Document */}
        <div className="p-6 sm:p-8 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-8">
          {/* Top Brand & Metadata */}
          <div className="flex flex-col sm:flex-row justify-between gap-6 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                  BL
                </div>
                <span className="text-lg font-bold text-slate-900">Brightloop Software</span>
              </div>
              <p className="text-xs text-slate-500">Brightloop Software Technologies Pvt Ltd</p>
              <p className="text-xs text-slate-500">Cyber City, DLF Phase 2, Gurugram 122002</p>
              <p className="text-xs text-slate-500 mt-1">GSTIN: <span className="font-mono text-slate-700">06AAACU4921N1ZM</span></p>
            </div>

            <div className="sm:text-right">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tax Invoice</span>
              <h2 className="text-xl font-bold text-slate-900 mt-0.5">{invoice.invoiceNumber}</h2>
              <div className="mt-2 text-xs text-slate-500 space-y-0.5">
                <p>Invoice Date: <span className="font-semibold text-slate-700">{formatDate(invoice.invoiceDate)}</span></p>
                <p>Payment Due: <span className="font-semibold text-slate-700">{formatDate(invoice.dueDate)}</span></p>
                {invoice.paymentMethod && (
                  <p>Payment Method: <span className="font-semibold text-slate-700">{invoice.paymentMethod}</span></p>
                )}
              </div>
            </div>
          </div>

          {/* Bill To Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Billed To:
              </span>
              <p className="font-bold text-slate-800 text-sm">{invoice.customerName}</p>
              <p className="text-slate-600 mt-0.5">{invoice.customerEmail}</p>
              {invoice.subscriptionId && (
                <p className="text-[11px] text-blue-600 font-medium mt-1">
                  Subscription Ref: {invoice.subscriptionId}
                </p>
              )}
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Payment Status:
                </span>
                <div className="flex items-center gap-2">
                  <StatusBadge status={invoice.status} />
                  {invoice.outstandingAmount > 0 && (
                    <span className="text-xs text-rose-600 font-medium">
                      ({formatCurrency(invoice.outstandingAmount)} due)
                    </span>
                  )}
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                All payments processed through Brightloop Automated Clearing Engine.
              </p>
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75">
                  <th className="py-2.5 px-3 font-semibold text-slate-600">Item Description</th>
                  <th className="py-2.5 px-3 font-semibold text-slate-600 text-center">Qty</th>
                  <th className="py-2.5 px-3 font-semibold text-slate-600 text-right">Unit Price</th>
                  <th className="py-2.5 px-3 font-semibold text-slate-600 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 px-3 font-medium text-slate-800">{item.description}</td>
                    <td className="py-3 px-3 text-center text-slate-600">{item.quantity}</td>
                    <td className="py-3 px-3 text-right text-slate-600">{formatCurrency(item.unitPrice)}</td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Breakdown & Totals */}
          <div className="flex justify-end pt-4 border-t border-slate-100">
            <div className="w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-800">{formatCurrency(invoice.subtotal)}</span>
              </div>
              {invoice.discountAmount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Discount:</span>
                  <span className="font-semibold">-{formatCurrency(invoice.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>GST Tax (18%):</span>
                <span className="font-semibold text-slate-800">+{formatCurrency(invoice.taxAmount)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Amount:</span>
                <span className="text-blue-700">{formatCurrency(invoice.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-xs text-emerald-700 font-semibold">
                <span>Amount Paid:</span>
                <span>{formatCurrency(invoice.amountPaid)}</span>
              </div>
              <div className="flex justify-between text-xs text-rose-700 font-bold pt-1 border-t border-slate-100">
                <span>Outstanding Balance:</span>
                <span>{formatCurrency(invoice.outstandingAmount)}</span>
              </div>
            </div>
          </div>

          {invoice.notes && (
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Payment Notes: </span>
              {invoice.notes}
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
};

