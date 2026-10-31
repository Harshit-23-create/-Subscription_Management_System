import { Product } from '@/types';

export const initialProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'SmartCare Subscription Management Suite',
    type: 'software',
    salesPrice: 1000,
    costPrice: 420,
    description: 'Enterprise recurring billing engine with automated invoicing, dunning management, and customer portal.',
    variants: [
      { id: 'var-1-1', name: 'Standard Edition', additionalPrice: 0, sku: 'SC-STD-01' },
      { id: 'var-1-2', name: 'Odoo Brand Integration', additionalPrice: 560, sku: 'SC-ODOO-560' },
      { id: 'var-1-3', name: 'Custom White Label Brand', additionalPrice: 1200, sku: 'SC-WHT-1200' },
    ],
    status: 'active',
    createdAt: '2024-01-10T00:00:00Z',
  },
  {
    id: 'prod-2',
    name: 'Brightloop Revenue Analytics Pro',
    type: 'software',
    salesPrice: 2499,
    costPrice: 850,
    description: 'Real-time MRR, ARR, cohort retention, and churn forecasting analytics platform.',
    variants: [
      { id: 'var-2-1', name: 'Standard Dashboard (10 Seats)', additionalPrice: 0, sku: 'BL-ANL-STD' },
      { id: 'var-2-2', name: 'Enterprise Unlimited Seats', additionalPrice: 1500, sku: 'BL-ANL-UNL' },
    ],
    status: 'active',
    createdAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'prod-3',
    name: 'Automated Tax & GST Compliance Module',
    type: 'addon',
    salesPrice: 750,
    costPrice: 200,
    description: 'Multi-jurisdiction automated GST calculation, e-invoicing generation, and compliance filing export.',
    variants: [
      { id: 'var-3-1', name: 'India GST Auto-Filing', additionalPrice: 0, sku: 'TAX-IND-01' },
      { id: 'var-3-2', name: 'Global Cross-Border VAT/GST', additionalPrice: 600, sku: 'TAX-GLB-02' },
    ],
    status: 'active',
    createdAt: '2024-02-01T00:00:00Z',
  },
  {
    id: 'prod-4',
    name: '24/7 Dedicated Priority Technical Support',
    type: 'service',
    salesPrice: 3500,
    costPrice: 1800,
    description: 'Dedicated technical account manager with 15-minute SLA response time and architecture reviews.',
    variants: [
      { id: 'var-4-1', name: 'Business Hours SLA', additionalPrice: 0, sku: 'SUP-BIZ-01' },
      { id: 'var-4-2', name: '24/7 Worldwide Rapid Escalation', additionalPrice: 2000, sku: 'SUP-247-02' },
    ],
    status: 'active',
    createdAt: '2024-02-15T00:00:00Z',
  },
  {
    id: 'prod-5',
    name: 'High-Throughput Webhook & API Gateway',
    type: 'addon',
    salesPrice: 1200,
    costPrice: 350,
    description: 'Dedicated webhooks pipeline processing up to 10M events per month with guaranteed delivery.',
    variants: [
      { id: 'var-5-1', name: 'Standard 1M Events', additionalPrice: 0, sku: 'API-1M' },
      { id: 'var-5-2', name: 'High-Volume 10M Events', additionalPrice: 1800, sku: 'API-10M' },
    ],
    status: 'active',
    createdAt: '2024-03-01T00:00:00Z',
  },
];

