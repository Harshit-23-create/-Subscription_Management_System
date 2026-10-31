import { Customer } from '@/types';
import { apiClient, extractErrorMessage } from './client';

export const mapBackendCustomer = (c: any): Customer => ({
  id: c._id?.toString() || c.id || '',
  name: c.name || '',
  email: c.email || '',
  company: c.companyName || c.company || '',
  phone: c.phone || '',
  status:
    c.status?.toUpperCase() === 'ACTIVE'
      ? 'active'
      : c.status?.toUpperCase() === 'SUSPENDED'
      ? 'inactive'
      : 'lead',
  subscriptionCount: c.subscriptionCount || 0,
  totalRevenue: c.balance !== undefined ? c.balance : 0,
  address: c.billingAddress?.street || c.address || '',
  city: c.billingAddress?.city || c.city || '',
  country: c.billingAddress?.country || c.country || 'US',
  postalCode: c.billingAddress?.postalCode || c.postalCode || '',
  taxNumber: c.taxId || c.taxNumber || '',
  notes: c.notes || '',
  createdAt: c.createdAt || new Date().toISOString(),
});

export const customersApi = {
  async getAll(query?: { search?: string; status?: string; page?: number; limit?: number }): Promise<Customer[]> {
    try {
      const params: any = { limit: query?.limit || 50 };
      if (query?.search) params.search = query.search;
      if (query?.status) params.status = query.status.toUpperCase();
      if (query?.page) params.page = query.page;

      const response = await apiClient.get('/customers', { params });
      const rawList = response.data.data || [];
      return rawList.map(mapBackendCustomer);
    } catch (err: any) {
      throw new Error(extractErrorMessage(err, 'Failed to fetch customer directory from server.'));
    }
  },

  async getById(id: string): Promise<Customer | undefined> {
    try {
      const response = await apiClient.get(`/customers/${id}`);
      const payload = response.data.data;
      const rawCustomer = payload.customer || payload;
      return mapBackendCustomer(rawCustomer);
    } catch (err: any) {
      throw new Error(extractErrorMessage(err, `Failed to fetch customer profile with ID ${id}.`));
    }
  },

  async create(data: Omit<Customer, 'id' | 'createdAt' | 'subscriptionCount' | 'totalRevenue'>): Promise<Customer> {
    try {
      const body = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        companyName: data.company,
        billingAddress: {
          street: data.address,
          city: data.city,
          country: data.country || 'US',
          postalCode: data.postalCode,
        },
        taxId: data.taxNumber,
        currency: 'USD',
        notes: data.notes,
      };

      const response = await apiClient.post('/customers', body);
      return mapBackendCustomer(response.data.data);
    } catch (err: any) {
      throw new Error(extractErrorMessage(err, 'Failed to create customer on server.'));
    }
  },

  async update(id: string, updates: Partial<Customer>): Promise<Customer> {
    try {
      const body: any = {};
      if (updates.name !== undefined) body.name = updates.name;
      if (updates.email !== undefined) body.email = updates.email;
      if (updates.phone !== undefined) body.phone = updates.phone;
      if (updates.company !== undefined) body.companyName = updates.company;
      if (updates.notes !== undefined) body.notes = updates.notes;
      if (updates.taxNumber !== undefined) body.taxId = updates.taxNumber;
      if (updates.status) {
        body.status = updates.status === 'active' ? 'ACTIVE' : updates.status === 'inactive' ? 'SUSPENDED' : 'ARCHIVED';
      }
      if (updates.address || updates.city || updates.country || updates.postalCode) {
        body.billingAddress = {
          street: updates.address,
          city: updates.city,
          country: updates.country,
          postalCode: updates.postalCode,
        };
      }

      const response = await apiClient.put(`/customers/${id}`, body);
      return mapBackendCustomer(response.data.data);
    } catch (err: any) {
      throw new Error(extractErrorMessage(err, 'Failed to update customer on server.'));
    }
  },

  async delete(id: string): Promise<void> {
    // Backend archives or suspends customer for audit compliance
    try {
      await apiClient.put(`/customers/${id}`, { status: 'ARCHIVED' });
    } catch (err: any) {
      throw new Error(extractErrorMessage(err, 'Failed to archive customer record.'));
    }
  },
};
