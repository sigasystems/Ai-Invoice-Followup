'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  Users,
  Activity,
  Settings,
  ShieldCheck,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Invoices', href: '/invoices', icon: FileText },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Activity', href: '/activity', icon: Activity },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-white border-r border-neutral-100 w-64 lg:w-72">
      <div className="flex items-center gap-2 px-6 h-16 shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <ShieldCheck className="w-5 h-5 text-white" />
        </div>
        <span className="text-lg font-bold tracking-tight text-neutral-900">PayPilot</span>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200",
                isActive
                  ? "bg-primary/5 text-primary"
                  : "text-muted-foreground hover:bg-neutral-50 hover:text-neutral-900"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5",
                isActive ? "text-primary" : "text-muted-foreground group-hover:text-neutral-900"
              )} />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 mt-auto">
        <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100">
           <h4 className="text-xs font-semibold text-neutral-900 mb-1">Trial Version</h4>
           <p className="text-[11px] text-muted-foreground mb-3">14 days left in your trial.</p>
           <button className="w-full py-2 bg-white border border-neutral-200 text-xs font-semibold rounded-lg shadow-sm hover:bg-neutral-50 transition-colors">
              Upgrade Plan
           </button>
        </div>
      </div>
    </div>
  );
}
