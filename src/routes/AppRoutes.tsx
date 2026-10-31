import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CustomerPortalLayout } from '@/components/layout/CustomerPortalLayout';

// Admin / Staff Pages
import { LoginPage } from '@/pages/LoginPage';
import { OverviewPage } from '@/pages/OverviewPage';
import { CustomersPage } from '@/pages/CustomersPage';
import { ProductsPage } from '@/pages/ProductsPage';
import { PlansPage } from '@/pages/PlansPage';
import { QuotationsPage } from '@/pages/QuotationsPage';
import { SubscriptionsPage } from '@/pages/SubscriptionsPage';
import { SubscriptionDetailPage } from '@/pages/SubscriptionDetailPage';
import { InvoicesPage } from '@/pages/InvoicesPage';
import { PaymentsPage } from '@/pages/PaymentsPage';
import { DiscountsPage } from '@/pages/DiscountsPage';
import { TaxesPage } from '@/pages/TaxesPage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';
import { SettingsPage } from '@/pages/SettingsPage';

// Customer Portal Pages
import { CustomerOverviewPage } from '@/pages/customer-portal/CustomerOverviewPage';
import { CustomerSubscriptionsPage } from '@/pages/customer-portal/CustomerSubscriptionsPage';
import { CustomerInvoicesPage } from '@/pages/customer-portal/CustomerInvoicesPage';
import { CustomerPaymentsPage } from '@/pages/customer-portal/CustomerPaymentsPage';
import { CustomerProfilePage } from '@/pages/customer-portal/CustomerProfilePage';

export const AppRoutes: React.FC = () => {
  const { isAuthenticated, role } = useAuth();

  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Admin & Staff Dashboard Routes */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            role === 'customer' ? (
              <Navigate to="/portal/overview" replace />
            ) : (
              <DashboardLayout />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >
        <Route index element={<Navigate to="/overview" replace />} />
        <Route path="overview" element={<OverviewPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="plans" element={<PlansPage />} />
        <Route path="quotations" element={<QuotationsPage />} />
        <Route path="subscriptions" element={<SubscriptionsPage />} />
        <Route path="subscriptions/:id" element={<SubscriptionDetailPage />} />
        <Route path="invoices" element={<InvoicesPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="discounts" element={<DiscountsPage />} />
        <Route path="taxes" element={<TaxesPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Customer Portal Routes */}
      <Route
        path="/portal"
        element={
          isAuthenticated ? <CustomerPortalLayout /> : <Navigate to="/login" replace />
        }
      >
        <Route index element={<Navigate to="/portal/overview" replace />} />
        <Route path="overview" element={<CustomerOverviewPage />} />
        <Route path="subscriptions" element={<CustomerSubscriptionsPage />} />
        <Route path="invoices" element={<CustomerInvoicesPage />} />
        <Route path="payments" element={<CustomerPaymentsPage />} />
        <Route path="profile" element={<CustomerProfilePage />} />
      </Route>

      {/* Fallback */}
      <Route
        path="*"
        element={<Navigate to={role === 'customer' ? '/portal/overview' : '/overview'} replace />}
      />
    </Routes>
  );
};

