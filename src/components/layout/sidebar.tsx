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
      collapsed ? "w-20" : "w-64 lg:w-72"
    )}>
      {/* Collapse Toggle Button - Hide on mobile */}
      {!isMobile && (
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-10 z-50 h-6 w-6 rounded-full border border-border bg-background flex items-center justify-center shadow-md hover:bg-accent transition-all duration-200 hover:scale-110 active:scale-95"
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </button>
      )}

      <div className={cn(
        "flex items-center h-16 shrink-0",
        collapsed ? "justify-center" : "px-6 gap-2"
      )}>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shrink-0 shadow-lg shadow-primary/20">
          <ShieldCheck className="w-5 h-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="flex flex-col animate-in fade-in slide-in-from-left-2 duration-300">
            <span className="text-base font-black text-foreground tracking-tight leading-none">PayPilot</span>
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest mt-0.5">Intelligence</span>
          </div>
        )}
      </div>
      
      <nav className={cn(
        "flex-1 py-6 space-y-2 overflow-y-auto custom-scrollbar",
        collapsed ? "px-3" : "px-4"
      )}>
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              title={collapsed ? item.name : ""}
              className={cn(
                "group flex items-center py-2.5 text-sm font-semibold rounded-xl transition-all duration-200",
                collapsed ? "justify-center px-0 h-11 w-11 mx-auto" : "px-4 gap-3",
                isActive
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 shrink-0 transition-all duration-300",
                isActive 
                  ? "text-primary-foreground" 
                  : "text-muted-foreground group-hover:scale-110 group-hover:text-primary"
              )} />
              {!collapsed && (
                <span className="truncate animate-in fade-in slide-in-from-left-2 duration-300">
                  {item.name}
                </span>
              )}
              {isActive && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-foreground/50 shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
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
            "flex items-center py-3 text-sm font-bold text-rose-500 hover:bg-rose-50/50 rounded-xl transition-all group w-full",
            collapsed ? "justify-center px-0 h-11 w-11 mx-auto" : "px-4 gap-3"
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
