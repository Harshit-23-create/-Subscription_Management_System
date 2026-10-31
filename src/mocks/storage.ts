import {
  Customer, Product, Plan, Quotation, Subscription, Invoice, Payment, Discount, Tax, OverviewMetrics
} from '@/types';
import { initialCustomers } from './customers.mock';
import { initialProducts } from './products.mock';
import { initialPlans } from './plans.mock';
import { initialQuotations } from './quotations.mock';
import { initialSubscriptions } from './subscriptions.mock';
import { initialInvoices } from './invoices.mock';
import { initialPayments } from './payments.mock';
import { initialDiscounts } from './discounts.mock';
import { initialTaxes } from './taxes.mock';
import { initialOverviewMetrics } from './analytics.mock';

const STORAGE_KEYS = {
  CUSTOMERS: 'bl_mock_customers',
  PRODUCTS: 'bl_mock_products',
  PLANS: 'bl_mock_plans',
  QUOTATIONS: 'bl_mock_quotations',
  SUBSCRIPTIONS: 'bl_mock_subscriptions',
  INVOICES: 'bl_mock_invoices',
  PAYMENTS: 'bl_mock_payments',
  DISCOUNTS: 'bl_mock_discounts',
  TAXES: 'bl_mock_taxes',
  METRICS: 'bl_mock_metrics',
};

function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Failed to save ${key} to localStorage:`, error);
  }
}

export class MockStorage {
  // Customers
  static getCustomers(): Customer[] {
    return getFromStorage<Customer[]>(STORAGE_KEYS.CUSTOMERS, initialCustomers);
  }

  static saveCustomers(customers: Customer[]): void {
    saveToStorage(STORAGE_KEYS.CUSTOMERS, customers);
  }

  // Products
  static getProducts(): Product[] {
    return getFromStorage<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
  }

  static saveProducts(products: Product[]): void {
    saveToStorage(STORAGE_KEYS.PRODUCTS, products);
  }

  // Plans
  static getPlans(): Plan[] {
    return getFromStorage<Plan[]>(STORAGE_KEYS.PLANS, initialPlans);
  }

  static savePlans(plans: Plan[]): void {
    saveToStorage(STORAGE_KEYS.PLANS, plans);
  }

  // Quotations
  static getQuotations(): Quotation[] {
    return getFromStorage<Quotation[]>(STORAGE_KEYS.QUOTATIONS, initialQuotations);
  }

  static saveQuotations(quotations: Quotation[]): void {
    saveToStorage(STORAGE_KEYS.QUOTATIONS, quotations);
  }

  // Subscriptions
  static getSubscriptions(): Subscription[] {
    return getFromStorage<Subscription[]>(STORAGE_KEYS.SUBSCRIPTIONS, initialSubscriptions);
  }

  static saveSubscriptions(subscriptions: Subscription[]): void {
    saveToStorage(STORAGE_KEYS.SUBSCRIPTIONS, subscriptions);
  }

  // Invoices
  static getInvoices(): Invoice[] {
    return getFromStorage<Invoice[]>(STORAGE_KEYS.INVOICES, initialInvoices);
  }

  static saveInvoices(invoices: Invoice[]): void {
    saveToStorage(STORAGE_KEYS.INVOICES, invoices);
  }

  // Payments
  static getPayments(): Payment[] {
    return getFromStorage<Payment[]>(STORAGE_KEYS.PAYMENTS, initialPayments);
  }

  static savePayments(payments: Payment[]): void {
    saveToStorage(STORAGE_KEYS.PAYMENTS, payments);
  }

  // Discounts
  static getDiscounts(): Discount[] {
    return getFromStorage<Discount[]>(STORAGE_KEYS.DISCOUNTS, initialDiscounts);
  }

  static saveDiscounts(discounts: Discount[]): void {
    saveToStorage(STORAGE_KEYS.DISCOUNTS, discounts);
  }

  // Taxes
  static getTaxes(): Tax[] {
    return getFromStorage<Tax[]>(STORAGE_KEYS.TAXES, initialTaxes);
  }

  static saveTaxes(taxes: Tax[]): void {
    saveToStorage(STORAGE_KEYS.TAXES, taxes);
  }

  // Metrics
  static getMetrics(): OverviewMetrics {
    return getFromStorage<OverviewMetrics>(STORAGE_KEYS.METRICS, initialOverviewMetrics);
  }

  static resetAll(): void {
    saveToStorage(STORAGE_KEYS.CUSTOMERS, initialCustomers);
    saveToStorage(STORAGE_KEYS.PRODUCTS, initialProducts);
    saveToStorage(STORAGE_KEYS.PLANS, initialPlans);
    saveToStorage(STORAGE_KEYS.QUOTATIONS, initialQuotations);
    saveToStorage(STORAGE_KEYS.SUBSCRIPTIONS, initialSubscriptions);
    saveToStorage(STORAGE_KEYS.INVOICES, initialInvoices);
    saveToStorage(STORAGE_KEYS.PAYMENTS, initialPayments);
    saveToStorage(STORAGE_KEYS.DISCOUNTS, initialDiscounts);
    saveToStorage(STORAGE_KEYS.TAXES, initialTaxes);
    saveToStorage(STORAGE_KEYS.METRICS, initialOverviewMetrics);
  }
}

