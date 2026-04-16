"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { PaymentPlanCard } from "@/components/shared/payment-plan-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { IndianRupee, ArrowLeft, Send, Download, Mail, MessageSquare, History, BrainCircuit } from "lucide-react"
import { fetchInvoices } from "@/lib/api"
import { Invoice } from "@/types"
import { toast } from "sonner"
import { triggerN8nWorkflow } from "@/lib/n8n"

export default function InvoiceDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [invoice, setInvoice] = React.useState<Invoice | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function load() {
      const all = await fetchInvoices()
      const found = all.find(i => i.id === id)
      setInvoice(found || null)
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) return <div className="p-20 text-center animate-pulse font-bold text-muted-foreground">Loading Case Details...</div>
  if (!invoice) return <div className="p-20 text-center font-bold text-rose-500">Invoice not found.</div>

  const handleManualReminder = (channel: string) => {
    triggerN8nWorkflow('trigger-reminder', {
      ...invoice,
      channel,
      notes: `Manual ${channel} reminder sent from Detail Page`
    });
    toast.success(`${channel} reminder triggered for ${invoice.customerName}`);
  }

  return (
    <DashboardLayout>
      <PageHeader
        title={`Invoice ${invoice.id}`}
        description={`View detailed history and AI analysis for ${invoice.customerName}.`}
      >
        <Button variant="ghost" onClick={() => router.back()} className="rounded-xl h-10 px-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Info Card */}
          <Card className="rounded-3xl border-none shadow-xl shadow-primary/5 bg-white overflow-hidden">
            <CardHeader className="bg-neutral-50/50 border-b border-neutral-100 p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <IndianRupee className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-neutral-950">₹{invoice.amount.toLocaleString('en-IN')}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <StatusBadge status={invoice.status} />
                      {invoice.prediction && (
                        <span className="text-[10px] font-black uppercase text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100">
                          AI: {invoice.prediction}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-muted-foreground uppercase  leading-none mb-2">Due Date</p>
                  <p className="text-xl font-black text-neutral-900">{new Date(invoice.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Customer</p>
                  <p className="text-sm font-black text-neutral-900">{invoice.customerName}</p>
                  <p className="text-xs font-medium text-muted-foreground">{invoice.customerEmail}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Created At</p>
                  <p className="text-sm font-black text-neutral-900">{new Date(invoice.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Days Overdue</p>
                  <p className={invoice.daysOverdue > 0 ? "text-sm font-black text-rose-600" : "text-sm font-black text-emerald-600"}>
                    {invoice.daysOverdue} Days
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Currency</p>
                  <p className="text-sm font-black text-neutral-900">INR (₹)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Timeline */}

          <Card className="rounded-3xl border-none shadow-xl shadow-primary/5 bg-white overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <div className="flex items-center gap-3">
                <History className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg font-bold">Automation Timeline</CardTitle>
              </div>
            </CardHeader>

            <CardContent className="p-8 pt-4">
              <div className="space-y-6 relative">
                <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-neutral-100" />

                {/* 1. Invoice Created */}
                <div className="relative pl-10">
                  <div className="absolute left-0 top-1 w-5 h-5 rounded-full bg-emerald-500 border-4 border-white shadow-sm" />
                  <p className="text-xs font-bold">Invoice Created</p>
                  <p className="text-xs text-muted-foreground">
                    Invoice generated for {invoice.customerName}
                  </p>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(invoice.createdAt).toLocaleString()}
                  </span>
                </div>

                {/* 2. FOLLOW-UP HISTORY */}
                {(invoice.reminder_dates || []).map((date: string, i: number) => {
                  const stage = invoice.reminder_stages?.[i];
                  const tone = invoice.tones?.[i];

                  return (
                    <div key={i} className="relative pl-10">
                      <div className="absolute left-0 top-1 w-5 h-5 rounded-full bg-primary border-4 border-white shadow-sm" />

                      <p className="text-xs font-bold">
                        Reminder Sent — Stage {stage}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        Tone: <span className="font-semibold">{tone}</span>
                      </p>

                      <span className="text-[10px] text-muted-foreground">
                        {new Date(date).toLocaleString()}
                      </span>
                    </div>
                  );
                })}

                {/* 3. NEXT REMINDER (SMART) */}
                {!invoice.paid && (() => {
                  const ladder = invoice.config?.escalationLadder || [];

                  const lastStage = invoice.reminder_stages?.length
                    ? invoice.reminder_stages[invoice.reminder_stages.length - 1]
                    : 0;

                  const nextStage = ladder[lastStage];

                  if (!nextStage) return null;

                  const due = new Date(invoice.dueDate);
                  const startDays = invoice.startFollowups || 0;

                  const startDate = new Date(due);
                  startDate.setDate(startDate.getDate() + startDays);

                  const nextDate = new Date(startDate);
                  nextDate.setDate(nextDate.getDate() + nextStage.delayDays);

                  return (
                    <div className="relative pl-10">
                      <div className="absolute left-0 top-1 w-5 h-5 rounded-full bg-amber-500 border-4 border-white shadow-sm animate-pulse" />

                      <p className="text-xs font-bold text-amber-600">
                        Next Scheduled Reminder
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {nextStage.label} — {nextStage.tone} tone
                      </p>

                      <span className="text-[10px] text-muted-foreground">
                        {nextDate.toLocaleDateString()}
                      </span>
                    </div>
                  );
                })()}
              </div>
            </CardContent>
          </Card>


          <Card className="rounded-3xl border-none shadow-xl bg-white p-6">
            <h4 className="text-xs font-bold uppercase  text-muted-foreground mb-4">
              Automation Intelligence
            </h4>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Reminders</span>
                <span className="font-bold">
                  {invoice.reminder_stages?.length || 0}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Reminder</span>
                <span className="font-bold">
                  {invoice.last_reminder_sent
                    ? new Date(invoice.last_reminder_sent).toLocaleDateString()
                    : "—"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Tone</span>
                <span className="font-bold capitalize">
                  {invoice.tone || "Neutral"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Follow-up Mode</span>
                <span className="font-bold">
                  {invoice.startFollowups > 0
                    ? `Starts after ${invoice.startFollowups} days`
                    : "Immediate"}
                </span>
              </div>
            </div>
          </Card>


        </div>




        <div className="space-y-8">
          {/* Actions Card */}
          {/* <Card className="rounded-3xl border-none shadow-xl shadow-primary/5 bg-white overflow-hidden">
              <CardHeader className="p-6">
                 <CardTitle className="text-base font-bold">Manual Intervention</CardTitle>
                 <CardDescription className="text-xs font-medium">Force a communication override.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-3">
                 <Button onClick={() => handleManualReminder('Email')} variant="outline" className="w-full justify-start rounded-2xl h-12 gap-3 hover:bg-primary/5 hover:text-primary transition-all border-neutral-100 font-bold">
                    <Mail className="w-4 h-4 text-primary" />
                    Send Email Reminder
                 </Button>
                 <Button onClick={() => handleManualReminder('WhatsApp')} variant="outline" className="w-full justify-start rounded-2xl h-12 gap-3 hover:bg-emerald-50 hover:text-emerald-600 transition-all border-neutral-100 font-bold">
                    <MessageSquare className="w-4 h-4 text-emerald-500" />
                    WhatsApp Nudge
                 </Button>
                 <Button variant="outline" className="w-full justify-start rounded-2xl h-12 gap-3 hover:bg-neutral-100 transition-all border-neutral-100 font-bold">
                    <Download className="w-4 h-4 text-muted-foreground" />
                    Download PDF
                 </Button>
              </CardContent>
           </Card> */}

          {/* AI Prediction */}
          <Card className="rounded-3xl border-none shadow-xl bg-linear-to-br from-indigo-600 to-primary text-white p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <BrainCircuit className="w-20 h-20" />
            </div>
            <h4 className="text-xs font-bold uppercase  text-white/70 mb-4">AI Collection Forecast</h4>
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold text-white/80 mb-2">Likelihood of Payment</p>
                <div className="flex items-end gap-3 mb-2">
                  <span className="text-4xl font-black">{invoice.prediction === 'Likely' ? '88%' : invoice.prediction === 'At Risk' ? '45%' : '22%'}</span>
                </div>
                <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white shadow-xl shadow-white/20" style={{ width: invoice.prediction === 'Likely' ? '88%' : invoice.prediction === 'At Risk' ? '45%' : '22%' }} />
                </div>
              </div>
              <p className="text-[11px] leading-relaxed text-white/80 italic font-medium">
                "Historical analysis shows this client usually pays within 3 days after a WhatsApp nudge. Tone should remain neutral."
              </p>
            </div>
          </Card>

          {/* Payment Plan if exists */}
          {invoice.paymentPlan && (
            <PaymentPlanCard plan={invoice.paymentPlan} />
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
