export function formatCurrency(amount: number | string | undefined | null, currency: string = 'INR'): string {
  const num = typeof amount === 'number' ? amount : Number(amount);
  const safeAmount = isNaN(num) ? 0 : num;
  if (currency === 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(safeAmount);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 2,
  }).format(safeAmount);
}

export function formatDate(dateString: string | Date | undefined | null): string {
  if (!dateString) return '—';
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    if (isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch {
    return '—';
  }
}

export function formatDateTime(dateString: string | Date | undefined | null): string {
  if (!dateString) return '—';
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    if (isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return '—';
  }
}

export function formatNumber(num: number | string | undefined | null): string {
  const val = typeof num === 'number' ? num : Number(num);
  const safeNum = isNaN(val) ? 0 : val;
  return new Intl.NumberFormat('en-IN').format(safeNum);
}

export function formatPercent(rate: number | undefined | null): string {
  const val = typeof rate === 'number' ? rate : Number(rate);
  const safeRate = isNaN(val) ? 0 : val;
  return `${safeRate >= 0 ? '+' : ''}${safeRate.toFixed(1)}%`;
}
