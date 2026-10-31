import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  CalendarDays,
  FileText,
  Repeat,
  Receipt,
  CreditCard,
  Percent,
  ReceiptCent,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  UserCheck,
  Building2,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/utils/cn';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavSection {
  title?: string;
  items: {
    name: string;
    path: string;
    icon: React.ElementType;
    adminOnly?: boolean;
    badge?: string;
  }[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'CORE PLATFORM',
    items: [
      { name: 'Overview', path: '/overview', icon: LayoutDashboard },
      { name: 'Customers', path: '/customers', icon: Users },
    ],
  },
  {
    title: 'COMMERCE & CONTRACTS',
    items: [
      { name: 'Products', path: '/products', icon: Package, adminOnly: true },
      { name: 'Plans', path: '/plans', icon: CalendarDays, adminOnly: true },
      { name: 'Quotations', path: '/quotations', icon: FileText },
      { name: 'Subscriptions', path: '/subscriptions', icon: Repeat, badge: 'Live' },
    ],
  },
  {
    title: 'BILLING & CLEARING',
    items: [
      { name: 'Invoices', path: '/invoices', icon: Receipt },
      { name: 'Payments', path: '/payments', icon: CreditCard },
      { name: 'Discounts', path: '/discounts', icon: Percent, adminOnly: true },
      { name: 'Taxes', path: '/taxes', icon: ReceiptCent, adminOnly: true },
    ],
  },
  {
    title: 'MANAGEMENT',
    items: [
      { name: 'Analytics', path: '/analytics', icon: BarChart3, adminOnly: true },
      { name: 'Settings', path: '/settings', icon: Settings },
    ],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { role, user } = useAuth();

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200/90 select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-100">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20 shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-slate-900 tracking-tight truncate leading-none">
                Brightloop
              </span>
              <span className="text-[10px] text-blue-600 font-semibold tracking-wider uppercase mt-1">
                Subscription Engine
              </span>
            </div>
          )}
        </div>

        {/* Close button on mobile */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Role Indicator Card */}
      {!isCollapsed && (
        <div className="px-3 pt-3">
          <div className="px-3 py-2 bg-slate-50 border border-slate-100/90 rounded-xl flex items-center gap-2.5">
            <div
              className={cn(
                'w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-white font-bold',
                role === 'admin'
                  ? 'bg-blue-600'
                  : 'bg-emerald-600'
              )}
            >
              {role === 'admin' ? <Shield className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-slate-900 capitalize leading-none">
                {role} Console
              </p>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">{user?.company || 'Brightloop Corp'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Grouped Navigation Links */}
      <div className="flex-1 px-3 py-3 space-y-4 overflow-y-auto">
        {NAV_SECTIONS.map((section, sIdx) => {
          const visibleItems = section.items.filter((item) => {
            if (role === 'admin') return true;
            if (role === 'staff') return !item.adminOnly;
            return true;
          });

          if (visibleItems.length === 0) return null;

          return (
            <div key={sIdx} className="space-y-1">
              {!isCollapsed && section.title && (
                <div className="px-3 pb-1 pt-0.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  {section.title}
                </div>
              )}
              {visibleItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={onCloseMobile}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group relative',
                        isActive
                          ? 'bg-blue-50 text-blue-700 font-bold shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                        isCollapsed && 'justify-center px-2 py-2.5'
                      )
                    }
                    title={isCollapsed ? item.name : undefined}
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon
                            className={cn(
                              'w-4 h-4 shrink-0 transition-colors',
                              isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                            )}
                          />
                          {!isCollapsed && <span className="truncate">{item.name}</span>}
                        </div>
                        {!isCollapsed && item.badge && (
                          <span className="text-[9px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded-full">
                            {item.badge}
                          </span>
                        )}
                        {isActive && (
                          <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-blue-600 rounded-r-md" />
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Collapse Toggle Footer (Desktop only) */}
      <div className="hidden lg:flex items-center justify-between p-3 border-t border-slate-100">
        {!isCollapsed && (
          <div className="flex items-center gap-2 text-slate-400 text-[11px] font-medium">
            <Building2 className="w-3.5 h-3.5" />
            <span>v1.0 Enterprise</span>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className={cn(
            'p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors ml-auto',
            isCollapsed && 'mx-auto'
          )}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:block shrink-0 transition-all duration-300 ease-in-out h-screen sticky top-0 z-30',
          isCollapsed ? 'w-18' : 'w-64'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={cn(
          'lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </div>
    </>
  );
};
