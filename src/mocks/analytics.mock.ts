import { OverviewMetrics, RevenueTrendItem, SubscriptionGrowthItem, ProductRevenueItem, PaymentCollectionItem } from '@/types';

export const initialOverviewMetrics: OverviewMetrics = {
  totalCustomers: 1248,
  totalSubscriptions: 892,
  activeSubscriptions: 745,
  mrr: 185400,
  arr: 2224800,
  totalRevenue: 2780500,
  outstandingPayments: 24350,
  overdueInvoices: 14,
};

export const monthlyRevenueData: RevenueTrendItem[] = [
  { month: 'Jan', revenue: 145000, mrr: 110000, expenses: 42000 },
  { month: 'Feb', revenue: 168000, mrr: 122000, expenses: 45000 },
  { month: 'Mar', revenue: 184000, mrr: 135000, expenses: 49000 },
  { month: 'Apr', revenue: 198000, mrr: 144000, expenses: 51000 },
  { month: 'May', revenue: 215000, mrr: 153000, expenses: 55000 },
  { month: 'Jun', revenue: 228000, mrr: 161000, expenses: 58000 },
  { month: 'Jul', revenue: 239000, mrr: 167000, expenses: 60000 },
  { month: 'Aug', revenue: 247000, mrr: 172000, expenses: 62000 },
  { month: 'Sep', revenue: 262000, mrr: 179000, expenses: 64000 },
  { month: 'Oct', revenue: 285000, mrr: 185400, expenses: 66000 },
];

export const subscriptionGrowthData: SubscriptionGrowthItem[] = [
  { month: 'Jan', newSubscriptions: 48, churnedSubscriptions: 6, netGrowth: 42 },
  { month: 'Feb', newSubscriptions: 55, churnedSubscriptions: 8, netGrowth: 47 },
  { month: 'Mar', newSubscriptions: 64, churnedSubscriptions: 7, netGrowth: 57 },
  { month: 'Apr', newSubscriptions: 58, churnedSubscriptions: 9, netGrowth: 49 },
  { month: 'May', newSubscriptions: 72, churnedSubscriptions: 5, netGrowth: 67 },
  { month: 'Jun', newSubscriptions: 69, churnedSubscriptions: 8, netGrowth: 61 },
  { month: 'Jul', newSubscriptions: 77, churnedSubscriptions: 11, netGrowth: 66 },
  { month: 'Aug', newSubscriptions: 83, churnedSubscriptions: 9, netGrowth: 74 },
  { month: 'Sep', newSubscriptions: 91, churnedSubscriptions: 12, netGrowth: 79 },
  { month: 'Oct', newSubscriptions: 104, churnedSubscriptions: 10, netGrowth: 94 },
];

export const activeVsCancelledData = [
  { name: 'Active', value: 745, color: '#0ea5e9' },
  { name: 'Paused', value: 42, color: '#f59e0b' },
  { name: 'Confirmed (Pending)', value: 38, color: '#8b5cf6' },
  { name: 'Closed / Cancelled', value: 67, color: '#ef4444' },
];

export const revenueByProductData: ProductRevenueItem[] = [
  { name: 'SmartCare Core Suite', revenue: 1280000, subscriptionsCount: 420, percentage: 46 },
  { name: 'Revenue Analytics Pro', revenue: 640000, subscriptionsCount: 180, percentage: 23 },
  { name: 'Enterprise Priority Support', revenue: 450000, subscriptionsCount: 45, percentage: 16 },
  { name: 'Tax & GST Module', revenue: 280000, subscriptionsCount: 190, percentage: 10 },
  { name: 'Webhook & API Gateway', revenue: 130500, subscriptionsCount: 57, percentage: 5 },
];

export const paymentCollectionData: PaymentCollectionItem[] = [
  { status: 'Paid On Time', count: 680, amount: 2450000, color: '#10b981' },
  { status: 'Paid Late', count: 85, amount: 280000, color: '#3b82f6' },
  { status: 'Pending Clearance', count: 18, amount: 48000, color: '#f59e0b' },
  { status: 'Overdue / Default', count: 14, amount: 24350, color: '#ef4444' },
];

