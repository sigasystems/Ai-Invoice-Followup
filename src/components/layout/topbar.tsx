'use client';

import { Search, Bell, Menu, User, Settings, Activity, ShieldCheck, LogOut } from 'lucide-react';
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

export function Topbar() {
  const router = useRouter();
  const [notifications, setNotifications] = React.useState(0);
  const [mounted, setMounted] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<{ invoices: any[], customers: any[] }>({ invoices: [], customers: [] });
  const [data, setData] = React.useState<any>(null);

  React.useEffect(() => {
    setMounted(true);
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
    <header className="sticky top-0 z-30 h-16 w-full flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-background/80 backdrop-blur-md border-b border-border shadow-sm">
      <div className="flex-1 flex items-center gap-4">
        <Sheet>
          <SheetTrigger render={<Button variant="ghost" size="icon" className="lg:hidden h-10 w-10 p-0 hover:bg-accent rounded-xl" />}>
            <Menu className="w-5 h-5 text-muted-foreground" />
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 lg:w-72 border-r border-border">
            <Sidebar isMobile={true} />
          </SheetContent>
        </Sheet>
        
        <div className="relative max-w-sm w-full hidden md:block group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search invoices, customers..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 w-full bg-muted border-transparent rounded-xl focus-visible:ring-primary focus-visible:bg-background transition-all text-sm"
          />

          {/* Search Results Dropdown */}
          <AnimatePresence>
            {searchQuery && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-card border border-border shadow-2xl rounded-2xl overflow-hidden z-50 p-2"
              >
                {searchResults.invoices.length === 0 && searchResults.customers.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-sm font-bold text-muted-foreground">No matches found</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">Try searching for a number or name</p>
                  </div>
                ) : (
                  <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {searchResults.invoices.length > 0 && (
                      <div className="mb-2">
                        <p className="px-3 py-1.5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Invoices</p>
                        {searchResults.invoices.map((inv) => (
                          <div 
                            key={inv.id}
                            onClick={() => router.push(`/invoices/${inv.id}`)}
                            className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/80 cursor-pointer transition-colors group"
                          >
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{inv.invoice_number}</span>
                              <span className="text-xs text-muted-foreground font-medium">{inv.customerName}</span>
                            </div>
                            <span className="text-xs font-black text-foreground">₹{inv.amount.toLocaleString('en-IN')}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {searchResults.customers.length > 0 && (
                      <div>
                        <p className="px-3 py-1.5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Customers</p>
                        {searchResults.customers.map((cust) => (
                          <div 
                            key={cust.id}
                            onClick={() => router.push(`/customers/${cust.id}`)}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/80 cursor-pointer transition-colors group"
                          >
                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black text-xs">
                              {cust.name.charAt(0)}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{cust.name}</span>
                              <span className="text-xs text-muted-foreground font-medium">{cust.email}</span>
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

      <div className="flex items-center gap-2 sm:gap-4 ml-auto">
        <ModeToggle />
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.push('/activity')}
          className="h-10 w-10 p-0 text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl relative overflow-visible group"
        >
          <Bell className="w-5 h-5 group-hover:shake transition-all" />
          {mounted && notifications > 0 && (
            <span className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-rose-500 border-2 border-background flex items-center justify-center text-[10px] font-black text-white shadow-lg animate-in fade-in zoom-in duration-300">
              {notifications > 9 ? '9+' : notifications}
            </span>
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" className="p-1 pl-2 gap-2 h-auto rounded-xl hover:bg-neutral-50" />}>
            <div className="hidden sm:flex flex-col items-end text-right">
              <span className="text-sm font-semibold ">Lalit Khairnar</span>
              <span className="text-[12px] text-muted-foreground font-medium uppercase tracking-wider">Admin</span>
            </div>
            <Avatar className="h-9 w-9 rounded-xl border border-neutral-100 ring-2 ring-transparent group-hover:ring-neutral-100 transition-all">
              <AvatarImage src="https://ui-avatars.com/api/?name=Lalit+Khairnar&background=6366f1&color=fff" alt="User" />
              <AvatarFallback className="bg-primary/5 text-primary font-bold text-xs">LK</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 border-neutral-100 shadow-xl mt-2">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-semibold text-neutral-900 px-3 py-2">System Admin</DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-neutral-50" />
            <DropdownMenuItem 
              onClick={() => router.push('/settings')}
              className="rounded-xl px-3 py-2 text-sm font-medium focus:bg-primary/5 focus:text-primary transition-colors cursor-pointer group flex items-center gap-2"
            >
              <Settings className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              Automation Settings
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => router.push('/activity')}
              className="rounded-xl px-3 py-2 text-sm font-medium focus:bg-primary/5 focus:text-primary transition-colors cursor-pointer group flex items-center gap-2"
            >
              <Activity className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              Audit Intelligence
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => router.push('/dashboard')}
              className="rounded-xl px-3 py-2 text-sm font-medium focus:bg-primary/5 focus:text-primary transition-colors cursor-pointer group flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              System Status
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-neutral-50" />
            <DropdownMenuItem 
              onClick={() => {
                if (window.confirm("Are you sure you want to log out? This will end your current session.")) {
                  logout();
                }
              }}
              className="rounded-xl px-3 py-2 text-sm font-medium text-rose-600 focus:bg-rose-50 focus:text-rose-700 transition-colors cursor-pointer flex items-center gap-2 group"
            >
              <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
