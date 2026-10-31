import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taxesApi } from '@/api/taxes.api';
import { productsApi } from '@/api/products.api';
import { Tax } from '@/types';
import { PageHeader } from '@/components/common/PageHeader';
import { SearchInput } from '@/components/common/SearchInput';
import { DataTable, Column } from '@/components/common/DataTable';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { Dropdown } from '@/components/ui/dropdown';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { TaxModal } from '@/components/taxes/TaxModal';
import { formatDate } from '@/utils/formatters';
import { useToast } from '@/hooks/useToast';
import { Plus, MoreHorizontal, Edit, Trash2, ReceiptCent, Calendar } from 'lucide-react';

export const TaxesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTax, setEditingTax] = useState<Tax | null>(null);
  const [deletingTaxId, setDeletingTaxId] = useState<string | null>(null);

  const { data: taxes = [], isLoading } = useQuery({
    queryKey: ['taxes'],
    queryFn: () => taxesApi.getAll(),
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsApi.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => taxesApi.create(data),
    onSuccess: (t) => {
      queryClient.invalidateQueries({ queryKey: ['taxes'] });
      setIsAddModalOpen(false);
      success('Tax Rate Added', `${t.name} (${t.percentage}%) configured.`);
    },
    onError: () => error('Error', 'Failed to configure tax rate.'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => taxesApi.update(id, data),
    onSuccess: (t) => {
      queryClient.invalidateQueries({ queryKey: ['taxes'] });
      setEditingTax(null);
      success('Tax Rate Updated', `${t.name} updated.`);
    },
    onError: () => error('Error', 'Failed to update tax rate.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => taxesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taxes'] });
      setDeletingTaxId(null);
      success('Tax Rate Removed', 'Tax rule deleted.');
    },
    onError: () => error('Error', 'Failed to delete tax rule.'),
  });

  const filteredTaxes = taxes.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const columns: Column<Tax>[] = [
    {
      key: 'name',
      header: 'Tax Rule Name',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <ReceiptCent className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-slate-900 block">{row.name}</span>
            <span className="text-[11px] text-slate-400 capitalize">{row.type} calculation</span>
          </div>
        </div>
      ),
    },
    {
      key: 'percentage',
      header: 'Tax Rate (%)',
      align: 'right',
      sortable: true,
      render: (row) => (
        <span className="font-bold text-slate-900 text-sm">{row.percentage.toFixed(1)}%</span>
      ),
    },
    {
      key: 'type',
      header: 'Application Mode',
      render: (row) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
            row.type === 'exclusive' ? 'bg-indigo-50 text-indigo-700' : 'bg-purple-50 text-purple-700'
          }`}
        >
          {row.type === 'exclusive' ? 'Exclusive (Add-on)' : 'Inclusive (In Price)'}
        </span>
      ),
    },
    {
      key: 'dates',
      header: 'Effective Period',
      render: (row) => (
        <div className="text-xs text-slate-600 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{formatDate(row.effectiveFrom)}</span>
          {row.effectiveTo && <span className="text-slate-400"> → {formatDate(row.effectiveTo)}</span>}
        </div>
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
        <Dropdown
          align="right"
          trigger={
            <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          }
          items={[
            {
              label: 'Edit Tax Rule',
              icon: <Edit className="w-3.5 h-3.5" />,
              onClick: () => setEditingTax(row),
            },
            {
              label: 'Delete Tax Rule',
              icon: <Trash2 className="w-3.5 h-3.5" />,
              danger: true,
              onClick: () => setDeletingTaxId(row.id),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tax Management & GST Rates"
        description="Configure tax regimes, percentage brackets, and automatic calculation modes for invoices and quotations."
        actions={
          <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            Add Tax Rate
          </Button>
        }
      />

      <div className="flex items-center justify-between gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search tax rules by title..."
        />
      </div>

      <DataTable
        columns={columns}
        data={filteredTaxes}
        keyExtractor={(t) => t.id}
        isLoading={isLoading}
        emptyTitle="No tax rules found"
        emptyDescription="Configure tax percentages to ensure invoices compute correct statutory obligations."
        emptyActionText="Add Tax Rate"
        onEmptyAction={() => setIsAddModalOpen(true)}
      />

      <TaxModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={(data) => createMutation.mutate(data)}
        products={products}
        isLoading={createMutation.isPending}
      />

      {editingTax && (
        <TaxModal
          isOpen={!!editingTax}
          initialData={editingTax}
          onClose={() => setEditingTax(null)}
          onSubmit={(data) => updateMutation.mutate({ id: editingTax.id, data })}
          products={products}
          isLoading={updateMutation.isPending}
        />
      )}

      <ConfirmDialog
        isOpen={!!deletingTaxId}
        onClose={() => setDeletingTaxId(null)}
        title="Delete Tax Rule"
        message="Are you sure you want to remove this tax rule? Invoices already issued will not be altered."
        confirmText="Delete Tax"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deletingTaxId && deleteMutation.mutate(deletingTaxId)}
      />
    </div>
  );
};

