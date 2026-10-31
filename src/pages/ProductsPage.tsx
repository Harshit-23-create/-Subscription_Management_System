import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '@/api/products.api';
import { Product } from '@/types';
import { PageHeader } from '@/components/common/PageHeader';
import { SearchInput } from '@/components/common/SearchInput';
import { FilterDropdown } from '@/components/common/FilterDropdown';
import { DataTable, Column } from '@/components/common/DataTable';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { Dropdown } from '@/components/ui/dropdown';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { ProductModal } from '@/components/products/ProductModal';
import { formatCurrency } from '@/utils/formatters';
import { useToast } from '@/hooks/useToast';
import { Plus, MoreHorizontal, Edit, Trash2, Layers, Tag } from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsApi.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => productsApi.create(data),
    onSuccess: (p) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsAddModalOpen(false);
      success('Product Added', `${p.name} configured successfully.`);
    },
    onError: () => error('Error', 'Failed to create product.'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => productsApi.update(id, data),
    onSuccess: (p) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setEditingProduct(null);
      success('Product Updated', `${p.name} updated successfully.`);
    },
    onError: () => error('Error', 'Failed to update product.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setDeletingProductId(null);
      success('Product Deleted', 'Product removed from catalogue.');
    },
    onError: () => error('Error', 'Failed to delete product.'),
  });

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || p.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const columns: Column<Product>[] = [
    {
      key: 'name',
      header: 'Product Name',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-900 block">{row.name}</span>
          <span className="text-[11px] text-slate-500 line-clamp-1 max-w-md">{row.description}</span>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Product Type',
      sortable: true,
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 capitalize">
          <Layers className="w-3 h-3 text-slate-400" />
          {row.type}
        </span>
      ),
    },
    {
      key: 'salesPrice',
      header: 'Base Price',
      align: 'right',
      sortable: true,
      render: (row) => (
        <span className="font-bold text-slate-900">{formatCurrency(row.salesPrice)}</span>
      ),
    },
    {
      key: 'variants',
      header: 'Configured Variants',
      render: (row) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {row.variants && row.variants.length > 0 ? (
            row.variants.map((v) => (
              <span
                key={v.id}
                className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200/60 px-2 py-0.5 rounded-md font-medium"
                title={`SKU: ${v.sku}`}
              >
                {v.name} {v.additionalPrice > 0 ? `(+₹${v.additionalPrice})` : ''}
              </span>
            ))
          ) : (
            <span className="text-slate-400 text-xs">Standard only</span>
          )}
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
              label: 'Edit Product',
              icon: <Edit className="w-3.5 h-3.5" />,
              onClick: () => setEditingProduct(row),
            },
            {
              label: 'Delete Product',
              icon: <Trash2 className="w-3.5 h-3.5" />,
              danger: true,
              onClick: () => setDeletingProductId(row.id),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products & Modules"
        description="Catalogue of recurring SaaS software products, support tiers, and feature add-on variants."
        actions={
          <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            Add Product
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search products by name or capabilities..."
        />

        <FilterDropdown
          label="Type"
          selectedValue={typeFilter}
          onChange={setTypeFilter}
          options={[
            { label: 'All Types', value: 'all' },
            { label: 'Core Software', value: 'software' },
            { label: 'Service / Support', value: 'service' },
            { label: 'Add-on Modules', value: 'addon' },
          ]}
        />
      </div>

      <DataTable
        columns={columns}
        data={filteredProducts}
        keyExtractor={(p) => p.id}
        isLoading={isLoading}
        emptyTitle="No products found"
        emptyDescription="No catalogue products matched your filter."
        emptyActionText="Create Product"
        onEmptyAction={() => setIsAddModalOpen(true)}
      />

      <ProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={(data) => createMutation.mutate(data)}
        isLoading={createMutation.isPending}
      />

      {editingProduct && (
        <ProductModal
          isOpen={!!editingProduct}
          initialData={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSubmit={(data) => updateMutation.mutate({ id: editingProduct.id, data })}
          isLoading={updateMutation.isPending}
        />
      )}

      <ConfirmDialog
        isOpen={!!deletingProductId}
        onClose={() => setDeletingProductId(null)}
        title="Delete Catalogue Product"
        message="Are you sure you want to remove this product? Existing active subscriptions will retain their contracted pricing."
        confirmText="Delete Product"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deletingProductId && deleteMutation.mutate(deletingProductId)}
      />
    </div>
  );
};

