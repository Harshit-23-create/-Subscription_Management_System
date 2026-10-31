import { Tax, TaxType, TaxStatus } from '@/types';
import { apiClient, extractErrorMessage } from './client';

export const mapBackendTax = (t: any): Tax => ({
  id: t._id?.toString() || t.id || '',
  name: `${t.name} (${t.jurisdiction || 'General'})`,
  percentage: t.percentage || 0,
  type: (t.isInclusive ? 'inclusive' : 'exclusive') as TaxType,
  applicableProducts: ['all'],
  effectiveFrom: t.createdAt || new Date().toISOString(),
  status: (t.active !== false ? 'active' : 'inactive') as TaxStatus,
});

export const taxesApi = {
  async getAll(): Promise<Tax[]> {
    try {
      const response = await apiClient.get('/taxes');
      const list = response.data.data || [];
      return list.map(mapBackendTax);
    } catch (err: any) {
      throw new Error(extractErrorMessage(err, 'Failed to fetch tax rates from server.'));
    }
  },

  async create(data: Omit<Tax, 'id'>): Promise<Tax> {
    try {
      const response = await apiClient.post('/taxes', {
        name: data.name,
        jurisdiction: 'Default Region',
        percentage: data.percentage,
        isInclusive: data.type === 'inclusive',
        active: data.status === 'active',
      });

      return mapBackendTax(response.data.data);
    } catch (err: any) {
      throw new Error(extractErrorMessage(err, 'Failed to configure tax rate on server.'));
    }
  },

  async update(id: string, updates: Partial<Tax>): Promise<Tax> {
    try {
      const body: any = {};
      if (updates.name) body.name = updates.name;
      if (updates.percentage !== undefined) body.percentage = updates.percentage;
      if (updates.type) body.isInclusive = updates.type === 'inclusive';
      if (updates.status) body.active = updates.status === 'active';

      const response = await apiClient.put(`/taxes/${id}`, body);
      return mapBackendTax(response.data.data);
    } catch (err: any) {
      throw new Error(extractErrorMessage(err, 'Failed to update tax rate on server.'));
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await apiClient.put(`/taxes/${id}`, { active: false });
    } catch (err: any) {
      throw new Error(extractErrorMessage(err, 'Failed to disable tax rate.'));
    }
  },
};
