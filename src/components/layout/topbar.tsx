'use client';

import { Search, Bell, Menu, User, Settings, Activity, ShieldCheck, LogOut, ChevronRight, Mail } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Sidebar } from './sidebar';
import { ModeToggle } from '@/components/shared/mode-toggle';
import { logout } from '@/lib/auth';
import React from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export function Topbar() {
  const router = useRouter();
  const [notifications, setNotifications] = React.useState(0);
  const [mounted, setMounted] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<{ invoices: any[], customers: any[] }>({ invoices: [], customers: [] });
  const [data, setData] = React.useState<any>(null);
  const [userEmail, setUserEmail] = React.useState<string | null>(null);

  React.useEffect(() => {
    setMounted(true);
    setUserEmail(localStorage.getItem('userEmail'));
    async function loadInitialData() {
      try {
        const res = await fetch('/api/dashboard');
        const d = await res.json();
        setData(d);
        setNotifications(d.activities?.length || 0);
      } catch (err) {
        console.error("Failed to load Topbar data", err);
      }
    }
    loadInitialData();
  }, []);

  React.useEffect(() => {
    if (!searchQuery.trim() || !data) {
      setSearchResults({ invoices: [], customers: [] });
      return;
    }

    const query = searchQuery.toLowerCase();
    const filteredInvoices = (data.invoices || []).filter((inv: any) =>
      inv.invoice_number.toLowerCase().includes(query) ||
      inv.customerName.toLowerCase().includes(query)
    ).slice(0, 5);

    const filteredCustomers = (data.customers || []).filter((cust: any) =>
      cust.name.toLowerCase().includes(query) ||
      cust.email?.toLowerCase().includes(query)
    ).slice(0, 5);

    setSearchResults({ invoices: filteredInvoices, customers: filteredCustomers });
  }, [searchQuery, data]);

  return (
    <header className="sticky top-0 z-30 h-18 w-full flex items-center justify-between px-6 lg:px-8 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="flex-1 flex items-center gap-6">
        <Sheet>
          <SheetTrigger render={<Button variant="ghost" size="icon" className="lg:hidden h-11 w-11 p-0 hover:bg-accent rounded-lg" />}>
            <Menu className="w-5 h-5 text-muted-foreground" />
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 lg:w-72 border-r border-border">
            <Sidebar isMobile={true} />
          </SheetContent>
        </Sheet>

        <div className="relative max-w-md w-full hidden sm:block group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search everything..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 h-11 w-full bg-muted/40 border border-border/50 rounded-lg focus-visible:ring-primary focus-visible:bg-white transition-all text-sm font-semibold text-neutral-900 dark:text-neutral-100 placeholder:text-muted-foreground/50"
          />

          {/* Search Results Dropdown */}
          <AnimatePresence>
            {searchQuery && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-0 right-0 mt-3 bg-white border border-border shadow-2xl rounded-lg overflow-hidden z-50 p-3"
              >
                {searchResults.invoices.length === 0 && searchResults.customers.length === 0 ? (
                  <div className="p-10 text-center">
                    <p className="text-sm font-bold text-muted-foreground">No matches found</p>
                    <p className="text-xs text-muted-foreground/50 mt-2 font-semibold">Try searching for a number or name</p>
                  </div>
                ) : (
                  <div className="max-h-[70vh] overflow-y-auto custom-scrollbar space-y-4">
                    {searchResults.invoices.length > 0 && (
                      <div className="space-y-2">
                        <p className="px-3 text-[11px] font-bold text-muted-foreground/60 tracking-wider">Invoices</p>
                        {searchResults.invoices.map((inv) => (
                          <div
                            key={inv.id}
                            onClick={() => router.push(`/invoices/${inv.id}`)}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-all group"
                          >
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-foreground group-hover:text-primary">{inv.invoice_number}</span>
                              <span className="text-xs text-muted-foreground font-semibold">{inv.customerName}</span>
                            </div>
                            <span className="text-xs font-bold text-foreground">₹{inv.amount.toLocaleString('en-IN')}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {searchResults.customers.length > 0 && (
                      <div className="space-y-2">
                        <p className="px-3 text-[11px] font-bold text-muted-foreground/60 tracking-wider">Customers</p>
                        {searchResults.customers.map((cust) => (
                          <div
                            key={cust.id}
                            onClick={() => router.push(`/customers/${cust.id}`)}
                            className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-all group"
                          >
                            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                              {cust.name.charAt(0)}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-foreground group-hover:text-primary">{cust.name}</span>
                              <span className="text-xs text-muted-foreground font-semibold">{cust.email}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-center gap-4 ml-auto">
        <ModeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger render={
            <Button
              variant="ghost"
              size="icon"
              className="relative h-11 w-11 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent group border border-transparent hover:border-border"
            />
          }>
            <Bell className="w-5 h-5 transition-transform duration-200 group-hover:rotate-12" />
              {mounted && notifications > 0 && (
              <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-primary ring-4 ring-white" />
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 rounded-xl p-2 border-border shadow-2xl mt-2 bg-popover z-50">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-bold text-foreground px-4 py-3 flex items-center justify-between">
                Notifications
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-widest">{notifications} New</span>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <div className="max-h-[420px] overflow-y-auto custom-scrollbar px-1 py-1">
              {data?.activities?.length > 0 ? (
                data.activities.slice(0, 5).map((activity: any) => {
                  const isDraft = activity.channel === 'Draft Created';
                  const isEmail = activity.channel === 'Email';
                  
                  return (
                    <DropdownMenuItem
                      key={activity.id}
                      onClick={() => router.push('/activity')}
                      className="rounded-xl px-4 py-4 focus:bg-muted/50 flex items-start gap-4 cursor-pointer transition-all border-b border-border/30 last:border-0 group"
                    >
                      <div className={cn(
                        "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                        isDraft ? "bg-amber-500/10 text-amber-600" : 
                        isEmail ? "bg-blue-500/10 text-blue-600" : 
                        "bg-emerald-500/10 text-emerald-600"
                      )}>
                        {isDraft ? <Activity className="w-5 h-5" /> : 
                         isEmail ? <Mail className="w-5 h-5" /> : 
                         <Activity className="w-5 h-5" />}
                      </div>
                      
                      <div className="flex flex-col gap-1 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                            {activity.customerName}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-bold whitespace-nowrap">
                            {(() => {
                              const d = new Date(activity.timestamp);
                              return isNaN(d.getTime()) ? 'Recently' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            })()}
                          </span>
                        </div>
                        
                        <p className="text-[12px] text-muted-foreground font-medium leading-relaxed line-clamp-2">
                          {activity.message}
                        </p>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <span className={cn(
                            "text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border",
                            isDraft ? "bg-amber-500/5 text-amber-700 border-amber-200/50" : 
                            isEmail ? "bg-blue-500/5 text-blue-700 border-blue-200/50" : 
                            "bg-emerald-500/5 text-emerald-700 border-emerald-200/50"
                          )}>
                            {activity.channel}
                          </span>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  );
                })
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center px-6">
                  <div className="h-12 w-12 bg-muted/50 rounded-2xl flex items-center justify-center mb-4">
                    <Bell className="w-6 h-6 text-muted-foreground/40" />
                  </div>
                  <p className="text-sm font-bold text-foreground">All caught up!</p>
                  <p className="text-xs text-muted-foreground mt-1 font-medium">No new notifications in your collection engine.</p>
                </div>
              )}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => router.push('/activity')}
              className="rounded-xl justify-center py-3 text-xs font-bold text-primary hover:bg-primary/5 transition-all cursor-pointer m-1"
            >
              View Full Activity Log
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger render={
            <Button variant="ghost" className="p-1 pl-4 gap-4 h-12 rounded-lg hover:bg-muted/50 transition-all group focus-visible:ring-0" />
          }>
            <Avatar className="h-9 w-9 rounded-full border border-border">
              <AvatarImage src={`https://ui-avatars.com/api/?name=${userEmail?.split('@')[0] || data?.settings?.managerEmails?.split(',')[0]?.split('@')[0] || 'Admin'}&background=3b82f6&color=fff`} alt="User" />
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                {(userEmail?.charAt(0) || data?.settings?.managerEmails?.split(',')[0]?.charAt(0) || 'A').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:flex flex-col items-start text-left">
              <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors capitalize">
                {(userEmail?.split('@')[0] || data?.settings?.managerEmails?.split(',')[0]?.split('@')[0] || 'System').replace(/[._]/g, ' ')} Admin
              </span>
              <span className="text-[11px] text-muted-foreground font-bold leading-none">
                {userEmail || data?.settings?.managerEmails?.split(',')[0] || 'admin@paypilot.ai'}
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground rotate-90" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 rounded-lg p-2 border-border shadow-2xl mt-2">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-bold text-foreground px-4 py-3">User settings</DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => router.push('/settings')}
              className="rounded-lg px-4 py-3 text-sm font-semibold focus:bg-primary focus:text-white transition-all cursor-pointer flex items-center gap-3"
            >
              <Settings className="w-4 h-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push('/activity')}
              className="rounded-lg px-4 py-3 text-sm font-semibold focus:bg-primary focus:text-white transition-all cursor-pointer flex items-center gap-3"
            >
              <Activity className="w-4 h-4" />
              Activities
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                if (window.confirm("Are you sure you want to log out?")) {
                  logout();
                }
              }}
              className="rounded-lg px-4 py-3 text-sm font-semibold text-rose-500 focus:bg-rose-500 focus:text-white transition-all cursor-pointer flex items-center gap-3"
            >
              <LogOut className="w-4 h-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
