import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { invoicesApi } from '@/api/invoices.api';
import { portalApi } from '@/api/portal.api';
import { Invoice } from '@/types';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable, Column } from '@/components/common/DataTable';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { InvoicePreviewModal } from '@/components/invoices/InvoicePreviewModal';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Eye, Download, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

export const CustomerInvoicesPage: React.FC = () => {
  const { user } = useAuth();
  const customerId = user?.customerId || 'cust-1';
  const { info } = useToast();

  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['customerInvoices', customerId],
    queryFn: async () => {
      try {
        return await portalApi.getInvoices();
      } catch {
        const all = await invoicesApi.getAll();
        return all.filter((i) => i.customerId === customerId);
      }
    },
  });

  const columns: Column<Invoice>[] = [
    {
      key: 'invoiceNumber',
      header: 'Invoice #',
      sortable: true,
      render: (r) => <span className="font-mono font-semibold text-slate-900">{r.invoiceNumber}</span>,
    },
    {
      key: 'invoiceDate',
      header: 'Invoice Date',
      render: (r) => <span className="text-xs text-slate-600">{formatDate(r.invoiceDate)}</span>,
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      render: (r) => <span className="text-xs text-slate-600">{formatDate(r.dueDate)}</span>,
    },
    {
      key: 'totalAmount',
      header: 'Total Amount',
      align: 'right',
      sortable: true,
      render: (r) => <span className="font-bold text-slate-900">{formatCurrency(r.totalAmount)}</span>,
    },
    {
      key: 'outstandingAmount',
      header: 'Balance Due',
      align: 'right',
      render: (r) => (
        <span className={r.outstandingAmount > 0 ? 'font-bold text-rose-600' : 'text-slate-400 font-medium'}>
          {formatCurrency(r.outstandingAmount)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (r) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button variant="outline" size="sm" onClick={() => setPreviewInvoice(r)} className="h-8 px-2 text-xs">
            <Eye className="w-3.5 h-3.5 mr-1" />
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => invoicesApi.downloadPdf(r.id, r.invoiceNumber)}
            className="h-8 px-2 text-xs text-slate-600 hover:text-blue-600"
            title="Download PDF Invoice"
          >
            <Download className="w-3.5 h-3.5" />
          </Button>
          {r.outstandingAmount > 0 && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => info('Pay Invoice UI', `Redirecting to payment checkout for ${r.invoiceNumber}`)}
              className="h-8 px-2.5 text-xs font-semibold"
            >
              <CreditCard className="w-3.5 h-3.5 mr-1" />
              Pay Now
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Billing & Invoices"
        description="Inspect electronic GST invoices, download receipts, and settle outstanding balances."
      />

      <DataTable
        columns={columns}
        data={invoices}
        keyExtractor={(i) => i.id}
        isLoading={isLoading}
        onRowClick={(row) => setPreviewInvoice(row)}
        emptyTitle="No invoices found"
        emptyDescription="Your billing history is currently clear."
      />

      {/* Invoice Preview */}
      <InvoicePreviewModal
        isOpen={!!previewInvoice}
        onClose={() => setPreviewInvoice(null)}
        invoice={previewInvoice}
      />
    </div>
  );
};

