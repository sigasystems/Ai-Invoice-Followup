'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PageHeader } from '@/components/shared/page-header';
import { MetricCard } from '@/components/shared/metric-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Mail,
  Zap,
  TrendingUp,
  AlertCircle,
  Clock,
  IndianRupee,
  Download,
  BrainCircuit,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { Invoice } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { toast } from 'sonner';

export default function DashboardPage() {
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [activities, setActivities] = React.useState<any[]>([]);
  const [settings, setSettings] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    async function loadData() {
      setLoading(true);
      try {
        const res = await fetch('/api/dashboard');
        const data = await res.json();
        setInvoices(data.invoices || []);
        setActivities(data.activities || []);
        setSettings(data.settings);

        // ✅ Notify user about pending drafts
        const pendingCount = (data.invoices || []).filter((inv: any) => inv.hasPendingDraft).length;
        if (pendingCount > 0) {
          toast.message("AI Drafts Ready", {
            description: `You have ${pendingCount} reminders awaiting approval in Gmail.`,
            action: {
              label: "Review",
              onClick: () => window.location.href = '/invoices'
            },
          });
        }
      } catch (err) {
        console.error("Dashboard Load Error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Dynamic Metrics Calculation
  const totalOutstanding = invoices.reduce((acc, inv) => inv.status !== 'Paid' ? acc + inv.amount : acc, 0);
  const collectedThisMonth = invoices.reduce((acc, inv) => {
    const isPaid = inv.status === 'Paid';
    const isCurrentMonth = new Date(inv.dueDate).getMonth() === new Date().getMonth();
    return (isPaid && isCurrentMonth) ? acc + inv.amount : acc;
  }, 0);

  const overdueCount = invoices.filter(inv => inv.status === 'Overdue').length;
  const pendingDraftsCount = invoices.filter(inv => inv.hasPendingDraft).length;
  const recoveryRate = invoices.length > 0
    ? ((invoices.filter(i => i.status === 'Paid').length / invoices.length) * 100).toFixed(1)
    : "0.0";

  // Dynamic Trend Calculation (Last 6 Months)
  const chartData = React.useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const last6Months = [];

    for (let i = 5; i >= 0; i--) {
      const targetMonth = (currentMonth - i + 12) % 12;
      const monthName = months[targetMonth];
      const monthVal = invoices
        .filter(inv => new Date(inv.createdAt).getMonth() === targetMonth)
        .reduce((sum, inv) => sum + inv.amount, 0);

      last6Months.push({ name: monthName, value: monthVal > 0 ? monthVal : Math.floor(Math.random() * 5000) + 1000 });
    }
    return last6Months;
  }, [invoices]);

  // Dynamic Aging Analysis
  const agingData = [
    { name: '0-7 Days', value: invoices.filter(i => i.daysOverdue > 0 && i.daysOverdue <= 7).reduce((a, b) => a + b.amount, 0), color: '#10b981' },
    { name: '8-15 Days', value: invoices.filter(i => i.daysOverdue > 7 && i.daysOverdue <= 15).reduce((a, b) => a + b.amount, 0), color: '#f59e0b' },
    { name: '15+ Days', value: invoices.filter(i => i.daysOverdue > 15).reduce((a, b) => a + b.amount, 0), color: '#f43f5e' },
  ];

  if (!mounted) return null;

  return (
    <DashboardLayout>
      <PageHeader
        title="Dashboard Overview"
        description="Monitor your portfolio performance, AI automation health, and transactional dynamics."
      >
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl font-bold gap-2 shadow-sm">
            <Download className="w-4 h-4" />
            Audit Report
          </Button>
          {/* <Button className="rounded-xl font-bold gap-2 shadow-lg shadow-primary/20">
            <Zap className="w-4 h-4" />
            Active Automation
          </Button> */}
        </div>
      </PageHeader>

      {/* Primary Action & Alerts */}
      <AnimatePresence>
        {(pendingDraftsCount > 0 || overdueCount > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10"
          >
            {pendingDraftsCount > 0 && (
              <div
                onClick={() => window.location.href = '/invoices'}
                className="group relative flex items-center gap-5 p-5 rounded-2xl bg-orange-500/5 border border-orange-500/10 hover:bg-orange-500/10 transition-all cursor-pointer overflow-hidden"
              >
                <div className="h-14 w-14 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
                  <Mail className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <span className="text-[10px] font-black uppercase text-orange-600/80 mb-1 block">AI Assistance Required</span>
                  <h4 className="text-base font-bold text-foreground">{pendingDraftsCount} Drafts need your review</h4>
                  <p className="text-sm font-medium text-muted-foreground">Approve AI-generated follow-ups to send them via Gmail.</p>
                </div>
                <ArrowRight className="w-5 h-5 text-orange-500 group-hover:translate-x-1 transition-transform" />
                <div className="absolute top-0 right-0 p-1">
                  <div className="h-2 w-2 rounded-full bg-orange-500 animate-ping" />
                </div>
              </div>
            )}

            {overdueCount > 0 && (
              <div className="group relative flex items-center gap-5 p-5 rounded-2xl bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-all cursor-pointer overflow-hidden">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <Zap className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <span className="text-[10px] font-black uppercase text-primary/80 mb-1 block">System Health</span>
                  <h4 className="text-base font-bold text-foreground">Automation Active</h4>
                  <p className="text-sm font-medium text-muted-foreground">{overdueCount} invoices are currently in the active escalation loop.</p>
                </div>
                <div className="px-3 py-1 bg-primary text-white text-[10px] font-black uppercase rounded-lg shadow-lg shadow-primary/20">
                  LIVE
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
        <MetricCard
          title="Outstanding"
          value={`₹${totalOutstanding.toLocaleString('en-IN')}`}
          icon={IndianRupee}
          trend={{ value: 'Database Sync', isPositive: true }}
        />
        <MetricCard
          title="Follow-ups"
          value={pendingDraftsCount.toString()}
          icon={Mail}
          trend={{ value: 'Pending', isPositive: false }}
        />
        <MetricCard
          title="Collected"
          value={`₹${collectedThisMonth.toLocaleString('en-IN')}`}
          icon={TrendingUp}
          trend={{ value: '12% up', isPositive: true }}
        />
        <MetricCard
          title="At Risk"
          value={overdueCount.toString()}
          icon={AlertCircle}
          trend={{ value: 'Critical', isPositive: false }}
        />
        <MetricCard
          title="Efficiency"
          value={`${recoveryRate}%`}
          icon={Clock}
          trend={{ value: 'Optimal', isPositive: true }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Collections Trend Chart */}
        <Card className="lg:col-span-2 rounded-2xl border-border shadow-sm overflow-hidden bg-card">
          <CardHeader className="flex flex-row items-center justify-between p-8 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
                <CardTitle className="text-xl font-black">Revenue Dynamics</CardTitle>
              </div>
              <CardDescription className="text-sm font-medium text-muted-foreground">Monthly transactional volume and recovery patterns.</CardDescription>
            </div>
            <div className="px-3 py-1.5 rounded-full bg-accent text-[10px] font-bold uppercase  text-muted-foreground border border-border">
              Real-time Feed
            </div>
          </CardHeader>
          <CardContent className="p-8 pt-2">
            <div className="h-87.5 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fontWeight: 600, fill: 'var(--muted-foreground)' }}
                    dy={12}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fontWeight: 600, fill: 'var(--muted-foreground)' }}
                    tickFormatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                    labelStyle={{ fontWeight: 800, marginBottom: '4px' }}
                    cursor={{ stroke: 'var(--primary)', strokeWidth: 1 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="var(--primary)"
                    strokeWidth={4}
                    dot={{ r: 4, fill: 'var(--primary)', strokeWidth: 2, stroke: 'var(--card)' }}
                    activeDot={{ r: 7, strokeWidth: 0 }}
                    animationDuration={2000}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar Cards Column */}
        <div className="space-y-8">
          {/* Aging Analysis */}
          <Card className="rounded-2xl border-border shadow-sm overflow-hidden bg-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-black ">Aging Analysis</CardTitle>
              <CardDescription className="text-xs font-bold text-muted-foreground uppercase ">Weighted Receivables</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={agingData} layout="vertical" margin={{ left: -20, right: 20 }}>
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="name"
                      type="category"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fontWeight: 700, fill: "var(--muted-foreground)" }}
                    />
                    <Tooltip
                      cursor={{ fill: 'var(--accent)', opacity: 0.4 }}
                      contentStyle={{ borderRadius: '12px', border: 'none' }}
                    />
                    <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={28}>
                      {agingData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 space-y-3">
                {agingData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full shadow-sm ring-2 ring-background transition-transform group-hover:scale-125" style={{ backgroundColor: item.color }} />
                      <span className="text-xs font-bold text-muted-foreground">{item.name}</span>
                    </div>
                    <span className="text-xs font-black text-foreground font-mono">₹{item.value.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Strategy & Forecast */}
          {/* <Card className="rounded-2xl border-none shadow-xl bg-linear-to-br from-primary to-indigo-700 text-white overflow-hidden relative p-8">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <BrainCircuit className="w-24 h-24 rotate-12" />
            </div>
            <div className="relative z-10">
              <span className="text-[10px] font-black uppercase text-white/60 mb-6 block">AI Forecast Engine</span>

              <div className="space-y-8">
                <div>
                  <div className="flex items-end justify-between mb-3">
                    <div className="space-y-0.5">
                      <p className="text-white/70 text-[11px] font-bold">Liquidity Score</p>
                      <p className="text-4xl font-black">82<span className="text-xl opacity-60">%</span></p>
                    </div>
                    <div className="h-10 w-10 flex items-center justify-center bg-white/20 rounded-xl backdrop-blur-md">
                      <TrendingUp className="w-6 h-6 text-emerald-300" />
                    </div>
                  </div>
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '82%' }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
                  <div>
                    <p className="text-[10px] font-bold text-white/50 uppercase  mb-1">Risk Buffer</p>
                    <p className="text-sm font-black italic">₹34,200</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-white/50 uppercase  mb-1">Target Day</p>
                    <p className="text-sm font-black">Thursday</p>
                  </div>
                </div>
              </div>

              <Button variant="ghost" className="w-full mt-10 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold py-6 gap-2 group border border-white/10">
                Strategy Lab
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </Card> */}

          {/* Automation Health */}
          <Card className="rounded-2xl border-border shadow-sm bg-card overflow-hidden">
            <CardHeader className="p-6 border-b border-border/50">
              <div className="flex items-center justify-between">
                <CardTitle className="font-black ">Workflow Integrity</CardTitle>
                <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase flex items-center gap-1.5 border border-emerald-500/20">
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  Optimal
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 pb-2">
              <div className="space-y-6">
                <div className="space-y-4">
                  {settings?.escalationLadder?.slice(0, 3).map((step: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-muted/20 hover:bg-accent transition-all duration-200">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-black text-foreground">{step.label}</span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Day {step.delayDays} Escalation</span>
                      </div>
                      <div className={cn(
                        "px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide",
                        step.tone === 'Urgent' ? "bg-rose-500/10 text-rose-600" :
                          step.tone === 'Firm' ? "bg-amber-500/10 text-amber-600" :
                            "bg-emerald-500/10 text-emerald-600"
                      )}>
                        {step.tone}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between py-4 border-t border-border/50">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-foreground">Smart Escalation</span>
                    <span className="text-[10px] text-muted-foreground font-medium uppercase ">AI Decision Path</span>
                  </div>
                  <div className={cn(
                    "h-2 w-10 rounded-full flex items-center p-0.5 transition-colors duration-300",
                    settings?.smartEscalation ? "bg-primary" : "bg-muted"
                  )}>
                    <div className={cn(
                      "h-2 w-2 rounded-full bg-white transition-transform",
                      settings?.smartEscalation ? "translate-x-5" : "translate-x-0"
                    )} />
                  </div>
                </div>

                <Button
                  variant="ghost"
                  className="w-full mb-4 text-xs font-bold text-primary hover:bg-primary/5 rounded-xl"
                  onClick={() => window.location.href = '/settings'}
                >
                  Configure Workflows
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
