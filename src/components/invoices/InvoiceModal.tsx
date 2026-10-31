import React, { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input, Select, Textarea, Label } from '@/components/ui/input';
import { Customer, Invoice, InvoiceItem } from '@/types';
import { Plus, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Invoice, 'id' | 'invoiceNumber'>) => void;
  customers: Customer[];
  isLoading?: boolean;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  customers,
  isLoading = false,
}) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [discountAmount, setDiscountAmount] = useState(0);
  const [notes, setNotes] = useState('Payment due within 15 days of invoice date.');

  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: `item-${Date.now()}-1`,
      description: 'SmartCare Monthly Recurring Subscription',
      quantity: 1,
      unitPrice: 1999,
      total: 1999,
    },
  ]);

  const handleItemChange = (index: number, field: keyof InvoiceItem, val: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: val };
    const qty = Number(updated[index].quantity) || 1;
    const price = Number(updated[index].unitPrice) || 0;
    updated[index].total = Number((qty * price).toFixed(2));
    setItems(updated);
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: `item-${Date.now()}`,
        description: 'Add-on Feature Module',
        quantity: 1,
        unitPrice: 500,
        total: 500,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((acc, it) => acc + it.total, 0);
  const taxAmount = Number(((subtotal - discountAmount) * 0.18).toFixed(2));
  const totalAmount = Number((subtotal - discountAmount + taxAmount).toFixed(2));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === selectedCustomerId);
    if (!cust) return;

    onSubmit({
      customerId: cust.id,
      customerName: cust.name,
      customerEmail: cust.email,
      invoiceDate,
      dueDate,
      status: 'Confirmed',
      items,
      subtotal,
      discountAmount,
      taxAmount,
      totalAmount,
      amountPaid: 0,
      outstandingAmount: totalAmount,
      notes,
    });
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Create Tax Invoice"
      description="Issue official invoice with GST breakdown and scheduled due dates."
      size="xl"
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
            <Label required>Invoice Date</Label>
            <Input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} required />
          </div>
          <div>
            <Label required>Due Date</Label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
          </div>
        </div>

        {/* Invoice Items */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Line Items</h4>
            <Button type="button" variant="outline" size="sm" onClick={handleAddItem} className="h-7 text-xs">
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Item
            </Button>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {items.map((item, idx) => (
              <div key={item.id} className="grid grid-cols-12 gap-2 p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl items-center text-xs">
                <div className="col-span-12 sm:col-span-6">
                  <Input
                    value={item.description}
                    onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                    placeholder="Description"
                    className="h-8 text-xs bg-white"
                  />
                </div>
                <div className="col-span-4 sm:col-span-2">
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))}
                    placeholder="Qty"
                    className="h-8 text-xs bg-white"
                  />
                </div>
                <div className="col-span-4 sm:col-span-2">
                  <Input
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) => handleItemChange(idx, 'unitPrice', Number(e.target.value))}
                    placeholder="Price"
                    className="h-8 text-xs bg-white"
                  />
                </div>
                <div className="col-span-3 sm:col-span-1 text-right font-bold text-slate-900">
                  {formatCurrency(item.total)}
                </div>
                <div className="col-span-1 text-right">
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    disabled={items.length <= 1}
                    className="text-slate-400 hover:text-rose-600 disabled:opacity-30 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex-1">
            <Label>Invoice Terms & Payment Notes</Label>
            <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <div className="w-full sm:w-60 space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Discount (₹):</span>
              <input
                type="number"
                min="0"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(Number(e.target.value))}
                className="w-20 text-right h-6 px-1.5 border border-slate-200 rounded text-xs"
              />
            </div>
            <div className="flex justify-between">
              <span>GST Tax (18%):</span>
              <span className="font-semibold text-slate-900">+{formatCurrency(taxAmount)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-200 font-bold text-sm text-slate-900">
              <span>Total:</span>
              <span className="text-blue-700">{formatCurrency(totalAmount)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" size="sm" isLoading={isLoading}>
            Issue Invoice
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

