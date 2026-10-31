import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Repeat,
  CheckCircle,
  TrendingUp,
  DollarSign,
  AlertCircle,
  Clock,
  ArrowUpRight,
  ShieldAlert,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { analyticsApi } from '@/api/analytics.api';
import { customersApi } from '@/api/customers.api';
import { subscriptionsApi } from '@/api/subscriptions.api';
import { invoicesApi } from '@/api/invoices.api';
import { paymentsApi } from '@/api/payments.api';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { ChartCard } from '@/components/common/ChartCard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatCurrency, formatDate, formatNumber } from '@/utils/formatters';

export const OverviewPage: React.FC = () => {
  const navigate = useNavigate();

  const { data: metrics, isLoading: isMetricsLoading } = useQuery({
    queryKey: ['overviewMetrics'],
    queryFn: () => analyticsApi.getMetrics(),
  });

  const { data: revenueTrend = [] } = useQuery({
    queryKey: ['revenueTrend'],
    queryFn: () => analyticsApi.getRevenueTrend('12m'),
  });

  const { data: subGrowth = [] } = useQuery({
    queryKey: ['subGrowth'],
    queryFn: () => analyticsApi.getSubscriptionGrowth(),
  });

  const { data: activeVsCancelled = [] } = useQuery({
    queryKey: ['activeVsCancelled'],
    queryFn: () => analyticsApi.getActiveVsCancelled(),
  });

  const { data: revenueByProduct = [] } = useQuery({
    queryKey: ['revenueByProduct'],
    queryFn: () => analyticsApi.getRevenueByProduct(),
  });

  const { data: paymentCollection = [] } = useQuery({
    queryKey: ['paymentCollection'],
    queryFn: () => analyticsApi.getPaymentCollection(),
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['recentCustomers'],
    queryFn: () => customersApi.getAll(),
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['upcomingRenewals'],
    queryFn: () => subscriptionsApi.getAll(),
  });

  const { data: invoices = [] } = useQuery({
    queryKey: ['recentInvoices'],
    queryFn: () => invoicesApi.getAll(),
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['recentPayments'],
    queryFn: () => paymentsApi.getAll(),
  });

  // Upcoming renewals (Active subs sorted by expiry date)
  const upcomingRenewals = [...subscriptions]
    .filter((s) => s.status === 'Active')
    .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())
    .slice(0, 4);

  const recentInvoicesList = invoices.slice(0, 4);
  const recentPaymentsList = payments.slice(0, 4);
  const recentCustomersList = customers.slice(0, 4);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Overview & Metrics"
        description="Real-time recurring revenue, subscriber lifecycle, and cash flow performance."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/analytics')}>
              Full Analytics
            </Button>
            <Button size="sm" onClick={() => navigate('/subscriptions')}>
              Manage Subscriptions
            </Button>
          </div>
        }
      />

      {/* Executive Operational Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 px-4 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50 border border-blue-100 rounded-2xl">
        <div className="flex items-center gap-2.5 text-xs text-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-slate-900">Billing Automation Engine: Active</span>
          <span className="text-slate-400 hidden sm:inline">•</span>
          <span className="text-slate-500 hidden sm:inline">Next automated renewal batch scheduled for 00:00 UTC</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-blue-700 bg-blue-100/60 border border-blue-200/60 px-2.5 py-0.5 rounded-full">
            Payment Gateways: 100% Operational
          </span>
        </div>
      </div>

      {/* 8 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Monthly Recurring Revenue"
          value={metrics ? formatCurrency(metrics.mrr) : '—'}
          change={12.4}
          changePeriod="vs last month"
          icon={<DollarSign className="w-5 h-5 text-blue-600" />}
          iconBgColor="bg-blue-50"
        />
        <StatCard
          title="Annual Recurring Revenue"
          value={metrics ? formatCurrency(metrics.arr) : '—'}
          change={15.8}
          changePeriod="annualized pace"
          icon={<TrendingUp className="w-5 h-5 text-indigo-600" />}
          iconBgColor="bg-indigo-50"
        />
        <StatCard
          title="Active Subscriptions"
          value={metrics ? formatNumber(metrics.activeSubscriptions) : '—'}
          change={8.2}
          icon={<CheckCircle className="w-5 h-5 text-emerald-600" />}
          iconBgColor="bg-emerald-50"
        />
        <StatCard
          title="Total Customers"
          value={metrics ? formatNumber(metrics.totalCustomers) : '—'}
          change={5.3}
          icon={<Users className="w-5 h-5 text-sky-600" />}
          iconBgColor="bg-sky-50"
        />

        <StatCard
          title="Total Lifetime Revenue"
          value={metrics ? formatCurrency(metrics.totalRevenue) : '—'}
          subtext="Net collected cash"
          icon={<Repeat className="w-5 h-5 text-purple-600" />}
          iconBgColor="bg-purple-50"
        />
        <StatCard
          title="Total Subscriptions"
          value={metrics ? formatNumber(metrics.totalSubscriptions) : '—'}
          subtext="All lifecycles combined"
          icon={<Clock className="w-5 h-5 text-slate-600" />}
          iconBgColor="bg-slate-100"
        />
        <StatCard
          title="Outstanding Payments"
          value={metrics ? formatCurrency(metrics.outstandingPayments) : '—'}
          subtext="Pending collection"
          icon={<AlertCircle className="w-5 h-5 text-amber-600" />}
          iconBgColor="bg-amber-50"
        />
        <StatCard
          title="Overdue Invoices"
          value={metrics ? metrics.overdueInvoices : '—'}
          subtext="Requires dunning action"
          icon={<ShieldAlert className="w-5 h-5 text-rose-600" />}
          iconBgColor="bg-rose-50"
        />
      </div>

      {/* Row of Primary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue Trend Area Chart */}
        <ChartCard
          title="Monthly Revenue & MRR Trend"
          description="Trajectory of recurring billing cashflow over the past 10 months"
          className="lg:col-span-2"
        >
          <ResponsiveContainer width="100%" height={290}>
            <AreaChart data={revenueTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
              <Tooltip
                formatter={(val: any) => [formatCurrency(Number(val)), '']}
                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Area type="monotone" dataKey="revenue" name="Total Revenue" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
              <Area type="monotone" dataKey="mrr" name="MRR" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorMrr)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Active vs Cancelled Donut */}
        <ChartCard
          title="Subscriber Status Breakdown"
          description="Distribution across all contract lifecycle stages"
        >
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={activeVsCancelled}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
              >
                {activeVsCancelled.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any) => [`${value} Subscriptions`, '']}
                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row of Secondary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subscription Growth Net Additions */}
        <ChartCard
          title="Subscriber Growth vs Churn"
          description="New additions vs churned contracts by month"
          className="lg:col-span-2"
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={subGrowth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="newSubscriptions" name="New Subscriptions" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="churnedSubscriptions" name="Churned Subscriptions" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Revenue by Product */}
        <ChartCard
          title="Revenue Contribution by Product"
          description="Volume share per product catalogue item"
        >
          <div className="space-y-3.5 pt-2">
            {revenueByProduct.map((p: any) => (
              <div key={p.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 truncate max-w-[170px]">{p.name}</span>
                  <span className="font-mono text-slate-600 font-semibold">{formatCurrency(p.revenue)}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${p.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* 4 Operations Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardTitle>Recent Invoices</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/invoices')}>
                View all <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {recentInvoicesList.map((inv) => (
                <div key={inv.id} className="p-3.5 px-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-slate-900">{inv.invoiceNumber}</span>
                      <StatusBadge status={inv.status} />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{inv.customerName} • Due {formatDate(inv.dueDate)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-xs text-slate-900">{formatCurrency(inv.totalAmount)}</p>
                    {inv.outstandingAmount > 0 && (
                      <p className="text-[10px] text-rose-600 font-medium">{formatCurrency(inv.outstandingAmount)} due</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Renewals */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardTitle>Upcoming Renewals</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/subscriptions')}>
                View all <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {upcomingRenewals.map((sub) => (
                <div key={sub.id} className="p-3.5 px-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <span className="font-semibold text-xs text-slate-900">{sub.subscriptionNumber}</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">{sub.customerName} • {sub.planName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-xs text-slate-900">{formatCurrency(sub.amount)}</p>
                    <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-medium">
                      Renews {formatDate(sub.expiryDate)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions (Payments) */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardTitle>Recent Payment Transactions</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/payments')}>
                View all <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {recentPaymentsList.map((pay) => (
                <div key={pay.id} className="p-3.5 px-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-xs text-slate-800">{pay.transactionId}</span>
                      <StatusBadge status={pay.status} />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{pay.customerName} • {pay.paymentMethod}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-xs text-emerald-600">+{formatCurrency(pay.amount)}</p>
                    <p className="text-[10px] text-slate-400">{formatDate(pay.paymentDate)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Customer Registrations */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardTitle>Recent Customer Registrations</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/customers')}>
                View all <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {recentCustomersList.map((cust) => (
                <div key={cust.id} className="p-3.5 px-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <span className="font-semibold text-xs text-slate-900">{cust.name}</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">{cust.company} • {cust.city}, {cust.country}</p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={cust.status} />
                    <p className="text-[10px] text-slate-400 mt-1">{formatDate(cust.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

