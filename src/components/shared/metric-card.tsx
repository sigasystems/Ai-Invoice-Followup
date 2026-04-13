import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}

export function MetricCard({ title, value, icon: Icon, trend, className }: MetricCardProps) {
  return (
    <Card className={cn("overflow-hidden rounded-2xl shadow-sm border-border", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="w-4 h-4 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value}</div>
        {trend && (
          <p className={cn(
            "text-xs font-medium mt-1",
            trend.isPositive ? "text-emerald-600" : "text-rose-600"
          )}>
            {trend.isPositive ? '+' : '-'}{trend.value}
            <span className="text-muted-foreground ml-1 font-normal">from last month</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
