import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input, Select, Textarea, Label } from '@/components/ui/input';
import { Customer } from '@/types';

const customerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  company: z.string().min(2, 'Company name is required'),
  phone: z.string().min(6, 'Valid phone number is required'),
  status: z.enum(['active', 'inactive', 'lead']),
  address: z.string().min(3, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  country: z.string().min(2, 'Country is required'),
  postalCode: z.string().min(3, 'Postal code is required'),
  taxNumber: z.string().optional(),
  notes: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CustomerFormData) => void;
  initialData?: Customer | null;
  isLoading?: boolean;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: '',
      email: '',
      company: '',
      phone: '',
      status: 'active',
      address: '',
      city: '',
      country: 'India',
      postalCode: '',
      taxNumber: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        email: initialData.email,
        company: initialData.company,
        phone: initialData.phone,
        status: initialData.status,
        address: initialData.address,
        city: initialData.city,
        country: initialData.country,
        postalCode: initialData.postalCode,
        taxNumber: initialData.taxNumber || '',
        notes: initialData.notes || '',
      });
    } else {
      reset({
        name: '',
        email: '',
        company: '',
        phone: '',
        status: 'active',
        address: '',
        city: '',
        country: 'India',
        postalCode: '',
        taxNumber: '',
        notes: '',
      });
    }
  }, [initialData, reset, isOpen]);

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Customer' : 'Add New Customer'}
      description="Manage enterprise customer profile, billing address, and tax information."
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label required>Customer Name</Label>
            <Input {...register('name')} placeholder="e.g. Aarav Sharma" error={errors.name?.message} />
          </div>
          <div>
            <Label required>Company Name</Label>
            <Input {...register('company')} placeholder="e.g. TechSpire Pvt Ltd" error={errors.company?.message} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label required>Email Address</Label>
            <Input type="email" {...register('email')} placeholder="name@company.com" error={errors.email?.message} />
          </div>
          <div>
            <Label required>Phone Number</Label>
            <Input {...register('phone')} placeholder="+91 98765 43210" error={errors.phone?.message} />
          </div>
          <div>
            <Label required>Account Status</Label>
            <Select {...register('status')} error={errors.status?.message}>
              <option value="active">Active</option>
              <option value="lead">Lead</option>
              <option value="inactive">Inactive</option>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <Label required>Street Address</Label>
            <Input {...register('address')} placeholder="e.g. Plot 42, Hitec City Phase 2" error={errors.address?.message} />
          </div>
          <div>
            <Label>GST / Tax ID</Label>
            <Input {...register('taxNumber')} placeholder="e.g. 36AABCT1332L1Z4" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label required>City</Label>
            <Input {...register('city')} placeholder="e.g. Hyderabad" error={errors.city?.message} />
          </div>
          <div>
            <Label required>Postal Code</Label>
            <Input {...register('postalCode')} placeholder="e.g. 500081" error={errors.postalCode?.message} />
          </div>
          <div>
            <Label required>Country</Label>
            <Input {...register('country')} placeholder="e.g. India" error={errors.country?.message} />
          </div>
        </div>

        <div>
          <Label>Account Notes</Label>
          <Textarea rows={2} {...register('notes')} placeholder="Special billing terms, SLA notes, or contract reminders..." />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" size="sm" isLoading={isLoading}>
            {initialData ? 'Save Changes' : 'Create Customer'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

