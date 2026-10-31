import { User, UserRole } from '@/types';
import { apiClient, extractErrorMessage } from './client';

export const DEMO_ACCOUNTS: { [key in UserRole]: { email: string; pass: string; user: User } } = {
  admin: {
    email: 'admin@subflow.io',
    pass: 'AdminPassword123!',
    user: {
      id: 'admin-seed-id',
      name: 'System Administrator',
      email: 'admin@subflow.io',
      role: 'admin',
      company: 'Brightloop Software HQ',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    },
  },
  staff: {
    email: 'staff@subflow.io',
    pass: 'StaffPassword123!',
    user: {
      id: 'staff-seed-id',
      name: 'Support & Billing Staff',
      email: 'staff@subflow.io',
      role: 'staff',
      company: 'Brightloop Operations',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
  },
  customer: {
    email: 'acme.billing@acmecorp.com',
    pass: 'CustomerPassword123!',
    user: {
      id: 'customer-seed-id',
      name: 'Acme Corporation (Billing)',
      email: 'acme.billing@acmecorp.com',
      role: 'customer',
      company: 'Acme Corporation',
      customerId: 'CUST-0001',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    },
  },
};

export const authApi = {
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    try {
      const response = await apiClient.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password,
      });

      const { accessToken, user: backendUser } = response.data.data;
      const normalizedRole = (backendUser.role || 'ADMIN').toLowerCase() as UserRole;

      const user: User = {
        id: backendUser.userId || backendUser._id || 'user-id',
        name: `${backendUser.firstName || ''} ${backendUser.lastName || ''}`.trim() || backendUser.email,
        email: backendUser.email,
        role: normalizedRole,
        company: normalizedRole === 'customer' ? 'Customer Account' : 'Brightloop Software',
        customerId: backendUser.customerId,
        avatarUrl: DEMO_ACCOUNTS[normalizedRole]?.user?.avatarUrl,
      };

      localStorage.setItem('bl_auth_token', accessToken);
      localStorage.setItem('bl_auth_user', JSON.stringify(user));

      return { user, token: accessToken };
    } catch (err: any) {
      throw new Error(extractErrorMessage(err, 'Failed to log in. Please check your credentials.'));
    }
  },

  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: string;
    customerId?: string;
  }): Promise<{ user: User; token: string }> {
    try {
      const response = await apiClient.post('/auth/register', data);
      const { accessToken, user: backendUser } = response.data.data;
      const normalizedRole = (backendUser.role || 'CUSTOMER').toLowerCase() as UserRole;

      const user: User = {
        id: backendUser.userId || backendUser._id,
        name: `${backendUser.firstName} ${backendUser.lastName}`.trim(),
        email: backendUser.email,
        role: normalizedRole,
        company: 'Brightloop User',
        customerId: backendUser.customerId,
      };

      return { user, token: accessToken };
    } catch (err: any) {
      throw new Error(extractErrorMessage(err, 'Failed to create user account.'));
    }
  },

  async getProfile(): Promise<User> {
    const response = await apiClient.get('/auth/profile');
    const u = response.data.data;
    const role = (u.role || 'ADMIN').toLowerCase() as UserRole;
    return {
      id: u._id || u.userId,
      name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
      email: u.email,
      role,
      customerId: u.customerId,
      company: role === 'customer' ? 'Customer Account' : 'Brightloop Software',
    };
  },

  async getUsers(query?: { search?: string; role?: string; page?: number; limit?: number }) {
    const response = await apiClient.get('/auth/users', { params: query });
    return response.data.data || [];
  },

  getCurrentUser(): User | null {
    try {
      const stored = localStorage.getItem('bl_auth_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  logout(): void {
    localStorage.removeItem('bl_auth_token');
    localStorage.removeItem('bl_auth_user');
  },
};
