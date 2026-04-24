import React from 'react';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';
import { Toaster } from '@/components/ui/sonner';
import { useSidebar } from './sidebar-provider';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isCollapsed } = useSidebar();
  return (
    <div className="flex min-h-screen bg-background selection:bg-primary/20 selection:text-primary">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex fixed inset-y-0 left-0 z-40">
        <Sidebar />
      </div>

      <div className={cn(
        "flex-1 flex flex-col pt-0 transition-all duration-300",
        isCollapsed ? "lg:pl-20" : "lg:pl-64 xl:pl-72"
      )}>
        <Topbar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
          {children}
        </main>
      </div>
      <Toaster richColors closeButton position="top-right" expand={false} duration={3000} />
    </div>
  );
}
