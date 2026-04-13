'use client';

import * as React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { StatusBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { 
  Users,
  Search,
  MoreHorizontal,
  Mail,
  UserCheck,
  TrendingDown,
  TrendingUp,
  Download,
  Plus
} from 'lucide-react';
import { fetchCustomers } from '@/lib/api';
import { ColumnDef } from '@tanstack/react-table';
import { Customer } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { Progress } from "@/components/ui/progress";
import { cn } from '@/lib/utils';

export default function CustomersPage() {
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadData() {
       setLoading(true);
       const data = await fetchCustomers();
       setCustomers(data);
       setLoading(false);
    }
    loadData();
  }, []);

  const columns: ColumnDef<Customer>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <a href={`/customers/${row.original.id}`} className="flex flex-col group cursor-pointer">
          <span className="font-bold text-neutral-900 leading-none mb-1 group-hover:text-primary transition-colors underline decoration-transparent group-hover:decoration-primary/30 underline-offset-4">
            {row.getValue('name')}
          </span>
          <span className="text-[10px] text-muted-foreground font-semibold leading-none">{row.original.email}</span>
        </a>
      ),
    },
    {
       accessorKey: 'phone',
       header: 'Phone',
       cell: ({ row }) => <span className="text-muted-foreground font-medium">{row.getValue('phone')}</span>,
    },
    {
      accessorKey: 'onTimeRate',
      header: 'On-Time Rate',
      cell: ({ row }) => {
        const rate = row.getValue('onTimeRate') as number;
        return (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 w-12 bg-neutral-100 rounded-full overflow-hidden">
               <div className="h-full bg-primary" style={{ width: `${rate}%` }} />
            </div>
            <span className="text-xs font-bold">{rate}%</span>
          </div>
        );
      },
    },
    {
       accessorKey: 'aiInsight',
       header: 'AI Forecast',
       cell: ({ row }) => (
         <div className="max-w-[180px]">
           <p className="text-[10px] leading-tight text-primary font-medium bg-primary/5 p-2 rounded-lg border border-primary/10 italic">
             "{row.getValue('aiInsight') || 'Calculating...'}"
           </p>
         </div>
       ),
    },
    {
      accessorKey: 'behaviorScore',
      header: 'Behavior Score',
      cell: ({ row }) => {
        const score = row.getValue('behaviorScore') as number;
        return (
          <div className="flex flex-col gap-1 w-32">
            <div className="flex items-center justify-between">
               <span className={cn(
                 "text-[11px] font-bold",
                 score > 70 ? "text-emerald-600" : score > 40 ? "text-amber-600" : "text-rose-600"
               )}>{score}/100</span>
               {score > 70 ? <TrendingUp className="w-3 h-3 text-emerald-600" /> : <TrendingDown className="w-3 h-3 text-rose-600" />}
            </div>
            <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
               <div 
                 className={cn(
                   "h-full transition-all duration-500",
                   score > 70 ? "bg-emerald-500" : score > 40 ? "bg-amber-400" : "bg-rose-500"
                 )} 
                 style={{ width: `${score}%` }} 
               />
            </div>
          </div>
        );
      },
    },
    {
       accessorKey: 'riskLevel',
       header: 'Risk Level',
       cell: ({ row }) => <StatusBadge status={row.getValue('riskLevel')} />,
    },
    {
      accessorKey: 'totalOutstanding',
      header: 'Outstanding (₹)',
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('totalOutstanding'));
        const formatted = new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          maximumFractionDigits: 0,
        }).format(amount);
        return <span className={cn("font-bold text-neutral-950", amount > 0 && "text-rose-600")}>{formatted}</span>;
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0 rounded-lg hover:bg-neutral-100" />}>
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl border-neutral-100 shadow-xl p-1 w-48">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-[11px] font-semibold text-muted-foreground uppercase px-2 py-1">Actions</DropdownMenuLabel>
                <DropdownMenuItem className="rounded-lg cursor-pointer px-2 py-2 text-sm font-medium focus:bg-primary/5 focus:text-primary transition-colors flex items-center gap-2">
                  <UserCheck className="w-4 h-4" /> View Customer profile
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-lg cursor-pointer px-2 py-2 text-sm font-medium focus:bg-primary/5 focus:text-primary transition-colors flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Message Customer
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="bg-neutral-50" />
              <DropdownMenuGroup>
                <DropdownMenuItem className="rounded-lg cursor-pointer px-2 py-2 text-sm font-medium focus:bg-neutral-50 transition-colors flex items-center gap-2">
                  Edit Details
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader 
        title="Customers" 
        description="View and manage customer behavior and payment health."
      >
        <div className="flex items-center gap-2">
           <Button variant="outline" size="sm" className="h-10 rounded-xl">
             <Download className="w-4 h-4 mr-2" />
             Export Portfolio
           </Button>
           <Button variant="default" size="sm" className="h-10 rounded-xl">
             <Plus className="w-4 h-4 mr-2" />
             Add Customer
           </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/5 flex items-center justify-center">
               <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
               <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
               <h3 className="text-2xl font-bold">186</h3>
            </div>
         </div>
         <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/5 flex items-center justify-center">
               <UserCheck className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
               <p className="text-sm font-medium text-muted-foreground">Low Risk Customers</p>
               <h3 className="text-2xl font-bold">142</h3>
            </div>
         </div>
         <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-rose-500/5 flex items-center justify-center">
               <Search className="h-6 w-6 text-rose-600" />
            </div>
            <div>
               <p className="text-sm font-medium text-muted-foreground">High Risk Segment</p>
               <h3 className="text-2xl font-bold">8.4%</h3>
            </div>
         </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
           <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
           <p className="text-sm font-medium text-muted-foreground animate-pulse">Syncing customer performance...</p>
        </div>
      ) : (
        <DataTable 
          columns={columns} 
          data={customers} 
          filterKey="name"
        />
      )}
    </DashboardLayout>
  );
}
