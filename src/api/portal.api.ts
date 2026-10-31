import { apiClient, extractErrorMessage, downloadBlobFile } from './client';
import { mapBackendSubscription } from './subscriptions.api';
import { mapBackendInvoice } from './invoices.api';
import { mapBackendPayment } from './payments.api';
import { mapBackendQuotation } from './quotations.api';
import { Subscription, Invoice, Payment, Quotation } from '@/types';

export interface CustomerPortalDashboard {
  stats: {
    activeSubscriptions: number;
    openInvoicesCount: number;
    outstandingBalance: number;
  };
  subscriptions: Subscription[];
  invoices: Invoice[];
  payments: Payment[];
}

export const portalApi = {
  async getDashboard(): Promise<CustomerPortalDashboard> {
    try {
      const response = await apiClient.get('/portal/dashboard');
      const data = response.data.data;

      return {
        stats: data.stats || {
          activeSubscriptions: 0,
          openInvoicesCount: 0,
          outstandingBalance: 0,
        },
        subscriptions: (data.subscriptions || []).map(mapBackendSubscription),
        invoices: (data.openInvoices || []).map(mapBackendInvoice),
        payments: (data.recentPayments || []).map(mapBackendPayment),
      };
    } catch (err: any) {
      throw new Error(extractErrorMessage(err, 'Failed to fetch customer portal dashboard.'));
    }
  },

  async getSubscriptions(): Promise<Subscription[]> {
    try {
      const response = await apiClient.get('/portal/subscriptions');
      const list = response.data.data || [];
      return list.map(mapBackendSubscription);
    } catch (err: any) {
      throw new Error(extractErrorMessage(err, 'Failed to fetch customer subscriptions.'));
    }
  },

  async getInvoices(): Promise<Invoice[]> {
    try {
      const response = await apiClient.get('/portal/invoices');
      const list = response.data.data || [];
      return list.map(mapBackendInvoice);
    } catch (err: any) {
      throw new Error(extractErrorMessage(err, 'Failed to fetch customer invoices.'));
    }
  },

  async getPayments(): Promise<Payment[]> {
    try {
      const response = await apiClient.get('/portal/payments');
      const list = response.data.data || [];
      return list.map(mapBackendPayment);
    } catch (err: any) {
      throw new Error(extractErrorMessage(err, 'Failed to fetch customer payment history.'));
    }
  },

  async getQuotations(): Promise<Quotation[]> {
    try {
      const response = await apiClient.get('/portal/quotations');
      const list = response.data.data || [];
      return list.map(mapBackendQuotation);
    } catch (err: any) {
      throw new Error(extractErrorMessage(err, 'Failed to fetch customer quotations.'));
    }
  },

  async downloadInvoicePdf(invoiceId: string, invoiceNumber = 'INV'): Promise<void> {
    try {
      const response = await apiClient.get(`/portal/invoices/${invoiceId}/pdf`, {
        responseType: 'blob',
      });
      downloadBlobFile(response.data, `Invoice-${invoiceNumber}.pdf`);
    } catch (err: any) {
      throw new Error(extractErrorMessage(err, 'Failed to download portal invoice PDF.'));
    }
  },
};

