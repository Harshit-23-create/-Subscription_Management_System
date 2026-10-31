import React, { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input, Select, Textarea, Label } from '@/components/ui/input';
import { Customer, Product, Quotation, QuotationLineItem } from '@/types';
import { Plus, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

interface QuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Quotation, 'id' | 'quotationNumber'>) => void;
  customers: Customer[];
  products: Product[];
  isLoading?: boolean;
}

export const QuotationModal: React.FC<QuotationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  customers,
  products,
  isLoading = false,
}) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [expirationDate, setExpirationDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('Standard enterprise onboarding terms apply. Quotation valid for 30 days.');

  const [lines, setLines] = useState<QuotationLineItem[]>([
    {
      id: `ql-${Date.now()}-1`,
      productId: products[0]?.id || 'prod-1',
      productName: products[0]?.name || 'SmartCare Suite',
      variantName: products[0]?.variants[1]?.name || 'Odoo Brand Integration',
      quantity: 1,
      unitPrice: 1560,
      discountPercent: 10,
      taxPercent: 18,
      total: 1656.72,
    },
  ]);

  const handleProductChange = (index: number, productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    const updated = [...lines];
    const defaultVariant = prod.variants[0];
    const unitPrice = prod.salesPrice + (defaultVariant?.additionalPrice || 0);

    const sub = unitPrice * updated[index].quantity;
    const disc = sub * (updated[index].discountPercent / 100);
    const tax = (sub - disc) * (updated[index].taxPercent / 100);

    updated[index] = {
      ...updated[index],
      productId: prod.id,
      productName: prod.name,
      variantName: defaultVariant?.name || 'Standard',
      unitPrice,
      total: Number((sub - disc + tax).toFixed(2)),
    };
    setLines(updated);
  };

  const handleLineChange = (index: number, field: keyof QuotationLineItem, val: any) => {
    const updated = [...lines];
    updated[index] = { ...updated[index], [field]: val };

    const qty = Number(updated[index].quantity) || 1;
    const price = Number(updated[index].unitPrice) || 0;
    const discPercent = Number(updated[index].discountPercent) || 0;
    const taxPercent = Number(updated[index].taxPercent) || 0;

    const sub = price * qty;
    const disc = sub * (discPercent / 100);
    const tax = (sub - disc) * (taxPercent / 100);

    updated[index].total = Number((sub - disc + tax).toFixed(2));
    setLines(updated);
  };

  const handleAddLine = () => {
    const prod = products[0];
    const unitPrice = prod ? prod.salesPrice : 1000;
    const disc = 0;
    const tax = unitPrice * 0.18;

    setLines([
      ...lines,
      {
        id: `ql-${Date.now()}`,
        productId: prod?.id || 'prod-1',
        productName: prod?.name || 'SaaS Product',
        variantName: prod?.variants[0]?.name || 'Standard',
        quantity: 1,
        unitPrice,
        discountPercent: 0,
        taxPercent: 18,
        total: Number((unitPrice + tax).toFixed(2)),
      },
    ]);
  };

  const handleRemoveLine = (index: number) => {
    if (lines.length <= 1) return;
    setLines(lines.filter((_, i) => i !== index));
  };

  // Summary calculations
  const subtotal = lines.reduce((acc, l) => acc + l.quantity * l.unitPrice, 0);
  const discountAmount = lines.reduce(
    (acc, l) => acc + l.quantity * l.unitPrice * (l.discountPercent / 100),
    0
  );
  const taxAmount = lines.reduce(
    (acc, l) =>
      acc + (l.quantity * l.unitPrice - l.quantity * l.unitPrice * (l.discountPercent / 100)) * (l.taxPercent / 100),
    0
  );
  const totalAmount = Number((subtotal - discountAmount + taxAmount).toFixed(2));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === selectedCustomerId);
    if (!cust) return;

    onSubmit({
      customerId: cust.id,
      customerName: cust.name,
      customerEmail: cust.email,
      date,
      expirationDate,
      status: 'draft',
      lines,
      subtotal: Number(subtotal.toFixed(2)),
      discountAmount: Number(discountAmount.toFixed(2)),
      taxAmount: Number(taxAmount.toFixed(2)),
      totalAmount,
      notes,
    });
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Create Commercial Quotation"
      description="Draft customized subscription proposals with multi-item line configurations, discounts, and GST."
      size="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label required>Customer</Label>
            <Select value={selectedCustomerId} onChange={(e) => setSelectedCustomerId(e.target.value)}>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.company})
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label required>Quotation Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div>
            <Label required>Expiration Date</Label>
            <Input type="date" value={expirationDate} onChange={(e) => setExpirationDate(e.target.value)} required />
          </div>
        </div>

        {/* Product Lines Builder */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Product Line Items</h4>
            <Button type="button" variant="outline" size="sm" onClick={handleAddLine} className="h-7 text-xs">
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Product Line
            </Button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {lines.map((line, idx) => (
              <div key={line.id} className="grid grid-cols-12 gap-2 p-3 bg-slate-50 border border-slate-200/80 rounded-xl items-center text-xs">
                <div className="col-span-12 sm:col-span-4">
                  <span className="text-[10px] text-slate-400 font-medium">Product</span>
                  <Select
                    value={line.productId}
                    onChange={(e) => handleProductChange(idx, e.target.value)}
                    className="h-8 text-xs bg-white"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="col-span-4 sm:col-span-2">
                  <span className="text-[10px] text-slate-400 font-medium">Qty</span>
                  <Input
                    type="number"
                    min="1"
                    value={line.quantity}
                    onChange={(e) => handleLineChange(idx, 'quantity', Number(e.target.value))}
                    className="h-8 text-xs bg-white"
                  />
                </div>
                <div className="col-span-4 sm:col-span-2">
                  <span className="text-[10px] text-slate-400 font-medium">Price (₹)</span>
                  <Input
                    type="number"
                    value={line.unitPrice}
                    onChange={(e) => handleLineChange(idx, 'unitPrice', Number(e.target.value))}
                    className="h-8 text-xs bg-white"
                  />
                </div>
                <div className="col-span-4 sm:col-span-1">
                  <span className="text-[10px] text-slate-400 font-medium">Disc %</span>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={line.discountPercent}
                    onChange={(e) => handleLineChange(idx, 'discountPercent', Number(e.target.value))}
                    className="h-8 text-xs bg-white"
                  />
                </div>
                <div className="col-span-6 sm:col-span-2 text-right">
                  <span className="text-[10px] text-slate-400 font-medium">Total (Tax Incl.)</span>
                  <p className="font-bold text-slate-900 mt-1">{formatCurrency(line.total)}</p>
                </div>
                <div className="col-span-6 sm:col-span-1 text-right sm:text-center">
                  <button
                    type="button"
                    onClick={() => handleRemoveLine(idx)}
                    disabled={lines.length <= 1}
                    className="text-slate-400 hover:text-rose-600 disabled:opacity-30 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Calculation Summary Card */}
        <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex-1">
            <Label>Quotation Notes & Terms</Label>
            <Textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Terms of payment, SLA guarantees..."
            />
          </div>
          <div className="w-full sm:w-64 space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-rose-600">
              <span>Discount:</span>
              <span className="font-semibold">-{formatCurrency(discountAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (18%):</span>
              <span className="font-semibold text-slate-900">+{formatCurrency(taxAmount)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-200 font-bold text-sm text-slate-900">
              <span>Total Amount:</span>
              <span className="text-blue-700">{formatCurrency(totalAmount)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" size="sm" isLoading={isLoading}>
            Generate Quotation
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

