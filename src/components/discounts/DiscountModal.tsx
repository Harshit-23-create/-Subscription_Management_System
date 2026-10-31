import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input, Select, Label } from '@/components/ui/input';
import { Discount, Product } from '@/types';

const discountSchema = z.object({
  name: z.string().min(2, 'Discount name is required'),
  code: z.string().min(3, 'Promo code must be at least 3 characters'),
  type: z.enum(['percentage', 'fixed']),
  value: z.coerce.number().min(1, 'Value must be greater than 0'),
  minPurchase: z.coerce.number().min(0).default(0),
  minQuantity: z.coerce.number().min(1).default(1),
  startDate: z.string().min(1, 'Start date is required'),
  expiryDate: z.string().min(1, 'Expiry date is required'),
  maxUsage: z.coerce.number().min(1).default(100),
  status: z.enum(['active', 'expired', 'inactive']),
});

type DiscountFormData = z.infer<typeof discountSchema>;

interface DiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DiscountFormData & { applicableProducts: string[] }) => void;
  products: Product[];
  initialData?: Discount | null;
  isLoading?: boolean;
}

export const DiscountModal: React.FC<DiscountModalProps> = ({
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
  } = useForm<DiscountFormData>({
    resolver: zodResolver(discountSchema),
    defaultValues: {
      name: '',
      code: '',
      type: 'percentage',
      value: 15,
      minPurchase: 1000,
      minQuantity: 1,
      startDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      maxUsage: 100,
      status: 'active',
    },
  });

  const discountType = watch('type');

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        code: initialData.code,
        type: initialData.type,
        value: initialData.value,
        minPurchase: initialData.minPurchase,
        minQuantity: initialData.minQuantity,
        startDate: initialData.startDate,
        expiryDate: initialData.expiryDate,
        maxUsage: initialData.maxUsage,
        status: initialData.status,
      });
    } else {
      reset({
        name: '',
        code: '',
        type: 'percentage',
        value: 15,
        minPurchase: 1000,
        minQuantity: 1,
        startDate: new Date().toISOString().split('T')[0],
        expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        maxUsage: 100,
        status: 'active',
      });
    }
  }, [initialData, reset, isOpen]);

  const onFormSubmit = (data: DiscountFormData) => {
    onSubmit({
      ...data,
      applicableProducts: ['all'],
    });
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Discount Voucher' : 'Create Promotional Discount'}
      description="Configure coupon codes, percentage deductions, or fixed credits."
      size="lg"
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label required>Campaign / Discount Name</Label>
            <Input {...register('name')} placeholder="e.g. Q4 Festive Enterprise Saver" error={errors.name?.message} />
          </div>
          <div>
            <Label required>Promo Code</Label>
            <Input {...register('code')} placeholder="e.g. FESTIVE20" className="uppercase font-mono" error={errors.code?.message} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label required>Discount Type</Label>
            <Select {...register('type')}>
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount (₹)</option>
            </Select>
          </div>
          <div>
            <Label required>{discountType === 'percentage' ? 'Percentage Off (%)' : 'Deduction Amount (₹)'}</Label>
            <Input type="number" step="1" {...register('value')} error={errors.value?.message} />
          </div>
          <div>
            <Label required>Max Redemptions</Label>
            <Input type="number" min="1" {...register('maxUsage')} error={errors.maxUsage?.message} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Min Purchase Amount (₹)</Label>
            <Input type="number" step="100" {...register('minPurchase')} />
          </div>
          <div>
            <Label>Min Quantity / Seats</Label>
            <Input type="number" min="1" {...register('minQuantity')} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label required>Start Date</Label>
            <Input type="date" {...register('startDate')} error={errors.startDate?.message} />
          </div>
          <div>
            <Label required>Expiry Date</Label>
            <Input type="date" {...register('expiryDate')} error={errors.expiryDate?.message} />
          </div>
          <div>
            <Label required>Status</Label>
            <Select {...register('status')}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="expired">Expired</option>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" size="sm" isLoading={isLoading}>
            {initialData ? 'Save Discount' : 'Create Discount'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

