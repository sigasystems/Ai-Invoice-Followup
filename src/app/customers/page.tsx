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
  Download,
  Plus,
  Phone,
  ShieldAlert,
  ShieldCheck,
  Shield,
  BrainCircuit,
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
  SlidersHorizontal,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  MessageCircle,
  UserCheck2,
  FileWarning,
  Search,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface LadderStep {
  delayDays: number;
  tone: string;
  label: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}
function getInitials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}
const GRADS = [
  'from-violet-500 to-indigo-600', 'from-blue-500 to-cyan-500',
  'from-emerald-500 to-teal-500', 'from-orange-500 to-amber-500',
  'from-rose-500 to-pink-500', 'from-purple-500 to-fuchsia-500',
  'from-indigo-500 to-blue-500',
];
function getGradient(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return GRADS[Math.abs(h) % GRADS.length];
}
function getRisk(risk: string) {
  const map: Record<string, { label: string; icon: React.ElementType; cls: string }> = {
    High: { label: 'High Risk', icon: ShieldAlert, cls: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/60' },
    Medium: { label: 'Medium Risk', icon: Shield, cls: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60' },
    Low: { label: 'Low Risk', icon: ShieldCheck, cls: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60' },
  };
  return map[risk] ?? map.Low;
}
function scoreColor(s: number) {
  if (s >= 80) return 'text-emerald-600 dark:text-emerald-400';
  if (s >= 50) return 'text-amber-600 dark:text-amber-400';
  return 'text-rose-600 dark:text-rose-400';
}
function rateBar(r: number) {
  if (r >= 80) return 'bg-emerald-500';
  if (r >= 50) return 'bg-amber-400';
  return 'bg-rose-500';
}

/**
 * Map a tone string from the escalation ladder to an icon + color for the journey step.
 */
function toneConfig(tone: string): { icon: React.ElementType; fill: string; ring: string; label: string } {
  const t = tone?.toLowerCase() ?? '';
  if (t.includes('whatsapp') || t.includes('sms') || t.includes('message'))
    return { icon: MessageCircle, fill: 'bg-green-500 border-green-600', ring: 'ring-green-200 dark:ring-green-900', label: 'WhatsApp' };
  if (t.includes('manager') || t.includes('escalat'))
    return { icon: UserCheck2, fill: 'bg-orange-500 border-orange-600', ring: 'ring-orange-200 dark:ring-orange-900', label: 'Manager' };
  if (t.includes('final') || t.includes('legal') || t.includes('demand'))
    return { icon: FileWarning, fill: 'bg-rose-600 border-rose-700', ring: 'ring-rose-200 dark:ring-rose-900', label: 'Final' };
  if (t.includes('urgent') || t.includes('firm'))
    return { icon: Zap, fill: 'bg-amber-500 border-amber-600', ring: 'ring-amber-200 dark:ring-amber-900', label: 'Firm' };
  // gentle / neutral / default = email
  return { icon: Mail, fill: 'bg-blue-500 border-blue-600', ring: 'ring-blue-200 dark:ring-blue-900', label: 'Email' };
}

// Default ladder when none configured
const DEFAULT_LADDER: LadderStep[] = [
  { delayDays: 3, tone: 'Gentle', label: 'Reminder 1' },
  { delayDays: 7, tone: 'Firm', label: 'Reminder 2' },
  { delayDays: 14, tone: 'Urgent', label: 'Reminder 3' },
  { delayDays: 21, tone: 'Manager', label: 'Manager Escalation' },
];

// ─── COLLECTION JOURNEY component ────────────────────────────────────────────
/**
 * Shows the configured escalation ladder as a horizontal step flow.
 *
 * State per step:
 *   • "sent"    — this step was sent to this customer (stage index reached)
 *   • "paid"    — invoice was resolved at / before this step
 *   • "active"  — currently at this step (overdue, not yet paid)
 *   • "pending" — not yet reached
 *
 * stagesUsed is 1-indexed (stage 1 = ladder[0], stage 2 = ladder[1], …).
 * paidAtStage is also 1-indexed avg stage of resolution for paid invoices.
 */
function CollectionJourney({
  customer,
  ladder,
}: {
  customer: Customer;
  ladder: LadderStep[];
}) {
  const {
    paidAtStage,
    maxReminderStage,
    escalationReached,
    totalInvoices,
    riskLevel,
    onTimeRate,
  } = customer;

  const steps = ladder.length ? ladder : DEFAULT_LADDER;
  const totalSteps = steps.length;

  if (totalInvoices === 0) {
    return (
      <span className="text-[10px] text-muted-foreground italic">
        New customer
      </span>
    );
  }

  const isOverdue = riskLevel !== "Low";
  const hasPaid = paidAtStage > 0 || (!isOverdue && onTimeRate > 0);

  const currentStage = hasPaid
    ? paidAtStage || totalSteps
    : Math.max(maxReminderStage, 0);

  const progress = Math.min(
    100,
    Math.round((currentStage / totalSteps) * 100)
  );

  const riskBadge =
    riskLevel === "Low"
      ? "bg-emerald-100 text-emerald-700"
      : riskLevel === "Medium"
        ? "bg-yellow-100 text-yellow-700"
        : "bg-red-100 text-red-700";

  return (
    <div className="flex items-center gap-2 min-w-0">

      {/* Risk badge */}
      {/* <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${riskBadge}`}>
        {riskLevel.toUpperCase()}
      </span> */}

      {/* Progress bar container */}
      <div className="relative flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full transition-all ${hasPaid ? "bg-emerald-500" : isOverdue ? "bg-red-500" : "bg-blue-500"
            }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Stage indicator */}
      <span className="text-[10px] font-semibold text-muted-foreground whitespace-nowrap">
        Stage {currentStage}/{totalSteps}
      </span>

      {/* Status dot */}
      <div className="flex items-center gap-1">
        <span
          className={`h-2 w-2 rounded-full ${hasPaid ? "bg-emerald-500" : isOverdue ? "bg-red-500 animate-pulse" : "bg-blue-500"
            }`}
        />
        <span className="text-[10px] font-bold text-muted-foreground">
          {hasPaid ? "PAID" : isOverdue ? "OVERDUE" : "IN PROGRESS"}
        </span>
      </div>

      {/* Escalation flag */}
      {escalationReached && (
        <span className="ml-1 text-[10px] px-2 py-0.5 rounded bg-orange-100 text-orange-700 font-semibold">
          ESCALATED
        </span>
      )}
    </div>
  );
}

// ─── Stat Card ──────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub, iconBg }: {
  icon: React.ElementType; label: string; value: string | number; sub: string; iconBg: string;
}) {
  return (
    <div className="bg-card rounded-2xl border border-border p-4 shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-3">
      <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center shrink-0', iconBg)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-muted-foreground uppercase  leading-none">{label}</p>
        <p className="text-xl font-black text-foreground leading-snug mt-0.5">{value}</p>
        <p className="text-[10px] font-medium text-muted-foreground leading-none">{sub}</p>
      </div>
    </div>
  );
}

