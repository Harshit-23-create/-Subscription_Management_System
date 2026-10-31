/**
 * Safe currency calculation utilities.
 * Handles 2-decimal rounding to prevent floating-point precision issues.
 */

export const roundMoney = (amount: number): number => {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
};

export interface CalculateTotalsInput {
  items: Array<{
    unitPrice: number;
    quantity: number;
  }>;
  discountPercentage?: number;
  discountFixed?: number;
  taxPercentage?: number;
  isTaxInclusive?: boolean;
}

export interface CalculatedTotals {
  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  taxAmount: number;
  totalAmount: number;
}

export const calculateFinancialTotals = ({
  items,
  discountPercentage = 0,
  discountFixed = 0,
  taxPercentage = 0,
  isTaxInclusive = false,
}: CalculateTotalsInput): CalculatedTotals => {
  const rawSubtotal = items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  const subtotal = roundMoney(rawSubtotal);

  // Discount calculation
  let discountAmount = 0;
  if (discountPercentage > 0) {
    discountAmount += (subtotal * discountPercentage) / 100;
  }
  if (discountFixed > 0) {
    discountAmount += discountFixed;
  }
  discountAmount = roundMoney(Math.min(discountAmount, subtotal));

  const afterDiscount = roundMoney(Math.max(0, subtotal - discountAmount));

  // Tax calculation
  let taxAmount = 0;
  let totalAmount = afterDiscount;
  let taxableAmount = afterDiscount;

  if (taxPercentage > 0) {
    if (isTaxInclusive) {
      // Inclusive tax: Total includes tax: Tax = Total - (Total / (1 + Rate))
      taxAmount = roundMoney(afterDiscount - afterDiscount / (1 + taxPercentage / 100));
      taxableAmount = roundMoney(afterDiscount - taxAmount);
      totalAmount = afterDiscount;
    } else {
      // Exclusive tax: Total = AfterDiscount + (AfterDiscount * Rate)
      taxAmount = roundMoney((afterDiscount * taxPercentage) / 100);
      taxableAmount = afterDiscount;
      totalAmount = roundMoney(afterDiscount + taxAmount);
    }
  }

  return {
    subtotal,
    discountAmount,
    taxableAmount,
    taxAmount,
    totalAmount,
  };
};

export const computeNextBillingDate = (
  startDate: Date,
  interval: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'WEEKLY'
): Date => {
  const nextDate = new Date(startDate);
  switch (interval) {
    case 'WEEKLY':
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case 'MONTHLY':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case 'QUARTERLY':
      nextDate.setMonth(nextDate.getMonth() + 3);
      break;
    case 'YEARLY':
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
  }
  return nextDate;
};

