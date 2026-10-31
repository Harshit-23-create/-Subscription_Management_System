import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input, Select, Label } from '@/components/ui/input';
import { Tax, Product } from '@/types';

const taxSchema = z.object({
  name: z.string().min(2, 'Tax name is required'),
  percentage: z.coerce.number().min(0, 'Percentage cannot be negative').max(100),
  type: z.enum(['exclusive', 'inclusive']),
  effectiveFrom: z.string().min(1, 'Effective date is required'),
  effectiveTo: z.string().optional(),
  status: z.enum(['active', 'inactive']),
});

type TaxFormData = z.infer<typeof taxSchema>;

interface TaxModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TaxFormData & { applicableProducts: string[] }) => void;
  products: Product[];
  initialData?: Tax | null;
  isLoading?: boolean;
}

export const TaxModal: React.FC<TaxModalProps> = ({
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
    formState: { errors },
  } = useForm<TaxFormData>({
    resolver: zodResolver(taxSchema),
    defaultValues: {
      name: '',
      percentage: 18,
      type: 'exclusive',
      effectiveFrom: new Date().toISOString().split('T')[0],
      effectiveTo: '',
      status: 'active',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        percentage: initialData.percentage,
        type: initialData.type,
        effectiveFrom: initialData.effectiveFrom,
        effectiveTo: initialData.effectiveTo || '',
        status: initialData.status,
      });
    } else {
      reset({
        name: '',
        percentage: 18,
        type: 'exclusive',
        effectiveFrom: new Date().toISOString().split('T')[0],
        effectiveTo: '',
        status: 'active',
      });
    }
  }, [initialData, reset, isOpen]);

  const onFormSubmit = (data: TaxFormData) => {
    onSubmit({
      ...data,
      applicableProducts: ['all'],
    });
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Tax Rule' : 'Add New Tax Rate'}
      description="Configure tax percentage, calculation scheme (inclusive vs exclusive), and effective dates."
      size="md"
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        <div>
          <Label required>Tax Rule Name</Label>
          <Input {...register('name')} placeholder="e.g. India GST Standard (18%)" error={errors.name?.message} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label required>Percentage Rate (%)</Label>
            <Input type="number" step="0.5" {...register('percentage')} error={errors.percentage?.message} />
          </div>
          <div>
            <Label required>Calculation Type</Label>
            <Select {...register('type')}>
              <option value="exclusive">Exclusive (Added to subtotal)</option>
              <option value="inclusive">Inclusive (Embedded in price)</option>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label required>Effective From</Label>
            <Input type="date" {...register('effectiveFrom')} error={errors.effectiveFrom?.message} />
          </div>
          <div>
            <Label>Effective To (Optional)</Label>
            <Input type="date" {...register('effectiveTo')} />
          </div>
        </div>

        <div>
          <Label required>Status</Label>
          <Select {...register('status')}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" size="sm" isLoading={isLoading}>
            {initialData ? 'Save Tax' : 'Create Tax Rule'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

