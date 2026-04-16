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
    <Card className={cn("relative overflow-hidden rounded-[2rem] border border-border bg-card shadow-sm hover:shadow-md transition-all duration-300", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-6">
        <CardTitle className="text-[13px] font-black uppercase text-muted-foreground">{title}</CardTitle>
        <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <Icon className="w-4 h-4" />
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="text-3xl font-black  text-foreground">{value}</div>
        {trend && (
          <div className="flex items-center gap-1.5 mt-2">
            <span className={cn(
              "px-2 py-0.5 rounded-lg text-[12px] font-black uppercase ",
              trend.isPositive ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
            )}>
              {trend.value}
            </span>
            <span className="text-[12px] text-muted-foreground font-bold ">System insight</span>
          </div>
        )}
      </CardContent>
      {/* Decorative background element */}
      <div className="absolute -right-4 -bottom-4 opacity-[0.03] pointer-events-none">
        <Icon className="h-24 w-24" />
      </div>
    </Card>
  );
}
