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
  Zap,
  Mail,
  ExternalLink,
  BrainCircuit,
  CheckCircle2,
  Clock
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
import { addDays, parseISO, isBefore, startOfDay, differenceInCalendarDays, format } from 'date-fns';

export default function InvoicesPage() {
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = React.useState<Invoice[]>([]);
  const [settings, setSettings] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [editingInvoice, setEditingInvoice] = React.useState<Invoice | null>(null);

  let formattedDate: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined;

  React.useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [invoiceData, settingsRes] = await Promise.all([
        fetchInvoices(),
        fetch('/api/settings').then(res => res.json())
      ]);
      setInvoices(invoiceData);
      setFilteredInvoices(invoiceData);
      setSettings(settingsRes);
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
        const isOverride = updates.startFollowups !== undefined ? updates.startFollowups !== null : invoice.startFollowups !== null;
        const newOffset = updates.startFollowups !== undefined 
          ? (updates.startFollowups ?? settings?.followupStartDelayDays ?? 0)
          : (invoice.startFollowups ?? settings?.followupStartDelayDays ?? 0);
          
        const issueDate = parseISO(invoice.issueDate);
        const startDate = addDays(issueDate, Number(newOffset));
        const formattedStartDate = startDate.toISOString().split('T')[0];

        await triggerN8nWorkflow('UPDATE_INVOICE', {
          id: invoiceId,
          invoice_number: invoice.invoice_number,
          client_email: invoice.customerEmail,
          followup_start_date: formattedStartDate,
          ...updates
        });
      }

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
          className="font-mono  font-bold text-primary hover:underline hover:text-primary transition-colors"
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
          <span className="text-[12px] text-muted-foreground font-semibold leading-none">{row.original.customerEmail}</span>
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
      accessorKey: 'issueDate',
      header: 'Issue Date',
      cell: ({ row }) => (
        <span className="text-muted-foreground font-medium">{new Date(row.getValue('issueDate')).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
      ),
    },
    {
      accessorKey: 'startFollowups',
      header: 'Follow-up',
      cell: ({ row }) => {
        const isOverride = row.original.startFollowups !== null;
        const offset = isOverride ? Number(row.original.startFollowups) : (settings?.followupStartDelayDays ?? 0);
        const issueDateString = row.original.issueDate;

        if (!issueDateString) return <span className="text-muted-foreground text-[12px]">No Date</span>;

        // ✅ Logic: [Issue Date] + [Offset]
        const issueDate = parseISO(issueDateString);
        const startDate = addDays(issueDate, offset);

        const today = startOfDay(new Date());
        const isPastOrToday = isBefore(startDate, today) || startDate.getTime() === today.getTime();
        const formattedFollowupDate = startDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

        return (
          <div className="flex items-center gap-2" title={isOverride ? `Manually overridden to ${offset} days` : `Using global default of ${offset} days`}>
            <div className={cn(
              "p-1.5 rounded-xl transition-all duration-300",
              isPastOrToday ? "bg-emerald-500/10 text-emerald-500" : "bg-indigo-500/10 text-indigo-500 border border-indigo-500/10"
            )}>
              {isOverride ? <Filter className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
            </div>
            <div className="flex flex-col">
              <span className={cn(
                "text-[10px] font-black uppercase leading-none mb-0.5 whitespace-nowrap",
                isOverride ? "text-amber-600" : "text-indigo-500"
              )}>
                {isOverride ? `Override (+${offset}d)` : `Default (+${offset}d)`}
              </span>
              <span className="text-[11px] font-bold text-foreground leading-tight">
                Starts {formattedFollowupDate}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'dueDate',
      header: 'Due Date',
      cell: ({ row }) => (
        <span className="text-muted-foreground font-medium">
          {row.getValue('dueDate') 
            ? new Date(row.getValue('dueDate')).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
            : '-'}
        </span>
      ),
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
                <div className="h-1 bg-muted flex-1 rounded-full overflow-hidden">
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
      accessorKey: 'lastSentAt',
      header: 'Last Automation',
      cell: ({ row }) => {
        const lastSentAt = row.original.lastSentAt;
        const stage = row.original.lastSentStage;
        
        if (!lastSentAt) return <span className="text-[12px] text-muted-foreground font-semibold uppercase italic">Not yet triggered</span>;
        
        return (
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-emerald-600 mb-0.5">
              <CheckCircle2 className="w-3 h-3" />
              <span className="text-[12px] font-black uppercase">Sent to n8n</span>
            </div>
            <span className="text-[11px] font-bold text-foreground">
              {new Date(lastSentAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="text-[9px] text-muted-foreground font-bold uppercase mt-0.5">Stage {stage} reminder</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'daysOverdue',
      header: 'Days Since Issue ',
      cell: ({ row }) => {
        const issueDate = new Date(row.original.issueDate);
        issueDate.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const diffTime = today.getTime() - issueDate.getTime();
        const days = Math.max(0, Math.floor(diffTime / 86400000));

        return (
          <span className={days > 15 ? "text-rose-600 font-bold" : "text-muted-foreground"}>
            {days}d
          </span>
        );
      },
    },
    {
      accessorKey: 'currentStage',
      header: 'Automation Lifecycle',
      cell: ({ row }) => {
        const currentStage = row.original.currentStage || 0;
        const ladder = settings?.escalationLadder || [];
        const isPaid = row.original.status === 'Paid';

        const displaySteps = Math.max(ladder.length, 3);
        const currentStep = ladder[currentStage] || ladder[ladder.length - 1] || null;

        // ✅ DAYS UNTIL NEXT ACTION (Robust Calendar Comparison)
        let daysLeft: number | null = null;
        let formattedCheckDate = "";
        
        if (row.original.nextActionAt) {
          const nextDate = new Date(row.original.nextActionAt);
          const today = new Date();
          
          // Use differenceInCalendarDays which handles the date part correctly across timezones
          daysLeft = differenceInCalendarDays(nextDate, today);
          formattedCheckDate = format(nextDate, 'dd/MM');
        }

        return (
          <div className="flex flex-col gap-2.5 py-1">
            <div className="flex items-center gap-1">
              {Array.from({ length: displaySteps }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition-all duration-700",
                    isPaid
                      ? "bg-emerald-500/40"
                      : i < currentStage
                        ? "bg-primary/60"
                        : i === currentStage
                          ? "bg-amber-500 animate-pulse"
                          : "bg-muted"
                  )}
                />
              ))}
            </div>

            <div className="flex flex-col">
              <span className={cn("text-[12px] font-black uppercase tracking-[0.05em]", isPaid ? "text-emerald-500" : "text-foreground")}>
                {isPaid ? 'Collection Successful' : currentStep?.label || `Stage ${currentStage + 1}`}
              </span>

              {!isPaid && (
                <span className="text-[12px] font-bold text-muted-foreground flex items-center gap-1.5">
                  <BrainCircuit className="w-3.5 h-3.5 text-primary opacity-70" />
                  AI Tone: <span className="text-primary italic">{currentStep?.tone || 'Neutral'}</span>
                </span>
              )}

              {!isPaid && row.original.nextActionAt && (
                <span className={cn(
                  "text-[12px] font-semibold",
                  daysLeft !== null && daysLeft < 0 ? "text-rose-600" : "text-blue-500"
                )}>
                  {daysLeft !== null 
                    ? (daysLeft < 0 
                        ? `Overdue (${Math.abs(daysLeft)}d)` 
                        : daysLeft === 0 
                          ? "Today" 
                          : daysLeft === 1 
                            ? "Tomorrow" 
                            : `in ${daysLeft}d`) 
                    : "Scheduled"} 
                  ({formattedCheckDate})
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      id: 'nextCheck',
      header: 'Actual Check',
      cell: ({ row }) => {
        const nextDate = row.original.nextActionAt;
        if (!nextDate) return <span className="text-[12px] text-muted-foreground italic"> Escalates to the manager</span>;
        if(row.original.status === 'Paid') return <span className="text-[12px] text-muted-foreground italic"> Collection Successful</span>;
        return (
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-blue-600 mb-0.5">
              <Clock className="w-3 h-3" />
              <span className="text-[11px] font-black uppercase">Start of Day</span>
            </div>
            <span className="text-[12px] font-bold text-foreground">
              {format(new Date(nextDate), 'dd MMM')} @ 12:00 AM
            </span>
            <span className="text-[9px] text-muted-foreground font-black uppercase mt-0.5 tracking-tight italic">24/7 Monitoring Active</span>
          </div>
        );
      }
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
                        issue_date: inv.issueDate,
                        status: inv.status,
                        startFollowups: inv.startFollowups,
                        currentStage: inv.currentStage,
                        notes: 'Manual reminder sent from dashboard'
                      });
                    }}
                  >
                    <Send className="w-4 h-4" /> Send Reminder
                  </DropdownMenuItem>
                )}
                {row.original.status !== 'Paid' && (
                  <DropdownMenuItem
                    className="rounded-lg cursor-pointer px-2 py-2 text-sm font-medium focus:bg-primary/5 focus:text-primary transition-colors flex items-center gap-2"
                    onClick={() => {
                      setEditingInvoice(row.original);
                      setIsEditModalOpen(true);
                    }}
                  >
                    <Filter className="w-4 h-4" /> Edit Automation
                  </DropdownMenuItem>
                )}

                {row.original.hasPendingDraft && (
                  <DropdownMenuItem
                    onClick={() => {
                      if (row.original.gmailDraftId) {
                        window.open(`https://mail.google.com/mail/u/0/#drafts/${row.original.gmailDraftId}`, '_blank');
                      } else {
                        window.open('https://mail.google.com/mail/u/0/#drafts', '_blank');
                      }
                    }}
                    className="rounded-lg cursor-pointer px-2 py-2 text-sm font-bold focus:bg-orange-500/10 focus:text-orange-500 transition-colors flex items-center gap-2 text-orange-500">
                    <ExternalLink className="w-4 h-4" /> Review AI Draft
                  </DropdownMenuItem>
                )}

                {row.original.status !== 'Paid' && (
                  <DropdownMenuItem
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to mark invoice ${row.original.invoice_number} as PAID? This will stop all future automation for this invoice.`)) {
                        updateInvoice(row.original.id, { status: 'Paid' });
                      }
                    }}
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
      const issueDate = new Date(); // New invoices are issued today
      const startOffset = payload.start_followups === '' 
        ? (settings?.followupStartDelayDays ?? 0) 
        : Number(payload.start_followups);
      const startDate = addDays(issueDate, startOffset);
      const formattedStartDate = startDate.toISOString().split('T')[0];

      // ✅ AUTOMATIC N8N TRIGGER on creation
      await triggerN8nWorkflow('CREATE_INVOICE', {
        ...payload,
        followup_start_date: formattedStartDate
      });

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
                // await triggerN8nWorkflow('TRIGGER_SHEET_SYNC', {
                //   requested_at: new Date().toISOString()
                // });

                // 2. Fetch updated data from DB
                const data = await fetchInvoices();
                setInvoices(data);
                setLoading(false);
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
                  <DialogTitle className="text-2xl font-bold  text-foreground">Create New Invoice</DialogTitle>
                  <DialogDescription className="text-muted-foreground font-medium">Capture details for your records and set automation.</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleCreateInvoice} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="invoice_number" className="text-xs font-black uppercase  text-muted-foreground">Invoice ID</Label>
                      <Input id="invoice_number" name="invoice_number" placeholder="INV-2024-001" className="rounded-xl h-11 border-border focus:ring-primary shadow-sm" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amount" className="text-xs font-black uppercase  text-muted-foreground">Amount (₹)</Label>
                      <Input id="amount" name="amount" type="number" placeholder="0.00" className="rounded-xl h-11 border-border focus:ring-primary shadow-sm" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customer_name" className="text-xs font-black uppercase  text-muted-foreground">Customer Name</Label>
                    <Input id="customer_name" name="customer_name" placeholder="John Doe Services" className="rounded-xl h-11 border-border focus:ring-primary shadow-sm" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customer_email" className="text-xs font-black uppercase  text-muted-foreground">Customer Email</Label>
                    <Input id="customer_email" name="customer_email" type="email" placeholder="client@example.com" className="rounded-xl h-11 border-border focus:ring-primary shadow-sm" required />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="due_date" className="text-xs font-black uppercase  text-muted-foreground">Issue Date</Label>
                      <Input id="due_date" name="due_date" type="date" className="rounded-xl h-11 border-border focus:ring-primary shadow-sm" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="start_followups" className="text-xs font-black uppercase text-muted-foreground">Follow-up Days</Label>
                      <Input 
                        id="start_followups" 
                        name="start_followups" 
                        type="number" 
                        placeholder={`Standard: ${settings?.followupStartDelayDays ?? 0} days`} 
                        className="rounded-xl h-11 border-border focus:ring-primary shadow-sm" 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-xs font-black uppercase  text-muted-foreground">Notes (Optional)</Label>
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

      {/* Automation Timing Note */}
      <div className="mb-8  border border-indigo-100 rounded-2xl p-6 flex items-start gap-5 shadow-sm">
        <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-600 shrink-0">
          <Zap className="w-6 h-6" />
        </div>
        <div className="space-y-2">
          <h4 className="text-base font-bold ">Automation & Timing Strategy</h4>
          <p className="text-sm text-indigo-700 leading-relaxed font-medium dark:text-indigo-300">
            The platform monitors your collections 24/7. When an invoice reaches its scheduled 'Next Action' date, the system triggers processing at <span className="font-black italic underline decoration-indigo-300 underline-offset-2">12:00 AM (midnight)</span> local time. This ensures all customers receive their reminders first thing in the morning.
          </p>
          <div className="mt-3 py-3 px-4 rounded-xl border border-indigo-100/50 flex items-center gap-3">
            <span className="text-[11px] font-black uppercase text-indigo-500 bg-indigo-50 px-2 py-1 rounded-lg">Example Logic:</span>
            <p className="text-sm text-indigo-600 italic dark:text-indigo-400">
              Invoice issued on <span className="font-bold">April 1st</span> with a <span className="font-bold">15-day delay</span> &rarr; Automated check occurs exactly on <span className="font-bold underline">April 16th at 12:00 AM</span>.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-muted-foreground animate-pulse">Syncing live dashboard...</p>
        </div>
      ) : (
        <>
          <div className="overflow-hidden">
            <DataTable
              columns={columns}
              data={filteredInvoices}
              filterKey="customerName"
            />
          </div>

          {/* Edit Invoice Dialog */}
          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent className="rounded-2xl max-w-lg border-border bg-card shadow-2xl p-0 overflow-hidden">
              <div className="p-8">
                <DialogHeader className="space-y-1 mb-8 text-left">
                  <DialogTitle className="text-2xl font-bold text-foreground">Manual Automation Override</DialogTitle>
                  <DialogDescription className="text-muted-foreground font-medium"> Adjust follow-up timing for Invoice {editingInvoice?.invoice_number}.</DialogDescription>
                </DialogHeader>

                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const val = formData.get('startFollowups');
                  const stage = formData.get('currentStage');
                  const nextDate = formData.get('nextActionAt');

                  const startFollowups = val === '' ? null : parseInt(String(val));
                  const currentStage = stage === '' ? undefined : parseInt(String(stage));
                  const nextActionAt = nextDate === '' ? undefined : new Date(String(nextDate));
                  
                  if (editingInvoice) {
                    await updateInvoice(editingInvoice.id, { 
                      startFollowups, 
                      currentStage,
                      nextActionAt
                    });
                    setIsEditModalOpen(false);
                  }
                }} className="space-y-6">
                  <div className="p-6 rounded-3xl bg-muted/30 border border-border/50 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-xs font-black uppercase text-muted-foreground">Follow-up Start Delay</Label>
                        <p className="text-[11px] text-muted-foreground font-medium">Days after issue date to begin automation.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          name="startFollowups"
                          type="number"
                          defaultValue={editingInvoice?.startFollowups ?? ''}
                          placeholder={String(settings?.followupStartDelayDays ?? 0)}
                          className="w-20 h-10 text-center font-bold rounded-xl border-border bg-background"
                        />
                        <span className="text-xs font-bold text-muted-foreground uppercase">Days</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border/50">
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary shrink-0">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[12px] font-bold text-foreground">Global Default: {settings?.followupStartDelayDays ?? 0} days</p>
                          <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                            Leave blank to follow the standard business protocol. Entering a value here will create a priority override for this specific client.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4">
                      <div className="space-y-0.5">
                        <Label className="text-xs font-black uppercase text-muted-foreground">Force current Stage</Label>
                        <p className="text-[11px] text-muted-foreground font-medium">Jump to a specific step in the ladder.</p>
                      </div>
                      <select
                        name="currentStage"
                        defaultValue={editingInvoice?.currentStage ?? 0}
                        className="h-10 px-3 rounded-xl border border-border bg-background text-xs font-bold"
                      >
                        {settings?.escalationLadder?.map((step: any, i: number) => (
                          <option key={i} value={i}>{step.label} (Stage {i})</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-2 pt-4">
                      <Label className="text-xs font-black uppercase text-muted-foreground">Manual date Override (Next Action)</Label>
                      <Input
                        name="nextActionAt"
                        type="date"
                        defaultValue={editingInvoice?.nextActionAt ? new Date(editingInvoice.nextActionAt).toISOString().split('T')[0] : ''}
                        className="h-10 rounded-xl border-border bg-background text-sm font-medium"
                      />
                      <p className="text-[10px] text-rose-500 font-bold uppercase italic">Warning: Setting this will bypass the auto-calculated schedule.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-amber-500/5 p-4 rounded-2xl border border-amber-500/10">
                    <Zap className="h-4 w-4 text-amber-600 shrink-0" />
                    <p className="text-[11px] font-medium text-amber-800 leading-tight">
                      Changing this will immediately recalculate the next scheduled action date for this invoice.
                    </p>
                  </div>

                  <DialogFooter className="pt-4 flex flex-col-reverse sm:flex-row gap-3">
                    <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)} className="rounded-xl h-12 flex-1 font-bold text-muted-foreground hover:bg-muted">Discard</Button>
                    <Button type="submit" className="rounded-xl h-12 flex-1 font-bold shadow-lg shadow-primary/20">Apply Override</Button>
                  </DialogFooter>
                </form>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </DashboardLayout>
  );
}
