import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input, Select, Textarea, Label } from '@/components/ui/input';
import { Plan, Product } from '@/types';

const planSchema = z.object({
  name: z.string().min(2, 'Plan name is required'),
  productId: z.string().min(1, 'Product selection is required'),
  billingInterval: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
  price: z.coerce.number().min(0, 'Price must be positive'),
  minQuantity: z.coerce.number().min(1, 'Minimum quantity is at least 1'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  status: z.enum(['active', 'inactive']),
  description: z.string().optional(),
  trialPeriodDays: z.coerce.number().min(0).default(0),
});

type PlanFormData = z.infer<typeof planSchema>;

interface PlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PlanFormData & { productName: string }) => void;
  products: Product[];
  initialData?: Plan | null;
  isLoading?: boolean;
}

export const PlanModal: React.FC<PlanModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  products,
  initialData,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<PlanFormData>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: '',
      productId: products[0]?.id || '',
      billingInterval: 'monthly',
      price: 1999,
      minQuantity: 1,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      status: 'active',
      description: '',
      trialPeriodDays: 14,
    },
  });

  const selectedProductId = watch('productId');

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        productId: initialData.productId,
        billingInterval: initialData.billingInterval,
        price: initialData.price,
        minQuantity: initialData.minQuantity,
        startDate: initialData.startDate,
        endDate: initialData.endDate || '',
        status: initialData.status,
        description: initialData.description || '',
        trialPeriodDays: initialData.trialPeriodDays || 0,
      });
    } else {
      reset({
        name: '',
        productId: products[0]?.id || '',
        billingInterval: 'monthly',
        price: 1999,
        minQuantity: 1,
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        status: 'active',
        description: '',
        trialPeriodDays: 14,
      });
    }
  }, [initialData, products, reset, isOpen]);

  const handleFormSubmit = (data: PlanFormData) => {
    const prod = products.find((p) => p.id === data.productId);
    onSubmit({
      ...data,
      productName: prod ? prod.name : 'Unknown Product',
    });
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Subscription Plan' : 'Create Subscription Plan'}
      description="Configure recurring billing frequencies: Daily, Weekly, Monthly, or Yearly."
      size="lg"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label required>Plan Name</Label>
            <Input {...register('name')} placeholder="e.g. Starter Monthly Plan" error={errors.name?.message} />
          </div>
          <div>
            <Label required>Associated SaaS Product</Label>
            <Select {...register('productId')} error={errors.productId?.message}>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label required>Billing Interval</Label>
            <Select {...register('billingInterval')}>
              <option value="daily">Daily Billing</option>
              <option value="weekly">Weekly Billing</option>
              <option value="monthly">Monthly Billing</option>
              <option value="yearly">Yearly Billing</option>
            </Select>
          </div>
          <div>
            <Label required>Price Per Interval (₹)</Label>
            <Input type="number" step="10" {...register('price')} error={errors.price?.message} />
          </div>
          <div>
            <Label required>Min Quantity / Seats</Label>
            <Input type="number" min="1" {...register('minQuantity')} error={errors.minQuantity?.message} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label required>Effective Start Date</Label>
            <Input type="date" {...register('startDate')} error={errors.startDate?.message} />
          </div>
          <div>
            <Label>End Date (Optional)</Label>
            <Input type="date" {...register('endDate')} />
          </div>
          <div>
            <Label>Free Trial (Days)</Label>
            <Input type="number" min="0" {...register('trialPeriodDays')} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label required>Status</Label>
            <Select {...register('status')}>
              <option value="active">Active (Available for purchase)</option>
              <option value="inactive">Inactive</option>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label>Plan Description</Label>
            <Textarea rows={2} {...register('description')} placeholder="Features, usage limits, or quota included..." />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" size="sm" isLoading={isLoading}>
            {initialData ? 'Save Plan' : 'Create Plan'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

