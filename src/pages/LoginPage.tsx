import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Eye,
  EyeOff,
  Shield,
  UserCheck,
  User,
  ArrowRight,
  Lock,
  Mail,
  CheckCircle2,
  TrendingUp,
  Repeat,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { UserRole } from '@/types';
import { DEMO_ACCOUNTS, authApi } from '@/api/auth.api';
import { useToast } from '@/hooks/useToast';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid work email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().default(true),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');

  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: DEMO_ACCOUNTS.admin.email,
      password: DEMO_ACCOUNTS.admin.pass,
      rememberMe: true,
    },
  });

  const selectDemoRole = (role: UserRole) => {
    setSelectedRole(role);
    setValue('email', DEMO_ACCOUNTS[role].email);
    setValue('password', DEMO_ACCOUNTS[role].pass);
  };

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      toast.success('Welcome back to Brightloop', `Signed in successfully`);
      const currentUser = authApi.getCurrentUser();
      if (currentUser?.role === 'customer' || selectedRole === 'customer') {
        navigate('/portal/overview');
      } else {
        navigate('/overview');
      }
    } catch (err: any) {
      toast.error('Authentication Failed', err?.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-stretch">
      {/* Left Column: Login Form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-20 xl:px-24 py-12 bg-white z-10">
        <div className="max-w-md w-full mx-auto space-y-8">
          {/* Brand & Title */}
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <span className="text-lg font-bold text-slate-900 tracking-tight">Brightloop</span>
                <span className="text-[10px] ml-2 font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-full">
                  v1.0 Enterprise
                </span>
              </div>
            </div>

            <h1 className="mt-6 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Sign in to your account
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-500">
              Enterprise Subscription & Recurring Billing Management Architecture
            </p>
          </div>

          {/* 1-Click Role Switcher */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700">Select Demo Account Role</span>
              <span className="text-[11px] text-blue-600 font-medium">1-Click Auto Fill</span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => selectDemoRole('admin')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-xs ${
                  selectedRole === 'admin'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-700 font-bold shadow-xs ring-2 ring-blue-500/10'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Shield className="w-4 h-4 mb-1.5 text-blue-600" />
                <span>Admin</span>
                <span className="text-[10px] text-slate-400 font-normal">Full Suite</span>
              </button>

              <button
                type="button"
                onClick={() => selectDemoRole('staff')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-xs ${
                  selectedRole === 'staff'
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-700 font-bold shadow-xs ring-2 ring-emerald-500/10'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <UserCheck className="w-4 h-4 mb-1.5 text-emerald-600" />
                <span>Staff</span>
                <span className="text-[10px] text-slate-400 font-normal">Operations</span>
              </button>

              <button
                type="button"
                onClick={() => selectDemoRole('customer')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-xs ${
                  selectedRole === 'customer'
                    ? 'border-purple-600 bg-purple-50/70 text-purple-700 font-bold shadow-xs ring-2 ring-purple-500/10'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <User className="w-4 h-4 mb-1.5 text-purple-600" />
                <span>Customer</span>
                <span className="text-[10px] text-slate-400 font-normal">Portal</span>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label required>Work Email Address</Label>
              <Input
                type="email"
                icon={<Mail className="w-4 h-4 text-slate-400" />}
                {...register('email')}
                error={errors.email?.message}
                placeholder="name@company.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label required className="mb-0">Password</Label>
                <button
                  type="button"
                  onClick={() => alert('Demo password is: password123')}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              <Input
                type={showPassword ? 'text' : 'password'}
                icon={<Lock className="w-4 h-4 text-slate-400" />}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                {...register('password')}
                error={errors.password?.message}
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600">
                <input
                  type="checkbox"
                  {...register('rememberMe')}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Remember this workstation</span>
              </label>
            </div>

            <Button type="submit" size="lg" className="w-full mt-2 font-semibold h-11" isLoading={isLoading}>
              <span>Sign in to Dashboard</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          {/* Security & Architecture Footer */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              256-bit SSL Protected
            </span>
            <span>Frontend Architecture Only</span>
          </div>
        </div>
      </div>

      {/* Right Column: SaaS Platform Showcase (Hidden on Mobile) */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 lg:p-16 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

        {/* Top Feature Pill */}
        <div className="relative z-10 flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-medium text-blue-200">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Next-Generation Recurring Billing Engine</span>
          </div>
        </div>

        {/* Center: Live Platform Cards Showcase */}
        <div className="relative z-10 space-y-6 max-w-lg my-auto">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
              Manage SaaS subscriptions, automated dunning & recurring revenue with precision.
            </h2>
            <p className="mt-3 text-sm text-slate-300 leading-relaxed">
              Brightloop provides billing automation, multi-interval cycles (daily, weekly, monthly, yearly), and seamless customer portal integration.
            </p>
          </div>

          {/* Floating Live KPI Metrics Card */}
          <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/15 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                  Monthly Recurring Revenue (MRR)
                </span>
                <span className="text-2xl font-extrabold text-white">₹1,85,400</span>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <TrendingUp className="w-3.5 h-3.5" />
                +12.4%
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10 text-xs">
              <div>
                <span className="text-slate-400 text-[11px]">Active Subscriptions</span>
                <p className="font-bold text-white text-base">745</p>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Collection Health</span>
                <p className="font-bold text-emerald-400 text-base">95.8%</p>
              </div>
            </div>
          </div>

          {/* Feature List */}
          <div className="space-y-2.5 text-xs text-slate-300">
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span>Automated Daily, Weekly, Monthly, and Yearly contract intervals</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span>Multi-line commercial quotations with 1-click subscription conversion</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span>GST-compliant e-invoicing and multi-channel payment reconciliation</span>
            </div>
          </div>
        </div>

        {/* Bottom Quote / Social Proof */}
        <div className="relative z-10 pt-6 border-t border-white/10 text-xs text-slate-400">
          <p className="italic">
            “Brightloop transformed our recurring billing operations and reduced dunning churn by 38% across our enterprise accounts.”
          </p>
          <p className="mt-2 text-slate-300 font-semibold">— VP of Finance, TechSpire Solutions</p>
        </div>
      </div>
    </div>
  );
};
