'use client';

import * as React from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { Customer } from '@/types';
import { cn } from '@/lib/utils';
import {
  Users,
  Phone,
  ShieldAlert,
  ShieldCheck,
  Shield,
  IndianRupee,
  Building2,
  MoreHorizontal,
  Mail,
  Eye,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  Settings2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Zap,
  MessageCircle,
  UserCheck2,
  FileWarning,
  Search,
  FilePlus,
  Plus,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import router from 'next/router';

// ─── Types ────────────────────────────────────────────────────────────────────

interface LadderStep {
  delayDays: number;
  tone: string;
  label: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n);
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Soft, light avatar palette — no harsh colours
const AVATAR_COLORS = [
  { bg: 'bg-blue-100', text: 'text-blue-700' },
  { bg: 'bg-violet-100', text: 'text-violet-700' },
  { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  { bg: 'bg-amber-100', text: 'text-amber-700' },
  { bg: 'bg-sky-100', text: 'text-sky-700' },
  { bg: 'bg-pink-100', text: 'text-pink-700' },
  { bg: 'bg-teal-100', text: 'text-teal-700' },
];

function getAvatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function getRiskConfig(risk: string) {
  const map: Record<string, { label: string; icon: React.ElementType; dot: string; badge: string }> = {
    High: {
      label: 'High',
      icon: ShieldAlert,
      dot: 'bg-red-400',
      badge: 'bg-red-50 text-red-600 border-red-200',
    },
    Medium: {
      label: 'Medium',
      icon: Shield,
      dot: 'bg-amber-400',
      badge: 'bg-amber-50 text-amber-600 border-amber-200',
    },
    Low: {
      label: 'Low',
      icon: ShieldCheck,
      dot: 'bg-emerald-400',
      badge: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    },
  };
  return map[risk] ?? map.Low;
}

function scoreColor(s: number) {
  if (s >= 80) return 'text-emerald-600';
  if (s >= 50) return 'text-amber-600';
  return 'text-red-500';
}

function rateBarColor(r: number) {
  if (r >= 80) return 'bg-emerald-400';
  if (r >= 50) return 'bg-amber-400';
  return 'bg-red-400';
}

function toneConfig(tone: string): {
  icon: React.ElementType;
  bg: string;
  text: string;
  label: string;
} {
  const t = tone?.toLowerCase() ?? '';
  if (t.includes('whatsapp') || t.includes('sms') || t.includes('message'))
    return { icon: MessageCircle, bg: 'bg-green-100', text: 'text-green-700', label: 'WhatsApp' };
  if (t.includes('manager') || t.includes('escalat'))
    return { icon: UserCheck2, bg: 'bg-orange-100', text: 'text-orange-700', label: 'Manager' };
  if (t.includes('final') || t.includes('legal') || t.includes('demand'))
    return { icon: FileWarning, bg: 'bg-red-100', text: 'text-red-600', label: 'Final' };
  if (t.includes('urgent') || t.includes('firm'))
    return { icon: Zap, bg: 'bg-amber-100', text: 'text-amber-700', label: 'Firm' };
  return { icon: Mail, bg: 'bg-blue-100', text: 'text-blue-700', label: 'Email' };
}

const DEFAULT_LADDER: LadderStep[] = [
  { delayDays: 3, tone: 'Gentle', label: 'Reminder 1' },
  { delayDays: 7, tone: 'Firm', label: 'Reminder 2' },
  { delayDays: 14, tone: 'Urgent', label: 'Reminder 3' },
  { delayDays: 21, tone: 'Manager', label: 'Manager Escalation' },
];

// ─── Collection Journey ───────────────────────────────────────────────────────

function CollectionJourney({
  customer,
  ladder,
}: {
  customer: Customer;
  ladder: LadderStep[];
}) {
  const { paidAtStage, maxReminderStage, escalationReached, totalInvoices, riskLevel, onTimeRate } =
    customer;

  const steps = ladder.length ? ladder : DEFAULT_LADDER;
  const totalSteps = steps.length;

  if (totalInvoices === 0) {
    return <span className="text-xs  italic">New customer</span>;
  }

  const isOverdue = riskLevel !== 'Low';
  const hasPaid = paidAtStage > 0 || (!isOverdue && onTimeRate > 0);
  const currentStage = hasPaid ? paidAtStage || totalSteps : Math.max(maxReminderStage, 0);
  const progress = Math.min(100, Math.round((currentStage / totalSteps) * 100));

  const barColor = hasPaid ? 'bg-emerald-400' : isOverdue ? 'bg-red-400' : 'bg-blue-400';
  const statusColor = hasPaid
    ? 'text-emerald-600 bg-emerald-50'
    : isOverdue
    ? 'text-red-500 bg-red-50'
    : 'text-blue-600 bg-blue-50';
  const statusLabel = hasPaid ? 'Paid' : isOverdue ? 'Overdue' : 'Active';

  return (
    <div className="flex items-center gap-3 min-w-0 w-56">
      {/* Progress bar */}
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', barColor)}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Stage label */}
      <span className="text-[11px]  font-medium whitespace-nowrap shrink-0">
        {currentStage}/{totalSteps}
      </span>

      {/* Status pill */}
      <span
        className={cn(
          'text-[10px] font-bold px-1.5 py-0.5 rounded-md whitespace-nowrap shrink-0 tracking-wide uppercase',
          statusColor
        )}
      >
        {statusLabel}
      </span>

      {/* Escalation tag */}
      {escalationReached && (
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-orange-50 text-orange-600 uppercase tracking-wide shrink-0">
          ESC
        </span>
      )}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  iconCls,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub: string;
  iconCls: string;
}) {
  return (
    <div className=" rounded-xl border  p-4 flex items-center gap-3 shadow-sm hover:shadow transition-shadow duration-200">
      <div className={cn('h-9 w-9 rounded-lg flex items-center justify-center shrink-0', iconCls)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold  uppercase tracking-wider leading-none">
          {label}
        </p>
        <p className="text-lg font-black  leading-tight mt-0.5">{value}</p>
        <p className="text-[11px]  leading-none mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

// ─── Sort Header ──────────────────────────────────────────────────────────────

function SortHeader({ column, label }: { column: any; label: string }) {
  const isSorted = column.getIsSorted();
  return (
    <button
      type="button"
      onClick={column.getToggleSortingHandler()}
      className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider hover:text-slate-900 transition-colors group cursor-pointer"
    >
      {label}
      <ArrowUpDown
        className={cn(
          'h-3 w-3 transition-opacity',
          isSorted ? 'text-blue-500 opacity-100' : 'opacity-30 group-hover:opacity-60'
        )}
      />
    </button>
  );
}

// ─── Columns ──────────────────────────────────────────────────────────────────

function buildColumns(ladder: LadderStep[]): ColumnDef<Customer>[] {
  return [
    // 1. Customer
    {
      accessorKey: 'name',
      header: ({ column }) => <SortHeader column={column} label="Customer" />,
      cell: ({ row }) => {
        const c = row.original;
        const av = getAvatarColor(c.name);
        return (
          <Link href={`/cus tomers/${c.id}`} className="flex items-center gap-3 group min-w-0">
            <div
              className={cn(
                'h-8 w-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-black',
                av.bg,
                av.text
              )}
            >
              {getInitials(c.name)}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm group-hover:text-blue-600 transition-colors truncate">
                {c.name}
              </p>
              <p className="text-[11px]  truncate">{c.email}</p>
            </div>
          </Link>
        );
      },
    },

    // 2. On-Time Rate
    {
      accessorKey: 'onTimeRate',
      header: ({ column }) => <SortHeader column={column} label="On-Time" />,
      cell: ({ row }) => {
        const rate = row.getValue('onTimeRate') as number;
        const invoices = row.original.totalInvoices;
        return (
          <div className="w-24">
            <div className="flex justify-between mb-1.5">
              <span className={cn('text-xs font-bold', scoreColor(rate))}>{rate}%</span>
              <span className="text-[11px] ">{invoices} inv</span>
            </div>
            <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full', rateBarColor(rate))}
                style={{ width: `${rate}%` }}
              />
            </div>
          </div>
        );
      },
    },

    // 3. Collection Journey
    {
      id: 'collectionJourney',
      header: () => (
        <span className="text-[11px] font-semibold  uppercase tracking-wider">
          Journey
        </span>
      ),
      cell: ({ row }) => <CollectionJourney customer={row.original} ladder={ladder} />,
      enableSorting: false,
    },

    // 4. Score
    {
      accessorKey: 'behaviorScore',
      header: ({ column }) => <SortHeader column={column} label="Score" />,
      cell: ({ row }) => {
        const s = row.getValue('behaviorScore') as number;
        return (
          <div className="flex items-center gap-2">
            {s >= 70 ? (
              <TrendingUp className={cn('h-3 w-3', scoreColor(s))} />
            ) : (
              <TrendingDown className={cn('h-3 w-3', scoreColor(s))} />
            )}
            <span className={cn('text-sm font-bold', scoreColor(s))}>{s}</span>
          </div>
        );
      },
    },

    // 5. Risk
    {
      accessorKey: 'riskLevel',
      header: ({ column }) => <SortHeader column={column} label="Risk" />,
      cell: ({ row }) => {
        const risk = getRiskConfig(row.getValue('riskLevel'));
        const Icon = risk.icon;
        return (
          <span
            className={cn(
              'inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold border',
              risk.badge
            )}
          >
            <Icon className="h-3 w-3" />
            {risk.label}
          </span>
        );
      },
    },

    // 6. Outstanding
    {
      accessorKey: 'totalOutstanding',
      header: ({ column }) => (
        <div className="text-right">
          <SortHeader column={column} label="Outstanding" />
        </div>
      ),
      cell: ({ row }) => {
        const amt = row.getValue('totalOutstanding') as number;
        return (
          <div className="text-right">
            <span
              className={cn(
                'text-sm font-bold',
                amt > 0 ? 'text-red-500' : 'text-emerald-600'
              )}
            >
              {fmt(amt)}
            </span>
          </div>
        );
      },
    },

    // 7. Actions
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const c = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="opacity-100 sm:opacity-0 sm:group-hover/row:opacity-100 focus:opacity-100 transition-opacity hover:bg-slate-100"
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Actions</span>
                </Button>
              }
            />
            <DropdownMenuContent
              align="end"
              className="rounded-xl  shadow-lg p-1 w-44 "
            >
              <DropdownMenuItem
                className="rounded-lg cursor-pointer px-2.5 py-2 text-sm text-slate-700 flex items-center gap-2  transition-colors"
                onClick={() => {
                  router.push(`/customers/${c.id}`);
                }}
              >
                <Eye className="w-3.5 h-3.5 " /> View Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                className="rounded-lg cursor-pointer px-2.5 py-2 text-sm text-indigo-600 flex items-center gap-2 transition-colors font-semibold focus:text-indigo-700 focus:bg-indigo-50"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('open-invoice-modal', { 
                    detail: { 
                      name: c.name, 
                      email: c.email,
                      phone: c.phone
                    } 
                  }));
                }}
              >
                <FilePlus className="w-3.5 h-3.5 " /> Issue Invoice
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CustomersPage() {
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [ladder, setLadder] = React.useState<LadderStep[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const router = useRouter();
  
  // Invoice Modal State
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = React.useState(false);
  const [prefilledCustomer, setPrefilledCustomer] = React.useState<{name: string, email: string, phone: string} | null>(null);

  React.useEffect(() => {
    const handleOpenModal = (e: any) => {
      setPrefilledCustomer(e.detail);
      setIsInvoiceModalOpen(true);
    };
    window.addEventListener('open-invoice-modal', handleOpenModal);
    return () => window.removeEventListener('open-invoice-modal', handleOpenModal);
  }, []);

  React.useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch('/api/dashboard', { cache: 'no-store' });
        const data = await res.json();

        const normalizeRisk = (r: string): Customer['riskLevel'] => {
          const v = (r ?? '').toLowerCase();
          if (v.includes('high')) return 'High';
          if (v.includes('medium')) return 'Medium';
          return 'Low';
        };

        const mapped: Customer[] = (data.customers ?? []).map((c: any) => ({
          id: c.id ?? '',
          name: c.name ?? '',
          email: c.email ?? '',
          phone: String(c.phone ?? ''),
          totalInvoices: Number(c.totalInvoices ?? 0),
          behaviorScore: Number(c.behaviorScore ?? 0),
          riskLevel: normalizeRisk(c.riskLevel),
          totalOutstanding: Number(c.totalOutstanding ?? 0),
          avgDelay: Number(c.avgDelay ?? 0),
          onTimeRate: Number(c.onTimeRate ?? 0),
          aiInsight: c.aiInsight ?? '',
          notes: c.notes ?? '',
          maxReminderStage: Number(c.maxReminderStage ?? 0),
          avgReminderStage: Number(c.avgReminderStage ?? 0),
          escalationReached: Boolean(c.escalationReached ?? false),
          stagesUsed: Array.isArray(c.stagesUsed) ? c.stagesUsed : [],
          paidAtStage: Number(c.paidAtStage ?? 0),
        }));

        setCustomers(mapped);
        setLadder(
          Array.isArray(data.settings?.escalationLadder) ? data.settings.escalationLadder : []
        );
      } catch (e) {
        console.error('Failed to load:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

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
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to create invoice');
      
      setIsInvoiceModalOpen(false);
      toast.success("Invoice issued successfully");
    } catch (err: any) {
      toast.error(`Failed to issue invoice: ${err.message}`);
    }
  };

  // Derived metrics
  const total = customers.length;
  const low = customers.filter((c) => c.riskLevel === 'Low').length;
  const med = customers.filter((c) => c.riskLevel === 'Medium').length;
  const high = customers.filter((c) => c.riskLevel === 'High').length;
  const outstanding = customers.reduce((s, c) => s + c.totalOutstanding, 0);
  const escalated = customers.filter((c) => c.escalationReached).length;

  const columns = React.useMemo(() => buildColumns(ladder), [ladder]);

  const table = useReactTable({
    data: customers,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    initialState: { pagination: { pageSize: 15 } },
    state: { sorting, columnFilters, columnVisibility },
  });

  const activeLadder = ladder.length > 0 ? ladder : DEFAULT_LADDER;

  return (
    <DashboardLayout>
      <div className="space-y-5 animate-in fade-in duration-400">
        <PageHeader
          title="Customers"
          description="Payment behaviour · collection journeys · risk overview"
        />

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard
            icon={Building2}
            label="Total"
            value={loading ? '—' : total}
            sub="Accounts"
            iconCls="bg-slate-100 text-slate-500"
          />
          <StatCard
            icon={ShieldCheck}
            label="Healthy"
            value={loading ? '—' : low}
            sub="Low risk"
            iconCls="bg-emerald-50 text-emerald-600"
          />
          <StatCard
            icon={Shield}
            label="Watch"
            value={loading ? '—' : med}
            sub="Medium risk"
            iconCls="bg-amber-50 text-amber-600"
          />
          <StatCard
            icon={ShieldAlert}
            label="Critical"
            value={loading ? '—' : high}
            sub="High risk"
            iconCls="bg-red-50 text-red-500"
          />
          <StatCard
            icon={IndianRupee}
            label="Outstanding"
            value={loading ? '—' : fmt(outstanding)}
            sub="Pending recovery"
            iconCls="bg-blue-50 text-blue-600"
          />
        </div>

        {/* ── Escalation Ladder banner ── */}
        {!loading && (
          <div className=" rounded-xl border  px-5 py-3.5 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center gap-3">
              {/* Label */}
              <div className="flex items-center gap-2 shrink-0">
                <Zap className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-xs font-bold  uppercase tracking-wider">
                  Escalation Ladder
                </span>
                {ladder.length === 0 && (
                  <span className="text-[11px]  italic">
                    (defaults — configure in Settings)
                  </span>
                )}
              </div>

              {/* Steps */}
              <div className="flex items-center gap-1 flex-wrap">
                {activeLadder.map((step, i) => {
                  const tc = toneConfig(step.tone);
                  const Icon = tc.icon;
                  return (
                    <React.Fragment key={i}>
                      {i > 0 && <div className="h-px w-3 bg-slate-200 shrink-0" />}
                      <div
                        className={cn(
                          'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border',
                          tc.bg,
                          tc.text,
                          'border-transparent'
                        )}
                      >
                        <Icon className="h-3 w-3 shrink-0" />
                        <div>
                          <div className="leading-none">{step.label}</div>
                          <div className="text-[9px] opacity-60 font-medium mt-0.5 leading-none">
                            Day {step.delayDays} · {step.tone}
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}

                {/* Outcomes */}
                <div className="flex items-center gap-1 ml-1">
                  <div className="h-px w-3 bg-slate-200" />
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[11px] font-semibold border border-emerald-100">
                    <CheckCircle2 className="h-3 w-3" /> Paid
                  </span>
                  <span className="text-[11px] text-slate-300 mx-1">or</span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-red-50 text-red-500 text-[11px] font-semibold border border-red-100">
                    <XCircle className="h-3 w-3" /> Overdue
                  </span>
                </div>
              </div>

              {/* Risk mini bar */}
              {total > 0 && (
                <div className="hidden xl:flex items-center gap-2 border-l  pl-4 ml-auto shrink-0">
                  <div className="w-24 h-1.5 rounded-full bg-slate-100 overflow-hidden flex">
                    <div
                      className="h-full bg-emerald-400"
                      style={{ width: `${(low / total) * 100}%` }}
                    />
                    <div
                      className="h-full bg-amber-400"
                      style={{ width: `${(med / total) * 100}%` }}
                    />
                    <div
                      className="h-full bg-red-400"
                      style={{ width: `${(high / total) * 100}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-medium ">
                    {low}L · {med}M · {high}H
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Table ── */}
        <div className=" rounded-xl border  shadow-sm overflow-hidden">

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-b ">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5  pointer-events-none" />
              <Input
                placeholder="Search customers…"
                value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
                onChange={(e) => table.getColumn('name')?.setFilterValue(e.target.value)}
                className="pl-8 h-8 rounded-lg border-slate-200 bg-slate-50 text-sm placeholder: focus:"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs  font-medium hidden sm:block">
                {table.getFilteredRowModel().rows.length} customers
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-lg px-3 text-xs font-medium gap-1.5 border-slate-200"
                    >
                      <Settings2 className="h-3.5 w-3.5" />
                      Columns
                    </Button>
                  }
                />
                <DropdownMenuContent
                  align="end"
                  className="rounded-xl  shadow-lg p-1.5 w-48 "
                >
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-[10px] font-semibold  uppercase tracking-wider px-2 py-1">
                    Toggle Columns
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-100 my-1" />
                  {table
                    .getAllColumns()
                    .filter((c) => c.getCanHide())
                    .map((col) => (
                      <DropdownMenuCheckboxItem
                        key={col.id}
                        className="text-xs font-medium text-slate-700 rounded-lg focus:bg-slate-50 cursor-pointer"
                        checked={col.getIsVisible()}
                        onCheckedChange={(v) => col.toggleVisibility(!!v)}
                      >
                        {col.id.replace(/([A-Z])/g, ' $1').trim()}
                      </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Table body */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <div className="relative h-10 w-10">
                <div className="h-10 w-10 border-2  rounded-full" />
                <div className="h-10 w-10 border-2 border-blue-400 border-t-transparent rounded-full animate-spin absolute top-0 left-0" />
              </div>
              <p className="text-sm ">Loading customers…</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className=" border-b ">
                  {table.getHeaderGroups().map((hg) => (
                    <TableRow key={hg.id} className="hover:bg-transparent border-none">
                      {hg.headers.map((h) => (
                        <TableHead key={h.id} className="h-10 px-4 py-2 whitespace-nowrap">
                          {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        className="group/row border-b border-slate-50 last:border-0 /60 transition-colors duration-100"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} className="px-4 py-3 align-middle">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="h-48 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center">
                            <Users className="h-5 w-5 " />
                          </div>
                          <p className="text-sm font-medium ">No customers found</p>
                          <p className="text-xs ">Try adjusting your search.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {!loading && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t">
              <div className="flex items-center gap-2 text-[11px] ">
                <div className="h-1.5 w-1.5 rounded-full animate-pulse" />
                {table.getFilteredRowModel().rows.length} of {total} · live
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-[11px] ">
                  Rows:
                  <select
                    value={table.getState().pagination.pageSize}
                    onChange={(e) => table.setPageSize(Number(e.target.value))}
                    className="bg-transparent text-[11px] font-semibold text-blue-500 focus:outline-none cursor-pointer ml-1"
                  >
                    {[10, 15, 25, 50].map((s) => (
                      <option key={s} value={s} className=" text-slate-700">
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <span className="text-[11px] ">
                  Page {table.getState().pagination.pageIndex + 1} /{' '}
                  {table.getPageCount() || 1}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    className="h-7 w-7 p-0 rounded-lg border-slate-200 hover:bg-slate-100 disabled:opacity-30"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    className="h-7 w-7 p-0 rounded-lg border-slate-200 hover:bg-slate-100 disabled:opacity-30"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Invoice Creation Modal */}
        <Dialog open={isInvoiceModalOpen} onOpenChange={setIsInvoiceModalOpen}>
          <DialogContent className="rounded-2xl max-w-2xl border-border bg-card shadow-2xl p-0 overflow-hidden">
            <div className="p-8 bg-linear-to-br from-primary/5 via-transparent to-transparent">
              <DialogHeader className="space-y-1 mb-8 text-left">
                <DialogTitle className="text-2xl font-bold">Issue New Invoice</DialogTitle>
                <DialogDescription className="font-medium">Creating a billing record for {prefilledCustomer?.name || 'this customer'}.</DialogDescription>
              </DialogHeader>

              <form onSubmit={handleCreateInvoice} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="invoice_number" className="text-[10px] font-black uppercase text-muted-foreground/70 tracking-widest">Invoice ID</Label>
                    <Input id="invoice_number" name="invoice_number" placeholder="INV-2024-001" className="rounded-xl h-11 border-border shadow-xs" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount" className="text-[10px] font-black uppercase text-muted-foreground/70 tracking-widest">Amount (₹)</Label>
                    <Input id="amount" name="amount" type="number" placeholder="0.00" className="rounded-xl h-11 border-border shadow-xs font-mono" required />
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-muted/30 border border-border/50 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer_name" className="text-[10px] font-black uppercase text-muted-foreground/70 tracking-widest">Client Name</Label>
                    <Input id="customer_name" name="customer_name" defaultValue={prefilledCustomer?.name || ''} className="rounded-xl h-11 bg-background border-border shadow-xs" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="customer_email" className="text-[10px] font-black uppercase text-muted-foreground/70 tracking-widest">Client Email</Label>
                      <Input id="customer_email" name="customer_email" type="email" defaultValue={prefilledCustomer?.email || ''} className="rounded-xl h-11 bg-background border-border shadow-xs" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customer_phone" className="text-[10px] font-black uppercase text-muted-foreground/70 tracking-widest">Client Phone</Label>
                      <Input id="customer_phone" name="customer_phone" defaultValue={prefilledCustomer?.phone || ''} className="rounded-xl h-11 bg-background border-border shadow-xs" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="issue_date" className="text-[10px] font-bold uppercase text-muted-foreground">Issue Date</Label>
                    <Input id="issue_date" name="issue_date" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="rounded-xl h-10 border-border shadow-xs text-xs" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="due_date" className="text-[10px] font-bold uppercase text-muted-foreground">Due Date</Label>
                    <Input id="due_date" name="due_date" type="date" className="rounded-xl h-10 border-border shadow-xs text-xs" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="start_followups" className="text-[10px] font-bold uppercase text-muted-foreground">Followup Start (Days)</Label>
                    <Input id="start_followups" name="start_followups" type="number" placeholder="Default" className="rounded-xl h-10 border-border shadow-xs text-xs" />
                  </div>
                </div>

                <DialogFooter className="pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsInvoiceModalOpen(false)} className="rounded-xl h-12 px-6">Cancel</Button>
                  <Button type="submit" className="rounded-xl h-12 px-8 bg-primary font-bold shadow-lg shadow-primary/20">Issue Invoice</Button>
                </DialogFooter>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}