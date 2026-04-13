'use client';

import { Search, Bell, Menu, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
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

export function Topbar() {
  return (
    <header className="sticky top-0 z-30 h-16 w-full flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-background/80 backdrop-blur-md border-b border-border shadow-sm">
      <div className="flex-1 flex items-center gap-4">
        <Sheet>
          <SheetTrigger render={<Button variant="ghost" size="icon" className="lg:hidden h-10 w-10 p-0 hover:bg-accent rounded-xl" />}>
            <Menu className="w-5 h-5 text-muted-foreground" />
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 lg:w-72 border-r border-border">
            <Sidebar />
          </SheetContent>
        </Sheet>
        
        <div className="relative max-w-sm w-full hidden md:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search invoices, customers..." 
            className="pl-10 h-10 w-full bg-muted border-transparent rounded-xl focus-visible:ring-primary focus-visible:bg-background transition-all text-sm"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
             <kbd className="hidden sm:flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 border-border">
                <span className="text-xs">⌘</span>K
             </kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 ml-auto">
        <ModeToggle />
        
        <Button variant="ghost" size="icon" className="h-10 w-10 p-0 text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-500 border-2 border-background ring-0" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" className="p-1 pl-2 gap-2 h-auto rounded-xl hover:bg-neutral-50" />}>
            <div className="hidden sm:flex flex-col items-end text-right">
              <span className="text-sm font-semibold text-neutral-900">John Doe</span>
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Admin</span>
            </div>
            <Avatar className="h-9 w-9 rounded-xl border border-neutral-100 ring-2 ring-transparent group-hover:ring-neutral-100 transition-all">
              <AvatarImage src="/avatar.png" alt="User" />
              <AvatarFallback className="bg-primary/5 text-primary font-bold text-xs">JD</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 border-neutral-100 shadow-xl mt-2">
            <DropdownMenuLabel className="font-semibold text-neutral-900 px-3 py-2">My Account</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-neutral-50" />
            <DropdownMenuItem className="rounded-xl px-3 py-2 text-sm font-medium focus:bg-primary/5 focus:text-primary transition-colors cursor-pointer group">
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-xl px-3 py-2 text-sm font-medium focus:bg-primary/5 focus:text-primary transition-colors cursor-pointer group">
              Subscription
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-xl px-3 py-2 text-sm font-medium focus:bg-primary/5 focus:text-primary transition-colors cursor-pointer group">
              Billing
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-neutral-50" />
            <DropdownMenuItem className="rounded-xl px-3 py-2 text-sm font-medium text-rose-600 focus:bg-rose-50 focus:text-rose-700 transition-colors cursor-pointer">
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
