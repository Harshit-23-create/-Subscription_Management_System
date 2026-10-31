import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoicesApi } from '@/api/invoices.api';
import { customersApi } from '@/api/customers.api';
import { Invoice, InvoiceStatus } from '@/types';
import { PageHeader } from '@/components/common/PageHeader';
import { SearchInput } from '@/components/common/SearchInput';
import { FilterDropdown } from '@/components/common/FilterDropdown';
import { DataTable, Column } from '@/components/common/DataTable';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { Dropdown } from '@/components/ui/dropdown';
import { InvoicePreviewModal } from '@/components/invoices/InvoicePreviewModal';
import { InvoiceModal } from '@/components/invoices/InvoiceModal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { useToast } from '@/hooks/useToast';
import {
  Plus,
  MoreHorizontal,
  Eye,
  CheckCircle2,
  XCircle,
  Download,
  Send,
  Calendar,
} from 'lucide-react';

export const InvoicesPage: React.FC = () => {
  const location = useLocation();
  const queryClient = useQueryClient();
  const { success, error, info } = useToast();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [cancellingInvoiceId, setCancellingInvoiceId] = useState<string | null>(null);

  useEffect(() => {
    if ((location.state as any)?.openCreate) {
      setIsCreateOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => invoicesApi.getAll(),
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customersApi.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => invoicesApi.create(data),
    onSuccess: (inv) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setIsCreateOpen(false);
      success('Invoice Issued', `${inv.invoiceNumber} created for ${inv.customerName}.`);
    },
    onError: () => error('Error', 'Failed to generate invoice.'),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: InvoiceStatus }) =>
      invoicesApi.updateStatus(id, status),
    onSuccess: (inv) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      if (previewInvoice?.id === inv.id) setPreviewInvoice(inv);
      setCancellingInvoiceId(null);
      success('Invoice Status Updated', `${inv.invoiceNumber} is now ${inv.status}.`);
    },
    onError: () => error('Error', 'Failed to update invoice.'),
  });

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inv.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const columns: Column<Invoice>[] = [
    {
      key: 'invoiceNumber',
      header: 'Invoice #',
      sortable: true,
      render: (row) => (
        <span className="font-semibold text-slate-900 font-mono text-xs">{row.invoiceNumber}</span>
      ),
    },
    {
      key: 'customerName',
      header: 'Customer',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-900 block">{row.customerName}</span>
          <span className="text-[11px] text-slate-400">{row.customerEmail}</span>
        </div>
      ),
    },
    {
      key: 'invoiceDate',
      header: 'Invoice Date',
      sortable: true,
      render: (row) => <span className="text-xs text-slate-600">{formatDate(row.invoiceDate)}</span>,
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      sortable: true,
      render: (row) => (
        <span className="text-xs text-slate-600 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          {formatDate(row.dueDate)}
        </span>
      ),
    },
    {
      key: 'totalAmount',
      header: 'Total Amount',
      align: 'right',
      sortable: true,
      render: (row) => (
        <span className="font-bold text-slate-900">{formatCurrency(row.totalAmount)}</span>
      ),
    },
    {
      key: 'amountPaid',
      header: 'Amount Paid',
      align: 'right',
      sortable: true,
      render: (row) => (
        <span className="font-medium text-emerald-700">{formatCurrency(row.amountPaid)}</span>
      ),
    },
    {
      key: 'outstandingAmount',
      header: 'Outstanding',
      align: 'right',
      sortable: true,
      render: (row) => (
        <span
          className={
            row.outstandingAmount > 0
              ? 'font-bold text-rose-600'
              : 'text-slate-400 font-medium'
          }
        >
          {formatCurrency(row.outstandingAmount)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-2 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              setPreviewInvoice(row);
            }}
          >
            <Eye className="w-3.5 h-3.5 mr-1 text-slate-400" />
            Preview
          </Button>

          <Dropdown
            align="right"
            trigger={
              <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            }
            items={[
              {
                label: 'View Detailed Preview',
                icon: <Eye className="w-3.5 h-3.5" />,
                onClick: () => setPreviewInvoice(row),
              },
              {
                label: 'Download PDF',
                icon: <Download className="w-3.5 h-3.5" />,
                onClick: () => info('Download PDF Trigger', `Invoice ${row.invoiceNumber}.pdf downloaded.`),
              },
              {
                label: 'Send to Customer',
                icon: <Send className="w-3.5 h-3.5" />,
                onClick: () => success('Invoice Dispatched', `Sent to ${row.customerEmail}`),
              },
              ...(row.status === 'Draft'
                ? [
                    {
                      label: 'Confirm Invoice',
                      icon: <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />,
                      onClick: () => statusMutation.mutate({ id: row.id, status: 'Confirmed' }),
                    },
                  ]
                : []),
              ...(row.status !== 'Cancelled' && row.status !== 'Paid'
                ? [
                    {
                      label: 'Cancel Invoice',
                      icon: <XCircle className="w-3.5 h-3.5 text-rose-500" />,
                      danger: true,
                      onClick: () => setCancellingInvoiceId(row.id),
                    },
                  ]
                : []),
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices & Billing"
        description="Issue professional GST-compliant invoices, track outstanding receivables, and trigger client payment receipts."
        actions={
          <Button size="sm" onClick={() => setIsCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            Create Invoice
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by invoice number or customer..."
        />

        <FilterDropdown
          label="Status"
          selectedValue={statusFilter}
          onChange={setStatusFilter}
          options={[
            { label: 'All Invoices', value: 'all' },
            { label: 'Paid', value: 'Paid' },
            { label: 'Confirmed (Pending)', value: 'Confirmed' },
            { label: 'Overdue', value: 'Overdue' },
            { label: 'Draft', value: 'Draft' },
            { label: 'Cancelled', value: 'Cancelled' },
          ]}
        />
      </div>

      <DataTable
        columns={columns}
        data={filteredInvoices}
        keyExtractor={(i) => i.id}
        isLoading={isLoading}
        onRowClick={(row) => setPreviewInvoice(row)}
        emptyTitle="No invoices found"
        emptyDescription="There are no billing invoices matching your search parameters."
        emptyActionText="Create Invoice"
        onEmptyAction={() => setIsCreateOpen(true)}
      />

      {/* Invoice Creation Modal */}
      <InvoiceModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={(data) => createMutation.mutate(data)}
        customers={customers}
        isLoading={createMutation.isPending}
      />

      {/* Invoice Preview Modal */}
      <InvoicePreviewModal
        isOpen={!!previewInvoice}
        onClose={() => setPreviewInvoice(null)}
        invoice={previewInvoice}
        onConfirmInvoice={(id) => statusMutation.mutate({ id, status: 'Confirmed' })}
        onCancelInvoice={(id) => setCancellingInvoiceId(id)}
      />

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!cancellingInvoiceId}
        onClose={() => setCancellingInvoiceId(null)}
        title="Cancel Invoice"
        message="Are you sure you want to cancel this invoice? Outstanding balance will be zeroed out."
        confirmText="Cancel Invoice"
        variant="danger"
        isLoading={statusMutation.isPending}
        onConfirm={() =>
          cancellingInvoiceId && statusMutation.mutate({ id: cancellingInvoiceId, status: 'Cancelled' })
        }
      />
    </div>
  );
};

