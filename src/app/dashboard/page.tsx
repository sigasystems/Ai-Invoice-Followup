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
function KpiCard({ title, value, pill, positive, icon: Icon, delay = 0 }: {
  title: string; value: string; pill: string; positive: boolean;
  icon: React.ElementType; delay?: number;
}) {
  return (
    <FadeUp delay={delay}>
      <div className="flex flex-col gap-3 rounded-2xl border border-neutral-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-5 py-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_3px_16px_rgba(0,0,0,0.06)] transition-shadow duration-300">
        <div className="flex items-center justify-between">
          <span className=" font-semibold ">
            {title}
          </span>
          <div className="h-7 w-7 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
            <Icon className="h-3 w-3  " />
          </div>
        </div>
        <p className="text-[22px] font-medium tracking-tight text-neutral-900 dark:text-neutral-100 leading-none tabular-nums">
          {value}
        </p>
        <Pill label={pill} positive={positive} />
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
      'rounded-2xl border border-neutral-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden',
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
    <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-neutral-100 dark:border-neutral-800">
      <div>
        <h3 className=" font-medium text-neutral-900 dark:text-neutral-100">{title}</h3>
        {sub && <p className="text-[12px]   mt-0.5 uppercase tracking-wide">{sub}</p>}
      </div>
      {action && (
        <button
          onClick={onAction}
          className="text-[12px] text-indigo-500 dark:text-indigo-400 font-medium hover:underline flex items-center gap-1"
        >
          {action} <ArrowUpRight className="w-3 h-3" />
        </button>
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
    <span className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium uppercase tracking-wide flex-none', cls)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
      {label}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════
   Main page
═══════════════════════════════════════════════════════ */
export default function DashboardPage() {
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
            action: { label: 'Review', onClick: () => (window.location.href = '/invoices') },
          });
        }
      } catch (err) {
        console.error('Dashboard error:', err);
      }
    })();
  }, []);

  /* ── Metrics ── */
  const totalOutstanding = invoices.reduce((a, i) => i.status !== 'Paid' ? a + i.amount : a, 0);
  
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const collectedThisMonth = invoices.reduce((a, i) => {
    if (i.status !== 'Paid') return a;
    // Use updatedAt as a proxy for payment date
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
    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
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
      { name: '1–15 days',  min: 0,  max: 15,       color: '#6ee7b7' },
      { name: '16–30 days', min: 15, max: 30,       color: '#fcd34d' },
      { name: '31–45 days', min: 30, max: 45,       color: '#fca5a5' },
      { name: '45+ days',   min: 45, max: Infinity, color: '#f87171' },
    ].map(b => ({
      ...b,
      value: unpaid
        .filter(i => i.daysSinceIssue > b.min && i.daysSinceIssue <= b.max)
        .reduce((a, x) => a + x.amount, 0),
    }));
  }, [invoices]);

  const agingMax = Math.max(...agingData.map(a => a.value), 1);

  /* ── Top risk accounts ── */
  const topRisk = invoices
    .filter(i => i.status !== 'Paid')
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 4);

  /* ── Escalation steps ── */
  const steps = settings?.escalationLadder?.slice(0, 3) ?? [];
  const TONE: Record<string, string> = {
    Urgent:   'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400',
    Firm:     'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-500',
    Friendly: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
  };

  if (!mounted) return null;

  return (
    <DashboardLayout>

      {/* ── Page header ─────────────────────────────── */}
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

      {/* ── Alert banners ───────────────────────────── */}
      <AnimatePresence>
        {(pendingDrafts > 0 || overdueCount > 0) && (
          <FadeUp delay={0.05} className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-7">

            {pendingDrafts > 0 && (
              <button
                onClick={() => (window.location.href = '/invoices')}
                className="group flex items-center gap-3 px-4 py-3 rounded-2xl border border-amber-200/60 dark:border-amber-800/30 bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors text-left w-full"
              >
                <div className="h-9 w-9 flex-none rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-0.5">
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
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-neutral-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                <div className="h-9 w-9 flex-none rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-indigo-500 dark:text-indigo-400 uppercase tracking-wide mb-0.5">
                    Automation active
                  </p>
                  <p className=" font-medium text-neutral-800 dark:text-neutral-200 truncate">
                    {overdueCount} invoice{overdueCount > 1 ? 's' : ''} in escalation loop
                  </p>
                </div>
                <LiveChip label="Live" />
              </div>
            )}
          </FadeUp>
        )}
      </AnimatePresence>

      {/* ── KPI grid ────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-7">
        <KpiCard title="Outstanding"   value={`₹${totalOutstanding.toLocaleString('en-IN')}`}  pill="Pending collection" positive={false} icon={IndianRupee} delay={0.08} />
        <KpiCard title="AI follow-ups" value={pendingDrafts.toString()}                         pill="Needs review"       positive={false} icon={Mail}        delay={0.12} />
        <KpiCard title="Collected"     value={`₹${collectedThisMonth.toLocaleString('en-IN')}`} pill="This month"         positive={true}  icon={TrendingUp}  delay={0.16} />
        <KpiCard title="At risk"       value={overdueCount.toString()}                          pill="Overdue"            positive={false} icon={AlertCircle} delay={0.2}  />
        <KpiCard title="Recovery rate" value={`${recoveryRate}%`}                               pill="Efficiency"         positive={true}  icon={Clock}       delay={0.24} />
      </div>

      {/* ── Revenue chart + Aging ────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">

        {/* Revenue dynamics */}
        <FadeUp delay={0.28} className="lg:col-span-2">
          <Shell className="h-full">
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-neutral-100 dark:border-neutral-800">
              <div>
                <h3 className=" font-medium text-neutral-900 dark:text-neutral-100">Revenue dynamics</h3>
                <p className="text-[12px]   mt-0.5">
                  Monthly invoiced vs. recovered — last 6 months
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-indigo-400" />
                  <span className="text-[12px]  uppercase tracking-wide">Invoiced</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span className="text-[12px]  uppercase tracking-wide">Recovered</span>
                </div>
                <LiveChip label="Real-time" variant="emerald" />
              </div>
            </div>
            <div className="px-4 pt-5 pb-5">
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--border)" opacity={0.4} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false}
                    tick={{ fontSize: 11, fontWeight: 400, fill: '#9ca3af' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} width={50}
                    tick={{ fontSize: 11, fontWeight: 400, fill: '#9ca3af' }}
                    tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    content={<ChartTooltip />}
                    cursor={{ stroke: '#c7d2fe', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Line
                    type="monotone" name="Invoiced" dataKey="invoiced"
                    stroke="#818cf8" strokeWidth={2}
                    dot={{ r: 3.5, fill: '#818cf8', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 5, strokeWidth: 0 }} animationDuration={1200}
                  />
                  <Line
                    type="monotone" name="Recovered" dataKey="collected"
                    stroke="#34d399" strokeWidth={2} strokeDasharray="6 3"
                    dot={{ r: 3.5, fill: '#34d399', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 5, strokeWidth: 0 }} animationDuration={1600}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Shell>
        </FadeUp>

        {/* Aging analysis */}
        <FadeUp delay={0.32}>
          <Shell className="h-full">
            <SectionHead title="Aging analysis" sub="Weighted receivables" />
            <div className="px-5 py-5 space-y-4">
              {agingData.map(item => (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full flex-none" style={{ background: item.color, opacity: 0.85 }} />
                      <span className="text-[12px] font-medium  dark:">{item.name}</span>
                    </div>
                    <span className="text-[12px] font-medium  tabular-nums">
                      ₹{item.value.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${(item.value / agingMax) * 100}%`, background: item.color, opacity: 0.75 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Shell>
        </FadeUp>
      </div>

      {/* ── Workflow + Exposure ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Workflow integrity */}
        <FadeUp delay={0.36}>
          <Shell className="h-full">
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-neutral-100 dark:border-neutral-800">
              <div>
                <h3 className=" font-medium text-neutral-900 dark:text-neutral-100">Workflow integrity</h3>
                <p className="text-[12px]   mt-0.5 uppercase tracking-wide">
                  Escalation ladder
                </p>
              </div>
              <LiveChip label="Optimal" variant="emerald" />
            </div>

            <div className="px-5 py-4 space-y-2">
              {steps.length > 0 ? steps.map((step: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors"
                >
                  <span className="h-5 w-5 rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-500 text-[12px] font-medium flex items-center justify-center flex-none">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-neutral-800 dark:text-neutral-200">{step.label}</p>
                    <p className="text-[12px]  mt-0.5">Day {step.delayDays}</p>
                  </div>
                  <span className={cn('px-2 py-0.5 rounded-lg text-[12px] font-medium', TONE[step.tone] ?? 'bg-neutral-100 text-neutral-500')}>
                    {step.tone}
                  </span>
                </div>
              )) : (
                <p className="text-xs  text-center py-6">No escalation steps configured.</p>
              )}

              {/* Smart escalation toggle */}
              <div className="flex items-center justify-between px-3 py-3 border-t border-neutral-100 dark:border-neutral-800 mt-1">
                <div>
                  <p className="text-xs font-medium text-neutral-800 dark:text-neutral-200">Smart escalation</p>
                  <p className="text-[12px]  mt-0.5">AI decision path</p>
                </div>
                <div className={cn(
                  'h-5 w-9 rounded-full flex items-center px-0.5 transition-colors',
                  settings?.smartEscalation
                    ? 'bg-indigo-400 dark:bg-indigo-500'
                    : 'bg-neutral-200 dark:bg-neutral-700'
                )}>
                  <div className={cn(
                    'h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200',
                    settings?.smartEscalation ? 'translate-x-4' : 'translate-x-0'
                  )} />
                </div>
              </div>

              <button
                onClick={() => (window.location.href = '/settings')}
                className="w-full mt-1 px-3 py-2 text-xs font-medium text-indigo-500 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                Configure workflows <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </Shell>
        </FadeUp>

        {/* Exposure analysis */}
        <FadeUp delay={0.4} className="lg:col-span-2">
          <Shell className="h-full">
            <SectionHead
              title="Exposure analysis"
              sub="Top default-risk accounts"
              action="View all"
              onAction={() => (window.location.href = '/invoices')}
            />

            {topRisk.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <CheckCircle2 className="w-7 h-7 text-emerald-400 mb-2" />
                <p className=" ">All accounts are current</p>
              </div>
            ) : (
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {topRisk.map((inv, idx) => {
                  const pct = Math.min(100, (inv.daysSinceIssue / 60) * 100);
                  const high = inv.daysSinceIssue > 30;
                  return (
                    <div
                      key={idx}
                      className="flex flex-col gap-3 p-4 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-800/20 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-neutral-800 dark:text-neutral-200 truncate">
                            {inv.customerName}
                          </p>
                          <p className="text-[12px]  mt-0.5 uppercase tracking-wide">
                            {inv.invoice_number}
                          </p>
                        </div>
                        <div className="text-right flex-none">
                          <p className={cn(
                            ' font-medium tabular-nums',
                            high ? 'text-rose-500' : 'text-amber-600'
                          )}>
                            ₹{inv.amount.toLocaleString('en-IN')}
                          </p>
                          <p className="text-[12px]  mt-0.5">
                            {inv.daysSinceIssue}d old
                          </p>
                        </div>
                      </div>
                      <div>
                        <div className="h-1 w-full rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden mb-1.5">
                          <div
                            className={cn('h-full rounded-full', high ? 'bg-rose-300' : 'bg-amber-300')}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[12px] ">
                          <span>Risk exposure</span>
                          <span className={high ? 'text-rose-500' : 'text-amber-500'}>
                            {pct.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Shell>
        </FadeUp>
      </div>

    </DashboardLayout>
  );
}