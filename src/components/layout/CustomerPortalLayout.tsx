import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Repeat,
  Receipt,
  CreditCard,
  User,
  LogOut,
  Shield,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Dropdown } from '@/components/ui/dropdown';
import { cn } from '@/utils/cn';

export const CustomerPortalLayout: React.FC = () => {
  const { user, logout, switchRole } = useAuth();
  const navigate = useNavigate();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const customerNavLinks = [
    { name: 'Portal Overview', path: '/portal/overview', icon: LayoutDashboard },
    { name: 'My Subscriptions', path: '/portal/subscriptions', icon: Repeat },
    { name: 'My Invoices', path: '/portal/invoices', icon: Receipt },
    { name: 'My Payments', path: '/portal/payments', icon: CreditCard },
    { name: 'Profile & Settings', path: '/portal/profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col font-sans text-slate-900">
      {/* Top Header */}
      <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
            className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
          >
            {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-purple-500/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900">Brightloop</span>
              <span className="text-[10px] ml-2 font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                Customer Portal
              </span>
            </div>
          </div>
        </div>

        {/* Center Nav for Desktop */}
        <nav className="hidden md:flex items-center gap-1">
          {customerNavLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                    isActive
                      ? 'bg-purple-50 text-purple-700 font-bold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  )
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Right profile / switch */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              switchRole('admin');
              navigate('/overview');
            }}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <span>Admin Console</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </button>

          <Dropdown
            align="right"
            className="w-52"
            trigger={
              <button className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 transition-colors">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                  {user?.name?.charAt(0) || 'C'}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-800">{user?.name}</span>
                  <span className="text-[10px] text-slate-400 truncate max-w-[120px]">{user?.company}</span>
                </div>
              </button>
            }
            items={[
              {
                label: 'Switch to Admin View',
                onClick: () => {
                  switchRole('admin');
                  navigate('/overview');
                },
              },
              {
                label: 'Switch to Staff View',
                onClick: () => {
                  switchRole('staff');
                  navigate('/overview');
                },
              },
              {
                label: 'Sign Out',
                danger: true,
                icon: <LogOut className="w-3.5 h-3.5 text-rose-500" />,
                onClick: () => {
                  logout();
                  navigate('/login');
                },
              },
            ]}
          />
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {isMobileNavOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 p-3 space-y-1">
          {customerNavLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileNavOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all',
                    isActive
                      ? 'bg-purple-50 text-purple-700 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  )
                }
              >
                <Icon className="w-4 h-4 text-purple-600" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>
      )}

      {/* Portal Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in-50 duration-200">
        <Outlet />
      </main>
    </div>
  );
};

