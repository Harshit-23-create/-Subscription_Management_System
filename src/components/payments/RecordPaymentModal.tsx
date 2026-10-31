import React, { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input, Select, Textarea, Label } from '@/components/ui/input';
import { Customer, Invoice, Payment, PaymentMethod, PaymentStatus } from '@/types';
import { formatCurrency } from '@/utils/formatters';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Payment, 'id' | 'transactionId' | 'paymentDate'>) => void;
  customers: Customer[];
  invoices: Invoice[];
  isLoading?: boolean;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  customers,
  invoices,
  isLoading = false,
}) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [amount, setAmount] = useState(1999);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Card');
  const [status, setStatus] = useState<PaymentStatus>('Success');
  const [notes, setNotes] = useState('Payment confirmed via payment gateway');

  // Filter invoices for selected customer
  const customerInvoices = invoices.filter((i) => i.customerId === selectedCustomerId && i.status !== 'Paid');

  useEffect(() => {
    if (customerInvoices.length > 0) {
      setSelectedInvoiceId(customerInvoices[0].id);
      setAmount(customerInvoices[0].outstandingAmount);
    } else {
      setSelectedInvoiceId('');
      setAmount(1000);
    }
  }, [selectedCustomerId, invoices]);

  const handleInvoiceSelect = (invId: string) => {
    setSelectedInvoiceId(invId);
    const inv = invoices.find((i) => i.id === invId);
    if (inv) {
      setAmount(inv.outstandingAmount > 0 ? inv.outstandingAmount : inv.totalAmount);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === selectedCustomerId);
    const inv = invoices.find((i) => i.id === selectedInvoiceId);

    onSubmit({
      invoiceId: selectedInvoiceId || (invoices[0]?.id ?? 'inv-gen'),
      invoiceNumber: inv?.invoiceNumber || 'INV-DIRECT',
      customerId: selectedCustomerId,
      customerName: cust?.name || 'Customer',
      amount: Number(amount),
      paymentMethod,
      status,
      notes,
    });
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Record Payment Receipt"
      description="Register customer payment transaction and automatically balance pending invoices."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
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
          <Label>Invoice Reference (Optional)</Label>
          <Select value={selectedInvoiceId} onChange={(e) => handleInvoiceSelect(e.target.value)}>
            <option value="">No invoice / Account credit</option>
            {customerInvoices.map((inv) => (
              <option key={inv.id} value={inv.id}>
                {inv.invoiceNumber} — Outstanding: {formatCurrency(inv.outstandingAmount)} (Due {inv.dueDate})
              </option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label required>Amount Received (₹)</Label>
            <Input
              type="number"
              step="10"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              required
            />
          </div>
          <div>
            <Label required>Payment Method</Label>
            <Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}>
              <option value="Card">Credit / Debit Card</option>
              <option value="Online Payment">Online Payment / UPI</option>
              <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
              <option value="Cash">Cash Receipt</option>
            </Select>
          </div>
        </div>

        <div>
          <Label required>Payment Status</Label>
          <Select value={status} onChange={(e) => setStatus(e.target.value as PaymentStatus)}>
            <option value="Success">Success (Settled)</option>
            <option value="Pending">Pending Clearance</option>
            <option value="Failed">Failed / Declined</option>
          </Select>
        </div>

        <div>
          <Label>Transaction Notes / Bank Reference</Label>
          <Textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="UTR number, transaction reference code, check number..."
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" size="sm" isLoading={isLoading}>
            Record Payment
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

