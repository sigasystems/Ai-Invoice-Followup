'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PageHeader } from '@/components/shared/page-header';
import { MetricCard } from '@/components/shared/metric-card';
import { ActivityItem } from '@/components/shared/activity-item';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  IndianRupee,
  TrendingUp,
  AlertCircle,
  Clock,
  Download,
  BrainCircuit,
  ArrowRight,
  Zap
} from 'lucide-react';
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

const chartData = [
  { name: 'Jan', value: 45000 },
  { name: 'Feb', value: 52000 },
  { name: 'Mar', value: 48000 },
  { name: 'Apr', value: 61000 },
  { name: 'May', value: 55000 },
  { name: 'Jun', value: 67000 },
];

const overdueData = [
  { name: '0-7 Days', value: 12400, color: '#10b981' },
  { name: '7-15 Days', value: 8200, color: '#f59e0b' },
  { name: '15+ Days', value: 15400, color: '#f43f5e' },
];

export default function DashboardPage() {
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [activities, setActivities] = React.useState<any[]>([]);
  const [settings, setSettings] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await fetch('/api/dashboard');
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

  const totalOutstanding = invoices.reduce((acc, inv) => inv.status !== 'Paid' ? acc + inv.amount : acc, 0);
  const collectedThisMonth = invoices.reduce((acc, inv) => inv.status === 'Paid' ? acc + inv.amount : acc, 0);
  const overdueCount = invoices.filter(inv => inv.status === 'Overdue').length;
  const recoveryRate = invoices.length > 0 ? ((invoices.filter(i => i.status === 'Paid').length / invoices.length) * 100).toFixed(1) : "0.0";

  // Dynamic Aging Analysis
  const agingData = [
    { name: '0-7 Days', value: invoices.filter(i => i.daysOverdue > 0 && i.daysOverdue <= 7).reduce((a, b) => a + b.amount, 0), color: '#10b981' },
    { name: '8-15 Days', value: invoices.filter(i => i.daysOverdue > 7 && i.daysOverdue <= 15).reduce((a, b) => a + b.amount, 0), color: '#f59e0b' },
    { name: '15+ Days', value: invoices.filter(i => i.daysOverdue > 15).reduce((a, b) => a + b.amount, 0), color: '#f43f5e' },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Dashboard"
        description="Monitor collections and upcoming receivables in real-time."
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-10 rounded-xl bg-background shadow-sm border-border font-semibold text-foreground">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          {/* <Button variant="default" size="sm" className="h-10 rounded-xl font-bold shadow-lg shadow-primary/20">
             <Plus className="w-4 h-4 mr-2" />
             New Invoice
           </Button> */}
        </div>
      </PageHeader>

      {/* Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          title="Total Outstanding"
          value={`₹${totalOutstanding.toLocaleString('en-IN')}`}
          icon={IndianRupee}
          trend={{ value: 'Real-time', isPositive: false }}
        />
        <MetricCard
          title="Collected This Month"
          value={`₹${collectedThisMonth.toLocaleString('en-IN')}`}
          icon={TrendingUp}
          trend={{ value: 'Live Sync', isPositive: true }}
        />
        <MetricCard
          title="Overdue Invoices"
          value={overdueCount.toString()}
          icon={AlertCircle}
          trend={{ value: 'Critical', isPositive: false }}
        />
        <MetricCard
          title="Recovery Rate"
          value={`${recoveryRate}%`}
          icon={Clock}
          trend={{ value: 'Target 95%', isPositive: true }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Collections Chart */}
        <Card className="lg:col-span-2 rounded-2xl shadow-sm border-border overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-lg font-semibold">Collections Trend</CardTitle>
              <CardDescription>Monthly collection volume for the past 6 months.</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs">
              Last 6 Months
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-75 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#888' }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#888' }}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="var(--primary)"
                    strokeWidth={3}
                    dot={{ r: 4, fill: 'var(--primary)', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
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
            <div className="h-62.5 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={agingData} layout="vertical" margin={{ left: -20, right: 20 }}>
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fontWeight: 700, fill: "#666" }}
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
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-600">Escalation Sequence</span>
              <div className="flex gap-1">
                {settings?.escalationLadder?.map((step: any, idx: number) => (
                  <div
                    key={idx}
                    className="w-2.5 h-2.5 rounded-full bg-primary/40 hover:bg-primary transition-colors cursor-help"
                    title={`${step.label}: Day ${step.delayDays} (${step.tone})`}
                  />
                ))}
                {(!settings?.escalationLadder || settings.escalationLadder.length === 0) && (
                  <span className="text-[10px] text-muted-foreground font-medium">None set</span>
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
              className="w-full h-11 rounded-xl text-xs font-bold border-neutral-100 hover:bg-neutral-50"
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
