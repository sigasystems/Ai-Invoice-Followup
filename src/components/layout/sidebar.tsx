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

export function Sidebar({ isMobile }: { isMobile?: boolean }) {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar } = useSidebar();

  // Force full width on mobile
  const collapsed = isMobile ? false : isCollapsed;

  return (
    <div className={cn(
      "flex flex-col h-full bg-background border-r border-border transition-all duration-300 relative",
      collapsed ? "w-20" : "w-64 xl:w-72"
    )}>
      {/* Collapse Toggle Button - Hide on mobile */}
      {!isMobile && (
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-20 z-50 h-6 w-6 rounded-full border border-border bg-background flex items-center justify-center shadow-sm hover:bg-accent transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      )}

      <div className={cn(
        "flex items-center h-16 shrink-0",
        collapsed ? "justify-center" : "px-6 gap-3"
      )}>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary shrink-0 shadow-lg shadow-primary/30">
          <ShieldCheck className="w-6 h-6 text-primary-foreground" />
        </div>
        {!collapsed && (
          <span className="text-xl font-bold text-foreground tracking-tight">
            PayPilot
          </span>
        )}
      </div>

      <nav className={cn(
        "flex-1 py-8 space-y-2 overflow-y-auto custom-scrollbar",
        collapsed ? "px-3" : "px-4"
      )}>
        <p className={cn("px-4 ] font-semibold mb-4", collapsed && "hidden")}>Menu</p>
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              title={collapsed ? item.name : ""}
              className={cn(
                "group flex items-center py-3 text-sm font-semibold rounded-lg transition-all duration-200",
                collapsed ? "justify-center px-0" : "px-4 gap-4",
                isActive
                  ? "bg-primary text-white shadow-md shadow-primary/30"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 shrink-0 transition-colors",
                isActive ? "text-white" : "text-muted-foreground group-hover:text-foreground"
              )} />
              {!collapsed && (
                <span>
                  {item.name}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className={cn(
        "mt-auto border-t border-border/50 transition-all duration-300",
        collapsed ? "p-3" : "p-4"
      )}>
        <button
          onClick={() => {
            if (window.confirm("Are you sure you want to logout?")) {
              logout();
            }
          }}
          title={collapsed ? "Logout" : ""}
          className={cn(
            "flex items-center py-2.5 text-sm font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-all group w-full",
            collapsed ? "justify-center px-0" : "px-3 gap-3"
          )}
        >
          <LogOut className="w-5 h-5 shrink-0 group-hover:-translate-x-1 transition-transform" />
          {!collapsed && (
            <span className="truncate animate-in fade-in slide-in-from-left-2 duration-300">
              Logout
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
