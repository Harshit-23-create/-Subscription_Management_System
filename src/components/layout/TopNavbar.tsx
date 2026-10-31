import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  HelpCircle,
  LogOut,
  ChevronDown,
  Shield,
  UserCheck,
  User,
  Plus,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import { Dropdown } from '@/components/ui/dropdown';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MockStorage } from '@/mocks/storage';
import { useToast } from '@/hooks/useToast';

interface TopNavbarProps {
  onOpenMobileMenu: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ onOpenMobileMenu }) => {
  const { user, role, switchRole, logout } = useAuth();
  const navigate = useNavigate();
  const { success, info } = useToast();

  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasNotifications, setHasNotifications] = useState(true);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const mockNotifications = [
    { id: 1, title: 'Payment Received', desc: '₹28,498.82 received for INV-2024-001 from Aarav Sharma', time: '10m ago', unread: true },
    { id: 2, title: 'Upcoming Renewal', desc: 'SUB-2024-002 (Priya Narayanan) renews in 10 days', time: '1h ago', unread: true },
    { id: 3, title: 'Quotation Accepted', desc: 'QT-2024-004 accepted by Sneha Kulkarni', time: '3h ago', unread: false },
    { id: 4, title: 'Overdue Notice', desc: 'INV-2024-003 is overdue by 14 days', time: '1d ago', unread: false },
  ];

  const handleRoleSwitch = (newRole: UserRole) => {
    switchRole(newRole);
    success(`Role switched to ${newRole.toUpperCase()}`, `Now viewing the system with ${newRole} privileges.`);
    if (newRole === 'customer') {
      navigate('/portal/overview');
    } else {
      navigate('/overview');
    }
  };

  const handleResetData = () => {
    MockStorage.resetAll();
    info('Mock data reset to initial defaults', 'All tables have been refreshed.');
    window.location.reload();
  };

  const profileMenuItems = [
    {
      label: (
        <div className="flex flex-col py-1">
          <span className="font-semibold text-slate-800">{user?.name}</span>
          <span className="text-[11px] text-slate-400">{user?.email}</span>
        </div>
      ),
      onClick: () => navigate('/settings'),
    },
    {
      label: (
        <div className="flex items-center justify-between w-full">
          <span>Switch to Admin</span>
          {role === 'admin' && <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">Active</span>}
        </div>
      ),
      icon: <Shield className="w-3.5 h-3.5 text-blue-600" />,
      onClick: () => handleRoleSwitch('admin'),
    },
    {
      label: (
        <div className="flex items-center justify-between w-full">
          <span>Switch to Staff</span>
          {role === 'staff' && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Active</span>}
        </div>
      ),
      icon: <UserCheck className="w-3.5 h-3.5 text-emerald-600" />,
      onClick: () => handleRoleSwitch('staff'),
    },
    {
      label: (
        <div className="flex items-center justify-between w-full">
          <span>Switch to Customer Portal</span>
          {role === 'customer' && <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">Active</span>}
        </div>
      ),
      icon: <User className="w-3.5 h-3.5 text-purple-600" />,
      onClick: () => handleRoleSwitch('customer'),
    },
    {
      label: 'Reset Demo Data to Defaults',
      icon: <RefreshCw className="w-3.5 h-3.5 text-slate-500" />,
      onClick: handleResetData,
    },
    {
      label: 'Sign Out',
      icon: <LogOut className="w-3.5 h-3.5 text-rose-500" />,
      danger: true,
      onClick: () => {
        logout();
        navigate('/login');
      },
    },
  ];

  const quickActionItems = [
    {
      label: 'New Subscription',
      onClick: () => navigate('/subscriptions', { state: { openCreate: true } }),
    },
    {
      label: 'New Quotation',
      onClick: () => navigate('/quotations', { state: { openCreate: true } }),
    },
    {
      label: 'New Invoice',
      onClick: () => navigate('/invoices', { state: { openCreate: true } }),
    },
    {
      label: 'New Customer',
      onClick: () => navigate('/customers', { state: { openCreate: true } }),
    },
  ];

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
        {/* Left: Mobile menu button + Global Search input */}
        <div className="flex items-center gap-3 flex-1 max-w-lg">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Global Search Trigger */}
          <div
            onClick={() => setIsSearchOpen(true)}
            className="flex-1 max-w-sm flex items-center gap-2.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-lg text-xs text-slate-400 cursor-pointer transition-colors"
          >
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="truncate">Search customers, subscriptions, invoices...</span>
            <kbd className="hidden sm:inline-block ml-auto text-[10px] bg-white border border-slate-200 text-slate-400 px-1.5 py-0.5 rounded font-mono shadow-2xs">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Create Dropdown */}
          {role !== 'customer' && (
            <Dropdown
              align="right"
              trigger={
                <Button size="sm" className="hidden sm:flex h-9 gap-1.5 font-semibold">
                  <Plus className="w-4 h-4" />
                  <span>Create</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                </Button>
              }
              items={quickActionItems}
            />
          )}

          {/* Notifications Popover Trigger */}
          <div className="relative">
            <button
              onClick={() => {
                setIsNotificationsOpen(!isNotificationsOpen);
                setHasNotifications(false);
              }}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 relative transition-colors"
              title="Notifications"
            >
              <Bell className="w-4.5 h-4.5" />
              {hasNotifications && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white animate-pulse" />
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200/80 p-0 z-50 animate-in fade-in zoom-in-95 overflow-hidden">
                <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Notifications
                  </h4>
                  <span className="text-[11px] text-blue-600 font-medium cursor-pointer hover:underline" onClick={() => setIsNotificationsOpen(false)}>
                    Mark all read
                  </span>
                </div>
                <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                  {mockNotifications.map((notif) => (
                    <div key={notif.id} className="p-3.5 hover:bg-slate-50 transition-colors flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800">{notif.title}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{notif.desc}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">{notif.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Help & Documentation Modal Trigger */}
          <button
            onClick={() => setIsHelpOpen(true)}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Help & Shortcuts"
          >
            <HelpCircle className="w-4.5 h-4.5" />
          </button>

          {/* Divider */}
          <div className="h-6 w-[1px] bg-slate-200 hidden sm:block mx-1" />

          {/* User Profile Dropdown */}
          <Dropdown
            align="right"
            className="w-56"
            trigger={
              <button className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-lg hover:bg-slate-100 transition-colors group">
                <div className="w-7.5 h-7.5 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-800 group-hover:text-blue-600 transition-colors leading-tight">
                    {user?.name}
                  </span>
                  <span className="text-[10px] font-medium text-slate-400 capitalize leading-tight">
                    {role}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
              </button>
            }
            items={profileMenuItems}
          />
        </div>
      </header>

      {/* Global Quick Search Modal */}
      <Dialog
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        title="Quick Navigation & Search"
        description="Search records or jump directly to any page"
        size="md"
      >
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              autoFocus
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customers, plans, invoices..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>

          <div className="space-y-1">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2">
              Quick Shortcuts
            </p>
            {[
              { title: 'Overview Dashboard', path: '/overview', desc: 'MRR, ARR and KPI metrics' },
              { title: 'Customers Directory', path: '/customers', desc: 'Customer accounts and contacts' },
              { title: 'Products & Modules', path: '/products', desc: 'Software, services, and pricing variants' },
              { title: 'Subscriptions Engine', path: '/subscriptions', desc: 'Active & paused subscriptions' },
              { title: 'Invoices & Billing', path: '/invoices', desc: 'Generated bills and payment receipts' },
              { title: 'Quotations Management', path: '/quotations', desc: 'Create & convert proposals' },
              { title: 'Plans & Pricing', path: '/plans', desc: 'Intervals: Daily, Weekly, Monthly, Yearly' },
              { title: 'Payment Receipts', path: '/payments', desc: 'Audit inbound transactions & clearing' },
              { title: 'Promotions & Discounts', path: '/discounts', desc: 'Coupon codes and voucher rates' },
              { title: 'Tax Management', path: '/taxes', desc: 'GST percentage and rule configuration' },
              { title: 'Analytics & Insights', path: '/analytics', desc: 'Financial cohorts and retention' },
              { title: 'Settings', path: '/settings', desc: 'Company, profiles, and demo reset' },
            ]
              .filter((s) =>
                s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.desc.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((shortcut) => (
              <div
                key={shortcut.path}
                onClick={() => {
                  setIsSearchOpen(false);
                  navigate(shortcut.path);
                }}
                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors group"
              >
                <div>
                  <p className="text-xs font-semibold text-slate-800 group-hover:text-blue-600">
                    {shortcut.title}
                  </p>
                  <p className="text-[11px] text-slate-400">{shortcut.desc}</p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600" />
              </div>
            ))}
          </div>
        </div>
      </Dialog>

      {/* Help Modal */}
      <Dialog
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        title="Brightloop Help & Documentation"
        description="Architecture details and subscription system guides"
        size="md"
      >
        <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
          <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl">
            <h4 className="font-bold text-blue-900 mb-1">Frontend-Only Demonstration Architecture</h4>
            <p>
              This application is built with a strictly decoupled frontend API layer. Realistic mock data is initialized in local memory and synchronized with localStorage.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-800 mb-1.5">User Roles Available</h4>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li><strong className="text-slate-800">Admin:</strong> Complete management, products, plans, discounts, taxes, analytics.</li>
              <li><strong className="text-slate-800">Staff:</strong> Customer records, quotations, subscriptions, invoices, and payments.</li>
              <li><strong className="text-slate-800">Customer:</strong> Dedicated Customer Portal for billing, invoices, and subscriptions.</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-800 mb-1.5">Subscription Lifecycle Workflow</h4>
            <p>Draft → Quotation → Confirmed → Active → Closed (also Paused/Renewed)</p>
          </div>
        </div>
      </Dialog>
    </>
  );
};

