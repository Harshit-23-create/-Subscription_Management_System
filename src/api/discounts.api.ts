import { Discount, DiscountStatus, DiscountType } from '@/types';
import { apiClient, extractErrorMessage } from './client';

export const mapBackendDiscount = (d: any): Discount => {
  const isExpired = d.validUntil && new Date(d.validUntil) < new Date();
  const status: DiscountStatus = !d.active ? 'inactive' : isExpired ? 'expired' : 'active';

  return {
    id: d._id?.toString() || d.id || '',
    name: d.description || d.code || 'Promotional Discount',
    code: d.code || '',
    type: (d.type || 'PERCENTAGE').toLowerCase() as DiscountType,
    value: d.value || 0,
    minPurchase: 0,
    minQuantity: 1,
    startDate: d.validFrom || d.createdAt || new Date().toISOString(),
    expiryDate: d.validUntil || new Date(Date.now() + 90 * 86400000).toISOString(),
    maxUsage: d.maxRedemptions || 100,
    usedCount: d.timesRedeemed || 0,
    applicableProducts: ['all'],
    status,
  };
};

export const discountsApi = {
  async getAll(): Promise<Discount[]> {
    try {
      const response = await apiClient.get('/discounts');
      const list = response.data.data || [];
      return list.map(mapBackendDiscount);
    } catch (err: any) {
      throw new Error(extractErrorMessage(err, 'Failed to fetch discounts from server.'));
    }
  },

  async getByCode(code: string): Promise<Discount | undefined> {
    try {
      const response = await apiClient.get(`/discounts/code/${code.trim().toUpperCase()}`);
      return mapBackendDiscount(response.data.data);
    } catch (err: any) {
      throw new Error(extractErrorMessage(err, `Invalid or expired discount code "${code}".`));
    }
  },

  async create(data: Omit<Discount, 'id' | 'usedCount'>): Promise<Discount> {
    try {
      const response = await apiClient.post('/discounts', {
        code: data.code.trim().toUpperCase(),
        description: data.name,
        type: data.type.toUpperCase(),
        value: data.value,
        maxRedemptions: data.maxUsage || 100,
        validFrom: data.startDate ? new Date(data.startDate).toISOString() : new Date().toISOString(),
        validUntil: data.expiryDate ? new Date(data.expiryDate).toISOString() : undefined,
        active: data.status === 'active',
      });

      return mapBackendDiscount(response.data.data);
    } catch (err: any) {
      throw new Error(extractErrorMessage(err, 'Failed to create discount coupon on server.'));
    }
  },

  async update(id: string, updates: Partial<Discount>): Promise<Discount> {
    try {
      const body: any = {};
      if (updates.name) body.description = updates.name;
      if (updates.value !== undefined) body.value = updates.value;
      if (updates.maxUsage !== undefined) body.maxRedemptions = updates.maxUsage;
      if (updates.status) body.active = updates.status === 'active';

      const response = await apiClient.put(`/discounts/${id}`, body);
      return mapBackendDiscount(response.data.data);
    } catch (err: any) {
      throw new Error(extractErrorMessage(err, 'Failed to update discount on server.'));
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await apiClient.put(`/discounts/${id}`, { active: false });
    } catch (err: any) {
      throw new Error(extractErrorMessage(err, 'Failed to disable discount coupon.'));
    }
  },
};
