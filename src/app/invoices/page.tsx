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
  MoreHorizontal,
  Eye,
  Send,
  Trash,
  Filter,
  Users,
  Zap,
  ExternalLink,
  ArrowUpDown,
  Pencil,
  TrendingUp,
  Clock,
  CheckCircle2,
  BrainCircuit
} from 'lucide-react';
import { useRouter } from 'next/navigation';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { addDays, parseISO, isBefore, startOfDay, differenceInCalendarDays, format, isSameDay, formatDistanceToNow } from 'date-fns';

const EditableDateCell = ({
  value,
  onSave,
  label,
  icon: Icon,
  colorClass,
  subText,
  emptyText = "Not set"
}: {
  value: string | null | undefined,
  onSave: (date: string | null) => Promise<void>,
  label: string,
  icon: any,
  colorClass: string,
  subText?: string,
  emptyText?: string
}) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [tempDate, setTempDate] = React.useState(value ? new Date(value).toISOString().slice(0, 16) : '');

  // Update tempDate when value changes externally
  React.useEffect(() => {
    if (value) {
      setTempDate(new Date(value).toISOString().slice(0, 16));
    } else {
      setTempDate('');
    }
  }, [value]);

  const handleSave = async () => {
    await onSave(tempDate ? new Date(tempDate).toISOString() : null);
    setIsEditing(false);
  };

  if (!value) return (
    <div className="flex items-center justify-between group min-w-35">
      <span className="text-[12px] text-muted-foreground font-bold italic">{emptyText}</span>
      <Popover open={isEditing} onOpenChange={setIsEditing}>
        <PopoverTrigger render={<Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" />}>
          <Plus className="h-3 w-3" />
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3 rounded-lg shadow-2xl border-border bg-card z-50">
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-muted-foreground">Set {label}</h4>
            <Input
              type="datetime-local"
              value={tempDate}
              onChange={(e) => setTempDate(e.target.value)}
              className="h-9 text-xs rounded-lg"
            />
            <div className="flex gap-2">
              <Button size="sm" className="h-8 flex-1 rounded-lg" onClick={handleSave}>Save</Button>
              <Button size="sm" variant="outline" className="h-8 flex-1 rounded-lg" onClick={() => setIsEditing(false)}>Cancel</Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );

  return (
    <div className="group relative flex flex-col min-w-35">
      <div className={cn("flex items-center gap-1.5 mb-0.5", colorClass)}>
        <Icon className="w-3 h-3" />
        <span className="text-[10px] font-bold">{label}</span>
        <span className="text-[10px] font-bold opacity-70 ml-auto">
          {formatDistanceToNow(new Date(value), { addSuffix: true })}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-foreground">
          {new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
        </span>
        <Popover open={isEditing} onOpenChange={setIsEditing}>
          <PopoverTrigger render={<Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" />}>
            <Pencil className="h-3 w-3" />
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3 rounded-lg shadow-2xl border-border bg-card z-50">
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-muted-foreground">Edit {label}</h4>
              <Input
                type="datetime-local"
                value={tempDate}
                onChange={(e) => setTempDate(e.target.value)}
                className="h-9 text-xs rounded-lg"
              />
              <div className="flex gap-2">
                <Button size="sm" className="h-8 flex-1 rounded-lg" onClick={handleSave}>Save</Button>
                <Button size="sm" variant="outline" className="h-8 flex-1 rounded-lg" onClick={() => setIsEditing(false)}>Cancel</Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      {subText && <span className="text-[9px] text-muted-foreground font-bold mt-0.5">{subText}</span>}
    </div>
  );
};

export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = React.useState<Invoice[]>([]);
  const [settings, setSettings] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [editingInvoice, setEditingInvoice] = React.useState<Invoice | null>(null);

  let formattedDate: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined;

  const loadData = React.useCallback(async () => {
    setLoading(true);
    const [invoiceData, settingsRes] = await Promise.all([
      fetchInvoices(),
      fetch('/api/settings').then(res => res.json())
    ]);
    setInvoices(invoiceData);
    setFilteredInvoices(invoiceData);
    setSettings(settingsRes);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

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
      }

      // Update local state to reflect change immediately
      setInvoices(prev => prev.map(inv =>
        inv.id === invoiceId ? { ...inv, ...updates } : inv
      ));
    } catch (err: any) {
      toast.error(`Update Failed: ${err.message}`);
    }
  };

  const handleDeleteInvoice = async (invoiceId: string, invoiceNumber: string) => {
    if (!window.confirm(`Are you sure you want to PERMANENTLY DELETE invoice ${invoiceNumber}? This action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.details || 'Failed to delete invoice');
      }

      toast.success(`Invoice ${invoiceNumber} deleted successfully`);
      loadData(); // Refresh list
    } catch (err: any) {
      toast.error(`Delete Failed: ${err.message}`);
    } finally {
      setLoading(false);
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
      accessorKey: 'invoice_number',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 hover:bg-transparent font-bold text-xs"
        >
          ID
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <a
          href={`/invoices/${row.original.id}`}
          className="font-mono font-bold text-primary hover:underline transition-colors"
        >
          {row.original.invoice_number}
        </a>
      ),
    },
    {
      accessorKey: 'customerName',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 hover:bg-transparent font-bold text-xs"
        >
          Customer
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      ),
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
      accessorKey: 'customerPhone',
      header: 'Mobile Number',
      cell: ({ row }) => (
        <span className="text-[12px] font-bold text-muted-foreground flex items-center gap-1.5">
          {row.original.customerPhone || <span className="opacity-30 italic font-medium">No Phone</span>}
        </span>
      ),
    },
    {
      accessorKey: 'amount',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 hover:bg-transparent font-bold text-xs"
        >
          Amount (₹)
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      ),
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
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 hover:bg-transparent font-bold text-xs"
        >
          Issue Date
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      ),
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
              "p-1.5 rounded-lg transition-all duration-300",
              isPastOrToday ? "bg-emerald-500/10 text-emerald-500" : "bg-indigo-500/10 text-indigo-500 border border-indigo-500/10"
            )}>
              {isOverride ? <Filter className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
            </div>
            <div className="flex flex-col">
              <span className={cn(
                "text-[10px] font-bold leading-none mb-0.5 whitespace-nowrap",
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
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 hover:bg-transparent font-bold text-xs"
        >
          Due Date
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      ),
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
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 hover:bg-transparent font-bold text-xs"
        >
          Status
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      ),
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
      cell: ({ row }) => (
        <EditableDateCell
          value={row.original.lastSentAt}
          label="Sent to n8n"
          icon={CheckCircle2}
          colorClass="text-emerald-600"
          subText={row.original.lastSentStage !== null ? `Stage ${row.original.lastSentStage} reminder` : undefined}
          emptyText="Not yet triggered"
          onSave={async (date) => {
            await updateInvoice(row.original.id, { lastSentAt: date });
            toast.success("Last sent date updated");
          }}
        />
      ),
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
        const isEscalated = !row.original.nextActionAt && !isPaid;

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

        // ✅ ESCALATION STATE
        if (isEscalated) {
          return (
            <div className="flex flex-col gap-2.5 py-1">
              <div className="flex items-center gap-1">
                {Array.from({ length: displaySteps }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-1.5 flex-1 rounded-full transition-all duration-700",
                      i <= currentStage ? "bg-red-500/50" : "bg-muted"
                    )}
                  />
                ))}
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-red-500/10 text-red-600">
                    <BrainCircuit className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[12px] font-bold tracking-[0.05em] text-red-600">Escalated to Manager</span>
                </div>
                <span className="text-[11px] font-bold text-red-500 ml-6">All automation stages completed</span>
              </div>
            </div>
          );
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
              <span className={cn("text-[12px] font-bold tracking-[0.05em]", isPaid ? "text-emerald-500" : "text-foreground")}>
                {isPaid ? 'Collection Successful' : currentStep?.label || `Stage ${currentStage}`}
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
        const isPaid = row.original.status === 'Paid';

        if (isPaid) {
          return (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-200/30">
                <div className="p-1 rounded-lg bg-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-emerald-600">Collection done</span>
                  <span className="text-[10px] font-bold text-emerald-500 mt-0.5">Payment received</span>
                </div>
              </div>
            </div>
          );
        }

        return (
          <EditableDateCell
            value={nextDate}
            label="Scheduled At"
            icon={Clock}
            colorClass="text-blue-600"
            subText="AI 24/7 Monitoring Active"
            emptyText="Escalated"
            onSave={async (date) => {
              await updateInvoice(row.original.id, { nextActionAt: date });
              toast.success("Next action date updated");
            }}
          />
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
                <DropdownMenuLabel className="text-[11px] font-bold text-muted-foreground/60 tracking-wider px-2 py-1">Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => router.push(`/invoices/${row.original.id}`)}
                  className="rounded-lg cursor-pointer px-2 py-2 text-sm font-medium focus:bg-primary/5 focus:text-primary transition-colors flex items-center gap-2">
                  <Eye className="w-4 h-4" /> View Details
                </DropdownMenuItem>
                {row.original.status !== 'Paid' && (() => {
                  const nextDate = row.original.nextActionAt;
                  const lastSentAt = row.original.lastSentAt;
                  const currentStage = row.original.currentStage;
                  const lastSentStage = row.original.lastSentStage;
                  const isEscalated = !nextDate; // ✅ No nextActionAt = escalated to manager

                  const isFutureDay = nextDate ? differenceInCalendarDays(new Date(nextDate), new Date()) > 0 : false;
                  const sameStageAlreadySentToday = lastSentAt && lastSentStage !== null &&
                    isSameDay(new Date(lastSentAt), new Date()) &&
                    lastSentStage === currentStage;

                  const isActionDay = !isEscalated && !isFutureDay && !sameStageAlreadySentToday; // ✅ Disable if escalated

                  return (
                    <DropdownMenuItem
                      disabled={!isActionDay}
                      title={isEscalated ? "Invoice escalated to manager - manual intervention required" : ""}
                      className={cn(
                        "rounded-lg cursor-pointer px-2 py-2 text-sm font-medium transition-colors flex items-center justify-between gap-2",
                        !isActionDay ? "opacity-50 cursor-not-allowed" : "focus:bg-primary/5 focus:text-primary"
                      )}
                      onClick={async () => {
                        if (!isActionDay) return;
                        const inv = row.original;
                        const result = await triggerN8nWorkflow('trigger-reminder', {
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

                        if (result) {
                          loadData(); // Refresh UI to show updated timestamps
                        }
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <Send className="w-4 h-4" /> Send Reminder
                      </div>
                      {!isActionDay && (
                        <div className="flex items-center gap-1">
                          {isEscalated ? (
                            <BrainCircuit className="w-3 h-3 text-red-500" />
                          ) : (
                            <Clock className="w-3 h-3 opacity-60" />
                          )}
                        </div>
                      )}
                    </DropdownMenuItem>
                  );
                })()}
                {row.original.status !== 'Paid' && (() => {
                  const isEscalatedToManager = !row.original.nextActionAt;
                  return (
                    <DropdownMenuItem
                      disabled={isEscalatedToManager}
                      title={isEscalatedToManager ? "Invoice escalated to manager - automation complete" : ""}
                      className={cn(
                        "rounded-lg cursor-pointer px-2 py-2 text-sm font-medium transition-colors flex items-center justify-between gap-2",
                        isEscalatedToManager
                          ? "opacity-50 cursor-not-allowed"
                          : "focus:bg-primary/5 focus:text-primary"
                      )}
                      onClick={() => {
                        if (!isEscalatedToManager) {
                          setEditingInvoice(row.original);
                          setIsEditModalOpen(true);
                        }
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4" /> Edit Automation
                      </div>
                      {isEscalatedToManager && <BrainCircuit className="w-3 h-3 text-red-500" />}
                    </DropdownMenuItem>
                  );
                })()}

                {row.original.hasPendingDraft && (() => {
                  const isEscalatedToManager = !row.original.nextActionAt && row.original.status !== 'Paid';
                  return (
                    <DropdownMenuItem
                      onClick={() => {
                        if (row.original.gmailDraftId) {
                          window.open(`https://mail.google.com/mail/u/0/#drafts/${row.original.gmailDraftId}`, '_blank');
                        } else {
                          window.open('https://mail.google.com/mail/u/0/#drafts', '_blank');
                        }
                      }}
                      className={cn(
                        "rounded-lg cursor-pointer px-2 py-2 text-sm font-bold transition-colors flex items-center gap-2",
                        isEscalatedToManager
                          ? "focus:bg-orange-500/10 focus:text-orange-500 text-orange-600"
                          : "focus:bg-orange-500/10 focus:text-orange-500 text-orange-500"
                      )}>
                      <ExternalLink className="w-4 h-4" /> Review AI Draft
                    </DropdownMenuItem>
                  );
                })()}

                {row.original.status !== 'Paid' && (() => {
                  const isEscalatedToManager = !row.original.nextActionAt;
                  return (
                    <DropdownMenuItem
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to mark invoice ${row.original.invoice_number} as PAID? This will stop all future automation for this invoice.`)) {
                          updateInvoice(row.original.id, { status: 'Paid' });
                        }
                      }}
                      title={isEscalatedToManager ? "Mark this invoice as collected to end manager escalation" : ""}
                      className={cn(
                        "rounded-lg cursor-pointer px-2 py-2 text-sm font-medium transition-colors flex items-center gap-2",
                        isEscalatedToManager
                          ? "focus:bg-emerald-500/10 focus:text-emerald-500 text-emerald-600 font-bold"
                          : "focus:bg-emerald-500/10 focus:text-emerald-500 text-emerald-500"
                      )}>
                      <Zap className="w-4 h-4" /> Mark as Paid
                    </DropdownMenuItem>
                  );
                })()}
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuGroup >
                <DropdownMenuItem
                  onClick={() => handleDeleteInvoice(row.original.id, row.original.invoice_number)}
                  title="Permanently delete this invoice"
                  className="rounded-lg cursor-pointer px-2 py-2 text-sm font-medium focus:bg-rose-50 focus:text-rose-600 transition-colors flex items-center gap-2 text-rose-500 hover:bg-rose-50/50"
                >
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
      issue_date: formData.get('issue_date'),
      due_date: formData.get('due_date'),
      start_followups: formData.get('start_followups'),
      client_phone: formData.get('customer_phone'),
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
      const issueDateVal = formData.get('issue_date');
      const issueDate = issueDateVal ? new Date(String(issueDateVal)) : new Date();
      const startOffset = payload.start_followups === ''
        ? (settings?.followupStartDelayDays ?? 0)
        : Number(payload.start_followups);
      const startDate = addDays(issueDate, startOffset);
      const formattedStartDate = startDate.toISOString().split('T')[0];
      setIsCreateModalOpen(false);

      // Refresh the list
      const data = await fetchInvoices();
      setInvoices(data);
      toast.success("Invoice created successfully");
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
          {/* <Button variant="outline" size="sm" className="h-10 rounded-xl hidden sm:flex">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button> */}
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger render={<Button variant="default" size="sm" className="h-10" />}>
              <Plus className="w-4 h-4 mr-2" />
              New Invoice
            </DialogTrigger>
            <DialogContent className="max-w-3xl p-0 overflow-hidden rounded-lg border border-border bg-card shadow-2xl">

              {/* Header */}
              <div className="px-8 pt-8 pb-6 bg-linear-to-br from-primary/5 via-transparent to-transparent">
                <DialogHeader className="space-y-1 text-left">
                  <DialogTitle className="text-2xl font-bold text-foreground">
                    Create New Invoice
                  </DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground">
                    Add invoice details and configure automated follow-ups.
                  </DialogDescription>
                </DialogHeader>
              </div>

              <form onSubmit={handleCreateInvoice} className="px-8 pb-8 space-y-8">

                {/* ================= BASIC INFO ================= */}
                <div className="space-y-4">
                  <h4 className="text-xs font-semibold tracking-widest text-primary uppercase">
                    Basic Information
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="invoice_number" className="text-xs font-medium text-muted-foreground">
                        Invoice ID
                      </Label>
                      <Input
                        id="invoice_number"
                        name="invoice_number"
                        placeholder="INV-2026-001"
                        className="h-11 rounded-xl"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="amount" className="text-xs font-medium text-muted-foreground">
                        Amount (₹)
                      </Label>
                      <Input
                        id="amount"
                        name="amount"
                        type="number"
                        placeholder="0.00"
                        className="h-11 rounded-xl font-mono"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* ================= CUSTOMER ================= */}
                <div className="p-6 space-y-4 border rounded-lg bg-muted/30 border-border">
                  <h4 className="text-xs font-semibold tracking-widest text-primary uppercase">
                    Client Details
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="customer_name" className="text-xs text-muted-foreground">
                        Client Name
                      </Label>
                      <Input
                        id="customer_name"
                        name="customer_name"
                        placeholder="Acme Corp"
                        className="h-11 rounded-xl bg-background"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="customer_email" className="text-xs text-muted-foreground">
                        Client Email
                      </Label>
                      <Input
                        id="customer_email"
                        name="customer_email"
                        type="email"
                        placeholder="billing@acme.com"
                        className="h-11 rounded-xl bg-background"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="customer_phone" className="text-xs text-muted-foreground">
                      Phone / WhatsApp
                    </Label>
                    <Input
                      id="customer_phone"
                      name="customer_phone"
                      placeholder="+91 98765 43210"
                      className="h-11 rounded-xl bg-background"
                    />
                  </div>
                </div>

                {/* ================= SCHEDULE ================= */}
                <div className="space-y-4">
                  <h4 className="text-xs font-semibold tracking-widest text-primary uppercase">
                    Schedule & Automation
                  </h4>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="issue_date" className="text-xs text-muted-foreground">
                        Issue Date
                      </Label>
                      <Input
                        id="issue_date"
                        name="issue_date"
                        type="date"
                        className="h-10 rounded-xl text-xs"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="due_date" className="text-xs text-muted-foreground">
                        Due Date
                      </Label>
                      <Input
                        id="due_date"
                        name="due_date"
                        type="date"
                        className="h-10 rounded-xl text-xs"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="start_followups" className="text-xs text-muted-foreground">
                        Follow-up Delay
                      </Label>
                      <Input
                        id="start_followups"
                        name="start_followups"
                        type="number"
                        placeholder={`${settings?.followupStartDelayDays ?? 0}`}
                        className="h-10 text-xs font-semibold text-center rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                {/* ================= NOTES ================= */}
                <div className="space-y-1.5">
                  <Label htmlFor="notes" className="text-xs text-muted-foreground">
                    Internal Notes
                  </Label>
                  <Input
                    id="notes"
                    name="notes"
                    placeholder="Optional notes for internal tracking"
                    className="h-11 rounded-xl"
                  />
                </div>

                {/* ================= ACTIONS ================= */}
                <DialogFooter className="flex flex-col gap-3 pt-6 sm:flex-row">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="flex-1 h-12 font-medium rounded-xl"
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    className="flex-1 h-12 font-semibold transition-transform rounded-xl bg-primary hover:scale-[1.02]"
                  >
                    Create Invoice
                  </Button>
                </DialogFooter>

              </form>
            </DialogContent>
          </Dialog>
        </div>
      </PageHeader>
      {/* 🔹 Filter & Sort Toolbar */}
      <div className="space-y-4 mb-8">
        {/* Row 1: Primary Tabs & Inline Sorts */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg w-fit border border-border/50">
            {['All', 'Pending', 'Overdue', 'Paid'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-6 py-2 rounded-md text-xs font-bold transition-all",
                  activeTab === tab
                    ? "bg-white dark:bg-neutral-800 text-primary shadow-sm ring-1 ring-black/5"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-neutral-800/50"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 no-scrollbar">
            <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mr-2 whitespace-nowrap">Sort by</span>
            <Button
              variant={activeTab === 'Newest' ? 'default' : 'outline'}
              size="sm"
              className={cn(
                "text-[11px] font-bold rounded-lg h-9 gap-2",
                activeTab === 'Newest' ? "bg-primary text-white" : "border-border/60 bg-card text-neutral-900 dark:text-neutral-100"
              )}
              onClick={() => {
                const sorted = [...filteredInvoices].sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());
                setFilteredInvoices(sorted);
                toast.success("Sorted by newest issue date");
              }}
            >
              <Clock className="w-3.5 h-3.5" />
              Newest First
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="text-[11px] font-bold rounded-lg h-9 border-border/60 bg-card text-neutral-900 dark:text-neutral-100 gap-2"
              onClick={() => {
                const sorted = [...filteredInvoices].sort((a, b) => b.amount - a.amount);
                setFilteredInvoices(sorted);
                toast.success("Sorted by highest amount");
              }}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Highest Amount
            </Button>
          </div>
        </div>

        {/* Row 2: Search & Advanced Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
          <div className="flex-1 max-w-2xl">
             {/* Search is handled inside DataTable component below */}
          </div>

          {/* <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger render={
                <Button variant="outline" className="h-10 rounded-lg px-4 font-bold text-xs gap-2 border-border/60 bg-card hover:bg-muted transition-all">
                  <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                  Advanced filters
                </Button>
              } />
              <DropdownMenuContent align="end" className="w-56 rounded-lg border-border shadow-xl p-1">
                <DropdownMenuLabel className="text-[10px] font-bold text-muted-foreground/60 tracking-widest px-2 py-1.5 uppercase">Smart views</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border/50" />
                <DropdownMenuItem
                  onClick={() => {
                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                    setFilteredInvoices(invoices.filter(i => new Date(i.issueDate) >= thirtyDaysAgo));
                    toast.success("Showing recent invoices (30d)");
                  }}
                  className="cursor-pointer rounded-md focus:bg-primary/5 focus:text-primary py-2 px-3 text-sm font-medium"
                >
                  <Zap className="w-4 h-4 mr-2 opacity-70" />
                  Recent (Last 30 days)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setFilteredInvoices(invoices.filter(i => i.amount > 100000));
                    toast.success("Showing high value invoices");
                  }}
                  className="cursor-pointer rounded-md focus:bg-primary/5 focus:text-primary py-2 px-3 text-sm font-medium"
                >
                  <TrendingUp className="w-4 h-4 mr-2 opacity-70" />
                  High value (₹1L+)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setFilteredInvoices(invoices.filter(i => i.hasPendingDraft));
                    toast.success("Showing invoices needing review");
                  }}
                  className="cursor-pointer rounded-md focus:bg-orange-500/5 focus:text-orange-600 py-2 px-3 text-sm font-bold text-orange-500"
                >
                  <BrainCircuit className="w-4 h-4 mr-2 opacity-70" />
                  Needs AI review
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border/50" />
                <DropdownMenuItem
                  onClick={() => {
                    setFilteredInvoices(invoices);
                    toast.info("All filters cleared");
                  }}
                  className="cursor-pointer rounded-md text-muted-foreground py-2 px-3 text-sm font-medium"
                >
                  Reset all filters
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div> */}
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

          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent className="rounded-lg max-w-lg border-border bg-card shadow-2xl p-0 overflow-hidden">
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
                  <div className="p-6 rounded-lg bg-muted/30 border border-border/50 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-xs font-semibold uppercase text-muted-foreground">Follow-up Start Delay</Label>
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
                  </div>

                  <div className="flex items-center gap-3 bg-amber-500/5 p-4 rounded-lg border border-amber-500/10">
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
