import { describe, it, expect } from 'vitest';
import { calculateFinancialTotals, roundMoney, computeNextBillingDate } from '../src/utils/calculation';

describe('Financial & Calculation Utilities', () => {
  it('should round money correctly to 2 decimal places', () => {
    expect(roundMoney(10.255)).toBe(10.26);
    expect(roundMoney(10.254)).toBe(10.25);
    expect(roundMoney(0.1 + 0.2)).toBe(0.3);
  });

  it('should calculate exclusive tax and percentage discount accurately', () => {
    const result = calculateFinancialTotals({
      items: [
        { unitPrice: 100, quantity: 2 }, // subtotal: 200
      ],
      discountPercentage: 10, // 10% of 200 = 20 -> 180 taxable
      taxPercentage: 10, // 10% of 180 = 18
      isTaxInclusive: false,
    });

    expect(result.subtotal).toBe(200);
    expect(result.discountAmount).toBe(20);
    expect(result.taxableAmount).toBe(180);
    expect(result.taxAmount).toBe(18);
    expect(result.totalAmount).toBe(198);
  });

  it('should calculate inclusive tax accurately', () => {
    const result = calculateFinancialTotals({
      items: [
        { unitPrice: 120, quantity: 1 }, // subtotal: 120
      ],
      discountPercentage: 0,
      taxPercentage: 20, // 20% inclusive -> 120 / 1.2 = 100 net, 20 tax
      isTaxInclusive: true,
    });

    expect(result.subtotal).toBe(120);
    expect(result.discountAmount).toBe(0);
    expect(result.totalAmount).toBe(120);
    expect(result.taxAmount).toBe(20);
    expect(result.taxableAmount).toBe(100);
  });

  it('should calculate next billing dates properly for intervals', () => {
    const baseDate = new Date('2026-01-15T00:00:00.000Z');

    const nextMonthly = computeNextBillingDate(baseDate, 'MONTHLY');
    expect(nextMonthly.getMonth()).toBe(1); // February

    const nextYearly = computeNextBillingDate(baseDate, 'YEARLY');
    expect(nextYearly.getFullYear()).toBe(2027);

    const nextWeekly = computeNextBillingDate(baseDate, 'WEEKLY');
    expect(nextWeekly.getDate()).toBe(22);
  });
});

