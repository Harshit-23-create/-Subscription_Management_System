import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input, Label, Textarea, Select } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs } from '@/components/ui/tabs';
import { useToast } from '@/hooks/useToast';
import { MockStorage } from '@/mocks/storage';
import { authApi } from '@/api/auth.api';
import {
  User,
  Building2,
  Bell,
  Palette,
  Shield,
  Save,
  RefreshCw,
  CheckCircle2,
  Users,
  UserPlus,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, role, switchRole } = useAuth();
  const { success, info } = useToast();

  const [activeTab, setActiveTab] = useState('profile');

  // Profile Form state
  const [name, setName] = useState(user?.name || 'Sarah Chen');
  const [email, setEmail] = useState(user?.email || 'sarah.chen@brightloop.com');
  const [company, setCompany] = useState(user?.company || 'Brightloop Technologies Inc');

  // Notification Preferences state
  const [emailInvoices, setEmailInvoices] = useState(true);
  const [emailRenewals, setEmailRenewals] = useState(true);
  const [slackAlerts, setSlackAlerts] = useState(false);

  // Appearance state
  const [compactDensity, setCompactDensity] = useState(false);
  const [themePreference, setThemePreference] = useState('light');

  // Staff creation form
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [staffFirstName, setStaffFirstName] = useState('');
  const [staffLastName, setStaffLastName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffRole, setStaffRole] = useState<'STAFF' | 'ADMIN'>('STAFF');
  const [staffPassword, setStaffPassword] = useState('StaffPass123!');

  const queryClient = useQueryClient();

  const { data: systemUsers = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['systemUsers'],
    queryFn: () => authApi.getUsers(),
    enabled: role === 'admin',
  });

  const addStaffMutation = useMutation({
    mutationFn: () =>
      authApi.register({
        firstName: staffFirstName,
        lastName: staffLastName,
        email: staffEmail,
        password: staffPassword,
        role: staffRole,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['systemUsers'] });
      success('Staff User Created', `${staffFirstName} ${staffLastName} added as ${staffRole}.`);
      setShowAddStaff(false);
      setStaffFirstName('');
      setStaffLastName('');
      setStaffEmail('');
    },
    onError: (err: any) => {
      info('Staff Registration', err.message || 'Could not register user.');
    },
  });

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    addStaffMutation.mutate();
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    success('Profile Updated', 'User profile settings saved successfully.');
  };

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    success('Company Details Saved', 'Business entity and GST credentials updated.');
  };

  const handleResetData = () => {
    MockStorage.resetAll();
    info('System Reset', 'All mock storage has been reset to baseline defaults.');
    setTimeout(() => window.location.reload(), 400);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings & System Configuration"
        description="Manage admin profiles, enterprise entity parameters, notification triggers, and demo data."
      />

      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: 'profile', label: 'Profile Settings', icon: <User className="w-4 h-4" /> },
          { id: 'staff', label: 'Team & Staff', icon: <Users className="w-4 h-4" /> },
          { id: 'company', label: 'Company Information', icon: <Building2 className="w-4 h-4" /> },
          { id: 'notifications', label: 'Notification Preferences', icon: <Bell className="w-4 h-4" /> },
          { id: 'appearance', label: 'Appearance', icon: <Palette className="w-4 h-4" /> },
          { id: 'account', label: 'Account & Demo State', icon: <Shield className="w-4 h-4" /> },
        ]}
      />

      {/* Tab 2: Team & Staff Management */}
      {activeTab === 'staff' && (
        <Card className="max-w-4xl">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <div>
                <CardTitle>Internal Team & Staff Directory</CardTitle>
                <p className="text-xs text-slate-500 mt-1">
                  Manage operations, billing staff, and administrator user credentials powered by backend RBAC.
                </p>
              </div>
              <Button size="sm" onClick={() => setShowAddStaff(!showAddStaff)}>
                <UserPlus className="w-4 h-4 mr-1.5" />
                {showAddStaff ? 'Cancel' : 'Invite Staff Member'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {showAddStaff && (
              <form onSubmit={handleCreateStaff} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Add Staff Account</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label required>First Name</Label>
                    <Input value={staffFirstName} onChange={(e) => setStaffFirstName(e.target.value)} required />
                  </div>
                  <div>
                    <Label required>Last Name</Label>
                    <Input value={staffLastName} onChange={(e) => setStaffLastName(e.target.value)} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label required>Email</Label>
                    <Input type="email" value={staffEmail} onChange={(e) => setStaffEmail(e.target.value)} required />
                  </div>
                  <div>
                    <Label required>System Role</Label>
                    <Select value={staffRole} onChange={(e) => setStaffRole(e.target.value as any)}>
                      <option value="STAFF">Staff (Operations & Billing)</option>
                      <option value="ADMIN">Admin (Full Control)</option>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label required>Temporary Password</Label>
                  <Input type="password" value={staffPassword} onChange={(e) => setStaffPassword(e.target.value)} required />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowAddStaff(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" disabled={addStaffMutation.isPending}>
                    {addStaffMutation.isPending ? 'Saving...' : 'Create Account'}
                  </Button>
                </div>
              </form>
            )}

            <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-xl overflow-hidden">
              {isLoadingUsers ? (
                <p className="p-6 text-xs text-slate-500 text-center">Loading system users...</p>
              ) : systemUsers.length === 0 ? (
                <p className="p-6 text-xs text-slate-500 text-center">No system users found.</p>
              ) : (
                systemUsers.map((u: any) => (
                  <div key={u._id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">
                        {(u.firstName || u.email).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          {u.firstName ? `${u.firstName} ${u.lastName || ''}`.trim() : u.email}
                        </p>
                        <p className="text-[11px] text-slate-500">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        u.role === 'ADMIN' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {u.role}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 1: Profile Settings */}
      {activeTab === 'profile' && (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Personal Profile Settings</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xl flex items-center justify-center shadow-md">
                  {name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{name}</h4>
                  <p className="text-xs text-slate-500 capitalize">{role} Account</p>
                </div>
              </div>

              <div>
                <Label required>Full Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required />
              </div>

              <div>
                <Label required>Email Address</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>

              <div>
                <Label>Primary Department</Label>
                <Input defaultValue="Billing & Subscription Operations" />
              </div>

              <div className="pt-2">
                <Button type="submit" size="sm">
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tab 2: Company Information */}
      {activeTab === 'company' && (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Company & Tax Entity Details</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSaveCompany} className="space-y-4">
              <div>
                <Label required>Legal Company Name</Label>
                <Input value={company} onChange={(e) => setCompany(e.target.value)} required />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label required>GSTIN / Tax Registration</Label>
                  <Input defaultValue="06AAACU4921N1ZM" className="font-mono uppercase" required />
                </div>
                <div>
                  <Label required>CIN Number</Label>
                  <Input defaultValue="U72200KA2023PTC174829" className="font-mono uppercase" required />
                </div>
              </div>

              <div>
                <Label required>Registered Office Address</Label>
                <Textarea
                  rows={2}
                  defaultValue="Brightloop Software HQ, Cyber City, DLF Phase 2, Gurugram, Haryana - 122002"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label required>Default Currency</Label>
                  <Select defaultValue="INR">
                    <option value="INR">INR (₹) - Indian Rupee</option>
                    <option value="USD">USD ($) - US Dollar</option>
                    <option value="EUR">EUR (€) - Euro</option>
                  </Select>
                </div>
                <div>
                  <Label required>Default Invoicing Terms</Label>
                  <Select defaultValue="Net 30 Days">
                    <option value="Immediate">Due Upon Receipt</option>
                    <option value="Net 15 Days">Net 15 Days</option>
                    <option value="Net 30 Days">Net 30 Days</option>
                    <option value="Net 60 Days">Net 60 Days</option>
                  </Select>
                </div>
              </div>

              <div className="pt-2">
                <Button type="submit" size="sm">
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  Save Company Info
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tab 3: Notification Preferences */}
      {activeTab === 'notifications' && (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Notification Triggers</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailInvoices}
                  onChange={(e) => setEmailInvoices(e.target.checked)}
                  className="mt-1 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800">Automated Invoice Dispatch</span>
                  <p className="text-[11px] text-slate-500">Email invoices to customers immediately when generated</p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailRenewals}
                  onChange={(e) => setEmailRenewals(e.target.checked)}
                  className="mt-1 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800">Renewal Notice Reminders</span>
                  <p className="text-[11px] text-slate-500">Send reminder alerts 7 days prior to contract expiration</p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={slackAlerts}
                  onChange={(e) => setSlackAlerts(e.target.checked)}
                  className="mt-1 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800">Internal Slack / Webhook Events</span>
                  <p className="text-[11px] text-slate-500">Post notifications in #subscription-alerts on new signups</p>
                </div>
              </label>
            </div>

            <Button
              size="sm"
              onClick={() => success('Preferences Saved', 'Notification configuration updated.')}
              className="mt-2"
            >
              <Save className="w-3.5 h-3.5 mr-1.5" />
              Save Preferences
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Tab 4: Appearance */}
      {activeTab === 'appearance' && (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Theme & Interface Appearance</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <Label>Design Theme Mode</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div
                  onClick={() => setThemePreference('light')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    themePreference === 'light'
                      ? 'border-blue-600 bg-blue-50/50 shadow-2xs'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <p className="text-xs font-bold text-slate-900">Enterprise Minimal (Light)</p>
                  <p className="text-[11px] text-slate-500 mt-1">Stripe & Linear inspired crisp slate palette</p>
                </div>

                <div
                  onClick={() => info('Theme Note', 'Enterprise Minimal Light is optimized for this SaaS dashboard.')}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer opacity-70"
                >
                  <p className="text-xs font-bold text-slate-900">Dark Mode (Coming in v2)</p>
                  <p className="text-[11px] text-slate-500 mt-1">Scheduled for upcoming quarterly release</p>
                </div>
              </div>
            </div>

            <Button
              size="sm"
              onClick={() => success('Appearance Saved', 'Interface preferences saved.')}
              className="mt-2"
            >
              <Save className="w-3.5 h-3.5 mr-1.5" />
              Apply Appearance
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Tab 5: Account Settings & Demo Controls */}
      {activeTab === 'account' && (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Account Governance & Demo Data State</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Active Role Impersonation
              </h4>
              <p className="text-xs text-slate-500 mb-4">
                Instantly switch roles to test Admin, Staff, or Customer portal interfaces:
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant={role === 'admin' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => switchRole('admin')}
                >
                  Admin View
                </Button>
                <Button
                  variant={role === 'staff' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => switchRole('staff')}
                >
                  Staff View
                </Button>
                <Button
                  variant={role === 'customer' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => switchRole('customer')}
                >
                  Customer Portal
                </Button>
              </div>
            </div>

            <div className="p-4 bg-rose-50/60 rounded-xl border border-rose-100 flex items-start justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-rose-900">Reset Demo Data to Initial Baseline</h4>
                <p className="text-xs text-rose-600/90 mt-1">
                  Restore all customer accounts, products, subscriptions, and invoices to clean factory demo defaults.
                </p>
              </div>
              <Button variant="danger" size="sm" onClick={handleResetData} className="shrink-0">
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                Reset Data
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
