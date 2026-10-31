import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quotationsApi } from '@/api/quotations.api';
import { customersApi } from '@/api/customers.api';
import { productsApi } from '@/api/products.api';
import { Quotation } from '@/types';
import { PageHeader } from '@/components/common/PageHeader';
import { SearchInput } from '@/components/common/SearchInput';
import { FilterDropdown } from '@/components/common/FilterDropdown';
import { DataTable, Column } from '@/components/common/DataTable';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { Dropdown } from '@/components/ui/dropdown';
import { QuotationModal } from '@/components/quotations/QuotationModal';
import { QuotationPreviewModal } from '@/components/quotations/QuotationPreviewModal';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { useToast } from '@/hooks/useToast';
import { Plus, MoreHorizontal, Eye, Repeat, FileCheck, Calendar, ArrowRight } from 'lucide-react';

export const QuotationsPage: React.FC = () => {
  const location = useLocation();
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [previewQuotation, setPreviewQuotation] = useState<Quotation | null>(null);

  useEffect(() => {
    if ((location.state as any)?.openCreate) {
      setIsCreateOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const { data: quotations = [], isLoading } = useQuery({
    queryKey: ['quotations'],
    queryFn: () => quotationsApi.getAll(),
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customersApi.getAll(),
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsApi.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => quotationsApi.create(data),
    onSuccess: (q) => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      setIsCreateOpen(false);
      success('Quotation Created', `${q.quotationNumber} generated for ${q.customerName}.`);
    },
    onError: () => error('Error', 'Failed to generate quotation.'),
  });

  const convertMutation = useMutation({
    mutationFn: (id: string) => quotationsApi.convertToSubscription(id),
    onSuccess: (newSub) => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      if (previewQuotation) {
        setPreviewQuotation({ ...previewQuotation, status: 'converted' });
      }
      success(
        'Converted to Subscription',
        `Contract created as ${newSub.subscriptionNumber} (${newSub.status})`
      );
    },
    onError: () => error('Error', 'Failed to convert quotation.'),
  });

  const filteredQuotations = quotations.filter((q) => {
    const matchesSearch =
      q.quotationNumber.toLowerCase().includes(search.toLowerCase()) ||
      q.customerName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns: Column<Quotation>[] = [
    {
      key: 'quotationNumber',
      header: 'Quotation #',
      sortable: true,
      render: (row) => (
        <span className="font-semibold text-slate-900 font-mono text-xs">{row.quotationNumber}</span>
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
      key: 'date',
      header: 'Issue Date',
      sortable: true,
      render: (row) => <span className="text-xs text-slate-600">{formatDate(row.date)}</span>,
    },
    {
      key: 'expirationDate',
      header: 'Valid Until',
      sortable: true,
      render: (row) => (
        <span className="text-xs text-slate-600 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          {formatDate(row.expirationDate)}
        </span>
      ),
    },
    {
      key: 'totalAmount',
      header: 'Total Value',
      align: 'right',
      sortable: true,
      render: (row) => (
        <span className="font-bold text-slate-900">{formatCurrency(row.totalAmount)}</span>
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
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-2 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              setPreviewQuotation(row);
            }}
          >
            <Eye className="w-3.5 h-3.5 mr-1 text-slate-400" />
            Preview
          </Button>

          {row.status !== 'converted' ? (
            <Button
              variant="primary"
              size="sm"
              className="h-8 px-2.5 text-xs font-semibold"
              onClick={(e) => {
                e.stopPropagation();
                convertMutation.mutate(row.id);
              }}
              isLoading={convertMutation.isPending}
            >
              <Repeat className="w-3.5 h-3.5 mr-1" />
              Convert
            </Button>
          ) : (
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
              Active Sub
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Commercial Quotations"
        description="Draft pricing proposals, configure custom enterprise discounts, and convert accepted deals directly to recurring subscriptions."
        actions={
          <Button size="sm" onClick={() => setIsCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            New Quotation
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by quotation number or customer..."
        />

        <FilterDropdown
          label="Status"
          selectedValue={statusFilter}
          onChange={setStatusFilter}
          options={[
            { label: 'All Quotations', value: 'all' },
            { label: 'Draft', value: 'draft' },
            { label: 'Sent', value: 'sent' },
            { label: 'Accepted', value: 'accepted' },
            { label: 'Converted to Sub', value: 'converted' },
          ]}
        />
      </div>

      <DataTable
        columns={columns}
        data={filteredQuotations}
        keyExtractor={(q) => q.id}
        isLoading={isLoading}
        onRowClick={(row) => setPreviewQuotation(row)}
        emptyTitle="No quotations found"
        emptyDescription="Create commercial quotations to negotiate contracts with potential clients."
        emptyActionText="Create Quotation"
        onEmptyAction={() => setIsCreateOpen(true)}
      />

      {/* Create Quotation Modal */}
      <QuotationModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={(data) => createMutation.mutate(data)}
        customers={customers}
        products={products}
        isLoading={createMutation.isPending}
      />

      {/* Quotation Preview Modal with Convert Action */}
      <QuotationPreviewModal
        isOpen={!!previewQuotation}
        onClose={() => setPreviewQuotation(null)}
        quotation={previewQuotation}
        onConvertToSubscription={(id) => convertMutation.mutate(id)}
        isConverting={convertMutation.isPending}
      />
    </div>
  );
};

