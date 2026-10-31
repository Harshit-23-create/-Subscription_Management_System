import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { discountsApi } from '@/api/discounts.api';
import { productsApi } from '@/api/products.api';
import { Discount } from '@/types';
import { PageHeader } from '@/components/common/PageHeader';
import { SearchInput } from '@/components/common/SearchInput';
import { DataTable, Column } from '@/components/common/DataTable';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { Dropdown } from '@/components/ui/dropdown';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { DiscountModal } from '@/components/discounts/DiscountModal';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { useToast } from '@/hooks/useToast';
import { Plus, MoreHorizontal, Edit, Trash2, Tag, Percent, Calendar } from 'lucide-react';

export const DiscountsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const [deletingDiscountId, setDeletingDiscountId] = useState<string | null>(null);

  const { data: discounts = [], isLoading } = useQuery({
    queryKey: ['discounts'],
    queryFn: () => discountsApi.getAll(),
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsApi.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => discountsApi.create(data),
    onSuccess: (d) => {
      queryClient.invalidateQueries({ queryKey: ['discounts'] });
      setIsAddModalOpen(false);
      success('Discount Created', `Coupon code ${d.code} created.`);
    },
    onError: () => error('Error', 'Failed to create discount voucher.'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => discountsApi.update(id, data),
    onSuccess: (d) => {
      queryClient.invalidateQueries({ queryKey: ['discounts'] });
      setEditingDiscount(null);
      success('Discount Updated', `Coupon code ${d.code} updated.`);
    },
    onError: () => error('Error', 'Failed to update discount.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => discountsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discounts'] });
      setDeletingDiscountId(null);
      success('Discount Removed', 'Voucher deleted.');
    },
    onError: () => error('Error', 'Failed to delete discount.'),
  });

  const filteredDiscounts = discounts.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.code.toLowerCase().includes(search.toLowerCase())
  );

  const columns: Column<Discount>[] = [
    {
      key: 'name',
      header: 'Campaign & Code',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-900 block">{row.name}</span>
          <span className="text-[11px] font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-bold uppercase">
            {row.code}
          </span>
        </div>
      ),
    },
    {
      key: 'value',
      header: 'Value Deduction',
      sortable: true,
      render: (row) => (
        <span className="font-bold text-slate-900">
          {row.type === 'percentage' ? `${row.value}% OFF` : `-${formatCurrency(row.value)}`}
        </span>
      ),
    },
    {
      key: 'usage',
      header: 'Usage Limits',
      render: (row) => (
        <div className="text-xs">
          <span className="text-slate-800 font-semibold">{row.usedCount}</span>
          <span className="text-slate-400"> / {row.maxUsage} used</span>
        </div>
      ),
    },
    {
      key: 'minPurchase',
      header: 'Min Thresholds',
      render: (row) => (
        <div className="text-xs text-slate-600">
          <span>Min Purchase: {formatCurrency(row.minPurchase)}</span>
          <span className="text-slate-400 block text-[11px]">Min Seats: {row.minQuantity}</span>
        </div>
      ),
    },
    {
      key: 'validity',
      header: 'Validity Period',
      render: (row) => (
        <div className="text-xs text-slate-600 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{formatDate(row.startDate)} → {formatDate(row.expiryDate)}</span>
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
              label: 'Edit Discount',
              icon: <Edit className="w-3.5 h-3.5" />,
              onClick: () => setEditingDiscount(row),
            },
            {
              label: 'Delete Voucher',
              icon: <Trash2 className="w-3.5 h-3.5" />,
              danger: true,
              onClick: () => setDeletingDiscountId(row.id),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Promotions & Discounts"
        description="Configure percentage coupon codes, fixed enterprise concessions, and seasonal redemption windows."
        actions={
          <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            Create Discount
          </Button>
        }
      />

      <div className="flex items-center justify-between gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by discount name or coupon code..."
        />
      </div>

      <DataTable
        columns={columns}
        data={filteredDiscounts}
        keyExtractor={(d) => d.id}
        isLoading={isLoading}
        emptyTitle="No discounts found"
        emptyDescription="Create coupon codes to offer price deductions on subscription contracts."
        emptyActionText="Create Discount"
        onEmptyAction={() => setIsAddModalOpen(true)}
      />

      <DiscountModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={(data) => createMutation.mutate(data)}
        products={products}
        isLoading={createMutation.isPending}
      />

      {editingDiscount && (
        <DiscountModal
          isOpen={!!editingDiscount}
          initialData={editingDiscount}
          onClose={() => setEditingDiscount(null)}
          onSubmit={(data) => updateMutation.mutate({ id: editingDiscount.id, data })}
          products={products}
          isLoading={updateMutation.isPending}
        />
      )}

      <ConfirmDialog
        isOpen={!!deletingDiscountId}
        onClose={() => setDeletingDiscountId(null)}
        title="Delete Discount Voucher"
        message="Are you sure you want to delete this promotional discount? Future quotations will not be able to apply this code."
        confirmText="Delete Voucher"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deletingDiscountId && deleteMutation.mutate(deletingDiscountId)}
      />
    </div>
  );
};