// ─── Sortable header ─────────────────────────────────────────────────────────

function SortHeader({ column, label }: { column: any; label: string }) {
  return (
    <button
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      className="flex items-center gap-1 text-[10px] font-black text-muted-foreground uppercase  hover:text-foreground transition-colors group"
    >
      {label}
      <ArrowUpDown className={cn('h-3 w-3', column.getIsSorted() ? 'text-primary' : 'opacity-30 group-hover:opacity-60')} />
    </button>
  );
}

// ─── Column builder ───────────────────────────────────────────────────────────

function buildColumns(ladder: LadderStep[]): ColumnDef<Customer>[] {
  return [
    // 1. Customer
    {
      accessorKey: 'name',
      header: ({ column }) => <SortHeader column={column} label="Customer" />,
      cell: ({ row }) => {
        const c = row.original;
        return (
          <a href={`/customers/${c.id}`} className="flex items-center gap-3 group min-w-0">
            <div className={cn('h-9 w-9 rounded-xl bg-linear-to-br flex items-center justify-center shrink-0 text-white font-black text-xs shadow-sm', getGradient(c.name))}>
              {getInitials(c.name)}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm text-foreground group-hover:text-primary transition-colors truncate leading-tight">{c.name}</p>
              <p className="text-[11px] text-muted-foreground truncate">{c.email}</p>
              {c.phone && (
                <div className="flex items-center gap-1 mt-0.5">
                  <Phone className="h-2.5 w-2.5 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">{c.phone}</span>
                </div>
              )}
            </div>
          </a>
        );
      },
    },

    // 2. On-Time Rate
    {
      accessorKey: 'onTimeRate',
      header: ({ column }) => <SortHeader column={column} label="On-Time" />,
      cell: ({ row }) => {
        const rate = row.getValue('onTimeRate') as number;
        return (
          <div className="w-28">
            <div className="flex justify-between mb-1">
              <span className={cn('text-xs font-black', scoreColor(rate))}>{rate}%</span>
              <span className="text-[10px] text-muted-foreground">{row.original.totalInvoices} inv.</span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div className={cn('h-full rounded-full transition-all duration-700', rateBar(rate))} style={{ width: `${rate}%` }} />
            </div>
          </div>
        );
      },
    },

    // 3. ★ Collection Journey
    {
      id: 'collectionJourney',
      header: () => (
        <div className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground uppercase ">
          <Zap className="h-3 w-3 text-amber-500" />
          Collection Journey
        </div>
      ),
      cell: ({ row }) => (
        <CollectionJourney customer={row.original} ladder={ladder} />
      ),
      enableSorting: false,
    },

    // 4. AI Insight
    // {
    //   accessorKey: 'aiInsight',
    //   header: () => (
    //     <div className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground uppercase ">
    //       <BrainCircuit className="h-3 w-3 text-indigo-500" /> AI Insight
    //     </div>
    //   ),
    //   cell: ({ row }) => {
    //     const insight = row.getValue('aiInsight') as string | undefined;
    //     return (
    //       <div className="w-44">
    //         <div className="flex items-start gap-1.5 bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-xl px-2 py-1.5">
    //           <BrainCircuit className="h-3 w-3 text-indigo-500 shrink-0 mt-0.5" />
    //           <p className="text-[10px] text-indigo-700 dark:text-indigo-300 font-medium leading-snug italic line-clamp-2">
    //             {insight ?? 'Analysing…'}
    //           </p>
    //         </div>
    //       </div>
    //     );
    //   },
    //   enableSorting: false,
    // },

    // 5. Score
    {
      accessorKey: 'behaviorScore',
      header: ({ column }) => <SortHeader column={column} label="Score" />,
      cell: ({ row }) => {
        const s = row.getValue('behaviorScore') as number;
        return (
          <div className="flex flex-col items-center w-12">
            <div className="flex items-center gap-1">
              {s >= 70 ? <TrendingUp className={cn('h-3 w-3', scoreColor(s))} /> : <TrendingDown className={cn('h-3 w-3', scoreColor(s))} />}
              <span className={cn('text-sm font-black', scoreColor(s))}>{s}</span>
            </div>
            <div className="h-1 w-10 bg-muted rounded-full overflow-hidden mt-1">
              <div className={cn('h-full rounded-full', rateBar(s))} style={{ width: `${s}%` }} />
            </div>
          </div>
        );
      },
    },

    // 6. Risk
    {
      accessorKey: 'riskLevel',
      header: ({ column }) => <SortHeader column={column} label="Risk" />,
      cell: ({ row }) => {
        const risk = getRisk(row.getValue('riskLevel'));
        const Icon = risk.icon;
        return (
          <span className={cn('inline-flex items-center gap-1.5 px-2 py-1 rounded-xl text-[10px] font-bold border', risk.cls)}>
            <Icon className="h-3 w-3" />{risk.label}
          </span>
        );
      },
    },

    // 7. Avg Delay
    // {
    //   accessorKey: 'avgDelay',
    //   header: ({ column }) => <SortHeader column={column} label="Avg Delay" />,
    //   cell: ({ row }) => {
    //     const d = row.getValue('avgDelay') as number;
    //     return (
    //       <span className={cn('text-sm font-black', d === 0 ? 'text-emerald-600 dark:text-emerald-400' : d <= 10 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400')}>
    //         {d === 0 ? '—' : `${d}d`}
    //       </span>
    //     );
    //   },
    // },

    // 8. Outstanding
    {
      accessorKey: 'totalOutstanding',
      header: ({ column }) => <div className="text-right"><SortHeader column={column} label="Outstanding" /></div>,
      cell: ({ row }) => {
        const amt = row.getValue('totalOutstanding') as number;
        return (
          <div className="text-right">
            <span className={cn('text-sm font-black', amt > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400')}>
              {fmt(amt)}
            </span>
          </div>
        );
      },
    },

    // 9. Actions
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const c = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <Button variant="ghost" className="h-8 w-8 p-0 rounded-lg hover:bg-muted opacity-0 group-hover/row:opacity-100 focus:opacity-100 transition-opacity" />
            }>
              <span className="sr-only">Actions</span>
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-2xl border-border shadow-2xl p-1.5 w-52 bg-popover animate-in fade-in zoom-in-95 duration-150">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-[10px] font-bold text-muted-foreground uppercase px-2 py-1.5 ">Actions</DropdownMenuLabel>
                <DropdownMenuItem className="rounded-xl cursor-pointer px-2.5 py-2 text-sm font-medium flex items-center gap-2.5 hover:bg-primary/5 hover:text-primary transition-colors"
                  onClick={() => { window.location.href = `/customers/${c.id}`; }}>
                  <Eye className="w-4 h-4" /> View Profile
                </DropdownMenuItem>
                {/* <DropdownMenuItem className="rounded-xl cursor-pointer px-2.5 py-2 text-sm font-medium flex items-center gap-2.5 hover:bg-primary/5 hover:text-primary transition-colors">
                  <Mail className="w-4 h-4" /> Send Follow-up
                </DropdownMenuItem> */}
              </DropdownMenuGroup>
              {/* <DropdownMenuSeparator className="my-1 bg-border" /> */}
              {/* <DropdownMenuItem className="rounded-xl cursor-pointer px-2.5 py-2 text-sm font-medium flex items-center gap-2.5 text-muted-foreground hover:bg-muted transition-colors">
                Edit Details
              </DropdownMenuItem> */}
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

  React.useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch('/api/dashboard', { cache: 'no-store' });
        const data = await res.json();

        // Normalise customers
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
        setLadder(Array.isArray(data.settings?.escalationLadder) ? data.settings.escalationLadder : []);
      } catch (e) {
        console.error('Failed to load:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Derived metrics
  const total = customers.length;
  const low = customers.filter(c => c.riskLevel === 'Low').length;
  const med = customers.filter(c => c.riskLevel === 'Medium').length;
  const high = customers.filter(c => c.riskLevel === 'High').length;
  const outstanding = customers.reduce((s, c) => s + c.totalOutstanding, 0);
  const escalated = customers.filter(c => c.escalationReached).length;
  const paidFirst = customers.filter(c => c.paidAtStage <= 1 && c.onTimeRate > 0).length;

  // Table columns depend on ladder (re-memoize when ladder changes)
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

  // Active ladder steps for legend
  const activeLadder = ladder.length > 0 ? ladder : DEFAULT_LADDER;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in duration-500">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-0.5">
              <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <h1 className="text-2xl font-black ">Customer Intelligence</h1>
            </div>
            <p className="text-sm text-muted-foreground font-medium pl-10.5">
              Portfolio analysis · escalation journeys · AI payment behaviour
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Button variant="outline" className="h-10 rounded-xl px-4 font-semibold text-sm gap-2">
              <Download className="w-4 h-4 text-muted-foreground" /> Export
            </Button>
            <Button className="h-10 rounded-xl px-4 shadow-lg shadow-primary/20 font-semibold text-sm gap-2">
              <Plus className="w-4 h-4" /> New Customer
            </Button>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard icon={Building2} label="Portfolio" value={loading ? '—' : total} sub="Total accounts" iconBg="bg-primary/10 text-primary" />
          {/* <StatCard icon={ShieldCheck} label="Healthy" value={loading ? '—' : low} sub="Low risk" iconBg="bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400" /> */}
          <StatCard icon={Shield} label="At Watch" value={loading ? '—' : med} sub="Medium risk" iconBg="bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400" />
          <StatCard icon={ShieldAlert} label="Critical" value={loading ? '—' : high} sub="High risk" iconBg="bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400" />
          <StatCard icon={AlertTriangle} label="Escalated" value={loading ? '—' : escalated} sub="Manager involved" iconBg="bg-orange-100 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400" />
          <StatCard icon={IndianRupee} label="Outstanding" value={loading ? '—' : fmt(outstanding)} sub="Pending recovery" iconBg="bg-violet-100 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400" />
        </div>

        {/* ── Journey Legend Banner ── */}
        {!loading && (
          <div className="bg-card rounded-2xl border border-border px-5 py-4 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex items-center gap-2 shrink-0">
                <Zap className="h-4 w-4 text-amber-500" />
                <span className="text-xs font-black text-foreground uppercase ">
                  Your Escalation Ladder
                </span>
                {ladder.length === 0 && (
                  <span className="text-[10px] text-muted-foreground italic">(using defaults — configure in Settings)</span>
                )}
              </div>

              {/* Visual ladder steps */}
              <div className="flex items-center gap-0 flex-wrap">
                {activeLadder.map((step, i) => {
                  const tc = toneConfig(step.tone);
                  const Icon = tc.icon;
                  return (
                    <React.Fragment key={i}>
                      {i > 0 && <div className="h-px w-4 bg-muted-foreground/30 shrink-0" />}
                      <div className={cn('flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[10px] font-bold text-white', tc.fill)}>
                        <Icon className="h-3 w-3 shrink-0" />
                        <div>
                          <div className="leading-none">{step.label}</div>
                          <div className="text-[8px] opacity-80 font-medium leading-none mt-0.5">Day {step.delayDays} · {step.tone}</div>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}
                <div className="flex items-center gap-1 ml-2">
                  <div className="h-px w-4 bg-muted-foreground/30" />
                  <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                    <CheckCircle2 className="h-3 w-3" /> PAID
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium ml-2">or</span>
                  <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-rose-300 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 text-[10px] font-bold ml-2">
                    <XCircle className="h-3 w-3" /> OVERDUE
                  </div>
                </div>
              </div>

              {/* Risk distribution mini bar */}
              {total > 0 && (
                <div className="hidden xl:flex items-center gap-3 border-l border-border pl-4 ml-auto shrink-0">
                  <div className="w-28 h-2 rounded-full bg-muted overflow-hidden flex">
                    <div className="h-full bg-emerald-500" style={{ width: `${(low / total) * 100}%` }} />
                    <div className="h-full bg-amber-400" style={{ width: `${(med / total) * 100}%` }} />
                    <div className="h-full bg-rose-500" style={{ width: `${(high / total) * 100}%` }} />
                  </div>
                  <div className="text-[10px] font-semibold text-muted-foreground">
                    {low}L · {med}M · {high}H
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Table ── */}
        <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-b border-border bg-muted/20">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search customers…"
                value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
                onChange={e => table.getColumn('name')?.setFilterValue(e.target.value)}
                className="pl-9 h-9 rounded-xl border-border bg-background text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-semibold hidden sm:block">
                {table.getFilteredRowModel().rows.length} customers
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger render={
                  <Button variant="outline" size="sm" className="h-9 rounded-xl px-3 font-bold text-sm gap-2 bg-card" />
                }>
                  <Settings2 className="h-4 w-4" /> Columns
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-2xl border-border shadow-xl p-2 w-52 bg-card">
                  <DropdownMenuLabel className="text-[10px] font-black  text-muted-foreground uppercase px-2 py-1.5">
                    Toggle Columns
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border" />
                  {table.getAllColumns().filter(c => c.getCanHide()).map(col => (
                    <DropdownMenuCheckboxItem
                      key={col.id}
                      className="text-xs font-semibold rounded-xl focus:bg-primary/5 focus:text-primary cursor-pointer"
                      checked={col.getIsVisible()}
                      onCheckedChange={v => col.toggleVisibility(!!v)}
                    >
                      {col.id.replace(/([A-Z])/g, ' $1').trim()}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Table body */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="relative h-12 w-12">
                <div className="h-12 w-12 border-4 border-primary/10 rounded-full" />
                <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin absolute top-0 left-0" />
              </div>
              <p className="text-sm font-bold text-muted-foreground animate-pulse">Loading customers…</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30 border-b border-border">
                  {table.getHeaderGroups().map(hg => (
                    <TableRow key={hg.id} className="hover:bg-transparent border-none">
                      {hg.headers.map(h => (
                        <TableHead key={h.id} className="h-11 px-4 py-2 whitespace-nowrap">
                          {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.length ? (
                    table.getRowModel().rows.map(row => (
                      <TableRow
                        key={row.id}
                        className="group/row border-b border-border/60 last:border-0 hover:bg-primary/1.5 transition-colors duration-150"
                      >
                        {row.getVisibleCells().map(cell => (
                          <TableCell key={cell.id} className="px-4 py-3 align-middle">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="h-48 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center">
                            <Users className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <p className="text-sm font-bold text-foreground">No customers found</p>
                          <p className="text-xs text-muted-foreground">Try adjusting your search.</p>
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
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-border bg-muted/10">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {table.getFilteredRowModel().rows.length} of {total} customers · live sync
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  Rows:
                  <select
                    value={table.getState().pagination.pageSize}
                    onChange={e => table.setPageSize(Number(e.target.value))}
                    className="bg-transparent text-xs font-bold text-primary focus:outline-none cursor-pointer"
                  >
                    {[10, 15, 25, 50].map(s => (
                      <option key={s} value={s} className="bg-card text-foreground">{s}</option>
                    ))}
                  </select>
                </div>
                <span className="text-xs text-muted-foreground font-semibold">
                  Page {table.getState().pagination.pageIndex + 1} / {table.getPageCount() || 1}
                </span>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    className="h-8 w-8 p-0 rounded-lg border-border hover:bg-muted disabled:opacity-30">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    className="h-8 w-8 p-0 rounded-lg border-border hover:bg-muted disabled:opacity-30">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
