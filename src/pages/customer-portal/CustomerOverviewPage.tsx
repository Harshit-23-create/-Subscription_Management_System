import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { portalApi } from '@/api/portal.api';
import { subscriptionsApi } from '@/api/subscriptions.api';
import { invoicesApi } from '@/api/invoices.api';
import { paymentsApi } from '@/api/payments.api';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Repeat, Receipt, CreditCard, ArrowRight, CheckCircle2 } from 'lucide-react';

export const CustomerOverviewPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const customerId = user?.customerId || 'cust-1';

  const { data: subscriptions = [] } = useQuery({
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

  const { data: invoices = [] } = useQuery({
    queryKey: ['customerInvoices', customerId],
    queryFn: async () => {
      try {
        return await portalApi.getInvoices();
      } catch {
        const all = await invoicesApi.getAll();
        return all.filter((i) => i.customerId === customerId);
      }
    },
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['customerPayments', customerId],
    queryFn: async () => {
      try {
        return await portalApi.getPayments();
      } catch {
        const all = await paymentsApi.getAll();
        return all.filter((p) => p.customerId === customerId);
      }
    },
  });

  const activeSubscriptions = subscriptions.filter((s) => s.status === 'Active');
  const outstandingAmount = invoices.reduce((acc, i) => acc + i.outstandingAmount, 0);
  const totalPaid = payments
    .filter((p) => p.status === 'Success')
    .reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${user?.name || 'Customer'}`}
        description={`Account portal for ${user?.company || 'Your Organization'} • Self-service subscription & billing`}
        badge={
          <span className="text-xs bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded-full">
            Customer Portal
          </span>
        }
      />

      {/* Customer KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Active Subscriptions"
          value={activeSubscriptions.length}
          subtext="Current active software plans"
          icon={<Repeat className="w-5 h-5 text-purple-600" />}
          iconBgColor="bg-purple-50"
        />
        <StatCard
          title="Outstanding Balance"
          value={formatCurrency(outstandingAmount)}
          subtext={outstandingAmount > 0 ? 'Pending invoice payment' : 'All accounts settled'}
          icon={<Receipt className="w-5 h-5 text-rose-600" />}
          iconBgColor={outstandingAmount > 0 ? 'bg-rose-50' : 'bg-emerald-50'}
        />
        <StatCard
          title="Lifetime Payments"
          value={formatCurrency(totalPaid)}
          subtext="Total settled receipts"
          icon={<CreditCard className="w-5 h-5 text-emerald-600" />}
          iconBgColor="bg-emerald-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Subscriptions Summary */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardTitle>My Subscriptions</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/portal/subscriptions')}>
                View all <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {subscriptions.length === 0 ? (
                <p className="p-6 text-xs text-slate-500 text-center">No subscriptions found.</p>
              ) : (
                subscriptions.map((sub) => (
                  <div key={sub.id} className="p-4 px-5 flex items-center justify-between hover:bg-slate-50">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-900">{sub.planName}</span>
                        <StatusBadge status={sub.status} />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Ref: {sub.subscriptionNumber} • Renews {formatDate(sub.expiryDate)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-xs text-slate-900">{formatCurrency(sub.amount)}</p>
                      <span className="text-[10px] text-slate-400 capitalize">per {sub.billingInterval}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Invoices */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardTitle>Recent Invoices</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/portal/invoices')}>
                View all <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {invoices.length === 0 ? (
                <p className="p-6 text-xs text-slate-500 text-center">No invoices found.</p>
              ) : (
                invoices.map((inv) => (
                  <div key={inv.id} className="p-4 px-5 flex items-center justify-between hover:bg-slate-50">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-900">{inv.invoiceNumber}</span>
                        <StatusBadge status={inv.status} />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">Due: {formatDate(inv.dueDate)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-xs text-slate-900">{formatCurrency(inv.totalAmount)}</p>
                      {inv.outstandingAmount > 0 ? (
                        <p className="text-[10px] text-rose-600 font-medium">{formatCurrency(inv.outstandingAmount)} due</p>
                      ) : (
                        <p className="text-[10px] text-emerald-600 font-medium">Settled</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

