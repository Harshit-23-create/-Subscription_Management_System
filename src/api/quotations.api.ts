import { Quotation, QuotationStatus } from '@/types';
import { apiClient, extractErrorMessage, downloadBlobFile } from './client';

export const mapBackendQuotation = (q: any): Quotation => {
  const customer = typeof q.customerId === 'object' && q.customerId ? q.customerId : null;
  const statusMap: Record<string, QuotationStatus> = {
    DRAFT: 'draft',
    SENT: 'sent',
    ACCEPTED: 'accepted',
    REJECTED: 'expired',
    EXPIRED: 'expired',
    CONVERTED: 'converted',
  };

  return {
    id: q._id?.toString() || q.id || '',
    quotationNumber: q.quotationNumber || 'QUO-0000',
    customerId: customer ? customer._id?.toString() : q.customerId?.toString() || '',
    customerName: customer ? customer.name : 'Valued Customer',
    customerEmail: customer ? customer.email : 'billing@customer.com',
    date: q.createdAt || new Date().toISOString(),
    expirationDate: q.validUntil || new Date(Date.now() + 14 * 86400000).toISOString(),
    status: statusMap[q.status?.toUpperCase()] || 'draft',
    lines: (q.items || []).map((item: any, idx: number) => ({
      id: item._id?.toString() || `line-${idx}`,
      productId: item.planId?._id || item.planId || 'prod-default',
      productName: item.description || 'Subscription Line',
      quantity: item.quantity || 1,
      unitPrice: item.unitPrice || 0,
      discountPercent: 0,
      taxPercent: 0,
      total: item.subtotal || item.total || (item.unitPrice || 0) * (item.quantity || 1),
    })),
    subtotal: q.subtotal || 0,
    taxAmount: q.taxAmount || 0,
    discountAmount: q.discountAmount || 0,
    totalAmount: q.totalAmount || 0,
    notes: q.notes || '',
    convertedSubscriptionId: q.convertedInvoiceId?.toString(),
  };
};

export const quotationsApi = {
  async getAll(query?: { customerId?: string; status?: string }): Promise<Quotation[]> {
    try {
      const params: any = {};
      if (query?.customerId) params.customerId = query.customerId;
      if (query?.status) params.status = query.status.toUpperCase();

      const response = await apiClient.get('/quotations', { params });
      const list = response.data.data || [];
      return list.map(mapBackendQuotation);
    } catch (err: any) {
      throw new Error(extractErrorMessage(err, 'Failed to fetch quotations from server.'));
    }
  },

  async getById(id: string): Promise<Quotation | undefined> {
    try {
      const response = await apiClient.get(`/quotations/${id}`);
      return mapBackendQuotation(response.data.data);
    } catch (err: any) {
      throw new Error(extractErrorMessage(err, `Failed to fetch quotation ${id}.`));
    }
  },

  async create(data: {
    customerId: string;
    lines: Array<{ description?: string; planId?: string; quantity: number; unitPrice: number }>;
    expirationDate: string;
    notes?: string;
    discountId?: string;
    taxRateId?: string;
  }): Promise<Quotation> {
    try {
      const items = data.lines.map((l) => ({
        description: l.description || 'Enterprise Subscription Item',
        planId: l.planId,
        unitPrice: l.unitPrice,
        quantity: l.quantity,
      }));

      const response = await apiClient.post('/quotations', {
        customerId: data.customerId,
        items,
        discountId: data.discountId,
        taxRateId: data.taxRateId,
        validUntil: new Date(data.expirationDate).toISOString(),
        notes: data.notes || '',
        terms: 'Net 15 days payment terms upon acceptance.',
      });

      return mapBackendQuotation(response.data.data);
    } catch (err: any) {
      throw new Error(extractErrorMessage(err, 'Failed to create quotation on server.'));
    }
  },

  async updateStatus(id: string, status: QuotationStatus): Promise<Quotation> {
    try {
      const backendStatusMap: Record<QuotationStatus, string> = {
        draft: 'DRAFT',
        sent: 'SENT',
        accepted: 'ACCEPTED',
        expired: 'EXPIRED',
        converted: 'CONVERTED',
      };

      const response = await apiClient.patch(`/quotations/${id}/status`, {
        status: backendStatusMap[status] || 'SENT',
      });
      return mapBackendQuotation(response.data.data);
    } catch (err: any) {
      throw new Error(extractErrorMessage(err, 'Failed to update quotation status.'));
    }
  },

  async convertToInvoice(id: string): Promise<{ invoiceId: string }> {
    try {
      const response = await apiClient.post(`/quotations/${id}/convert-to-invoice`);
      return { invoiceId: response.data.data._id };
    } catch (err: any) {
      throw new Error(extractErrorMessage(err, 'Failed to convert quotation to invoice.'));
    }
  },

  async convertToSubscription(id: string): Promise<{ subscriptionNumber: string; status: string }> {
    try {
      const response = await apiClient.post(`/quotations/${id}/convert-to-invoice`);
      const inv = response.data.data;
      return {
        subscriptionNumber: inv.invoiceNumber || 'INV-CONVERTED',
        status: 'Active',
      };
    } catch (err: any) {
      throw new Error(extractErrorMessage(err, 'Failed to convert quotation.'));
    }
  },

  async downloadPdf(id: string, quotationNumber: string = 'QUO'): Promise<void> {
    try {
      const response = await apiClient.get(`/quotations/${id}/pdf`, {
        responseType: 'blob',
      });
      downloadBlobFile(response.data, `Quotation-${quotationNumber}.pdf`);
    } catch (err: any) {
      throw new Error(extractErrorMessage(err, 'Failed to download quotation PDF.'));
    }
  },
};
