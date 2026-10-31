import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/api/analytics.api';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { ChartCard } from '@/components/common/ChartCard';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
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
import {
  TrendingUp,
  DollarSign,
  Users,
  Repeat,
  AlertCircle,
  ShieldAlert,
  ArrowUpRight,
  Filter,
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState<'3m' | '6m' | '12m'>('12m');

  const { data: metrics } = useQuery({
    queryKey: ['analyticsMetrics'],
    queryFn: () => analyticsApi.getMetrics(),
  });

  const { data: revenueTrend = [] } = useQuery({
    queryKey: ['analyticsRevenueTrend', dateRange],
    queryFn: () => analyticsApi.getRevenueTrend(dateRange),
  });

  const { data: subGrowth = [] } = useQuery({
    queryKey: ['analyticsSubGrowth'],
    queryFn: () => analyticsApi.getSubscriptionGrowth(),
  });

  const { data: revenueByProduct = [] } = useQuery({
    queryKey: ['analyticsRevenueByProduct'],
    queryFn: () => analyticsApi.getRevenueByProduct(),
  });

  const { data: paymentCollection = [] } = useQuery({
    queryKey: ['analyticsPaymentCollection'],
    queryFn: () => analyticsApi.getPaymentCollection(),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Revenue & Performance Analytics"
        description="Deep financial insights, cohort retention, and SaaS revenue predictability indicators."
        actions={
          <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <Button
              variant={dateRange === '3m' ? 'primary' : 'ghost'}
              size="sm"
              className="h-7 text-xs"
              onClick={() => setDateRange('3m')}
            >
              3 Months
            </Button>
            <Button
              variant={dateRange === '6m' ? 'primary' : 'ghost'}
              size="sm"
              className="h-7 text-xs"
              onClick={() => setDateRange('6m')}
            >
              6 Months
            </Button>
            <Button
              variant={dateRange === '12m' ? 'primary' : 'ghost'}
              size="sm"
              className="h-7 text-xs"
              onClick={() => setDateRange('12m')}
            >
              12 Months
            </Button>
          </div>
        }
      />

      {/* KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Monthly Recurring Revenue (MRR)"
          value={metrics ? formatCurrency(metrics.mrr) : '—'}
          change={12.4}
          changePeriod="month-over-month"
          icon={<DollarSign className="w-5 h-5 text-blue-600" />}
        />
        <StatCard
          title="Annual Recurring Revenue (ARR)"
          value={metrics ? formatCurrency(metrics.arr) : '—'}
          change={15.8}
          changePeriod="run rate"
          icon={<TrendingUp className="w-5 h-5 text-indigo-600" />}
        />
        <StatCard
          title="Customer Retention / Churn"
          value="97.4%"
          change={1.2}
          changePeriod="healthy benchmark"
          icon={<Users className="w-5 h-5 text-emerald-600" />}
        />
        <StatCard
          title="Collection Settlement Rate"
          value="95.8%"
          change={3.1}
          changePeriod="vs previous quarter"
          icon={<Repeat className="w-5 h-5 text-purple-600" />}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trends with Expenses & MRR */}
        <ChartCard
          title="Revenue vs Operating Expenses"
          description="Comparison of net gross billing revenue versus cloud platform costs"
        >
          <ResponsiveContainer width="100%" height={290}>
            <AreaChart data={revenueTrend} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="colRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colExp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
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
              <Area type="monotone" dataKey="revenue" name="Total Revenue" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colRev)" />
              <Area type="monotone" dataKey="expenses" name="Operating Expenses" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colExp)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Net Subscription Additions */}
        <ChartCard
          title="Net Subscription Additions & Churn"
          description="Net subscription additions after accounting for cancellations"
        >
          <ResponsiveContainer width="100%" height={290}>
            <BarChart data={subGrowth} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="newSubscriptions" name="New Subscriptions" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="churnedSubscriptions" name="Churned" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Collection Rate Breakdown */}
        <ChartCard
          title="Payment Collection & Settlement Quality"
          description="Volume of payments collected on time vs delayed or overdue"
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={paymentCollection} layout="vertical" margin={{ top: 10, right: 20, left: 40, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `₹${val / 1000}k`} />
              <YAxis dataKey="status" type="category" stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip
                formatter={(val: any) => [formatCurrency(Number(val)), 'Collected Amount']}
                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
              <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                {paymentCollection.map((entry, index) => (
                  <Cell key={`bar-cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Revenue Contribution by Product */}
        <ChartCard
          title="Revenue Concentration by Product"
          description="Percentage distribution of gross billing by product catalogue item"
        >
          <div className="space-y-4 pt-2">
            {revenueByProduct.map((p: any) => (
              <div key={p.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{p.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{formatCurrency(p.revenue)}</span>
                    <span className="text-[11px] text-slate-400">({p.percentage}%)</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${p.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
};

