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
  Users,
  Zap
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
import { addDays, parseISO, isBefore, startOfDay } from 'date-fns';

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

  const updateInvoice = async (invoiceId: string, updates: any) => {
    try {
      const res = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.details || 'Failed to update invoice');
      }

      // ✅ AUTOMATIC N8N TRIGGER on status/follow-up change
      const invoice = invoices.find(i => i.id === invoiceId);
      if (invoice) {
        // Calculate new followup start date if offset changed
        const newOffset = updates.startFollowups ?? invoice.startFollowups;
        const dueDate = parseISO(invoice.dueDate);
        const startDate = addDays(dueDate, Number(newOffset));
        const formattedStartDate = startDate.toISOString().split('T')[0];

        await triggerN8nWorkflow('UPDATE_INVOICE', {
          id: invoiceId,
          invoice_number: invoice.invoice_number,
          client_email: invoice.customerEmail,
          followup_start_date: formattedStartDate,
          ...updates
        });
      }

      toast.success(`Updated and synced with n8n`);

      // Update local state to reflect change immediately
      setInvoices(prev => prev.map(inv =>
        inv.id === invoiceId ? { ...inv, ...updates } : inv
      ));
    } catch (err: any) {
      toast.error(`Update Failed: ${err.message}`);
    }
  };

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
          href={`/invoices/${row.original.id}`}
          className="font-mono text-[10px] font-bold text-primary hover:underline hover:text-primary transition-colors"
        >
          {row.original.invoice_number}
        </a>
      ),
    },
    {
      accessorKey: 'customerName',
      header: 'Customer',
      cell: ({ row }) => (
        <a href={`/invoices/${row.original.id}`} className="flex flex-col group cursor-pointer">
          <span className="font-bold text-foreground leading-none mb-1 group-hover:text-primary transition-colors underline decoration-transparent group-hover:decoration-primary/30 underline-offset-4">
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
        return <span className="font-bold text-foreground">{formatted}</span>;
      },
    },
    {
      accessorKey: 'dueDate',
      header: 'Due Date',
      cell: ({ row }) => (
        <span className="text-muted-foreground font-medium">{new Date(row.getValue('dueDate')).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
      ),
    },
    // {
    //   accessorKey: 'prediction',
    //   header: 'AI Predict',
    //   cell: ({ row }) => {
    //     const pred = row.getValue('prediction') as string;
    //     const colors = {
    //       Likely: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    //       'At Risk': 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    //       Delayed: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    //     };
    //     if (!pred) return <span className="text-muted-foreground text-xs font-semibold px-2">N/A</span>;
    //     return (
    //       <span className={cn("text-[10px] font-bold px-2 py-1 rounded-lg border", colors[pred as keyof typeof colors])}>
    //         {pred.toUpperCase()}
    //       </span>
    //     );
    //   },
    // },
    {
      accessorKey: 'startFollowups',
      header: 'Follow-up',
      cell: ({ row }) => {
        const offset = Number(row.original.startFollowups) || 0;
        const dueDateString = row.original.dueDate;

        if (!dueDateString) return <span className="text-muted-foreground text-[10px]">No Date</span>;

        // ✅ Robust calculation: STRICTLY [Due Date] + [Offset]
        const dueDate = parseISO(dueDateString);
        const startDate = addDays(dueDate, offset);

        const today = startOfDay(new Date());
        const isPastOrToday = isBefore(startDate, today) || startDate.getTime() === today.getTime();
        const formattedDate = startDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

        return (
          <div className="flex items-center gap-2" title={`Follow-up configured for ${offset} days after due date`}>
            <div className={cn(
              "p-1.5 rounded-xl transition-all duration-300",
              isPastOrToday ? "bg-emerald-500/10 text-emerald-500" : "bg-indigo-500/10 text-indigo-500 border border-indigo-500/10"
            )}>
              <Zap className={cn("w-3.5 h-3.5", isPastOrToday && "animate-pulse")} />
            </div>
            <div className="flex flex-col">
              <span className={cn(
                "text-[10px] font-black uppercase tracking-tight leading-none mb-0.5",
                isPastOrToday ? "text-emerald-500" : "text-indigo-500"
              )}>
                {isPastOrToday ? 'Active' : `Scheduled (+${offset}d)`}
              </span>
              <span className="text-[11px] font-bold text-foreground leading-tight">
                Starts {formattedDate}
              </span>
            </div>
          </div>
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
                <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
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
        const dueDate = new Date(row.original.dueDate + 'T00:00:00');

        const today = new Date();
        today.setHours(0, 0, 0, 0); // normalize

        const diffTime = today.getTime() - dueDate.getTime();
        const days = Math.floor(diffTime / 86400000);

        return (
          <span
            className={
              days > 0
                ? "text-rose-600 font-bold"
                : "text-muted-foreground"
            }
          >
            {days > 0 ? `${days}d` : '-'}
          </span>
        );
      },
    },
    {
      accessorKey: 'reminder_stage',
      header: 'Follow-up Stage',
      cell: ({ row }) => {
        const stage = row.original.reminder_stage || 0;
        const tone = row.original.tone || 'Friendly';
        return (
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Stage {stage}</span>
            <div className="flex items-center gap-1.5">
              <span className={cn(
                "w-1.5 h-1.5 rounded-full",
                stage === 0 ? "bg-emerald-500" : stage === 1 ? "bg-amber-500" : "bg-rose-500"
              )} />
              <span className="text-xs font-semibold text-foreground">{tone}</span>
            </div>
          </div>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0 rounded-lg hover:bg-accent" />}>
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl border-border shadow-xl p-1 w-48 bg-popover text-popover-foreground">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-[11px] font-semibold text-muted-foreground uppercase px-2 py-1">Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => window.location.href = `/invoices/${row.original.id}`}
                  className="rounded-lg cursor-pointer px-2 py-2 text-sm font-medium focus:bg-primary/5 focus:text-primary transition-colors flex items-center gap-2">
                  <Eye className="w-4 h-4" /> View Details
                </DropdownMenuItem>
                {row.original.status !== 'Paid' && (
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
                )}
                {row.original.status !== 'Paid' && (
                  <DropdownMenuItem
                    className="rounded-lg cursor-pointer px-2 py-2 text-sm font-medium focus:bg-primary/5 focus:text-primary transition-colors flex items-center gap-2"
                    onClick={() => {
                      const newDays = prompt("Adjust Follow-up Offset (Days from Due Date):", String(row.original.startFollowups));
                      if (newDays !== null) {
                        updateInvoice(row.original.id, { startFollowups: parseInt(newDays) || 0 });
                      }
                    }}
                  >
                    <Filter className="w-4 h-4" /> Adjust Automation
                  </DropdownMenuItem>
                )}
                {row.original.status !== 'Paid' && (
                  <DropdownMenuItem
                    onClick={() => updateInvoice(row.original.id, { status: 'Paid' })}
                    className="rounded-lg cursor-pointer px-2 py-2 text-sm font-medium focus:bg-emerald-500/10 focus:text-emerald-500 transition-colors flex items-center gap-2 text-emerald-500">
                    <Zap className="w-4 h-4" /> Mark as Paid
                  </DropdownMenuItem>
                )}
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="bg-border" />
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

  const handleCreateInvoice = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const payload = {
      invoice_number: formData.get('invoice_number'),
      client_name: formData.get('customer_name'),
      client_email: formData.get('customer_email'),
      amount: formData.get('amount'),
      due_date: formData.get('due_date'),
      start_followups: formData.get('start_followups'),
      notes: formData.get('notes'),
    };

    try {
      setLoading(true);
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to create invoice');

      // Calculate absolute followup start date for n8n
      const dueDate = parseISO(payload.due_date as string);
      const startOffset = Number(payload.start_followups) || 0;
      const startDate = addDays(dueDate, startOffset);
      const formattedStartDate = startDate.toISOString().split('T')[0];

      // ✅ AUTOMATIC N8N TRIGGER on creation
      await triggerN8nWorkflow('CREATE_INVOICE', {
        ...payload,
        followup_start_date: formattedStartDate
      });

      toast.success('Invoice created and synced with n8n!');
      setIsCreateModalOpen(false);

      // Refresh the list
      const data = await fetchInvoices();
      setInvoices(data);
    } catch (err: any) {
      toast.error(`Creation failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
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

                // 1. Trigger n8n to sync from Google Sheets
                await triggerN8nWorkflow('TRIGGER_SHEET_SYNC', {
                  requested_at: new Date().toISOString()
                });

                // 2. Fetch updated data from DB
                const data = await fetchInvoices();
                setInvoices(data);
                setLoading(false);
                toast.success('Sync triggered and dashboard updated!');
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
            <DialogTrigger render={<Button variant="default" size="sm" className="h-10 rounded-xl" />}>
              <Plus className="w-4 h-4 mr-2" />
              New Invoice
            </DialogTrigger>
            <DialogContent className="rounded-2xl max-w-lg border-border bg-card shadow-2xl p-0 overflow-hidden">
              <div className="p-8 bg-linear-to-br from-primary/5 via-transparent to-transparent">
                <DialogHeader className="space-y-1 mb-8 text-left">
                  <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">Create New Invoice</DialogTitle>
                  <DialogDescription className="text-muted-foreground font-medium">Capture details for your records and set automation.</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleCreateInvoice} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="invoice_number" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Invoice ID</Label>
                      <Input id="invoice_number" name="invoice_number" placeholder="INV-2024-001" className="rounded-xl h-11 border-border focus:ring-primary shadow-sm" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amount" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Amount (₹)</Label>
                      <Input id="amount" name="amount" type="number" placeholder="0.00" className="rounded-xl h-11 border-border focus:ring-primary shadow-sm" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customer_name" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Customer Name</Label>
                    <Input id="customer_name" name="customer_name" placeholder="John Doe Services" className="rounded-xl h-11 border-border focus:ring-primary shadow-sm" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customer_email" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Customer Email</Label>
                    <Input id="customer_email" name="customer_email" type="email" placeholder="client@example.com" className="rounded-xl h-11 border-border focus:ring-primary shadow-sm" required />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="due_date" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Due Date</Label>
                      <Input id="due_date" name="due_date" type="date" className="rounded-xl h-11 border-border focus:ring-primary shadow-sm" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="start_followups" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Follow-up Days</Label>
                      <Input id="start_followups" name="start_followups" type="number" defaultValue="7" placeholder="e.g. 7" className="rounded-xl h-11 border-border focus:ring-primary shadow-sm" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Notes (Optional)</Label>
                    <Input id="notes" name="notes" placeholder="e.g. Monthly maintenance retainer" className="rounded-xl h-11 border-border focus:ring-primary shadow-sm" />
                  </div>

                  <DialogFooter className="pt-4 flex flex-col-reverse sm:flex-row gap-3">
                    <Button type="button" variant="ghost" onClick={() => setIsCreateModalOpen(false)} className="rounded-xl h-12 flex-1 font-bold text-muted-foreground hover:bg-muted">Cancel</Button>
                    <Button type="submit" className="rounded-xl h-12 flex-1 font-bold shadow-lg shadow-primary/20">Generate Invoice</Button>
                  </DialogFooter>
                </form>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </PageHeader>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 p-1 bg-muted rounded-2xl w-fit border border-border">
        {['All', 'Pending', 'Overdue', 'Paid', 'In Plan'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-6 py-2 rounded-xl text-xs font-bold transition-all",
              activeTab === tab
                ? "bg-background text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-muted-foreground animate-pulse">Syncing live dashboard...</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <DataTable
            columns={columns}
            data={filteredInvoices}
            filterKey="customerName"
          />
        </div>
      )}
    </DashboardLayout>
  );
}
