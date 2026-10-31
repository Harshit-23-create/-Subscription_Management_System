import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { subscriptionsApi } from '@/api/subscriptions.api';
import { customersApi } from '@/api/customers.api';
import { plansApi } from '@/api/plans.api';
import { productsApi } from '@/api/products.api';
import { Subscription, SubscriptionStatus } from '@/types';
import { PageHeader } from '@/components/common/PageHeader';
import { SearchInput } from '@/components/common/SearchInput';
import { FilterDropdown } from '@/components/common/FilterDropdown';
import { DataTable, Column } from '@/components/common/DataTable';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { Dropdown } from '@/components/ui/dropdown';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { SubscriptionModal } from '@/components/subscriptions/SubscriptionModal';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { useToast } from '@/hooks/useToast';
import {
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Pause,
  Play,
  RotateCw,
  XCircle,
  Clock,
} from 'lucide-react';

export const SubscriptionsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const toast = useToast();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);

  useEffect(() => {
    if ((location.state as any)?.openCreate) {
      setIsAddModalOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Status action dialog state
  const [statusActionDialog, setStatusActionDialog] = useState<{
    sub: Subscription;
    newStatus: SubscriptionStatus;
    title: string;
    message: string;
    variant: 'danger' | 'primary';
  } | null>(null);

  // Renewal dialog state
  const [renewingSubId, setRenewingSubId] = useState<string | null>(null);

  const { data: subscriptions = [], isLoading } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: () => subscriptionsApi.getAll(),
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customersApi.getAll(),
  });

  const { data: plans = [] } = useQuery({
    queryKey: ['plans'],
    queryFn: () => plansApi.getAll(),
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsApi.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => subscriptionsApi.create(data),
    onSuccess: (sub) => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      setIsAddModalOpen(false);
      toast.success('Subscription Created', `${sub.subscriptionNumber} created with status ${sub.status}.`);
    },
    onError: () => {
      toast.error('Error', 'Failed to create subscription.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => subscriptionsApi.update(id, data),
    onSuccess: (sub) => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      setEditingSub(null);
      toast.success('Subscription Updated', `${sub.subscriptionNumber} updated.`);
    },
    onError: () => {
      toast.error('Error', 'Failed to update subscription.');
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: SubscriptionStatus; notes?: string }) =>
      subscriptionsApi.updateStatus(id, status, notes),
    onSuccess: (sub) => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      setStatusActionDialog(null);
      toast.success('Status Updated', `${sub.subscriptionNumber} is now ${sub.status}.`);
    },
    onError: () => {
      toast.error('Error', 'Failed to update status.');
    },
  });

  const renewMutation = useMutation({
    mutationFn: (id: string) => subscriptionsApi.renew(id, 12),
    onSuccess: (sub) => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      setRenewingSubId(null);
      toast.success('Subscription Renewed', `${sub.subscriptionNumber} renewed for 12 months.`);
    },
    onError: () => {
      toast.error('Error', 'Failed to renew subscription.');
    },
  });

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const matchesSearch =
      sub.subscriptionNumber.toLowerCase().includes(search.toLowerCase()) ||
      sub.customerName.toLowerCase().includes(search.toLowerCase()) ||
      sub.planName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sub.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const columns: Column<Subscription>[] = [
    {
      key: 'subscriptionNumber',
      header: 'Sub Number',
      sortable: true,
      render: (row) => (
        <span className="font-semibold text-slate-900 font-mono text-xs">{row.subscriptionNumber}</span>
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
      key: 'planName',
      header: 'Plan',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-medium text-slate-800 text-xs block">{row.planName}</span>
          <span className="text-[10px] text-slate-400 capitalize">{row.billingInterval} interval</span>
        </div>
      ),
    },
    {
      key: 'startDate',
      header: 'Start Date',
      render: (row) => <span className="text-xs text-slate-600">{formatDate(row.startDate)}</span>,
    },
    {
      key: 'expiryDate',
      header: 'Renewal Date',
      render: (row) => (
        <span className="text-xs text-slate-600 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          {formatDate(row.expiryDate)}
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      sortable: true,
      render: (row) => (
        <span className="font-bold text-slate-900">{formatCurrency(row.amount)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Workflow Status',
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
              navigate(`/subscriptions/${row.id}`);
            }}
          >
            <Eye className="w-3.5 h-3.5 mr-1 text-slate-400" />
            Details
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
                label: 'View Complete Timeline',
                icon: <Eye className="w-3.5 h-3.5" />,
                onClick: () => navigate(`/subscriptions/${row.id}`),
              },
              {
                label: 'Edit Parameters',
                icon: <Edit className="w-3.5 h-3.5" />,
                onClick: () => setEditingSub(row),
              },
              ...(row.status === 'Active'
                ? [
                    {
                      label: 'Pause Subscription',
                      icon: <Pause className="w-3.5 h-3.5 text-amber-500" />,
                      onClick: () =>
                        setStatusActionDialog({
                          sub: row,
                          newStatus: 'Paused',
                          title: 'Pause Subscription',
                          message: `Temporarily pause recurring billing for ${row.subscriptionNumber}? Auto-renewal invoices will be held.`,
                          variant: 'primary',
                        }),
                    },
                    {
                      label: 'Renew Contract (1 Year)',
                      icon: <RotateCw className="w-3.5 h-3.5 text-blue-500" />,
                      onClick: () => setRenewingSubId(row.id),
                    },
                    {
                      label: 'Cancel Subscription',
                      icon: <XCircle className="w-3.5 h-3.5 text-rose-500" />,
                      danger: true,
                      onClick: () =>
                        setStatusActionDialog({
                          sub: row,
                          newStatus: 'Closed',
                          title: 'Cancel Subscription',
                          message: `Are you sure you want to cancel and close subscription ${row.subscriptionNumber}?`,
                          variant: 'danger',
                        }),
                    },
                  ]
                : []),
              ...(row.status === 'Paused'
                ? [
                    {
                      label: 'Resume Subscription',
                      icon: <Play className="w-3.5 h-3.5 text-emerald-500" />,
                      onClick: () =>
                        setStatusActionDialog({
                          sub: row,
                          newStatus: 'Active',
                          title: 'Resume Subscription',
                          message: `Resume active billing for ${row.subscriptionNumber}? Next billing schedule will reactivate.`,
                          variant: 'primary',
                        }),
                    },
                  ]
                : []),
              ...(row.status === 'Confirmed' || row.status === 'Draft'
                ? [
                    {
                      label: 'Activate Subscription',
                      icon: <Play className="w-3.5 h-3.5 text-emerald-500" />,
                      onClick: () =>
                        setStatusActionDialog({
                          sub: row,
                          newStatus: 'Active',
                          title: 'Activate Subscription',
                          message: `Promote ${row.subscriptionNumber} to Active live status?`,
                          variant: 'primary',
                        }),
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
        title="Subscriptions"
        description="Comprehensive lifecycle management across Draft, Quotation, Confirmed, Active, and Closed stages."
        actions={
          <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            New Subscription
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by subscription number, customer, or plan..."
        />

        <FilterDropdown
          label="Workflow Status"
          selectedValue={statusFilter}
          onChange={setStatusFilter}
          options={[
            { label: 'All Statuses', value: 'all' },
            { label: 'Active', value: 'Active' },
            { label: 'Confirmed (Pending)', value: 'Confirmed' },
            { label: 'Draft / Quotation', value: 'Draft' },
            { label: 'Paused', value: 'Paused' },
            { label: 'Closed / Cancelled', value: 'Closed' },
          ]}
        />
      </div>

      <DataTable
        columns={columns}
        data={filteredSubscriptions}
        keyExtractor={(s) => s.id}
        isLoading={isLoading}
        onRowClick={(row) => navigate(`/subscriptions/${row.id}`)}
        emptyTitle="No subscriptions found"
        emptyDescription="Create or convert quotations to begin managing active subscriptions."
        emptyActionText="Create Subscription"
        onEmptyAction={() => setIsAddModalOpen(true)}
      />

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={(data) => createMutation.mutate(data)}
        customers={customers}
        plans={plans}
        products={products}
        isLoading={createMutation.isPending}
      />

      {editingSub && (
        <SubscriptionModal
          isOpen={!!editingSub}
          initialData={editingSub}
          onClose={() => setEditingSub(null)}
          onSubmit={(data) => updateMutation.mutate({ id: editingSub.id, data })}
          customers={customers}
          plans={plans}
          products={products}
          isLoading={updateMutation.isPending}
        />
      )}

      {/* Workflow Status Change Confirmation */}
      {statusActionDialog && (
        <ConfirmDialog
          isOpen={!!statusActionDialog}
          onClose={() => setStatusActionDialog(null)}
          title={statusActionDialog.title}
          message={statusActionDialog.message}
          confirmText={`Confirm ${statusActionDialog.newStatus}`}
          variant={statusActionDialog.variant}
          isLoading={statusMutation.isPending}
          onConfirm={() =>
            statusMutation.mutate({
              id: statusActionDialog.sub.id,
              status: statusActionDialog.newStatus,
            })
          }
        />
      )}

      {/* Contract Renewal Confirmation */}
      {renewingSubId && (
        <ConfirmDialog
          isOpen={!!renewingSubId}
          onClose={() => setRenewingSubId(null)}
          title="Renew Subscription Contract"
          message="Extend this subscription for an additional 12-month billing period? Expiration date will advance accordingly."
          confirmText="Renew for 1 Year"
          variant="primary"
          isLoading={renewMutation.isPending}
          onConfirm={() => renewMutation.mutate(renewingSubId)}
        />
      )}
    </div>
  );
};
