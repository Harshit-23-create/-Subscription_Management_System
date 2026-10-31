import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input, Select, Label } from '@/components/ui/input';
import { Customer, Plan, Product, Subscription, SubscriptionStatus } from '@/types';

const subscriptionSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  planId: z.string().min(1, 'Plan is required'),
  startDate: z.string().min(1, 'Start date is required'),
  expiryDate: z.string().min(1, 'Expiry date is required'),
  billingInterval: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
  amount: z.coerce.number().min(0, 'Amount must be positive'),
  status: z.enum(['Draft', 'Quotation', 'Confirmed', 'Active', 'Closed', 'Paused']),
  paymentTerms: z.string().min(2, 'Payment terms required'),
  autoRenew: z.boolean().default(true),
});

type SubscriptionFormData = z.infer<typeof subscriptionSchema>;

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SubscriptionFormData & { customerName: string; customerEmail: string; planName: string; productId: string; productName: string }) => void;
  customers: Customer[];
  plans: Plan[];
  products: Product[];
  initialData?: Subscription | null;
  isLoading?: boolean;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  customers,
  plans,
  products,
  initialData,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SubscriptionFormData>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      customerId: customers[0]?.id || '',
      planId: plans[0]?.id || '',
      startDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      billingInterval: 'monthly',
      amount: 1999,
      status: 'Active',
      paymentTerms: 'Net 30 Days',
      autoRenew: true,
    },
  });

  const selectedPlanId = watch('planId');

  useEffect(() => {
    if (selectedPlanId) {
      const plan = plans.find((p) => p.id === selectedPlanId);
      if (plan) {
        setValue('billingInterval', plan.billingInterval);
        setValue('amount', plan.price);
      }
    }
  }, [selectedPlanId, plans, setValue]);

  useEffect(() => {
    if (initialData) {
      reset({
        customerId: initialData.customerId,
        planId: initialData.planId,
        startDate: initialData.startDate,
        expiryDate: initialData.expiryDate,
        billingInterval: initialData.billingInterval,
        amount: initialData.amount,
        status: initialData.status,
        paymentTerms: initialData.paymentTerms,
        autoRenew: initialData.autoRenew,
      });
    } else {
      reset({
        customerId: customers[0]?.id || '',
        planId: plans[0]?.id || '',
        startDate: new Date().toISOString().split('T')[0],
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        billingInterval: 'monthly',
        amount: plans[0]?.price || 1999,
        status: 'Active',
        paymentTerms: 'Net 30 Days',
        autoRenew: true,
      });
    }
  }, [initialData, customers, plans, reset, isOpen]);

  const onFormSubmit = (data: SubscriptionFormData) => {
    const cust = customers.find((c) => c.id === data.customerId);
    const plan = plans.find((p) => p.id === data.planId);
    const prod = products.find((p) => p.id === plan?.productId);

    onSubmit({
      ...data,
      customerName: cust?.name || 'Customer',
      customerEmail: cust?.email || '',
      planName: plan?.name || 'Standard Plan',
      productId: prod?.id || 'prod-1',
      productName: prod?.name || 'SaaS Product',
    });
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Subscription Contract' : 'Create New Subscription'}
      description="Configure recurring billing terms, plan selection, and renewal cycles."
      size="lg"
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label required>Customer Account</Label>
            <Select {...register('customerId')} error={errors.customerId?.message}>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.company})
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label required>Subscription Plan</Label>
            <Select {...register('planId')} error={errors.planId?.message}>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.billingInterval} - ₹{p.price})
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label required>Billing Interval</Label>
            <Select {...register('billingInterval')}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </Select>
          </div>
          <div>
            <Label required>Recurring Amount (₹)</Label>
            <Input type="number" step="10" {...register('amount')} error={errors.amount?.message} />
          </div>
          <div>
            <Label required>Workflow Status</Label>
            <Select {...register('status')}>
              <option value="Draft">Draft</option>
              <option value="Quotation">Quotation</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Active">Active</option>
              <option value="Paused">Paused</option>
              <option value="Closed">Closed</option>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label required>Start Date</Label>
            <Input type="date" {...register('startDate')} error={errors.startDate?.message} />
          </div>
          <div>
            <Label required>Expiry / Next Renewal</Label>
            <Input type="date" {...register('expiryDate')} error={errors.expiryDate?.message} />
          </div>
          <div>
            <Label required>Payment Terms</Label>
            <Select {...register('paymentTerms')}>
              <option value="Immediate">Due Upon Receipt</option>
              <option value="Net 15 Days">Net 15 Days</option>
              <option value="Net 30 Days">Net 30 Days</option>
              <option value="Net 60 Days">Net 60 Days</option>
            </Select>
          </div>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-800">Auto-Renew Subscription</span>
            <p className="text-[11px] text-slate-400">Automatically generate renewal invoices at the end of each cycle</p>
          </div>
          <input
            type="checkbox"
            {...register('autoRenew')}
            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" size="sm" isLoading={isLoading}>
            {initialData ? 'Save Subscription' : 'Create Subscription'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

