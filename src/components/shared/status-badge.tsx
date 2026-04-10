import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'outline';
  className?: string;
}

const statusMap: Record<string, { color: string; label: string }> = {
  Paid: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Paid' },
  Pending: { color: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Pending' },
  Overdue: { color: 'bg-rose-50 text-rose-700 border-rose-200', label: 'Overdue' },
  'In Plan': { color: 'bg-indigo-50 text-indigo-700 border-indigo-200', label: 'Payment Plan' },
  Sent: { color: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Sent' },
  Delivered: { color: 'bg-indigo-50 text-indigo-700 border-indigo-200', label: 'Delivered' },
  Failed: { color: 'bg-red-50 text-red-700 border-red-200', label: 'Failed' },
  Low: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Low Risk' },
  Medium: { color: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Medium Risk' },
  High: { color: 'bg-rose-50 text-rose-700 border-rose-200', label: 'High Risk' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusMap[status] || { color: 'bg-slate-50 text-slate-700 border-slate-200', label: status };

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "rounded-full px-2.5 py-0.5 text-[11px] font-semibold border shadow-none",
        config.color,
        className
      )}
    >
      {config.label}
    </Badge>
  );
}
