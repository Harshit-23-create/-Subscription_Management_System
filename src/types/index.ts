export type UserRole = 'admin' | 'staff' | 'customer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  company?: string;
  customerId?: string; // Links customer role to specific customer entity
}

export type CustomerStatus = 'active' | 'inactive' | 'lead';

export interface Customer {
  id: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  status: CustomerStatus;
  subscriptionCount: number;
  totalRevenue: number;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  taxNumber?: string;
  notes?: string;
  createdAt: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  additionalPrice: number;
  sku: string;
}

export type ProductType = 'software' | 'service' | 'addon';
export type ProductStatus = 'active' | 'archived';

export interface Product {
  id: string;
  name: string;
  type: ProductType;
  salesPrice: number;
  costPrice: number;
  description: string;
  variants: ProductVariant[];
  status: ProductStatus;
  createdAt: string;
}

export type BillingInterval = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type PlanStatus = 'active' | 'inactive';

export interface Plan {
  id: string;
  productId: string;
  productName: string;
  name: string;
  billingInterval: BillingInterval;
  price: number;
  minQuantity: number;
  startDate: string;
  endDate?: string;
  status: PlanStatus;
  description?: string;
  trialPeriodDays?: number;
}

export interface QuotationLineItem {
  id: string;
  productId: string;
  productName: string;
  variantId?: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  taxPercent: number;
  total: number;
}

export type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'expired' | 'converted';

export interface Quotation {
  id: string;
  quotationNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  date: string;
  expirationDate: string;
  status: QuotationStatus;
  lines: QuotationLineItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  notes?: string;
  convertedSubscriptionId?: string;
}

export type SubscriptionStatus = 'Draft' | 'Quotation' | 'Confirmed' | 'Active' | 'Closed' | 'Paused';

export interface SubscriptionTimelineEvent {
  id: string;
  date: string;
  action: string;
  performedBy: string;
  notes?: string;
}

export interface SubscriptionLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Subscription {
  id: string;
  subscriptionNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  planId: string;
  planName: string;
  productId: string;
  productName: string;
  billingInterval: BillingInterval;
  startDate: string;
  expiryDate: string;
  nextBillingDate?: string;
  amount: number;
  status: SubscriptionStatus;
  paymentTerms: string;
  autoRenew: boolean;
  lines: SubscriptionLineItem[];
  timeline: SubscriptionTimelineEvent[];
}

export type InvoiceStatus = 'Draft' | 'Confirmed' | 'Paid' | 'Cancelled' | 'Overdue';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  subscriptionId?: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  invoiceDate: string;
  dueDate: string;
  status: InvoiceStatus;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  amountPaid: number;
  outstandingAmount: number;
  paymentMethod?: string;
  notes?: string;
}

export type PaymentMethod = 'Cash' | 'Bank Transfer' | 'Card' | 'Online Payment';
export type PaymentStatus = 'Success' | 'Pending' | 'Failed';

export interface Payment {
  id: string;
  transactionId: string;
  invoiceId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  status: PaymentStatus;
  notes?: string;
}

export type DiscountType = 'percentage' | 'fixed';
export type DiscountStatus = 'active' | 'expired' | 'inactive';

export interface Discount {
  id: string;
  name: string;
  code: string;
  type: DiscountType;
  value: number; // Percentage (e.g. 15%) or Fixed amount (e.g. 500)
  minPurchase: number;
  minQuantity: number;
  startDate: string;
  expiryDate: string;
  maxUsage: number;
  usedCount: number;
  applicableProducts: string[]; // Product IDs or 'all'
  status: DiscountStatus;
}

export type TaxType = 'exclusive' | 'inclusive';
export type TaxStatus = 'active' | 'inactive';

export interface Tax {
  id: string;
  name: string;
  percentage: number;
  type: TaxType;
  applicableProducts: string[];
  effectiveFrom: string;
  effectiveTo?: string;
  status: TaxStatus;
}

export interface OverviewMetrics {
  totalCustomers: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  mrr: number;
  arr: number;
  totalRevenue: number;
  outstandingPayments: number;
  overdueInvoices: number;
}

export interface RevenueTrendItem {
  month: string;
  revenue: number;
  mrr: number;
  expenses: number;
}

export interface SubscriptionGrowthItem {
  month: string;
  newSubscriptions: number;
  churnedSubscriptions: number;
  netGrowth: number;
}

export interface ProductRevenueItem {
  name: string;
  revenue: number;
  subscriptionsCount: number;
  percentage: number;
}

export interface PaymentCollectionItem {
  status: string;
  count: number;
  amount: number;
  color: string;
}

