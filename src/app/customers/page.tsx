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
import { cn } from '@/lib/utils';

export default function CustomersPage() {
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await fetchCustomers();
        setCustomers(data);
      } catch (error) {
        console.error("Failed to load customers:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Dynamic Metrics Calculation
  const totalCustomers = customers.length;
  const lowRiskCount = customers.filter(c => c.riskLevel === 'Low').length;
  const highRiskPercent = totalCustomers > 0
    ? ((customers.filter(c => c.riskLevel === 'High').length / totalCustomers) * 100).toFixed(1)
    : '0';

  const columns: ColumnDef<Customer>[] = [
    {
      accessorKey: 'name',
      header: 'Customer',
      cell: ({ row }) => (
        <a href={`/customers/${row.original.id}`} className="flex flex-col group py-1">
          <span className="font-semibold text-foreground leading-tight group-hover:text-primary transition-colors">
            {row.getValue('name')}
          </span>
          <span className="text-[11px] text-muted-foreground font-medium">{row.original.email}</span>
        </a>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Contact',
      cell: ({ row }) => <span className="text-neutral-600 font-medium tabular-nums">{row.getValue('phone')}</span>,
    },
    {
      accessorKey: 'onTimeRate',
      header: 'On-Time Rate',
      cell: ({ row }) => {
        const rate = row.getValue('onTimeRate') as number;
        return (
          <div className="flex items-center gap-3 min-w-30">
            <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all duration-1000 ease-out",
                  rate > 80 ? "bg-emerald-500" : rate > 50 ? "bg-amber-400" : "bg-rose-500"
                )}
                style={{ width: `${rate}%` }}
              />
            </div>
            <span className="text-xs font-bold w-9">{rate}%</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'aiInsight',
      header: 'AI Forecast',
      cell: ({ row }) => {
        const insight = row.getValue('aiInsight') as string;
        return (
          <div className="max-w-45">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-50/50 border border-indigo-100/50">
              <span className="text-[11px] leading-tight text-indigo-700 font-medium italic">
                {insight}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'behaviorScore',
      header: 'Behavior',
      cell: ({ row }) => {
        const score = row.getValue('behaviorScore') as number;
        return (
          <div className="flex flex-col gap-1.5 w-28">
            <div className="flex items-center justify-between">
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-wider",
                score > 70 ? "text-emerald-600" : score > 40 ? "text-amber-600" : "text-rose-600"
              )}>Score: {score}</span>
              {score > 70 ? (
                <TrendingUp className="w-3 h-3 text-emerald-500" />
              ) : (
                <TrendingDown className="w-3 h-3 text-rose-500" />
              )}
            </div>
            <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all duration-700",
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
      header: 'Risk',
      cell: ({ row }) => <StatusBadge status={row.getValue('riskLevel')} />,
    },
    {
      accessorKey: 'totalOutstanding',
      header: 'Outstanding',
      cell: ({ row }) => {
        const amount = Number(row.getValue('totalOutstanding'));
        const formatted = new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          maximumFractionDigits: 0,
        }).format(amount);
        return (
          <div className="text-right">
            <span className={cn(
              "font-bold text-sm tracking-tight",
              amount > 0 ? "text-rose-600" : "text-emerald-600"
            )}>
              {formatted}
            </span>
          </div>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0 rounded-full hover:bg-muted focus:ring-0" />}>
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl border-border shadow-2xl p-1.5 w-56 animate-in fade-in zoom-in duration-200 bg-popover text-popover-foreground">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-[10px] font-bold text-muted-foreground uppercase px-2.5 py-2 tracking-widest">Customer Management</DropdownMenuLabel>
                  <DropdownMenuItem className="rounded-lg cursor-pointer px-2.5 py-2 text-sm font-medium focus:bg-primary/5 focus:text-primary transition-colors flex items-center gap-3">
                    <UserCheck className="w-4 h-4" /> View Full Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="rounded-lg cursor-pointer px-2.5 py-2 text-sm font-medium focus:bg-primary/5 focus:text-primary transition-colors flex items-center gap-3">
                    <Mail className="w-4 h-4" /> Send Follow-up
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="my-1 bg-border" />
                <DropdownMenuGroup>
                  <DropdownMenuItem className="rounded-lg cursor-pointer px-2.5 py-2 text-sm font-medium hover:bg-muted transition-colors flex items-center gap-3 text-muted-foreground">
                    Edit Account Details
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-400 mx-auto space-y-8">
        <PageHeader
          title="Customer Intelligence"
          description="Advanced portfolio analysis and payment behavior tracking powered by AI."
        >
          <div className="flex items-center gap-3">
            <Button variant="outline" className="h-11 rounded-xl px-5 border-border hover:bg-muted transition-all font-semibold text-sm">
              <Download className="w-4 h-4 mr-2 text-muted-foreground" />
              Export Data
            </Button>
            <Button variant="default" className="h-11 rounded-xl px-5 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:scale-95 transition-all font-semibold text-sm">
              <Plus className="w-4 h-4 mr-2" />
              New Customer
            </Button>
          </div>
        </PageHeader>

        {/* Dynamic Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="group relative overflow-hidden bg-card p-7 rounded-[24px] border border-border shadow-sm hover:shadow-md transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
            <div className="relative flex items-center gap-5">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center ring-4 ring-primary/5">
                <Users className="h-7 w-7 text-primary" />
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Total Portfolio</p>
                <div className="flex items-end gap-2">
                  <h3 className="text-3xl font-black tracking-tight text-foreground leading-none">
                    {loading ? "..." : totalCustomers}
                  </h3>
                  <span className="text-xs font-semibold text-muted-foreground pb-0.5">Accounts</span>
                </div>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-card p-7 rounded-[24px] border border-border shadow-sm hover:shadow-md transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
            <div className="relative flex items-center gap-5">
              <div className="h-14 w-14 rounded-2xl bg-emerald-100 flex items-center justify-center ring-4 ring-emerald-50">
                <UserCheck className="h-7 w-7 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Healthy Customers</p>
                <div className="flex items-end gap-2">
                  <h3 className="text-3xl font-black tracking-tight text-foreground leading-none">
                    {loading ? "..." : lowRiskCount}
                  </h3>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full pb-0.5">
                    Low Risk
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-card p-7 rounded-[24px] border border-border shadow-sm hover:shadow-md transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
            <div className="relative flex items-center gap-5">
              <div className="h-14 w-14 rounded-2xl bg-rose-100 flex items-center justify-center ring-4 ring-rose-50">
                <Search className="h-7 w-7 text-rose-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">High Risk Segment</p>
                <div className="flex items-end gap-2">
                  <h3 className="text-3xl font-black tracking-tight text-foreground leading-none">
                    {loading ? "..." : `${highRiskPercent}%`}
                  </h3>
                  <span className="text-xs font-semibold text-rose-600 pb-0.5">of total</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Table Section */}
        <div className="bg-card/50 backdrop-blur-sm rounded-[32px] border border-border/80 p-1 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-32 space-y-6">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-primary/10 rounded-full" />
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin absolute top-0 left-0" />
              </div>
              <div className="flex flex-col items-center gap-1">
                <p className="text-base font-bold text-foreground">Synchronizing Data</p>
                <p className="text-sm font-medium text-muted-foreground animate-pulse leading-none">Fetching latest performance insights...</p>
              </div>
            </div>
          ) : (
            <div className="bg-card rounded-[31px]">
              <DataTable
                columns={columns}
                data={customers}
                filterKey="name"
              />
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
