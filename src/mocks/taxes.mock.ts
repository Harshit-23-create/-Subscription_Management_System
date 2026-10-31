import { Tax } from '@/types';

export const initialTaxes: Tax[] = [
  {
    id: 'tax-1',
    name: 'India GST Standard Rate (18%)',
    percentage: 18.0,
    type: 'exclusive',
    applicableProducts: ['all'],
    effectiveFrom: '2024-01-01',
    status: 'active',
  },
  {
    id: 'tax-2',
    name: 'India GST Concessional Services (12%)',
    percentage: 12.0,
    type: 'exclusive',
    applicableProducts: ['prod-3', 'prod-4'],
    effectiveFrom: '2024-01-01',
    status: 'active',
  },
  {
    id: 'tax-3',
    name: 'Zero-Rated Software Export (0%)',
    percentage: 0.0,
    type: 'exclusive',
    applicableProducts: ['prod-1', 'prod-2'],
    effectiveFrom: '2024-01-01',
    status: 'active',
  },
  {
    id: 'tax-4',
    name: 'B2C Retail Inclusive VAT (5%)',
    percentage: 5.0,
    type: 'inclusive',
    applicableProducts: ['prod-5'],
    effectiveFrom: '2024-03-01',
    effectiveTo: '2025-03-31',
    status: 'active',
  },
  {
    id: 'tax-5',
    name: 'Legacy Service Tax Cess (14.5%)',
    percentage: 14.5,
    type: 'exclusive',
    applicableProducts: ['prod-1'],
    effectiveFrom: '2023-01-01',
    effectiveTo: '2023-12-31',
    status: 'inactive',
  },
];

