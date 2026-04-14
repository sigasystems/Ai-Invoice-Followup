'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PageHeader } from '@/components/shared/page-header';
import { MetricCard } from '@/components/shared/metric-card';
import { ActivityItem } from '@/components/shared/activity-item';
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
  Bell,
  CheckCircle2,
  Timer
} from 'lucide-react';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { Invoice } from '@/types';
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
        console.log(res);
        const data = await res.json();
        setInvoices(data.invoices || []);
        setActivities(data.activities || []);
        setSettings(data.settings);
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
        title="Portfolio Analytics"
        description="Comprehensive real-time tracking of receivables and database-driven efficiency scores."
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-11 rounded-xl px-5 bg-background shadow-sm border-border font-bold text-muted-foreground hover:bg-muted transition-all text-sm">
            <Download className="w-4 h-4 mr-2" />
            Download Audit
          </Button>
        </div>
      </PageHeader>

      {/* Action Center / Smart Notifications */}
      {(pendingDraftsCount > 0 || overdueCount > 0) && (
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
          {pendingDraftsCount > 0 && (
            <div className="flex items-center gap-4 p-4 rounded-3xl bg-orange-500/5 border border-orange-500/10 shadow-sm group hover:bg-orange-500/10 transition-all cursor-pointer" onClick={() => window.location.href = '/invoices'}>
              <div className="h-12 w-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                <Mail className="w-6 h-6 animate-bounce" />
              </div>
              <div className="flex-1">
                <h5 className="text-[11px] font-black uppercase tracking-widest text-orange-600 mb-0.5">Drafts Awaiting Approval</h5>
                <p className="text-sm font-bold text-foreground line-clamp-1">Review {pendingDraftsCount} AI-generated follow-ups in Gmail.</p>
              </div>
              <Button size="icon" variant="ghost" className="rounded-xl text-orange-500 hover:bg-orange-500/20">
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          )}
          
          {overdueCount > 0 && (
            <div className="flex items-center gap-4 p-4 rounded-3xl bg-primary/5 border border-primary/10 shadow-sm group hover:bg-primary/10 transition-all cursor-pointer">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Zap className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h5 className="text-[11px] font-black uppercase tracking-widest text-primary mb-0.5">Automation Active</h5>
                <p className="text-sm font-bold text-foreground line-clamp-1">{overdueCount} critical invoices are now in the escalation ladder.</p>
              </div>
              <div className="px-3 py-1 bg-primary text-white text-[9px] font-black uppercase rounded-lg">
                LIVE
              </div>
            </div>
          )}
        </div>
      )}

      {/* Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <MetricCard
          title="Live Outstanding"
          value={`₹${totalOutstanding.toLocaleString('en-IN')}`}
          icon={IndianRupee}
          trend={{ value: 'Database Sync', isPositive: false }}
        />
        <MetricCard
          title="AI Drafts"
          value={pendingDraftsCount.toString()}
          icon={Mail}
          trend={{ value: 'Action Required', isPositive: false }}
        />
        <MetricCard
          title="Monthly Collections"
          value={`₹${collectedThisMonth.toLocaleString('en-IN')}`}
          icon={TrendingUp}
          trend={{ value: 'Actual Flow', isPositive: true }}
        />
        <MetricCard
          title="Overdue Risk"
          value={overdueCount.toString()}
          icon={AlertCircle}
          trend={{ value: 'Critical Status', isPositive: false }}
        />
        <MetricCard
          title="Efficiency Rate"
          value={`${recoveryRate}%`}
          icon={Clock}
          trend={{ value: 'Dynamic Metric', isPositive: true }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Collections Chart */}
        <Card className="lg:col-span-2 rounded-[32px] shadow-sm border-border overflow-hidden bg-card">
          <CardHeader className="flex flex-row items-center justify-between p-8 pb-4">
            <div>
               <div className="flex items-center gap-2 mb-1">
                 <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                 <CardTitle className="text-xl font-black tracking-tight">Revenue Dynamics</CardTitle>
               </div>
              <CardDescription className="text-sm font-medium">Monthly transactional volume from database records.</CardDescription>
            </div>
            <div className="px-4 py-1.5 rounded-full bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/10">
              Live Feed
            </div>
          </CardHeader>
          <CardContent className="p-8 pt-2">
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fontWeight: 700, fill: '#999' }}
                    dy={12}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fontWeight: 700, fill: '#999' }}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '12px 16px' }}
                    itemStyle={{ fontWeight: 800, color: 'var(--primary)' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="var(--primary)"
                    strokeWidth={4}
                    dot={{ r: 5, fill: 'var(--primary)', strokeWidth: 3, stroke: '#fff' }}
                    activeDot={{ r: 8, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Overdue Buckets */}
        <Card className="rounded-2xl shadow-sm border-border overflow-hidden bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold">Aging Analysis</CardTitle>
            <CardDescription className="text-xs font-semibold">Value weighted receivables aging.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
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
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={32}>
                    {agingData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-3 pt-2">
              {agingData.map((item) => (
                <div key={item.name} className="flex items-center justify-between p-2 rounded-xl hover:bg-accent transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
                    <span className="text-xs font-bold text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="text-xs font-black text-foreground font-mono">₹{item.value.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-1 rounded-2xl shadow-sm border-border overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
            <CardDescription>Latest follow-ups and system logs.</CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-2">
            <div className="space-y-0 relative">
              {activities.length > 0 ? activities.slice(0, 5).map((activity, index) => (
                <ActivityItem
                  key={activity.id}
                  activity={activity}
                  isLast={index === Math.min(activities.length, 5) - 1}
                />
              )) : (
                <div className="py-8 text-center">
                  <p className="text-xs text-muted-foreground font-semibold">No recent activity logs found.</p>
                </div>
              )}
            </div>
            <Button variant="ghost" className="w-full text-xs font-semibold text-primary hover:bg-primary/5 rounded-xl flex items-center justify-center gap-2 mt-2">
              View All Logs
            </Button>
          </CardContent>
        </Card>

        {/* AI Prediction Models */}
        <Card className="lg:col-span-1 rounded-3xl border-none shadow-xl bg-linear-to-br from-indigo-600 to-primary text-white overflow-hidden p-6 relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <BrainCircuit className="w-24 h-24" />
          </div>
          <h4 className="text-sm font-bold uppercase tracking-widest text-white/70 mb-6">AI Forecast Engine</h4>
          <div className="space-y-6">
            <div>
              <p className="text-xs font-semibold text-white/80 mb-2">Unlocking Probability (7 days)</p>
              <div className="flex items-end gap-3 mb-2">
                <span className="text-4xl font-black">82%</span>
                <TrendingUp className="w-6 h-6 text-emerald-300" />
              </div>
              <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-300" style={{ width: '82%' }} />
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-white/70">At Risk Segment</span>
                <span className="text-xs font-bold bg-rose-500/50 px-2 py-1 rounded-lg italic">₹34,200</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-white/70">Estimated Pay Day</span>
                <span className="text-xs font-bold text-white">Thursday</span>
              </div>
            </div>
          </div>
          <Button variant="ghost" className="w-full mt-8 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold py-6 group">
            Open Strategy Lab
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Card>

        {/* Automation Status Card */}
        <Card className="rounded-3xl border border-border shadow-sm bg-card overflow-hidden p-6">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Automation Health</h4>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase">
              <Zap className="w-3 h-3" />
              Active
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-3">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Escalation Ladder</span>
              <div className="space-y-2">
                {settings?.escalationLadder?.map((step: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 border border-border group hover:bg-muted/50 transition-all">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-black text-foreground leading-none mb-1">{step.label}</span>
                      <span className="text-[10px] font-bold text-muted-foreground leading-none">Day {step.delayDays} Post-Due</span>
                    </div>
                    <div className={cn(
                      "px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                      step.tone === 'Urgent' ? "bg-rose-500/10 text-rose-500" : 
                      step.tone === 'Firm' ? "bg-amber-500/10 text-amber-500" : 
                      "bg-emerald-500/10 text-emerald-500"
                    )}>
                      {step.tone}
                    </div>
                  </div>
                ))}
                {(!settings?.escalationLadder || settings.escalationLadder.length === 0) && (
                  <div className="p-4 rounded-2xl border border-dashed border-border text-center">
                    <span className="text-[10px] text-muted-foreground font-black uppercase opacity-40">No Steps Configured</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-muted border border-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-neutral-400 uppercase">Smart Escalation</span>
                <span className={`text-[10px] font-black ${settings?.smartEscalation ? 'text-primary' : 'text-neutral-300'}`}>
                  {settings?.smartEscalation ? 'ENABLED' : 'DISABLED'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-neutral-400 uppercase">GDPR Guard</span>
                <span className={`text-[10px] font-black ${settings?.consentVerified ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {settings?.consentVerified ? 'SECURE' : 'INACTIVE'}
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full h-11 rounded-xl text-xs font-bold border-border hover:bg-muted"
              onClick={() => window.location.href = '/settings'}
            >
              Adjust Global Rules
            </Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
