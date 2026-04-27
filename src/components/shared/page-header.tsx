import React from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, children, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-10", className)}>
      <div className="space-y-1.5">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">{title}</h1>
        {description && <p className="text-sm font-bold text-neutral-500/80 dark:text-neutral-400">{description}</p>}
      </div>
      {children && <div className="flex items-center gap-3 mt-4 sm:mt-0">{children}</div>}
    </div>
  );
}
