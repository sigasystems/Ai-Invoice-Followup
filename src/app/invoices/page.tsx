'use client';

import * as React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { StatusBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Plus,
  Download,
  MoreHorizontal,
  Eye,
  Send,
  Trash,
  Filter,
  Users
} from 'lucide-react';
import { fetchInvoices } from '@/lib/api';
import { triggerN8nWorkflow } from '@/lib/n8n';
import { ColumnDef } from '@tanstack/react-table';
import { Invoice } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function InvoicesPage() {
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = React.useState<Invoice[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);

  React.useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await fetchInvoices();
      setInvoices(data);
      setFilteredInvoices(data);
      setLoading(false);
    }
    loadData();
  }, []);

  React.useEffect(() => {
    if (activeTab === 'All') {
      setFilteredInvoices(invoices);
    } else {
      setFilteredInvoices(invoices.filter(i => i.status === activeTab));
    }
  }, [activeTab, invoices]);

  const columns: ColumnDef<Invoice>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => (
        <a
          href={`/invoices/${row.getValue('id')}`}
          className="font-mono text-xs font-bold text-primary hover:underline hover:text-indigo-600 transition-colors"
        >
          {row.getValue('id')}
        </a>
      ),
    },
    {
      accessorKey: 'customerName',
      header: 'Customer',
      cell: ({ row }) => (
        <a href={`/invoices/${row.original.id}`} className="flex flex-col group cursor-pointer">
          <span className="font-bold text-neutral-900 leading-none mb-1 group-hover:text-primary transition-colors underline decoration-transparent group-hover:decoration-primary/30 underline-offset-4">
            {row.getValue('customerName')}
          </span>
          <span className="text-[10px] text-muted-foreground font-semibold leading-none">{row.original.customerEmail}</span>
        </a>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Amount (₹)',
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('amount'));
        const formatted = new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          maximumFractionDigits: 0,
        }).format(amount);
        return <span className="font-bold text-neutral-950">{formatted}</span>;
      },
    },
    {
      accessorKey: 'dueDate',
      header: 'Due Date',
      cell: ({ row }) => (
        <span className="text-muted-foreground font-medium">{new Date(row.getValue('dueDate')).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
      ),
    },
    {
      accessorKey: 'prediction',
      header: 'AI Predict',
      cell: ({ row }) => {
        const pred = row.getValue('prediction') as string;
        const colors = {
          Likely: 'text-emerald-600 bg-emerald-50 border-emerald-100',
          'At Risk': 'text-amber-600 bg-amber-50 border-amber-100',
          Delayed: 'text-rose-600 bg-rose-50 border-rose-100',
        };
        if (!pred) return <span className="text-muted-foreground text-xs font-semibold px-2">N/A</span>;
        return (
          <span className={cn("text-[10px] font-bold px-2 py-1 rounded-lg border", colors[pred as keyof typeof colors])}>
            {pred.toUpperCase()}
          </span>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        const plan = row.original.paymentPlan;
        return (
          <div className="flex flex-col gap-1.5 min-w-30">
            <StatusBadge status={status} />
            {plan && (
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1 bg-neutral-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${plan.progress}%` }} />
                </div>
                <span className="text-[9px] font-bold text-muted-foreground">{plan.progress}%</span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'daysOverdue',
      header: 'Days Overdue',
      cell: ({ row }) => {
        const days = row.getValue('daysOverdue') as number;
        return <span className={days > 0 ? "text-rose-600 font-bold" : "text-muted-foreground"}>{days > 0 ? `${days}d` : '-'}</span>;
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="ghost" className="h-8 w-8 p-0 rounded-lg hover:bg-neutral-100"><span className="sr-only">Open menu</span><MoreHorizontal className="h-4 w-4" /></Button>}
            />
            <DropdownMenuContent align="end" className="rounded-xl border-neutral-100 shadow-xl p-1 w-48">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-[11px] font-semibold text-muted-foreground uppercase px-2 py-1">Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  className="rounded-lg cursor-pointer px-2 py-2 text-sm font-medium focus:bg-primary/5 focus:text-primary transition-colors flex items-center gap-2">
                  <Eye className="w-4 h-4" /> View Details
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="rounded-lg cursor-pointer px-2 py-2 text-sm font-medium focus:bg-primary/5 focus:text-primary transition-colors flex items-center gap-2"
                  onClick={() => {
                    const inv = row.original;
                    triggerN8nWorkflow('trigger-reminder', {
                      invoice_id: inv.id,
                      client_name: inv.customerName,
                      client_email: inv.customerEmail,
                      amount: inv.amount,
                      due_date: inv.dueDate,
                      status: inv.status,
                      notes: 'Manual reminder sent from dashboard'
                    });
                    toast.success(`Success! Reminder for ${inv.customerName} pushed to n8n.`);
                  }}
                >
                  <Send className="w-4 h-4" /> Send Reminder
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="bg-neutral-50" />
              <DropdownMenuGroup>
                <DropdownMenuItem className="rounded-lg cursor-pointer px-2 py-2 text-sm font-medium focus:bg-rose-50 focus:text-rose-600 transition-colors flex items-center gap-2 text-rose-500">
                  <Trash className="w-4 h-4" /> Delete Invoice
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Invoice created successfully!');
    setIsCreateModalOpen(false);
  };

  return (
    <DashboardLayout >
      <PageHeader
        title="Invoices"
        description="Manage your billings and track payment status."
      >
        <div className="flex items-center gap-2 ">
          <Button
            variant="outline"
            size="sm"
            className="h-10 rounded-xl"
            onClick={() => {
              async function refresh() {
                setLoading(true);
                const data = await fetchInvoices();
                setInvoices(data);
                setLoading(false);
                toast.success('Synced with Google Sheets!');
              }
              refresh();
            }}
          >
            <Users className="w-4 h-4 mr-2" />
            Refresh Sync
          </Button>
          <Button variant="outline" size="sm" className="h-10 rounded-xl hidden sm:flex">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger >
              <Button variant="default" size="sm" className="h-10 rounded-xl">
                <Plus className="w-4 h-4 mr-2" />
                New Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl max-w-md border-none shadow-2xl p-6">
              <DialogHeader className="space-y-1 mb-6">
                <DialogTitle className="text-xl font-semibold">Create New Invoice</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">Fill in the details to generate a new invoice.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateInvoice} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="customer" className="text-sm font-semibold">Customer Name</Label>
                  <Input id="customer" placeholder="Enter customer name" className="rounded-xl h-12 bg-neutral-50 focus:bg-white" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount" className="text-sm font-semibold">Amount (₹)</Label>
                    <Input id="amount" type="number" placeholder="0.00" className="rounded-xl h-12 bg-neutral-50 focus:bg-white" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="due" className="text-sm font-semibold">Due Date</Label>
                    <Input id="due" type="date" className="rounded-xl h-12 bg-neutral-50 focus:bg-white" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm font-semibold">Notes (Optional)</Label>
                  <Input id="notes" placeholder="Invoice details..." className="rounded-xl h-12 bg-neutral-50 focus:bg-white" />
                </div>
                <DialogFooter className="pt-2">
                  <Button type="button" variant="ghost" onClick={() => setIsCreateModalOpen(false)} className="rounded-xl h-12 flex-1">Cancel</Button>
                  <Button type="submit" className="rounded-xl h-12 flex-1">Generate Invoice</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </PageHeader>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 p-1 bg-neutral-200/20 rounded-2xl w-fit border border-neutral-100">
        {['All', 'Pending', 'Overdue', 'Paid', 'In Plan'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-6 py-2 rounded-xl text-xs font-bold transition-all",
              activeTab === tab
                ? "bg-white text-primary shadow-sm ring-1 ring-neutral-200/50"
                : "text-muted-foreground hover:text-neutral-900"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-muted-foreground animate-pulse">Fetching live sheet data...</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredInvoices}
          filterKey="customerName"
        />
      )}
    </DashboardLayout>
  );
}
