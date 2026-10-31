import { Product } from '@/types';
import { apiClient, extractErrorMessage } from './client';

export const mapBackendProduct = (p: any): Product => ({
  id: p._id?.toString() || p.id || '',
  name: p.name || '',
  type: p.type || (p.category?.toLowerCase().includes('service') ? 'service' : 'software'),
  salesPrice: p.salesPrice || 499,
  costPrice: p.costPrice || 150,
  description: p.description || '',
  variants: p.variants && p.variants.length > 0 ? p.variants : [
    { id: `${p._id}-v1`, name: 'Standard Edition', additionalPrice: 0, sku: `${p.sku || 'SKU'}-STD` },
    { id: `${p._id}-v2`, name: 'Enterprise Cluster (+SLA)', additionalPrice: 250, sku: `${p.sku || 'SKU'}-ENT` },
  ],
  status: p.active !== false ? 'active' : 'archived',
  createdAt: p.createdAt || new Date().toISOString(),
});

export const productsApi = {
  async getAll(query?: { category?: string; active?: boolean; search?: string }): Promise<Product[]> {
    try {
      const response = await apiClient.get('/products', { params: query });
      const list = response.data.data || [];
      return list.map(mapBackendProduct);
    } catch (err: any) {
      throw new Error(extractErrorMessage(err, 'Failed to fetch product catalog from server.'));
    }
  },

  async getById(id: string): Promise<Product | undefined> {
    try {
      const response = await apiClient.get(`/products/${id}`);
      const payload = response.data.data;
      const rawProduct = payload.product || payload;
      return mapBackendProduct(rawProduct);
    } catch (err: any) {
      throw new Error(extractErrorMessage(err, `Failed to fetch product ${id}.`));
    }
  },

  async create(data: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    try {
      const sku = (data as any).sku || `${data.name.replace(/\s+/g, '-').toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
      const response = await apiClient.post('/products', {
        name: data.name,
        description: data.description,
        sku,
        category: data.type === 'service' ? 'Professional Services' : 'Cloud Software',
        active: data.status === 'active',
        features: ['Automated Billing', 'API Access', '24/7 SLA Support'],
      });
      return mapBackendProduct(response.data.data);
    } catch (err: any) {
      throw new Error(extractErrorMessage(err, 'Failed to create product on server.'));
    }
  },

  async update(id: string, updates: Partial<Product>): Promise<Product> {
    try {
      const body: any = {};
      if (updates.name) body.name = updates.name;
      if (updates.description) body.description = updates.description;
      if (updates.status) body.active = updates.status === 'active';

      const response = await apiClient.put(`/products/${id}`, body);
      return mapBackendProduct(response.data.data);
    } catch (err: any) {
      throw new Error(extractErrorMessage(err, 'Failed to update product on server.'));
    }
  },

  async delete(id: string): Promise<void> {
    try {
      // Soft-archive product
      await apiClient.put(`/products/${id}`, { active: false });
    } catch (err: any) {
      throw new Error(extractErrorMessage(err, 'Failed to archive product on server.'));
    }
  },
};
