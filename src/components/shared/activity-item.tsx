import { Activity } from '@/types';
import { StatusBadge } from './status-badge';
import { Mail, MessageSquare, PhoneCall, Clock, ShieldAlert, MailCheck, UserCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface ActivityItemProps {
  activity: Activity;
  isLast?: boolean;
}

const channelIcons: Record<string, any> = {
  Email: Mail,
  WhatsApp: MessageSquare,
  SMS: PhoneCall,
  'Manager Escalation': ShieldAlert,
  'Draft Created': MailCheck,
  'Human Review': UserCheck
};

export function ActivityItem({ activity, isLast }: ActivityItemProps) {
  const Icon = channelIcons[activity.channel] || Clock;

  return (
    <div className={cn("relative flex gap-x-4", !isLast && "pb-8")}>
      {!isLast && (
        <div className="absolute left-[15px] top-[15px] bottom-0 w-[1px] bg-neutral-100" />
      )}
      <div className={cn(
        "relative flex h-8 w-8 items-center justify-center rounded-full ring-1 shadow-xs transition-all",
        activity.channel === 'Draft Created'
          ? "bg-orange-500/10 ring-orange-200 text-orange-600 scale-110"
          : "bg-neutral-50 ring-neutral-200 text-primary"
      )}>
        <Icon className="h-4 w-4" />
        {activity.channel === 'Draft Created' && (
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-orange-500 animate-pulse border border-white" />
        )}
      </div>
      <div className="flex-auto py-0.5">
        <div className="flex items-center justify-between gap-x-4">
          <div className="text-sm font-medium leading-6">
            {activity.customerName}
          </div>
          <time
            dateTime={activity.timestamp}
            className="flex-none text-xs text-muted-foreground font-normal"
          >
            {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
          </time>
        </div>
        <div className="mt-1 flex items-center gap-x-2">
          <p className="text-sm leading-6 text-muted-foreground">{activity.message}</p>
          <StatusBadge status={activity.status} className="border-none bg-transparent h-auto py-0 px-0 shadow-none text-[10px]" />
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span className="text-[9px] uppercase  px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-black border border-border">
            {activity.channel}
          </span>
          {activity.channel === 'Manager Escalation' && (
            <span className="text-[9px] uppercase  px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-600 font-black border border-rose-500/10">
              Critical Alert
            </span>
          )}
          {activity.channel === 'Draft Created' && (
            <span className="text-[9px] uppercase  px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-600 font-black border border-orange-500/10">
              Awaiting Approval
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
