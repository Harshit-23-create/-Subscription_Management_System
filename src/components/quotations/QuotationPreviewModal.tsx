import React from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Quotation } from '@/types';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Printer, Repeat, CheckCircle } from 'lucide-react';

interface QuotationPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotation: Quotation | null;
  onConvertToSubscription: (quotationId: string) => void;
  isConverting?: boolean;
}

export const QuotationPreviewModal: React.FC<QuotationPreviewModalProps> = ({
  isOpen,
  onClose,
  quotation,
  onConvertToSubscription,
  isConverting = false,
}) => {
  if (!quotation) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} size="xl">
      <div className="space-y-6">
        {/* Top Action Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 no-print">
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-bold text-slate-900">{quotation.quotationNumber}</h3>
            <StatusBadge status={quotation.status} />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="w-3.5 h-3.5 mr-1.5" />
              Print
            </Button>
            {quotation.status !== 'converted' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onConvertToSubscription(quotation.id)}
                isLoading={isConverting}
              >
                <Repeat className="w-3.5 h-3.5 mr-1.5" />
                Convert to Subscription
              </Button>
            )}
            {quotation.status === 'converted' && (
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" />
                Converted to Subscription
              </span>
            )}
          </div>
        </div>

        {/* Printable Quotation Sheet */}
        <div className="p-6 sm:p-8 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between gap-6 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
                  BL
                </div>
                <span className="text-lg font-bold text-slate-900">Brightloop Software</span>
              </div>
              <p className="text-xs text-slate-500">Global Cloud & Subscription Infrastructure</p>
              <p className="text-xs text-slate-500">CIN: U72200KA2023PTC174829 | GSTIN: 29AABCU9834L1ZN</p>
            </div>

            <div className="sm:text-right">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Quotation</span>
              <h2 className="text-xl font-bold text-slate-900 mt-0.5">{quotation.quotationNumber}</h2>
              <div className="mt-2 text-xs text-slate-500 space-y-0.5">
                <p>Issue Date: <span className="font-semibold text-slate-700">{formatDate(quotation.date)}</span></p>
                <p>Valid Until: <span className="font-semibold text-slate-700">{formatDate(quotation.expirationDate)}</span></p>
              </div>
            </div>
          </div>

          {/* Client Recipient */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Prepared For:
              </span>
              <p className="font-bold text-slate-800 text-sm">{quotation.customerName}</p>
              <p className="text-slate-600 mt-0.5">{quotation.customerEmail}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Commercial Summary:
              </span>
              <p className="text-slate-600">Standard Net-30 Subscription Term</p>
              <p className="text-slate-600 mt-0.5">Conversion will automatically initiate recurring billing.</p>
            </div>
          </div>

          {/* Line items table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75">
                  <th className="py-2.5 px-3 font-semibold text-slate-600">Product Line</th>
                  <th className="py-2.5 px-3 font-semibold text-slate-600 text-center">Qty</th>
                  <th className="py-2.5 px-3 font-semibold text-slate-600 text-right">Unit Price</th>
                  <th className="py-2.5 px-3 font-semibold text-slate-600 text-right">Disc %</th>
                  <th className="py-2.5 px-3 font-semibold text-slate-600 text-right">Tax %</th>
                  <th className="py-2.5 px-3 font-semibold text-slate-600 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quotation.lines.map((l) => (
                  <tr key={l.id}>
                    <td className="py-3 px-3">
                      <p className="font-semibold text-slate-800">{l.productName}</p>
                      {l.variantName && <p className="text-[11px] text-slate-400">{l.variantName}</p>}
                    </td>
                    <td className="py-3 px-3 text-center">{l.quantity}</td>
                    <td className="py-3 px-3 text-right">{formatCurrency(l.unitPrice)}</td>
                    <td className="py-3 px-3 text-right text-rose-600">
                      {l.discountPercent > 0 ? `${l.discountPercent}%` : '—'}
                    </td>
                    <td className="py-3 px-3 text-right">{l.taxPercent}%</td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">{formatCurrency(l.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end pt-4 border-t border-slate-100">
            <div className="w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-800">{formatCurrency(quotation.subtotal)}</span>
              </div>
              <div className="flex justify-between text-rose-600">
                <span>Discount:</span>
                <span className="font-semibold">-{formatCurrency(quotation.discountAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST Tax:</span>
                <span className="font-semibold text-slate-800">+{formatCurrency(quotation.taxAmount)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Amount:</span>
                <span className="text-blue-700">{formatCurrency(quotation.totalAmount)}</span>
              </div>
            </div>
          </div>

          {quotation.notes && (
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Terms & Conditions: </span>
              {quotation.notes}
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
};

