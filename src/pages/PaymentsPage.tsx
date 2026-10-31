import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsApi } from '@/api/payments.api';
import { customersApi } from '@/api/customers.api';
import { invoicesApi } from '@/api/invoices.api';
import { Payment, PaymentMethod } from '@/types';
import { PageHeader } from '@/components/common/PageHeader';
import { SearchInput } from '@/components/common/SearchInput';
import { FilterDropdown } from '@/components/common/FilterDropdown';
import { DataTable, Column } from '@/components/common/DataTable';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { RecordPaymentModal } from '@/components/payments/RecordPaymentModal';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import { useToast } from '@/hooks/useToast';
import { Plus, CreditCard, ArrowDownRight } from 'lucide-react';

export const PaymentsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');
  const [isRecordOpen, setIsRecordOpen] = useState(false);

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: () => paymentsApi.getAll(),
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customersApi.getAll(),
  });

  const { data: invoices = [] } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => invoicesApi.getAll(),
  });

  const recordMutation = useMutation({
    mutationFn: (data: any) => paymentsApi.recordPayment(data),
    onSuccess: (p) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['overviewMetrics'] });
      setIsRecordOpen(false);
      success('Payment Recorded', `Transaction ${p.transactionId} (${formatCurrency(p.amount)}) confirmed.`);
    },
    onError: () => error('Error', 'Failed to record payment transaction.'),
  });

  const filteredPayments = payments.filter((pay) => {
    const matchesSearch =
      pay.transactionId.toLowerCase().includes(search.toLowerCase()) ||
      pay.customerName.toLowerCase().includes(search.toLowerCase()) ||
      pay.invoiceNumber.toLowerCase().includes(search.toLowerCase());
    const matchesMethod = methodFilter === 'all' || pay.paymentMethod === methodFilter;
    return matchesSearch && matchesMethod;
  });

  const columns: Column<Payment>[] = [
    {
      key: 'transactionId',
      header: 'Transaction ID',
      sortable: true,
      render: (row) => (
        <span className="font-semibold text-slate-900 font-mono text-xs">{row.transactionId}</span>
      ),
    },
    {
      key: 'customerName',
      header: 'Customer',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-900 block">{row.customerName}</span>
          {row.notes && <span className="text-[11px] text-slate-400 line-clamp-1">{row.notes}</span>}
        </div>
      ),
    },
    {
      key: 'invoiceNumber',
      header: 'Invoice Reference',
      sortable: true,
      render: (row) => (
        <span className="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
          {row.invoiceNumber}
        </span>
      ),
    },
    {
      key: 'paymentMethod',
      header: 'Method',
      sortable: true,
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-700 font-medium">
          <CreditCard className="w-3.5 h-3.5 text-slate-400" />
          {row.paymentMethod}
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount Paid',
      align: 'right',
      sortable: true,
      render: (row) => (
        <span className="font-bold text-emerald-700">+{formatCurrency(row.amount)}</span>
      ),
    },
    {
      key: 'paymentDate',
      header: 'Payment Date',
      sortable: true,
      render: (row) => <span className="text-xs text-slate-600">{formatDateTime(row.paymentDate)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment Receipts & Clearing"
        description="Audit multi-channel payments, reconcile invoice balances, and track settled collections."
        actions={
          <Button size="sm" onClick={() => setIsRecordOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            Record Payment
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by transaction ID, customer, or invoice..."
        />

        <FilterDropdown
          label="Method"
          selectedValue={methodFilter}
          onChange={setMethodFilter}
          options={[
            { label: 'All Methods', value: 'all' },
            { label: 'Credit / Debit Card', value: 'Card' },
            { label: 'Online Payment (UPI)', value: 'Online Payment' },
            { label: 'Bank Transfer (NEFT)', value: 'Bank Transfer' },
            { label: 'Cash Receipt', value: 'Cash' },
          ]}
        />
      </div>

      <DataTable
        columns={columns}
        data={filteredPayments}
        keyExtractor={(p) => p.id}
        isLoading={isLoading}
        emptyTitle="No payments recorded"
        emptyDescription="Record inbound cash, bank transfers, or card settlements."
        emptyActionText="Record Payment"
        onEmptyAction={() => setIsRecordOpen(true)}
      />

      <RecordPaymentModal
        isOpen={isRecordOpen}
        onClose={() => setIsRecordOpen(false)}
        onSubmit={(data) => recordMutation.mutate(data)}
        customers={customers}
        invoices={invoices}
        isLoading={recordMutation.isPending}
      />
    </div>
  );
};

