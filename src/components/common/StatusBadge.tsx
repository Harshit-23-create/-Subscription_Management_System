import React from 'react';
import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const normalized = status.toLowerCase();

  let variant: 'success' | 'warning' | 'danger' | 'info' | 'default' = 'default';
  let dotColor = 'bg-slate-400';

  if (['active', 'paid', 'success', 'converted', 'accepted'].includes(normalized)) {
    variant = 'success';
    dotColor = 'bg-emerald-500';
  } else if (['pending', 'paused', 'draft', 'sent'].includes(normalized)) {
    variant = 'warning';
    dotColor = 'bg-amber-500';
  } else if (['overdue', 'cancelled', 'closed', 'failed', 'expired', 'archived'].includes(normalized)) {
    variant = 'danger';
    dotColor = 'bg-rose-500';
  } else if (['confirmed', 'lead'].includes(normalized)) {
    variant = 'info';
    dotColor = 'bg-blue-500';
  }

  return (
    <Badge variant={variant} size={size} className="gap-1.5 capitalize font-medium">
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      {status}
    </Badge>
  );
};

