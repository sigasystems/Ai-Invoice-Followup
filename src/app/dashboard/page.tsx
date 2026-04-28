'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import {
  Mail, Zap, TrendingUp, AlertCircle, Clock,
  IndianRupee, Download, ArrowRight, ArrowUpRight,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { Invoice } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

/* ─── Fade-up motion wrapper ─────────────────────────── */
function FadeUp({ children, delay = 0, className }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const compactCurrency = (val: number) => {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
  return `₹${val.toLocaleString('en-IN')}`;
};

/* ─── Status pill ────────────────────────────────────── */
function Pill({ label, positive }: { label: string; positive: boolean }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 text-[12px] font-medium tracking-wide px-2 py-0.5 rounded-full',
      positive
        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
        : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
    )}>
      {label}
    </span>
  );
}

/* ─── KPI card ───────────────────────────────────────── */
function KpiCard({ title, value, fullValue, pill, positive, icon: Icon, delay = 0, isPrimary = false }: {
  title: string; value: string; fullValue?: string; pill: string; positive: boolean;
  icon: React.ElementType; delay?: number; isPrimary?: boolean;
}) {
  return (
    <FadeUp delay={delay}>
      <div
        title={fullValue}
        className={cn(
          "flex flex-col gap-4 rounded-xl px-6 py-6 shadow-sm transition-all duration-300 group cursor-default h-full min-h-40",
          isPrimary
            ? "bg-primary text-white shadow-xl shadow-primary/30"
            : "bg-white dark:bg-neutral-900 border border-border/50 hover:shadow-lg"
        )}
      >
        <div className="flex items-center justify-between">
          <span className={cn("text-sm font-bold opacity-70", isPrimary ? "text-white" : "text-BLACK/80")}>
            {title}
          </span>
          <div className={cn(
            "h-10 w-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110",
            isPrimary ? "bg-white/20" : "bg-primary/5"
          )}>
            <Icon className={cn("h-5 w-5", isPrimary ? "text-white" : "text-primary")} />
          </div>
        </div>
        <div className="mt-auto">
          <p className={cn("text-3xl font-bold tracking-tight leading-none tabular-nums", isPrimary ? "text-white" : "text-foreground")}>
            {value}
          </p>
          <div className="mt-3">
            <Pill label={pill} positive={positive} />
          </div>
        </div>
      </div>
    </FadeUp>
  );
}

/* ─── Custom chart tooltip ───────────────────────────── */
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-lg px-4 py-3 text-xs">
      <p className="font-medium text-neutral-600 dark: mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2 text-neutral-500 dark: mb-1 last:mb-0">
          <span className="h-2 w-2 rounded-full flex-none" style={{ background: p.stroke }} />
          <span>{p.name}:</span>
          <span className="font-medium text-neutral-800 dark:text-neutral-200">
            ₹{Number(p.value).toLocaleString('en-IN')}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ─── Card shell ─────────────────────────────────────── */
function Shell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn(
      'rounded-xl border border-border/50 bg-white dark:bg-neutral-900 shadow-sm overflow-hidden',
      className
    )}>
      {children}
    </div>
  );
}

