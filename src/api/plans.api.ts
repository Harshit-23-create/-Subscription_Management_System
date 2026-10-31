import { Plan } from '@/types';
import { apiClient, extractErrorMessage } from './client';

export const mapBackendPlan = (p: any): Plan => ({
  id: p._id?.toString() || p.id || '',
  productId: typeof p.productId === 'object' ? p.productId._id?.toString() : p.productId?.toString() || '',
  productName: typeof p.productId === 'object' && p.productId ? p.productId.name : 'Brightloop Core Platform',
  name: p.name || '',
  billingInterval: (p.billingInterval || 'MONTHLY').toLowerCase() as any,
  price: p.price || 0,
  minQuantity: 1,
  startDate: p.createdAt || new Date().toISOString(),
  status: p.active !== false ? 'active' : 'inactive',
  description: p.description || '',
  trialPeriodDays: p.trialPeriodDays || 0,
});

export const plansApi = {
  async getAll(query?: { productId?: string; billingInterval?: string; active?: boolean }): Promise<Plan[]> {
    try {
      const params: any = {};
      if (query?.productId) params.productId = query.productId;
      if (query?.billingInterval) params.billingInterval = query.billingInterval.toUpperCase();
      if (typeof query?.active === 'boolean') params.active = query.active;

      const response = await apiClient.get('/plans', { params });
      const rawList = response.data.data || [];
      return rawList.map(mapBackendPlan);
    } catch (err: any) {
      throw new Error(extractErrorMessage(err, 'Failed to fetch subscription plans from server.'));
    }
  },

  async getById(id: string): Promise<Plan | undefined> {
    try {
      const response = await apiClient.get(`/plans/${id}`);
      return mapBackendPlan(response.data.data);
    } catch (err: any) {
      throw new Error(extractErrorMessage(err, `Failed to fetch plan with ID ${id}.`));
    }
  },

  async create(data: Omit<Plan, 'id' | 'startDate'>): Promise<Plan> {
    try {
      const code = (data as any).code || `${data.name.replace(/\s+/g, '-').toUpperCase()}-${Date.now().toString().slice(-4)}`;
      const intervalMap: Record<string, string> = {
        daily: 'WEEKLY', // backend enums: WEEKLY, MONTHLY, QUARTERLY, YEARLY
        weekly: 'WEEKLY',
        monthly: 'MONTHLY',
        yearly: 'YEARLY',
      };

      const response = await apiClient.post('/plans', {
        productId: data.productId,
        code,
        name: data.name,
        description: data.description || `${data.name} subscription plan`,
        billingInterval: intervalMap[data.billingInterval] || 'MONTHLY',
        price: data.price,
        currency: 'USD',
        trialPeriodDays: data.trialPeriodDays || 0,
        active: data.status === 'active',
        features: ['Automated Renewal', 'Standard Invoicing'],
      });

      return mapBackendPlan(response.data.data);
    } catch (err: any) {
      throw new Error(extractErrorMessage(err, 'Failed to create subscription plan on server.'));
    }
  },

  async update(id: string, updates: Partial<Plan>): Promise<Plan> {
    try {
      const body: any = {};
      if (updates.name) body.name = updates.name;
      if (updates.price !== undefined) body.price = updates.price;
      if (updates.description) body.description = updates.description;
      if (updates.status) body.active = updates.status === 'active';
      if (updates.trialPeriodDays !== undefined) body.trialPeriodDays = updates.trialPeriodDays;

      const response = await apiClient.put(`/plans/${id}`, body);
      return mapBackendPlan(response.data.data);
    } catch (err: any) {
      throw new Error(extractErrorMessage(err, 'Failed to update plan on server.'));
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await apiClient.put(`/plans/${id}`, { active: false });
    } catch (err: any) {
      throw new Error(extractErrorMessage(err, 'Failed to archive subscription plan.'));
    }
  },
};
