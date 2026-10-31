import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { authApi, DEMO_ACCOUNTS } from '@/api/auth.api';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  switchRole: (newRole: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => authApi.getCurrentUser());

  useEffect(() => {
    // If no session found on mount, auto-login with default seeded admin credentials
    if (!user) {
      const token = localStorage.getItem('bl_auth_token');
      if (token) {
        authApi.getProfile()
          .then(setUser)
          .catch(() => {
            // Token expired or invalid, auto-login to admin seed
            authApi.login(DEMO_ACCOUNTS.admin.email, DEMO_ACCOUNTS.admin.pass)
              .then((res) => setUser(res.user))
              .catch((err) => console.warn('Could not auto-login to backend admin:', err.message));
          });
      } else {
        // Initial dev auto-login
        authApi.login(DEMO_ACCOUNTS.admin.email, DEMO_ACCOUNTS.admin.pass)
          .then((res) => setUser(res.user))
          .catch((err) => console.warn('Could not auto-login to backend admin:', err.message));
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    const { user: loggedInUser } = await authApi.login(email, password);
    setUser(loggedInUser);
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
  };

  const switchRole = async (newRole: UserRole) => {
    const account = DEMO_ACCOUNTS[newRole];
    if (account) {
      const { user: switchedUser } = await authApi.login(account.email, account.pass);
      setUser(switchedUser);
    }
  };

  const role = user?.role || 'admin';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, role, isAuthenticated, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
