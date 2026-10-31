import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionsApi } from '@/api/subscriptions.api';
import { customersApi } from '@/api/customers.api';
import { invoicesApi } from '@/api/invoices.api';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { SubscriptionTimeline } from '@/components/subscriptions/SubscriptionTimeline';
import { DataTable, Column } from '@/components/common/DataTable';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { useToast } from '@/hooks/useToast';
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  Building2,
  Mail,
  Repeat,
  Pause,
  Play,
  RotateCw,
  XCircle,
  Receipt,
} from 'lucide-react';
import { Invoice } from '@/types';

export const SubscriptionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const { data: subscription, isLoading } = useQuery({
    queryKey: ['subscription', id],
    queryFn: () => (id ? subscriptionsApi.getById(id) : undefined),
    enabled: !!id,
  });

  const { data: customer } = useQuery({
    queryKey: ['customer', subscription?.customerId],
    queryFn: () => (subscription?.customerId ? customersApi.getById(subscription.customerId) : undefined),
    enabled: !!subscription?.customerId,
  });

  const { data: invoices = [] } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => invoicesApi.getAll(),
  });

  const statusMutation = useMutation({
    mutationFn: ({ newStatus, notes }: { newStatus: any; notes?: string }) =>
      id ? subscriptionsApi.updateStatus(id, newStatus, notes) : Promise.reject('No ID'),
    onSuccess: (sub) => {
      queryClient.invalidateQueries({ queryKey: ['subscription', id] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      success('Status Updated', `Subscription is now ${sub.status}`);
    },
    onError: () => error('Error', 'Failed to update subscription status.'),
  });

  const renewMutation = useMutation({
    mutationFn: () => (id ? subscriptionsApi.renew(id, 12) : Promise.reject('No ID')),
    onSuccess: (sub) => {
      queryClient.invalidateQueries({ queryKey: ['subscription', id] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      success('Renewed', `Subscription renewed until ${sub.expiryDate}`);
    },
    onError: () => error('Error', 'Failed to renew subscription.'),
  });

  if (isLoading) {
    return <div className="p-12 text-center text-slate-500">Loading subscription records...</div>;
  }

  if (!subscription) {
    return (
      <div className="p-12 text-center">
        <h3 className="text-base font-semibold text-slate-800">Subscription not found</h3>
        <Button variant="outline" size="sm" onClick={() => navigate('/subscriptions')} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Subscriptions
        </Button>
      </div>
    );
  }

  const relatedInvoices = invoices.filter(
    (i) => i.subscriptionId === subscription.id || i.customerId === subscription.customerId
  );

  const invoiceColumns: Column<Invoice>[] = [
    { key: 'invoiceNumber', header: 'Invoice #', sortable: true },
    { key: 'invoiceDate', header: 'Date', render: (r) => formatDate(r.invoiceDate) },
    { key: 'dueDate', header: 'Due Date', render: (r) => formatDate(r.dueDate) },
    { key: 'totalAmount', header: 'Amount', align: 'right', render: (r) => formatCurrency(r.totalAmount) },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate('/subscriptions')} className="h-8">
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          All Subscriptions
        </Button>
      </div>

      <PageHeader
        title={subscription.subscriptionNumber}
        description={`Contract with ${subscription.customerName} for ${subscription.planName}`}
        badge={<StatusBadge status={subscription.status} />}
        actions={
          <div className="flex items-center gap-2">
            {subscription.status === 'Active' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => statusMutation.mutate({ newStatus: 'Paused' })}
                  isLoading={statusMutation.isPending}
                >
                  <Pause className="w-3.5 h-3.5 mr-1 text-amber-500" />
                  Pause
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => renewMutation.mutate()}
                  isLoading={renewMutation.isPending}
                >
                  <RotateCw className="w-3.5 h-3.5 mr-1 text-blue-500" />
                  Renew Contract
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => statusMutation.mutate({ newStatus: 'Closed' })}
                  isLoading={statusMutation.isPending}
                >
                  <XCircle className="w-3.5 h-3.5 mr-1" />
                  Cancel
                </Button>
              </>
            )}
            {subscription.status === 'Paused' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => statusMutation.mutate({ newStatus: 'Active' })}
                isLoading={statusMutation.isPending}
              >
                <Play className="w-3.5 h-3.5 mr-1" />
                Resume Subscription
              </Button>
            )}
            {(subscription.status === 'Confirmed' || subscription.status === 'Draft') && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => statusMutation.mutate({ newStatus: 'Active' })}
                isLoading={statusMutation.isPending}
              >
                <Play className="w-3.5 h-3.5 mr-1" />
                Activate Subscription
              </Button>
            )}
          </div>
        }
      />

      {/* Overview Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <span className="text-[11px] font-semibold uppercase text-slate-400">Recurring Rate</span>
          <p className="text-xl font-bold text-slate-900 mt-1">{formatCurrency(subscription.amount)}</p>
          <span className="text-xs text-slate-500 capitalize">Billed {subscription.billingInterval}</span>
        </Card>
        <Card className="p-4">
          <span className="text-[11px] font-semibold uppercase text-slate-400">Effective Dates</span>
          <p className="text-sm font-bold text-slate-800 mt-1">{formatDate(subscription.startDate)}</p>
          <span className="text-xs text-slate-500">To {formatDate(subscription.expiryDate)}</span>
        </Card>
        <Card className="p-4">
          <span className="text-[11px] font-semibold uppercase text-slate-400">Payment Terms</span>
          <p className="text-sm font-bold text-slate-800 mt-1">{subscription.paymentTerms}</p>
          <span className="text-xs text-slate-500">Auto-Renew: {subscription.autoRenew ? 'Enabled' : 'Disabled'}</span>
        </Card>
        <Card className="p-4">
          <span className="text-[11px] font-semibold uppercase text-slate-400">Next Billing Cycle</span>
          <p className="text-sm font-bold text-slate-800 mt-1">{formatDate(subscription.expiryDate)}</p>
          <span className="text-xs text-blue-600 font-medium">Automatic Invoicing</span>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Product Lines & Customer Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Lines Card */}
          <Card>
            <CardHeader>
              <CardTitle>Contracted Product Lines & Services</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="py-2.5 px-4 font-semibold text-slate-600">Description</th>
                      <th className="py-2.5 px-4 font-semibold text-slate-600 text-center">Seats / Qty</th>
                      <th className="py-2.5 px-4 font-semibold text-slate-600 text-right">Unit Rate</th>
                      <th className="py-2.5 px-4 font-semibold text-slate-600 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {subscription.lines && subscription.lines.length > 0 ? (
                      subscription.lines.map((l) => (
                        <tr key={l.id}>
                          <td className="py-3 px-4 font-medium text-slate-900">{l.description}</td>
                          <td className="py-3 px-4 text-center text-slate-600">{l.quantity}</td>
                          <td className="py-3 px-4 text-right text-slate-600">{formatCurrency(l.unitPrice)}</td>
                          <td className="py-3 px-4 text-right font-bold text-slate-900">{formatCurrency(l.amount)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="py-3 px-4 font-medium text-slate-900">{subscription.planName}</td>
                        <td className="py-3 px-4 text-center text-slate-600">1</td>
                        <td className="py-3 px-4 text-right text-slate-600">{formatCurrency(subscription.amount)}</td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900">{formatCurrency(subscription.amount)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Customer & Billing Terms Card */}
          <Card>
            <CardHeader>
              <CardTitle>Customer & Billing Account</CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">Customer</span>
                  <p className="font-bold text-slate-900 text-sm">{subscription.customerName}</p>
                  <p className="text-slate-500">{subscription.customerEmail}</p>
                  {customer && <p className="text-slate-600 mt-1">{customer.company}</p>}
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">Billing Address</span>
                  <p className="text-slate-700">{customer?.address || 'Plot 42, Hitec City'}</p>
                  <p className="text-slate-700">{customer?.city || 'Hyderabad'}, {customer?.country || 'India'}</p>
                  {customer?.taxNumber && (
                    <p className="font-mono text-blue-600 text-[11px] mt-1">GST: {customer.taxNumber}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoices History Table */}
          <Card>
            <CardHeader>
              <CardTitle>Subscription Billing History</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <DataTable
                columns={invoiceColumns}
                data={relatedInvoices}
                keyExtractor={(i) => i.id}
                emptyTitle="No invoices generated yet"
                emptyDescription="Invoices will automatically generate on each recurring billing cycle."
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Workflow Progression & Timeline */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Workflow</CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <SubscriptionTimeline
                status={subscription.status}
                timeline={subscription.timeline || []}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

