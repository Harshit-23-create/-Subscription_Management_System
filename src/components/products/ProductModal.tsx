import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input, Select, Textarea, Label } from '@/components/ui/input';
import { Product, ProductVariant } from '@/types';
import { Plus, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

const productSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  type: z.enum(['software', 'service', 'addon']),
  salesPrice: z.coerce.number().min(0, 'Sales price must be positive'),
  costPrice: z.coerce.number().min(0, 'Cost price must be positive'),
  description: z.string().min(5, 'Description is required'),
  status: z.enum(['active', 'archived']),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormData & { variants: ProductVariant[] }) => void;
  initialData?: Product | null;
  isLoading?: boolean;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}) => {
  const [variants, setVariants] = useState<ProductVariant[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      type: 'software',
      salesPrice: 1000,
      costPrice: 400,
      description: '',
      status: 'active',
    },
  });

  const basePrice = watch('salesPrice') || 0;

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        type: initialData.type,
        salesPrice: initialData.salesPrice,
        costPrice: initialData.costPrice,
        description: initialData.description,
        status: initialData.status,
      });
      setVariants(initialData.variants || []);
    } else {
      reset({
        name: '',
        type: 'software',
        salesPrice: 1000,
        costPrice: 400,
        description: '',
        status: 'active',
      });
      setVariants([
        { id: `var-${Date.now()}-1`, name: 'Base Edition', additionalPrice: 0, sku: 'PROD-BASE' },
        { id: `var-${Date.now()}-2`, name: 'Odoo Brand Connector', additionalPrice: 560, sku: 'PROD-ODOO-560' },
      ]);
    }
  }, [initialData, reset, isOpen]);

  const handleAddVariant = () => {
    setVariants([
      ...variants,
      {
        id: `var-${Date.now()}`,
        name: 'New Custom Variant',
        additionalPrice: 200,
        sku: `SKU-${Math.floor(100 + Math.random() * 900)}`,
      },
    ]);
  };

  const handleUpdateVariant = (index: number, field: keyof ProductVariant, val: any) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: val };
    setVariants(updated);
  };

  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const onFormSubmit = (data: ProductFormData) => {
    onSubmit({ ...data, variants });
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Product' : 'Add New SaaS Product'}
      description="Configure software product details, base pricing, and add-on variants."
      size="lg"
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label required>Product Name</Label>
            <Input {...register('name')} placeholder="e.g. SmartCare Subscription Suite" error={errors.name?.message} />
          </div>
          <div>
            <Label required>Product Type</Label>
            <Select {...register('type')} error={errors.type?.message}>
              <option value="software">Software (Core SaaS)</option>
              <option value="service">Service (Support/Retainer)</option>
              <option value="addon">Addon (Feature Module)</option>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label required>Base Sales Price (₹)</Label>
            <Input type="number" step="10" {...register('salesPrice')} error={errors.salesPrice?.message} />
          </div>
          <div>
            <Label required>Cost Price (₹)</Label>
            <Input type="number" step="10" {...register('costPrice')} error={errors.costPrice?.message} />
          </div>
          <div>
            <Label required>Status</Label>
            <Select {...register('status')}>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </Select>
          </div>
        </div>

        <div>
          <Label required>Description</Label>
          <Textarea rows={2} {...register('description')} placeholder="Detailed product capabilities and scope..." error={errors.description?.message} />
        </div>

        {/* Product Variants Section */}
        <div className="pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Product Pricing Variants</h4>
              <p className="text-[11px] text-slate-400">e.g. Base price: ₹{basePrice} + Odoo brand: +₹560</p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={handleAddVariant} className="h-7 text-xs">
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Variant
            </Button>
          </div>

          <div className="space-y-2">
            {variants.map((variant, idx) => {
              const totalPrice = Number(basePrice) + Number(variant.additionalPrice);
              return (
                <div key={variant.id} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                  <div className="flex-1">
                    <Input
                      value={variant.name}
                      onChange={(e) => handleUpdateVariant(idx, 'name', e.target.value)}
                      placeholder="Variant Name"
                      className="h-8 text-xs bg-white"
                    />
                  </div>
                  <div className="w-28">
                    <Input
                      type="number"
                      value={variant.additionalPrice}
                      onChange={(e) => handleUpdateVariant(idx, 'additionalPrice', Number(e.target.value))}
                      placeholder="+ Price"
                      className="h-8 text-xs bg-white"
                    />
                  </div>
                  <div className="w-24 text-right">
                    <span className="text-xs font-bold text-blue-700">
                      = {formatCurrency(totalPrice)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveVariant(idx)}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" size="sm" isLoading={isLoading}>
            {initialData ? 'Save Product' : 'Create Product'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

