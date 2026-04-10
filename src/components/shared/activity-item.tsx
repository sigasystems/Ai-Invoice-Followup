import { Activity } from '@/types';
import { StatusBadge } from './status-badge';
import { Mail, MessageSquare, PhoneCall, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface ActivityItemProps {
  activity: Activity;
  isLast?: boolean;
}

const channelIcons = {
  Email: Mail,
  WhatsApp: MessageSquare,
  SMS: PhoneCall,
};

export function ActivityItem({ activity, isLast }: ActivityItemProps) {
  const Icon = channelIcons[activity.channel] || Clock;

  return (
    <div className={cn("relative flex gap-x-4", !isLast && "pb-8")}>
      {!isLast && (
        <div className="absolute left-[15px] top-[15px] bottom-0 w-[1px] bg-neutral-100" />
      )}
      <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-neutral-50 ring-1 ring-neutral-200">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-auto py-0.5">
        <div className="flex items-center justify-between gap-x-4">
          <div className="text-sm font-medium leading-6 text-neutral-900">
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
        <div className="mt-1 flex items-center gap-x-2">
           <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Channel: {activity.channel}</span>
        </div>
      </div>
    </div>
  );
}
