import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { portalApi } from '@/api/portal.api';
import { subscriptionsApi } from '@/api/subscriptions.api';
import { Subscription } from '@/types';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable, Column } from '@/components/common/DataTable';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SubscriptionTimeline } from '@/components/subscriptions/SubscriptionTimeline';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Eye, Clock, ShieldCheck } from 'lucide-react';

export const CustomerSubscriptionsPage: React.FC = () => {
  const { user } = useAuth();
  const customerId = user?.customerId || 'cust-1';

  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);

  const { data: subscriptions = [], isLoading } = useQuery({
    queryKey: ['customerSubscriptions', customerId],
    queryFn: async () => {
      try {
        return await portalApi.getSubscriptions();
      } catch {
        const all = await subscriptionsApi.getAll();
        return all.filter((s) => s.customerId === customerId);
      }
    },
  });

  const columns: Column<Subscription>[] = [
    {
      key: 'subscriptionNumber',
      header: 'Sub Reference',
      sortable: true,
      render: (r) => <span className="font-mono font-semibold text-slate-900">{r.subscriptionNumber}</span>,
    },
    {
      key: 'planName',
      header: 'Plan Package',
      sortable: true,
      render: (r) => (
        <div>
          <span className="font-semibold text-slate-800 block">{r.planName}</span>
          <span className="text-[11px] text-slate-400 capitalize">{r.billingInterval} cycle</span>
        </div>
      ),
    },
    {
      key: 'startDate',
      header: 'Start Date',
      render: (r) => <span className="text-xs text-slate-600">{formatDate(r.startDate)}</span>,
    },
    {
      key: 'expiryDate',
      header: 'Next Renewal',
      render: (r) => (
        <span className="text-xs text-slate-600 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          {formatDate(r.expiryDate)}
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Billing Amount',
      align: 'right',
      sortable: true,
      render: (r) => <span className="font-bold text-slate-900">{formatCurrency(r.amount)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: 'actions',
      header: 'Details',
      align: 'right',
      render: (r) => (
        <Button variant="outline" size="sm" onClick={() => setSelectedSub(r)} className="h-8 px-2 text-xs">
          <Eye className="w-3.5 h-3.5 mr-1" />
          Timeline
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Subscriptions"
        description="View your active software licenses, renewal dates, and contracted service tiers."
      />

      <DataTable
        columns={columns}
        data={subscriptions}
        keyExtractor={(s) => s.id}
        isLoading={isLoading}
        onRowClick={(row) => setSelectedSub(row)}
        emptyTitle="No active subscriptions"
        emptyDescription="Your organization currently has no active subscription plans."
      />

      {/* Subscription Timeline Modal */}
      {selectedSub && (
        <Dialog
          isOpen={!!selectedSub}
          onClose={() => setSelectedSub(null)}
          title={`Subscription ${selectedSub.subscriptionNumber}`}
          description={`${selectedSub.planName} • Billed ${selectedSub.billingInterval}`}
          size="lg"
        >
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Recurring Fee</span>
                <p className="text-lg font-bold text-slate-900">{formatCurrency(selectedSub.amount)}</p>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Renewal Date</span>
                <p className="text-sm font-bold text-slate-900">{formatDate(selectedSub.expiryDate)}</p>
              </div>
            </div>

            <SubscriptionTimeline
              status={selectedSub.status}
              timeline={selectedSub.timeline || []}
            />
          </div>
        </Dialog>
      )}
    </div>
  );
};

