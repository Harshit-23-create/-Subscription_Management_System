import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { paymentsApi } from '@/api/payments.api';
import { portalApi } from '@/api/portal.api';
import { Payment } from '@/types';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable, Column } from '@/components/common/DataTable';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import { CreditCard, Download } from 'lucide-react';

export const CustomerPaymentsPage: React.FC = () => {
  const { user } = useAuth();
  const customerId = user?.customerId || 'cust-1';

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['customerPayments', customerId],
    queryFn: async () => {
      try {
        return await portalApi.getPayments();
      } catch {
        const all = await paymentsApi.getAll();
        return all.filter((p) => p.customerId === customerId);
      }
    },
  });

  const columns: Column<Payment>[] = [
    {
      key: 'transactionId',
      header: 'Transaction ID',
      sortable: true,
      render: (r) => <span className="font-mono font-semibold text-slate-900">{r.transactionId}</span>,
    },
    {
      key: 'invoiceNumber',
      header: 'Invoice Reference',
      render: (r) => (
        <span className="font-mono text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
          {r.invoiceNumber}
        </span>
      ),
    },
    {
      key: 'paymentMethod',
      header: 'Payment Method',
      render: (r) => (
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-700 font-medium">
          <CreditCard className="w-3.5 h-3.5 text-slate-400" />
          {r.paymentMethod}
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount Paid',
      align: 'right',
      sortable: true,
      render: (r) => <span className="font-bold text-emerald-700">+{formatCurrency(r.amount)}</span>,
    },
    {
      key: 'paymentDate',
      header: 'Settlement Date',
      render: (r) => <span className="text-xs text-slate-600">{formatDateTime(r.paymentDate)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: 'actions',
      header: 'Receipt',
      align: 'right',
      render: (r) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => paymentsApi.downloadReceipt(r.id, r.transactionId)}
          className="h-8 px-2 text-xs text-slate-600 hover:text-emerald-700"
          title="Download Official Receipt"
        >
          <Download className="w-3.5 h-3.5 mr-1" />
          Receipt
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Payment Receipts"
        description="Audit cleared transaction records and payment confirmations."
      />

      <DataTable
        columns={columns}
        data={payments}
        keyExtractor={(p) => p.id}
        isLoading={isLoading}
        emptyTitle="No payment records found"
        emptyDescription="Transactions will appear here when invoices are paid."
      />
    </div>
  );
};

