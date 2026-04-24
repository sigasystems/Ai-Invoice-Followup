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
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { logout } from '@/lib/auth';
import { useSidebar } from './sidebar-provider';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Invoices', href: '/invoices', icon: FileText },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Activity', href: '/activity', icon: Activity },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar } = useSidebar();

  return (
    <div className={cn(
      "flex flex-col h-full bg-background border-r border-border transition-all duration-300 relative",
      isCollapsed ? "w-20" : "w-64 lg:w-72"
    )}>
      {/* Collapse Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 z-50 h-6 w-6 rounded-full border border-border bg-background flex items-center justify-center shadow-sm hover:bg-accent transition-colors"
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>

      <div className={cn(
        "flex items-center h-16 shrink-0",
        isCollapsed ? "justify-center" : "px-6 gap-2"
      )}>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shrink-0">
          <ShieldCheck className="w-5 h-5 text-primary-foreground" />
        </div>
        {!isCollapsed && (
          <span className="text-lg font-bold text-foreground tracking-tight ">
            PayPilot
          </span>
        )}
      </div>
      
      <nav className={cn(
        "flex-1 py-6 space-y-1.5 overflow-y-auto custom-scrollbar",
        isCollapsed ? "px-3" : "px-4"
      )}>
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              title={isCollapsed ? item.name : ""}
              className={cn(
                "group flex items-center py-2.5 text-sm font-medium rounded-xl transition-all duration-200",
                isCollapsed ? "justify-center px-0" : "px-3 gap-3",
                isActive
                  ? "bg-primary/10 text-primary shadow-sm shadow-primary/20"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 shrink-0 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
              )} />
              {!isCollapsed && (
                <span className="">
                  {item.name}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className={cn(
        "mt-auto border-t border-border/50 transition-all duration-300",
        isCollapsed ? "p-3" : "p-4"
      )}>
        <button 
          onClick={() => {
            if (window.confirm("Are you sure you want to logout?")) {
              logout();
            }
          }}
          title={isCollapsed ? "Logout" : ""}
          className={cn(
            "flex items-center py-2.5 text-sm font-semibold text-rose-500 hover:bg-rose-50 rounded-xl transition-all group w-full",
            isCollapsed ? "justify-center px-0" : "px-3 gap-3"
          )}
        >
          <LogOut className="w-5 h-5 shrink-0 group-hover:-translate-x-1 transition-transform" />
          {!isCollapsed && (
            <span className="truncate animate-in fade-in slide-in-from-left-2 duration-300">
              Logout
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
