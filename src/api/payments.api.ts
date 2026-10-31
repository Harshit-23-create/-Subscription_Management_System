import { Payment, PaymentMethod, PaymentStatus } from '@/types';
import { apiClient, extractErrorMessage, downloadBlobFile } from './client';

export const mapBackendPayment = (p: any): Payment => {
  const customer = typeof p.customerId === 'object' && p.customerId ? p.customerId : null;
  const invoice = typeof p.invoiceId === 'object' && p.invoiceId ? p.invoiceId : null;

  const methodMap: Record<string, PaymentMethod> = {
    CREDIT_CARD: 'Card',
    BANK_TRANSFER: 'Bank Transfer',
    CASH: 'Cash',
    STRIPE_MOCK: 'Online Payment',
  };

  const statusMap: Record<string, PaymentStatus> = {
    SUCCESS: 'Success',
    PENDING: 'Pending',
    FAILED: 'Failed',
    REFUNDED: 'Success',
  };

  return {
    id: p._id?.toString() || p.id || '',
    transactionId: p.transactionReference || p.paymentNumber || `TXN-${p._id?.toString().slice(-6)}`,
    invoiceId: invoice ? invoice._id?.toString() : p.invoiceId?.toString() || '',
    invoiceNumber: invoice ? invoice.invoiceNumber : 'INV-AUTO',
    customerId: customer ? customer._id?.toString() : p.customerId?.toString() || '',
    customerName: customer ? customer.name : 'Acme Corporation',
    amount: p.amount || 0,
    paymentMethod: methodMap[p.paymentMethod] || 'Card',
    paymentDate: p.paymentDate || p.createdAt || new Date().toISOString(),
    status: statusMap[p.status] || 'Success',
    notes: p.notes || '',
  };
};

export const paymentsApi = {
  async getAll(query?: { customerId?: string; invoiceId?: string }): Promise<Payment[]> {
    try {
      const response = await apiClient.get('/payments', { params: query });
      const list = response.data.data || [];
      return list.map(mapBackendPayment);
    } catch (err: any) {
      throw new Error(extractErrorMessage(err, 'Failed to fetch payment records from server.'));
    }
  },

  async getById(id: string): Promise<Payment | undefined> {
    try {
      const response = await apiClient.get(`/payments/${id}`);
      return mapBackendPayment(response.data.data);
    } catch (err: any) {
      throw new Error(extractErrorMessage(err, `Failed to fetch payment ${id}.`));
    }
  },

  async record(data: {
    customerId: string;
    invoiceId: string;
    amount: number;
    paymentMethod?: string;
    transactionReference?: string;
    notes?: string;
  }): Promise<Payment> {
    try {
      const methodMap: Record<string, string> = {
        Card: 'CREDIT_CARD',
        'Bank Transfer': 'BANK_TRANSFER',
        Cash: 'CASH',
        'Online Payment': 'STRIPE_MOCK',
      };

      const backendMethod = data.paymentMethod ? methodMap[data.paymentMethod] || 'CREDIT_CARD' : 'CREDIT_CARD';

      const response = await apiClient.post('/payments', {
        customerId: data.customerId,
        invoiceId: data.invoiceId,
        amount: data.amount,
        paymentMethod: backendMethod,
        transactionReference: data.transactionReference,
        notes: data.notes,
      });

      return mapBackendPayment(response.data.data);
    } catch (err: any) {
      throw new Error(extractErrorMessage(err, 'Failed to record payment on server.'));
    }
  },

  recordPayment(data: {
    customerId: string;
    invoiceId: string;
    amount: number;
    paymentMethod?: string;
    transactionReference?: string;
    notes?: string;
  }): Promise<Payment> {
    return this.record(data);
  },

  async refund(id: string, amount: number, reason: string): Promise<Payment> {
    try {
      const response = await apiClient.post(`/payments/${id}/refund`, {
        amount,
        reason,
      });
      return mapBackendPayment(response.data.data);
    } catch (err: any) {
      throw new Error(extractErrorMessage(err, 'Failed to process refund.'));
    }
  },

  async downloadReceipt(id: string, paymentNumber: string = 'PAY'): Promise<void> {
    try {
      const response = await apiClient.get(`/payments/${id}/receipt`, {
        responseType: 'blob',
      });
      downloadBlobFile(response.data, `Receipt-${paymentNumber}.pdf`);
    } catch (err: any) {
      throw new Error(extractErrorMessage(err, 'Failed to download payment receipt PDF.'));
    }
  },
};
