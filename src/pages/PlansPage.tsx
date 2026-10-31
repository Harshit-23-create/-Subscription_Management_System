import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { plansApi } from '@/api/plans.api';
import { productsApi } from '@/api/products.api';
import { Plan, BillingInterval } from '@/types';
import { PageHeader } from '@/components/common/PageHeader';
import { SearchInput } from '@/components/common/SearchInput';
import { FilterDropdown } from '@/components/common/FilterDropdown';
import { DataTable, Column } from '@/components/common/DataTable';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { Dropdown } from '@/components/ui/dropdown';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { PlanModal } from '@/components/plans/PlanModal';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { useToast } from '@/hooks/useToast';
import { Plus, MoreHorizontal, Edit, Trash2, Calendar, Clock } from 'lucide-react';

export const PlansPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const [search, setSearch] = useState('');
  const [intervalFilter, setIntervalFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null);

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: () => plansApi.getAll(),
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsApi.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => plansApi.create(data),
    onSuccess: (p) => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      setIsAddModalOpen(false);
      success('Plan Created', `${p.name} configured with ${p.billingInterval} billing.`);
    },
    onError: () => error('Error', 'Failed to create plan.'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => plansApi.update(id, data),
    onSuccess: (p) => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      setEditingPlan(null);
      success('Plan Updated', `${p.name} updated.`);
    },
    onError: () => error('Error', 'Failed to update plan.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => plansApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      setDeletingPlanId(null);
      success('Plan Removed', 'Subscription plan deleted.');
    },
    onError: () => error('Error', 'Failed to delete plan.'),
  });

  const filteredPlans = plans.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.productName.toLowerCase().includes(search.toLowerCase());
    const matchesInterval = intervalFilter === 'all' || p.billingInterval === intervalFilter;
    return matchesSearch && matchesInterval;
  });

  const intervalColors: Record<BillingInterval, string> = {
    daily: 'bg-orange-50 text-orange-700 border-orange-200',
    weekly: 'bg-amber-50 text-amber-700 border-amber-200',
    monthly: 'bg-blue-50 text-blue-700 border-blue-200',
    yearly: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };

  const columns: Column<Plan>[] = [
    {
      key: 'name',
      header: 'Plan Name',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-900 block">{row.name}</span>
          <span className="text-[11px] text-slate-400">{row.productName}</span>
        </div>
      ),
    },
    {
      key: 'billingInterval',
      header: 'Billing Interval',
      sortable: true,
      render: (row) => (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${intervalColors[row.billingInterval]}`}
        >
          <Clock className="w-3 h-3" />
          <span className="capitalize">{row.billingInterval}</span>
        </span>
      ),
    },
    {
      key: 'price',
      header: 'Price / Interval',
      align: 'right',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900">{formatCurrency(row.price)}</span>
          <span className="text-[10px] text-slate-400 block">per {row.billingInterval}</span>
        </div>
      ),
    },
    {
      key: 'minQuantity',
      header: 'Min Qty / Seats',
      align: 'center',
      render: (row) => (
        <span className="text-xs font-medium text-slate-700">{row.minQuantity} seat(s)</span>
      ),
    },
    {
      key: 'startDate',
      header: 'Effective Dates',
      render: (row) => (
        <div className="text-xs text-slate-600">
          <span>{formatDate(row.startDate)}</span>
          {row.endDate && <span className="text-slate-400"> → {formatDate(row.endDate)}</span>}
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
              label: 'Edit Plan',
              icon: <Edit className="w-3.5 h-3.5" />,
              onClick: () => setEditingPlan(row),
            },
            {
              label: 'Delete Plan',
              icon: <Trash2 className="w-3.5 h-3.5" />,
              danger: true,
              onClick: () => setDeletingPlanId(row.id),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscription Plans"
        description="Manage recurring subscription packages across daily, weekly, monthly, and yearly cycles."
        actions={
          <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            Create Plan
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search plans by name or product..."
        />

        <FilterDropdown
          label="Interval"
          selectedValue={intervalFilter}
          onChange={setIntervalFilter}
          options={[
            { label: 'All Intervals', value: 'all' },
            { label: 'Daily Billing', value: 'daily' },
            { label: 'Weekly Billing', value: 'weekly' },
            { label: 'Monthly Billing', value: 'monthly' },
            { label: 'Yearly Billing', value: 'yearly' },
          ]}
        />
      </div>

      <DataTable
        columns={columns}
        data={filteredPlans}
        keyExtractor={(p) => p.id}
        isLoading={isLoading}
        emptyTitle="No subscription plans found"
        emptyDescription="Create recurring plans to start offering subscriptions to clients."
        emptyActionText="Create Plan"
        onEmptyAction={() => setIsAddModalOpen(true)}
      />

      <PlanModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={(data) => createMutation.mutate(data)}
        products={products}
        isLoading={createMutation.isPending}
      />

      {editingPlan && (
        <PlanModal
          isOpen={!!editingPlan}
          initialData={editingPlan}
          onClose={() => setEditingPlan(null)}
          onSubmit={(data) => updateMutation.mutate({ id: editingPlan.id, data })}
          products={products}
          isLoading={updateMutation.isPending}
        />
      )}

      <ConfirmDialog
        isOpen={!!deletingPlanId}
        onClose={() => setDeletingPlanId(null)}
        title="Delete Subscription Plan"
        message="Are you sure you want to deactivate and remove this plan? It will no longer be available for new subscriptions."
        confirmText="Delete Plan"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deletingPlanId && deleteMutation.mutate(deletingPlanId)}
      />
    </div>
  );
};

