import { Subscription, SubscriptionStatus, BillingInterval } from '@/types';
import { apiClient, extractErrorMessage } from './client';

export const mapBackendSubscription = (s: any): Subscription => {
  const customer = typeof s.customerId === 'object' && s.customerId ? s.customerId : null;
  const plan = typeof s.planId === 'object' && s.planId ? s.planId : null;
  const product = plan && typeof plan.productId === 'object' ? plan.productId : null;

  const statusMap: Record<string, SubscriptionStatus> = {
    TRIALING: 'Active',
    ACTIVE: 'Active',
    PAUSED: 'Paused',
    PAST_DUE: 'Confirmed',
    CANCELED: 'Closed',
    EXPIRED: 'Closed',
  };

  const billingInterval = (s.billingInterval || 'MONTHLY').toLowerCase() as BillingInterval;
  const amount = (s.unitPrice || plan?.price || 0) * (s.quantity || 1);

  return {
    id: s._id?.toString() || s.id || '',
    subscriptionNumber: s.subscriptionNumber || 'SUB-0000',
    customerId: customer ? customer._id?.toString() : s.customerId?.toString() || '',
    customerName: customer ? customer.name : 'Subscribed Customer',
    customerEmail: customer ? customer.email : 'billing@customer.com',
    planId: plan ? plan._id?.toString() : s.planId?.toString() || '',
    planName: plan ? plan.name : 'Enterprise Plan',
    productId: product ? product._id?.toString() : 'prod-core',
    productName: product ? product.name : 'Brightloop Core Suite',
    billingInterval,
    startDate: s.startDate || s.currentPeriodStart || new Date().toISOString(),
    expiryDate: s.currentPeriodEnd || new Date(Date.now() + 30 * 86400000).toISOString(),
    nextBillingDate: s.currentPeriodEnd,
    amount,
    status: statusMap[s.status?.toUpperCase()] || 'Active',
    paymentTerms: 'Auto-Renew Recurring',
    autoRenew: s.autoRenew !== false,
    lines: [
      {
        id: `line-${s._id}`,
        description: `${plan?.name || 'Subscription Tier'} (${billingInterval})`,
        quantity: s.quantity || 1,
        unitPrice: s.unitPrice || plan?.price || 0,
        amount,
      },
    ],
    timeline: [
      {
        id: `event-${s._id}-1`,
        date: s.createdAt || new Date().toISOString(),
        action: 'Subscription Initiated',
        performedBy: 'System Engine',
        notes: `Created with status ${s.status}`,
      },
      ...(s.status === 'PAUSED'
        ? [
            {
              id: `event-${s._id}-2`,
              date: new Date().toISOString(),
              action: 'Subscription Paused',
              performedBy: 'Admin Operator',
              notes: 'Billing temporarily held',
            },
          ]
        : []),
    ],
  };
};

export const subscriptionsApi = {
  async getAll(query?: { customerId?: string; planId?: string; status?: string }): Promise<Subscription[]> {
    try {
      const params: any = {};
      if (query?.customerId) params.customerId = query.customerId;
      if (query?.planId) params.planId = query.planId;
      if (query?.status) params.status = query.status.toUpperCase();

      const response = await apiClient.get('/subscriptions', { params });
      const list = response.data.data || [];
      return list.map(mapBackendSubscription);
    } catch (err: any) {
      throw new Error(extractErrorMessage(err, 'Failed to fetch subscriptions from server.'));
    }
  },

  async getById(id: string): Promise<Subscription | undefined> {
    try {
      const response = await apiClient.get(`/subscriptions/${id}`);
      return mapBackendSubscription(response.data.data);
    } catch (err: any) {
      throw new Error(extractErrorMessage(err, `Failed to fetch subscription ${id}.`));
    }
  },

  async create(data: {
    customerId: string;
    planId: string;
    quantity?: number;
    billingInterval?: string;
    discountId?: string;
    taxRateId?: string;
    startDate?: string;
    autoRenew?: boolean;
  }): Promise<Subscription> {
    try {
      const response = await apiClient.post('/subscriptions', {
        customerId: data.customerId,
        planId: data.planId,
        quantity: data.quantity || 1,
        billingInterval: data.billingInterval ? data.billingInterval.toUpperCase() : undefined,
        discountId: data.discountId,
        taxRateId: data.taxRateId,
        startDate: data.startDate ? new Date(data.startDate).toISOString() : new Date().toISOString(),
        autoRenew: data.autoRenew !== false,
      });

      return mapBackendSubscription(response.data.data);
    } catch (err: any) {
      throw new Error(extractErrorMessage(err, 'Failed to create subscription on server.'));
    }
  },

  async update(id: string, data: any): Promise<Subscription> {
    if (data.planId) {
      return this.changePlan(id, data.planId, true);
    }
    const sub = await this.getById(id);
    if (!sub) throw new Error('Subscription not found');
    return sub;
  },

  async updateStatus(id: string, status: SubscriptionStatus | string, notes?: string): Promise<Subscription> {
    if (status === 'Paused') {
      return this.pause(id);
    } else if (status === 'Active') {
      return this.resume(id);
    } else if (status === 'Closed') {
      return this.cancel(id, false, notes || 'Closed by operator');
    }
    const sub = await this.getById(id);
    if (!sub) throw new Error('Subscription not found');
    return sub;
  },

  async renew(id: string, _months?: number): Promise<Subscription> {
    try {
      const response = await apiClient.post(`/subscriptions/${id}/renew`);
      return mapBackendSubscription(response.data.data.subscription || response.data.data);
    } catch (err: any) {
      throw new Error(extractErrorMessage(err, 'Failed to renew subscription.'));
    }
  },

  async pause(id: string): Promise<Subscription> {
    try {
      const response = await apiClient.post(`/subscriptions/${id}/pause`);
      return mapBackendSubscription(response.data.data);
    } catch (err: any) {
      throw new Error(extractErrorMessage(err, 'Failed to pause subscription.'));
    }
  },

  async resume(id: string): Promise<Subscription> {
    try {
      const response = await apiClient.post(`/subscriptions/${id}/resume`);
      return mapBackendSubscription(response.data.data);
    } catch (err: any) {
      throw new Error(extractErrorMessage(err, 'Failed to resume subscription.'));
    }
  },

  async cancel(id: string, cancelAtPeriodEnd = false, reason = 'Customer request'): Promise<Subscription> {
    try {
      const response = await apiClient.post(`/subscriptions/${id}/cancel`, {
        cancelAtPeriodEnd,
        reason,
      });
      return mapBackendSubscription(response.data.data);
    } catch (err: any) {
      throw new Error(extractErrorMessage(err, 'Failed to cancel subscription.'));
    }
  },

  async changePlan(id: string, planId: string, prorate = true): Promise<Subscription> {
    try {
      const response = await apiClient.post(`/subscriptions/${id}/change-plan`, {
        planId,
        prorate,
      });
      return mapBackendSubscription(response.data.data);
    } catch (err: any) {
      throw new Error(extractErrorMessage(err, 'Failed to upgrade/change subscription plan.'));
    }
  },
};
