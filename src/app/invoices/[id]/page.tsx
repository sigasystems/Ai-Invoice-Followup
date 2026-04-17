"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { PaymentPlanCard } from "@/components/shared/payment-plan-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { IndianRupee, ArrowLeft, Send, Download, Mail, MessageSquare, History, BrainCircuit, Clock, Zap } from "lucide-react"
import { fetchInvoices, fetchSettings } from "@/lib/api"
import { Invoice, GlobalSetting } from "@/types"
import { toast } from "sonner"
import { triggerN8nWorkflow } from "@/lib/n8n"
import { differenceInCalendarDays, format, startOfDay } from 'date-fns'
import { cn } from "@/lib/utils"

export default function InvoiceDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [invoice, setInvoice] = React.useState<Invoice | null>(null)
  const [settings, setSettings] = React.useState<GlobalSetting | null>(null)
  const [loading, setLoading] = React.useState(true)
  console.log("invoice log in id page,,,",invoice);

  React.useEffect(() => {
    async function load() {
      const [allInvoices, globalSettings] = await Promise.all([
        fetchInvoices(),
        fetchSettings()
      ]);
      const found = allInvoices.find((i: Invoice) => i.id === id || i.invoice_number === id)
      setInvoice(found || null)
      setSettings(globalSettings)
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
       <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-black text-indigo-900 uppercase tracking-widest animate-pulse">Analyzing Ledger...</p>
       </div>
    </div>
  )
  
  if (!invoice) return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <div className="text-center space-y-4">
         <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto">
            <Zap className="w-10 h-10 text-rose-500" />
         </div>
         <h2 className="text-2xl font-black ">Invoice not found</h2>
         <Button onClick={() => router.push('/invoices')} variant="outline">Return to Dashboard</Button>
      </div>
    </div>
  )

  const lastSentStageValue = invoice.lastSentStage ?? (invoice.reminder_stages?.length > 0 ? invoice.reminder_stages[invoice.reminder_stages.length - 1] : null);

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
      <div className="max-w-[1600px] mx-auto space-y-8 pb-20">
        {/* Navigation & Actions */}
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => router.back()} 
            className="rounded-2xl h-12 px-6  shadow-sm border border-neutral-100 hover:bg-neutral-50 font-bold gap-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Collection Board
          </Button>

          <div className="flex items-center gap-3">
             <Button variant="outline" className="rounded-2xl h-12 px-6 border-neutral-200 font-bold  gap-2">
                <Download className="w-4 h-4" />
                Export Ledger
             </Button>
             <Button className="rounded-2xl h-12 px-6 bg-indigo-600 text-white hover:bg-indigo-700 font-bold gap-2 shadow-lg shadow-indigo-600/20">
                <Mail className=" transition-transform group-hover:rotate-12 " />
                Direct Message
             </Button>
          </div>
        </div>

        {/* MOSAIC GRID START */}
        <div className="grid grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Customer & Risk Card */}
          <div className="col-span-12 lg:col-span-4 space-y-8">
            <Card className="rounded-[40px] border-none shadow-2xl shadow-indigo-900/5  overflow-hidden p-10">
               <div className="space-y-8">
                  <div className="flex items-center gap-5">
                     <div className="w-20 h-20 rounded-3xl bg-linear-to-br from-indigo-500 to-primary flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
                        <span className="text-3xl font-black">{invoice.customerName?.charAt(0)}</span>
                     </div>
                     <div>
                        <h2 className="text-2xl font-black  tracking-tight leading-tight">{invoice.customerName}</h2>
                        <p className="text-sm font-bold  mt-0.5">{invoice.customerEmail}</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-5 bg-neutral-50 rounded-3xl border border-neutral-100/50">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Risk Profile</p>
                        <div className="flex items-center gap-2">
                           <div className={cn("w-2 h-2 rounded-full", invoice.prediction === 'Likely' ? 'bg-emerald-500' : 'bg-rose-500')} />
                           <span className="text-sm font-black ">{invoice.prediction || 'Unrated'}</span>
                        </div>
                     </div>
                     <div className="p-5 bg-neutral-50 rounded-3xl border border-neutral-100/50">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Pay History</p>
                        <span className="text-sm font-black ">82% On-Time</span>
                     </div>
                  </div>

                  <div className="divider h-[1px] bg-neutral-100" />

                  <div className="space-y-6">
                     <h4 className="text-xs font-black uppercase text-neutral-400 tracking-thinner">Case Intelligence</h4>
                     <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                           <span className="font-bold text-muted-foreground">Wait Protocol</span>
                           <span className="font-black ">
                             {invoice.startFollowups === null ? `Global (${settings?.followupStartDelayDays}d)` : `Manual (${invoice.startFollowups}d)`}
                           </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                           <span className="font-bold text-muted-foreground">Current Stage</span>
                           <span className="font-black ">Stage {invoice.currentStage}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                           <span className="font-bold text-muted-foreground">Total Nudges</span>
                           <span className="font-black ">{invoice.reminder_stages?.length || 0}</span>
                        </div>
                     </div>
                  </div>

                  <div className="p-6 bg-indigo-600 rounded-3xl text-white space-y-4 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-500">
                     <div className="absolute top-0 right-0 p-4 opacity-10">
                        <BrainCircuit className="w-16 h-16" />
                     </div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-indigo-100">AI Sentiment Forecast</p>
                     <p className="text-sm font-medium leading-relaxed italic text-indigo-50">
                        "This client responds best to legal-adjacent language. Recommend immediate transition to Stage 3 if unpaid by tomorrow."
                     </p>
                  </div>
               </div>
            </Card>

            <Card className="rounded-[40px] border-none shadow-2xl shadow-indigo-900/5  p-10">
               <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 bg-indigo-50 rounded-xl ">
                     <Zap className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-black uppercase  tracking-tight">Comm. Temperature</h4>
               </div>

               <div className="space-y-8">
                  <div className="space-y-2">
                     <div className="flex justify-between text-[11px] font-black uppercase text-muted-foreground">
                        <span>Mild</span>
                        <span>Neutral</span>
                        <span>Firm</span>
                        <span>Legal</span>
                     </div>
                     <div className="h-2 w-full bg-neutral-100 rounded-full flex overflow-hidden">
                        {(invoice.tones || []).map((t: string, i: number) => (
                           <div 
                             key={i} 
                             className={cn(
                               "h-full flex-1 border-r border-white/50",
                               t === 'Mild' ? 'bg-emerald-400' : 
                               t === 'Firm' ? 'bg-amber-400' : 
                               'bg-rose-500'
                             )} 
                           />
                        ))}
                     </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                     Communication has escalated <span className="text-rose-600 font-bold">{invoice.tones?.length} times</span>. Tone shifted from <b>{invoice.tones?.[0]}</b> to <b>{invoice.tones?.[invoice.tones?.length - 1]}</b>.
                  </p>
               </div>
            </Card>
          </div>

          {/* MAIN CONTENT: Hero Amount & Timeline */}
          <div className="col-span-12 lg:col-span-8 space-y-8">
            {/* HERO AMOUNT CARD */}
            <Card className="rounded-[40px] border-none shadow-2xl shadow-indigo-900/5  overflow-hidden">
               <div className="p-12  relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-12 opacity-5">
                    <IndianRupee className="w-40 h-40" />
                  </div>
                  
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                     <div className="space-y-2">
                        <div className="flex items-center gap-3">
                           <span className="px-3 py-1 rounded-full  text-[10px] font-black uppercase tracking-widest backdrop-blur-md">Invoice {invoice.invoice_number}</span>
                           <StatusBadge status={invoice.status} />
                        </div>
                        <h1 className="text-6xl font-black tracking-tight mt-4">
                           ₹{invoice.amount.toLocaleString('en-IN')}
                        </h1>
                        <p className="text-neutral-400 font-medium text-lg">Total Outstanding Balance</p>
                     </div>

                     <div className="flex flex-col items-end gap-2 text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Due Date</p>
                        <p className="text-3xl font-black text-white">
                           {invoice.dueDate ? format(new Date(invoice.dueDate), 'dd MMMM yyyy') : 'N/A'}
                        </p>
                        <div className="px-4 py-1 bg-rose-500/20 text-rose-300 rounded-full border border-rose-500/30 text-[11px] font-black uppercase tracking-wider">
                           {invoice.daysOverdue} Days Past Due
                        </div>
                     </div>
                  </div>
               </div>
               
               <div className="grid grid-cols-3 divide-x divide-neutral-100">
                  <div className="p-8 space-y-1">
                     <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Issue Date</p>
                     <p className="text-base font-black ">{invoice.issueDate ? format(new Date(invoice.issueDate), 'dd MMM yyyy') : 'N/A'}</p>
                  </div>
                  <div className="p-8 space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Status Duration</p>
                    <p className="text-base font-black ">{invoice.issueDate ? differenceInCalendarDays(new Date(), new Date(invoice.issueDate)) : 0} Days Active</p>
                  </div>
                  <div className="p-8 space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Last Automation Step</p>
                    <p className="text-base font-black ">Stage {lastSentStageValue !== null ? lastSentStageValue : 'None'}</p>
                  </div>
               </div>
            </Card>

            {/* ENHANCED TIMELINE */}
            <Card className="rounded-[40px] border-none shadow-2xl shadow-indigo-900/5  p-12">
               <div className="flex items-center justify-between mb-12">
                  <div className="flex items-center gap-4">
                     <div className="p-3 bg-indigo-50 rounded-2xl ">
                        <History className="w-6 h-6" />
                     </div>
                     <div>
                        <h4 className="text-xl font-black ">Collection Journey</h4>
                        <p className="text-sm font-medium text-muted-foreground">Complete chronology of the automation sequence.</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-indigo-600/20">
                     <div className="w-1.5 h-1.5 rounded-full  animate-pulse" />
                     Live Sequence Monitoring
                  </div>
               </div>

               <div className="space-y-16 relative">
                  <div className="absolute left-6 top-4 bottom-4 w-1 bg-linear-to-b from-indigo-500 via-primary/50 to-neutral-100 rounded-full" />

                  {/* INITIALIZATION */}
                  <div className="relative pl-16">
                     <div className="absolute left-[-2px] top-1 w-12 h-12 -translate-x-1/2 rounded-3xl bg-neutral-950 border-4 border-white shadow-xl flex items-center justify-center text-white">
                        <Zap className="w-5 h-5" />
                     </div>
                     <div className="space-y-1">
                        <div className="flex items-center gap-3">
                           <span className="text-[11px] font-black uppercase py-1 px-3 bg-neutral-100 text-neutral-600 rounded-xl border border-neutral-200">Genesis</span>
                           <span className="text-xs font-bold text-neutral-400">{invoice.issueDate ? format(new Date(invoice.issueDate), 'PPpp') : 'N/A'}</span>
                        </div>
                        <h5 className="text-lg font-black  mt-2">Case Registry & Protocol Assignment</h5>
                        <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
                           Invoice registered at <span className="font-bold text-neutral-700">₹{invoice.amount.toLocaleString()}</span>. System applied the <b>{invoice.startFollowups === null ? 'Standard Business Rules' : `Custom Offset (+${invoice.startFollowups}d)`}</b>.
                        </p>
                     </div>
                  </div>

                  {/* REMINDER STEPS */}
                  {(invoice.reminder_dates || []).map((date: string, i: number) => {
                    const stage = invoice.reminder_stages?.[i];
                    const tone = invoice.tones?.[i];
                    const ladderStep = settings?.escalationLadder?.[stage];

                    return (
                      <div key={i} className="relative pl-16">
                        <div className="absolute left-[-2px] top-1 w-12 h-12 -translate-x-1/2 rounded-3xl bg-indigo-600 border-4 border-white shadow-xl flex items-center justify-center text-white">
                           <Send className="w-5 h-5" />
                        </div>
                        <div className="space-y-4">
                           <div className="flex items-center gap-3">
                              <span className="text-[11px] font-black uppercase py-1 px-3 bg-indigo-50  rounded-xl border border-indigo-100">Stage {stage} Sent</span>
                              <span className="text-xs font-bold text-neutral-400">{format(new Date(date), 'PPpp')}</span>
                           </div>
                           
                           <div className="p-6 bg-neutral-50 rounded-[32px] border border-neutral-100 space-y-3">
                              <h5 className="text-base font-black ">{ladderStep?.label || 'Direct Collection Reminder'}</h5>
                              <div className="flex items-center gap-4">
                                 <div className="flex items-center gap-2">
                                    <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                                    <span className="text-[10px] font-black uppercase text-neutral-500">Tone: <b className="">{tone}</b></span>
                                 </div>
                                 <div className="flex items-center gap-2">
                                    <BrainCircuit className="w-3.5 h-3.5 text-indigo-500" />
                                    <span className="text-[10px] font-black uppercase text-neutral-500">AI Generated Copy</span>
                                 </div>
                              </div>
                           </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* FINAL MILESTONE: FUTURE ACTION OR ESCALATION */}
                  {invoice.status !== 'Paid' && (
                    <div className="relative pl-16">
                      <div className={cn(
                        "absolute left-[-2px] top-1 w-12 h-12 -translate-x-1/2 rounded-3xl border-4 border-white shadow-xl flex items-center justify-center text-white",
                        invoice.nextActionAt ? 'bg-amber-500 animate-pulse' : 'bg-rose-600'
                      )}>
                         {invoice.nextActionAt ? <Clock className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                      </div>

                      <div className={cn(
                        "p-8 rounded-[40px] border",
                        // invoice.nextActionAt ? 'bg-amber-50/50 border-amber-100' : 'bg-rose-50/50 border-rose-100'
                      )}>
                        {invoice.nextActionAt ? (
                          <div className="space-y-4">
                            <div className="flex items-center gap-3">
                               <span className="text-[11px] font-black uppercase py-1 px-3 bg-amber-500 text-white rounded-xl shadow-lg shadow-amber-500/20">Upcoming Check</span>
                               <span className="text-xs font-bold text-amber-700">Scheduled by Engine</span>
                            </div>
                            <h5 className="text-xl font-black text-amber-950">
                               {settings?.escalationLadder?.[invoice.currentStage]?.label || `Stage ${invoice.currentStage} Follow-up`}
                            </h5>
                            <div className="flex items-center gap-3">
                               <div className="w-12 h-12 rounded-2xl  border border-amber-200 shadow-sm flex flex-col items-center justify-center">
                                  <span className="text-[10px] font-black text-amber-500 leading-none">Day</span>
                                  <span className="text-xl font-black text-amber-900 leading-none">{format(new Date(invoice.nextActionAt), 'dd')}</span>
                               </div>
                               <div>
                                  <p className="text-sm font-bold text-amber-950">{format(new Date(invoice.nextActionAt), 'MMMM yyyy')}</p>
                                  <p className="text-[11px] font-black uppercase tracking-widest text-amber-500">Processing @ 12:00 AM</p>
                               </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                             <div className="flex items-center gap-3">
                               <span className="text-[11px] font-black uppercase py-1 px-3 bg-rose-600 text-white rounded-xl">Sequence Handover</span>
                               <span className="text-xs font-bold ">Manual Level 2 Active</span>
                            </div>
                            <h5 className="text-xl font-black ">Manager Review Required</h5>
                            <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                               Automation sequence for <b>{invoice.invoice_number}</b> is now complete. Handing over to managerial tier for final collection resolution.
                            </p>
                            <div className="flex items-center gap-3 pt-4">
                               <Button className="rounded-2xl h-11 bg-rose-600 hover:bg-rose-700 text-white font-black uppercase tracking-wider text-[10px] px-6">
                                  Initiate Legal Tier
                               </Button>
                               <Button variant="outline" className="rounded-2xl h-11 border-rose-200  font-black uppercase tracking-wider text-[10px] px-6 ">
                                  Mark In-Plan
                               </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
               </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