/* ─── Card section header ────────────────────────────── */
function SectionHead({ title, sub, action, onAction }: {
  title: string; sub?: string; action?: string; onAction?: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border/40">
      <div>
        <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{title}</h3>
        {sub && <p className="text-[11px] font-bold text-muted-foreground/80 mt-0.5 tracking-wider">{sub}</p>}
      </div>
      {action && (
        <Button
          onClick={onAction}
          variant="outline"
          size="sm"
          className="rounded-lg h-9 px-4 font-bold text-xs gap-2 border-border/60 hover:bg-muted"
        >
          {action} <ArrowUpRight className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}

/* ─── Live chip ──────────────────────────────────────── */
function LiveChip({ label, variant = 'indigo' }: { label: string; variant?: 'indigo' | 'emerald' }) {
  const cls = variant === 'emerald'
    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
    : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400';
  return (
    <span className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-bold tracking-wide flex-none', cls)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
      {label}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════
   Main page
   ═══════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const router = useRouter();
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [settings, setSettings] = React.useState<any>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    (async () => {
      try {
        const res = await fetch('/api/dashboard');
        const data = await res.json();
        setInvoices(data.invoices ?? []);
        setSettings(data.settings);
        const pendingCount = (data.invoices ?? []).filter((i: any) => i.hasPendingDraft).length;
        if (pendingCount > 0) {
          toast.message('AI drafts ready', {
            description: `${pendingCount} reminder${pendingCount > 1 ? 's' : ''} awaiting approval.`,
            action: { label: 'Review', onClick: () => router.push('/activity') },
          });
        }
      } catch (err) {
        console.error('Dashboard error:', err);
      }
    })();
  }, []);

  /* ── Metrics ── */
  const totalOutstanding = invoices.reduce((a, i) => i.status !== 'Paid' ? a + i.amount : a, 0);
  console.log('Total Outstanding', totalOutstanding);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const collectedThisMonth = invoices.reduce((a, i) => {
    if (i.status !== 'Paid') return a;
    const paymentDate = new Date(i.updatedAt);
    const isThisMonth = paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
    return isThisMonth ? a + i.amount : a;
  }, 0);
  const overdueCount = invoices.filter(i => i.status === 'Overdue').length;
  const pendingDrafts = invoices.filter(i => i.hasPendingDraft).length;
  const recoveryRate = invoices.length > 0
    ? ((invoices.filter(i => i.status === 'Paid').length / invoices.length) * 100).toFixed(1)
    : '0.0';

  /* ── Chart data: last 6 months ── */
  const chartData = React.useMemo(() => {
    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const [tm, ty] = [d.getMonth(), d.getFullYear()];

      const invoicedInMonth = invoices.filter(inv => {
        const id = new Date(inv.issueDate);
        return id.getMonth() === tm && id.getFullYear() === ty;
      }).reduce((s, inv) => s + inv.amount, 0);

      const recoveredInMonth = invoices.filter(inv => {
        if (inv.status !== 'Paid') return false;
        const pd = new Date(inv.updatedAt);
        return pd.getMonth() === tm && pd.getFullYear() === ty;
      }).reduce((s, inv) => s + inv.amount, 0);

      return {
        name: MONTHS[tm],
        invoiced: invoicedInMonth,
        collected: recoveredInMonth,
      };
    });
  }, [invoices]);

  /* ── Aging buckets ── */
  const agingData = React.useMemo(() => {
    const unpaid = invoices.filter(i => i.status !== 'Paid');
    return [
      { name: '1–15 days', min: 0, max: 15, color: '#6ee7b7' },
      { name: '16–30 days', min: 15, max: 30, color: '#fcd34d' },
      { name: '31–45 days', min: 30, max: 45, color: '#fca5a5' },
      { name: '45+ days', min: 45, max: Infinity, color: '#f87171' },
    ].map(b => ({
      ...b,
      value: unpaid
        .filter(i => i.daysSinceIssue > b.min && i.daysSinceIssue <= b.max)
        .reduce((a, x) => a + x.amount, 0),
    }));
  }, [invoices]);

  const agingMax = Math.max(...agingData.map(a => a.value), 1);

  if (!mounted) return null;

  return (
    <DashboardLayout>
      <PageHeader
        title="Dashboard"
        description="Portfolio performance, automation health & collection dynamics."
      >
        <Button
          variant="outline"
          className="rounded-xl text-xs font-medium gap-2 border-neutral-200 dark:border-neutral-700 h-9 px-4"
        >
          <Download className="w-3.5 h-3.5" />
          Audit report
        </Button>
      </PageHeader>

      <AnimatePresence>
        {(pendingDrafts > 0 || overdueCount > 0) && (
          <FadeUp delay={0.05} className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-7">
            {pendingDrafts > 0 && (
              <button
                onClick={() => router.push('/activity')}
                className="group flex items-center gap-3 px-4 py-3 rounded-2xl border border-amber-200/60 dark:border-amber-800/30 bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors text-left w-full"
              >
                <div className="h-9 w-9 flex-none rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold text-amber-700 dark:text-amber-400 tracking-wide mb-0.5">
                    AI assistance required
                  </p>
                  <p className=" font-medium text-neutral-800 dark:text-neutral-200 truncate">
                    {pendingDrafts} draft{pendingDrafts > 1 ? 's' : ''} awaiting your review
                  </p>
                </div>
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse flex-none" />
                <ArrowRight className="w-4 h-4  group-hover:translate-x-0.5 transition-transform flex-none" />
              </button>
            )}

            {overdueCount > 0 && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border/50 bg-white dark:bg-neutral-900 shadow-sm">
                <div className="h-9 w-9 flex-none rounded-lg bg-primary/10 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-primary tracking-wider mb-0.5">
                    Automation active
                  </p>
                  <p className="font-bold text-neutral-900 dark:text-neutral-100 truncate">
                    {overdueCount} invoice{overdueCount > 1 ? 's' : ''} in escalation loop
                  </p>
                </div>
                <LiveChip label="Live" />
              </div>
            )}
          </FadeUp>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <KpiCard title="Total earning" value={`₹${totalOutstanding.toLocaleString('en-IN')}`} fullValue={`₹${totalOutstanding.toLocaleString('en-IN')}`} pill="Pending collection" positive={false} icon={IndianRupee} delay={0.08} isPrimary={true} />
        <KpiCard title="Total spending" value={`₹${collectedThisMonth.toLocaleString('en-IN')}`} fullValue={`₹${collectedThisMonth.toLocaleString('en-IN')}`} pill="This month" positive={true} icon={TrendingUp} delay={0.16} />
        <KpiCard title="Risk Count" value={overdueCount.toString()} pill="Overdue" positive={false} icon={AlertCircle} delay={0.2} />
        <KpiCard title="Goal this month" value={`${recoveryRate}%`} pill="Efficiency" positive={true} icon={Clock} delay={0.24} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 xl:grid-cols-3 gap-5 mb-5">
        <FadeUp delay={0.28} className="xl:col-span-2">
          <Shell className="h-full">
            <SectionHead title="Revenue dynamics" sub="Monthly invoiced vs. recovered" />
            <div className="flex items-center justify-between px-5 pt-0 pb-4">
              <div />
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-indigo-400" />
                  <span className="text-[12px] font-bold tracking-wide">Invoiced</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span className="text-[12px] font-bold tracking-wide">Recovered</span>
                </div>
              </div>
            </div>
            <div className="px-4 pt-5 pb-5">
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--border)" opacity={0.4} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 400, fill: '#9ca3af' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} width={50} tick={{ fontSize: 11, fontWeight: 400, fill: '#9ca3af' }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#c7d2fe', strokeWidth: 1, strokeDasharray: '4 4' }} />
                  <Line type="monotone" name="Invoiced" dataKey="invoiced" stroke="#818cf8" strokeWidth={2} dot={{ r: 3.5, fill: '#818cf8', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 5, strokeWidth: 0 }} animationDuration={1200} />
                  <Line type="monotone" name="Recovered" dataKey="collected" stroke="#34d399" strokeWidth={2} strokeDasharray="6 3" dot={{ r: 3.5, fill: '#34d399', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 5, strokeWidth: 0 }} animationDuration={1600} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Shell>
        </FadeUp>

        <FadeUp delay={0.32}>
          <Shell className="h-full">
            <SectionHead title="Aging analysis" sub="Weighted receivables" />
            <div className="px-5 py-5 space-y-4">
              {agingData.map(item => (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="h-2 w-2 rounded-full flex-none" style={{ background: item.color, opacity: 0.85 }} />
                      <span className="text-[12px] truncate">{item.name}</span>
                    </div>
                    <span className="text-[12px] font-bold text-foreground tabular-nums break-all text-right">
                      ₹{item.value.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-lg bg-muted/50 overflow-hidden">
                    <div
                      className="h-full rounded-lg transition-all duration-700"
                      style={{ width: `${(item.value / agingMax) * 100}%`, background: item.color, opacity: 0.75 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Shell>
        </FadeUp>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 xl:grid-cols-3 gap-6">
        <FadeUp delay={0.36} className="xl:col-span-2">
          <Shell className="h-full">
            <SectionHead title="New invoice" sub="Recently generated records" action="View all" onAction={() => router.push('/invoices')} />
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border/40">
                    <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground/60 tracking-wider">Invoice ID</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground/60 tracking-wider">Invoice Name</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground/60 tracking-wider">Date</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground/60 tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {invoices.slice(0, 4).map((inv) => (
                    <tr key={inv.id} className="hover:bg-muted/30 transition-colors group cursor-pointer" onClick={() => router.push(`/invoices/${inv.id}`)}>
                      <td className="px-6 py-4 text-sm font-bold text-foreground group-hover:text-primary">{inv.invoice_number}</td>
                      <td className="px-6 py-4 text-sm font-medium text-muted-foreground">{inv.customerName}</td>
                      <td className="px-6 py-4 text-sm font-medium text-muted-foreground">{new Date(inv.issueDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-sm font-bold text-foreground">₹{inv.amount.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Shell>
        </FadeUp>

        <FadeUp delay={0.4}>
          <Shell className="h-full">
            <SectionHead title="Recent activity" sub="System audit trail" action="History" onAction={() => router.push('/activity')} />
            <div className="p-6 space-y-6">
              {invoices.slice(0, 4).map((inv, i) => (
                <div key={i} className="flex items-center gap-4 group cursor-pointer" onClick={() => router.push('/activity')}>
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0 group-hover:scale-110 transition-transform">
                    {inv.customerName?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-bold text-foreground truncate">{inv.customerName}</p>
                      <span className="text-[10px] font-bold text-muted-foreground/60 whitespace-nowrap">{inv.invoice_number}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <p className="text-xs font-medium text-muted-foreground truncate">{inv.status === 'Paid' ? 'Payment confirmed' : 'Invoice generated'}</p>
                      <span className="text-xs font-bold text-foreground">₹{inv.amount.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Shell>
        </FadeUp>
      </div>
    </DashboardLayout>
  );
}