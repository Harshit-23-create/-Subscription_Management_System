import { Invoice, InvoiceStatus } from '@/types';
import { apiClient, extractErrorMessage, downloadBlobFile } from './client';

export const mapBackendInvoice = (i: any): Invoice => {
  const customer = typeof i.customerId === 'object' && i.customerId ? i.customerId : null;
  const isOverdue = i.status === 'OPEN' && new Date(i.dueDate) < new Date();

  const statusMap: Record<string, InvoiceStatus> = {
    DRAFT: 'Draft',
    OPEN: isOverdue ? 'Overdue' : 'Confirmed',
    PAID: 'Paid',
    VOID: 'Cancelled',
    UNCOLLECTIBLE: 'Cancelled',
  };

  return {
    id: i._id?.toString() || i.id || '',
    invoiceNumber: i.invoiceNumber || 'INV-0000',
    subscriptionId: i.subscriptionId?.toString(),
    customerId: customer ? customer._id?.toString() : i.customerId?.toString() || '',
    customerName: customer ? customer.name : 'Valued Client',
    customerEmail: customer ? customer.email : 'billing@client.com',
    invoiceDate: i.issueDate || i.createdAt || new Date().toISOString(),
    dueDate: i.dueDate || new Date().toISOString(),
    status: statusMap[i.status?.toUpperCase()] || 'Confirmed',
    items: (i.items || []).map((item: any, idx: number) => ({
      id: item._id?.toString() || `inv-item-${idx}`,
      description: item.description || 'Enterprise SaaS License',
      quantity: item.quantity || 1,
      unitPrice: item.unitPrice || 0,
      total: item.amount || (item.unitPrice || 0) * (item.quantity || 1),
    })),
    subtotal: i.subtotal || 0,
    taxAmount: i.taxAmount || 0,
    discountAmount: i.discountAmount || 0,
    totalAmount: i.totalAmount || 0,
    amountPaid: i.amountPaid || 0,
    outstandingAmount: i.amountDue !== undefined ? i.amountDue : i.totalAmount - (i.amountPaid || 0),
    paymentMethod: 'Credit Card / Wire',
    notes: i.notes || '',
  };
};

export const invoicesApi = {
  async getAll(query?: { customerId?: string; subscriptionId?: string; status?: string }): Promise<Invoice[]> {
    try {
      const params: any = {};
      if (query?.customerId) params.customerId = query.customerId;
      if (query?.subscriptionId) params.subscriptionId = query.subscriptionId;
      if (query?.status) params.status = query.status.toUpperCase();

      const response = await apiClient.get('/invoices', { params });
      const list = response.data.data || [];
      return list.map(mapBackendInvoice);
    } catch (err: any) {
      throw new Error(extractErrorMessage(err, 'Failed to fetch invoices from server.'));
    }
  },

  async getById(id: string): Promise<Invoice | undefined> {
    try {
      const response = await apiClient.get(`/invoices/${id}`);
      return mapBackendInvoice(response.data.data);
    } catch (err: any) {
      throw new Error(extractErrorMessage(err, `Failed to fetch invoice ${id}.`));
    }
  },

  async create(data: {
    customerId: string;
    subscriptionId?: string;
    items: Array<{ description: string; planId?: string; quantity: number; unitPrice: number }>;
    dueDate: string;
    notes?: string;
    discountId?: string;
    taxRateId?: string;
  }): Promise<Invoice> {
    try {
      const response = await apiClient.post('/invoices', {
        customerId: data.customerId,
        subscriptionId: data.subscriptionId,
        items: data.items,
        discountId: data.discountId,
        taxRateId: data.taxRateId,
        dueDate: new Date(data.dueDate).toISOString(),
        notes: data.notes || '',
      });

      return mapBackendInvoice(response.data.data);
    } catch (err: any) {
      throw new Error(extractErrorMessage(err, 'Failed to generate invoice on server.'));
    }
  },

  async updateStatus(id: string, status: string): Promise<Invoice> {
    try {
      const statusMap: Record<string, string> = {
        Draft: 'DRAFT',
        Confirmed: 'OPEN',
        Paid: 'PAID',
        Cancelled: 'VOID',
        Overdue: 'OPEN',
        OPEN: 'OPEN',
        PAID: 'PAID',
        VOID: 'VOID',
      };
      const backendStatus = statusMap[status] || 'OPEN';
      const response = await apiClient.patch(`/invoices/${id}/status`, { status: backendStatus });
      return mapBackendInvoice(response.data.data);
    } catch (err: any) {
      throw new Error(extractErrorMessage(err, 'Failed to update invoice status.'));
    }
  },

  async downloadPdf(id: string, invoiceNumber: string = 'INV'): Promise<void> {
    try {
      const response = await apiClient.get(`/invoices/${id}/pdf`, {
        responseType: 'blob',
      });
      downloadBlobFile(response.data, `Invoice-${invoiceNumber}.pdf`);
    } catch (err: any) {
      throw new Error(extractErrorMessage(err, 'Failed to download official invoice PDF.'));
    }
  },
};
