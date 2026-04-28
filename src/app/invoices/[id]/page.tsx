"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { IndianRupee, ArrowLeft, Send, Download, Mail, MessageSquare, History, BrainCircuit, Clock, Zap } from "lucide-react"
import { fetchInvoices, fetchSettings } from "@/lib/api"
import { Invoice, GlobalSetting } from "@/types"
import { toast } from "sonner"
import { triggerN8nWorkflow } from "@/lib/n8n"
import { differenceInCalendarDays, format } from 'date-fns'
import { cn } from "@/lib/utils"

export default function InvoiceDetailPage() {
   const { id } = useParams()
   const router = useRouter()
   const [invoice, setInvoice] = React.useState<Invoice | null>(null)
   const [settings, setSettings] = React.useState<GlobalSetting | null>(null)
   const [loading, setLoading] = React.useState(true)

   React.useEffect(() => {
      async function load() {
         try {
            const [allInvoices, globalSettings] = await Promise.all([
               fetchInvoices(),
               fetchSettings()
            ]);
            const found = allInvoices.find((i: Invoice) => i.id === id || i.invoice_number === id)
            setInvoice(found || null)
            setSettings(globalSettings)
         } catch (err) {
            console.error("Load error:", err);
         } finally {
            setLoading(false)
         }
      }
      load()
   }, [id])

   if (loading) return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center">
         <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-primary font-bold tracking-widest animate-pulse">Analyzing ledger...</p>
         </div>
      </div>
   )

   if (!invoice) return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center">
         <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-rose-50 dark:bg-rose-950/20 rounded-lg flex items-center justify-center mx-auto">
               <Zap className="w-10 h-10 text-rose-500" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">Invoice not found</h2>
            <Button onClick={() => router.push('/invoices')} variant="outline" className="rounded-lg">Return to dashboard</Button>
         </div>
      </div>
   )

   const lastSentStageValue = invoice.lastSentStage ?? (invoice.reminder_stages?.length > 0 ? invoice.reminder_stages[invoice.reminder_stages.length - 1] : null);

   return (
      <DashboardLayout>
         <div className="max-w-400 mx-auto space-y-8 pb-20">
            {/* Navigation & Actions */}
            <div className="flex items-center justify-between">
               <Button
                  variant="ghost"
                  onClick={() => router.back()}
                  className="rounded-lg h-12 px-6 shadow-sm border border-border/50 bg-white dark:bg-neutral-900 hover:bg-muted font-bold gap-3 text-neutral-900 dark:text-neutral-100"
               >
                  <ArrowLeft className="w-4 h-4" />
                  Back to collection board
               </Button>

               <div className="flex items-center gap-3">
                  <Button variant="outline" className="rounded-lg h-12 px-6 border-border font-bold gap-2 text-neutral-900 dark:text-neutral-100">
                     <Download className="w-4 h-4" />
                     Export ledger
                  </Button>
               </div>
            </div>

            <div className="grid grid-cols-12 gap-8 items-start">
               {/* LEFT COLUMN: Customer & Risk Card */}
               <div className="col-span-12 xl:col-span-4 space-y-8">
                  <Card className="border border-border/50 shadow-xl shadow-neutral-900/5 dark:shadow-black/20 overflow-hidden p-8 rounded-lg bg-white dark:bg-neutral-900">
                     <div className="space-y-8">
                        <div className="flex items-center gap-5">
                           <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-indigo-500 to-primary flex items-center justify-center text-white shadow-xl shadow-primary/20">
                              <span className="text-3xl font-black">{invoice.customerName?.charAt(0)}</span>
                           </div>
                           <div>
                              <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{invoice.customerName}</h2>
                              <p className="text-sm font-bold text-muted-foreground/60 mt-0.5">{invoice.customerEmail}</p>
                           </div>
                        </div>

                        <div className="h-px bg-border/50" />

                        <div className="space-y-6">
                           <h4 className="text-[11px] font-bold text-muted-foreground/60 tracking-wider">Case intelligence</h4>
                           <div className="space-y-4">
                              <div className="flex justify-between items-center text-sm">
                                 <span className="font-bold text-muted-foreground/60">Wait protocol</span>
                                 <span className="font-bold text-neutral-900 dark:text-neutral-100">
                                    {invoice.startFollowups === null ? `Global (${settings?.followupStartDelayDays}d)` : `Manual (${invoice.startFollowups}d)`}
                                 </span>
                              </div>
                              <div className="flex justify-between items-center text-sm">
                                 <span className="font-bold text-muted-foreground/60">Current stage</span>
                                 <span className="font-bold text-neutral-900 dark:text-neutral-100">Stage {invoice.currentStage}</span>
                              </div>
                              <div className="flex justify-between items-center text-sm">
                                 <span className="font-bold text-muted-foreground/60">Total nudges</span>
                                 <span className="font-bold text-neutral-900 dark:text-neutral-100">{invoice.reminder_stages?.length || 0}</span>
                              </div>
                           </div>
                        </div>
                     </div>
                  </Card>

                  <Card className="border border-border/50 shadow-xl shadow-neutral-900/5 dark:shadow-black/20 p-8 rounded-lg bg-white dark:bg-neutral-900">
                     <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                           <Zap className="w-5 h-5" />
                        </div>
                        <h4 className="text-[11px] font-bold text-muted-foreground/60 tracking-wider">Communication temperature</h4>
                     </div>

                     <div className="space-y-8">
                        {invoice.tones && invoice.tones.length > 0 ? (() => {
                           const allTones = settings?.escalationLadder?.map((step: any) => step.tone) || [];
                           const totalStages = allTones.length || 1;

                           const getToneColor = (index: number) => {
                              const progress = totalStages > 1 ? index / (totalStages - 1) : 0;
                              if (progress < 0.25) return 'bg-emerald-400';
                              if (progress < 0.5) return 'bg-blue-400';
                              if (progress < 0.75) return 'bg-amber-400';
                              return 'bg-rose-500';
                           };

                           return (
                              <>
                                 <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] text-muted-foreground/60 font-bold tracking-wider">
                                       {allTones.map((tone: string, i: number) => (
                                          <span key={i} title={`Stage ${i + 1}`}>{tone}</span>
                                       ))}
                                    </div>
                                    <div className="h-3 w-full bg-muted rounded-lg flex overflow-hidden">
                                       {invoice.tones.map((t: string, i: number) => {
                                          const stageIndex = allTones.indexOf(t);
                                          return (
                                             <div
                                                key={i}
                                                className={cn(
                                                   "h-full flex-1 transition-all duration-500",
                                                   i < invoice.tones.length - 1 ? "border-r border-white/20" : "",
                                                   getToneColor(stageIndex >= 0 ? stageIndex : i)
                                                )}
                                                title={`Step ${i + 1}: ${t}`}
                                             />
                                          );
                                       })}
                                    </div>
                                 </div>
                                 <div className="space-y-4">
                                    <p className="text-xs text-muted-foreground/60 leading-relaxed font-bold">
                                       Communication escalated <span className="text-rose-600">{invoice.tones.length} times</span>. Real progression: <span className="text-neutral-900 dark:text-neutral-100 text-[12px]">{invoice.tones.join(' → ')}</span>
                                    </p>
                                    <div className="grid grid-cols-2 gap-3 text-[11px]">
                                       <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                                          <span className="text-muted-foreground/60 text-[10px] font-bold tracking-wider">Initial tone</span>
                                          <p className="font-bold text-neutral-900 dark:text-neutral-100 mt-2 text-sm">{invoice.tones[0]}</p>
                                       </div>
                                       <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                                          <span className="text-muted-foreground/60 text-[10px] font-bold tracking-wider">Current tone</span>
                                          <p className="font-bold text-neutral-900 dark:text-neutral-100 mt-2 text-sm">{invoice.tones[invoice.tones.length - 1]}</p>
                                       </div>
                                    </div>
                                    <div className="pt-2 space-y-2 text-[11px] bg-primary/5 p-4 rounded-lg border border-primary/10">
                                       <p className="text-muted-foreground font-bold"><span className="text-primary">Total escalations:</span> {invoice.tones.length}</p>
                                       <p className="text-muted-foreground text-[10px] leading-relaxed font-bold"><span className="text-primary">Escalation ladder:</span> {allTones.join(' → ') || 'Not configured'}</p>
                                    </div>
                                 </div>
                              </>
                           );
                        })() : (
                           <div className="p-6 text-center bg-muted/20 rounded-lg border border-border border-dashed">
                              <p className="text-sm text-muted-foreground italic font-bold">No reminders sent yet. Automation pending...</p>
                           </div>
                        )}
                     </div>
                  </Card>
               </div>

               {/* MAIN CONTENT: Hero Amount & Timeline */}
               <div className="col-span-12 xl:col-span-8 space-y-8">
                  {/* HERO AMOUNT CARD */}
                  <Card className="border border-border/50 shadow-xl shadow-neutral-900/5 dark:shadow-black/20 overflow-hidden rounded-lg bg-white dark:bg-neutral-900">
                     <div className="p-10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 opacity-5">
                           <IndianRupee className="w-40 h-40" />
                        </div>

                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                           <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                 <span className="text-[11px] font-bold tracking-widest text-muted-foreground/60">Invoice {invoice.invoice_number}</span>
                                 <StatusBadge status={invoice.status} />
                              </div>
                              <h1 className="text-5xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 mt-4">
                                 ₹{invoice.amount.toLocaleString('en-IN')}
                              </h1>
                              <p className="text-muted-foreground/60 font-bold text-lg">Total outstanding balance</p>
                           </div>

                           <div className="flex flex-col items-end gap-2 text-right">
                              <div className="px-5 py-2 bg-rose-500 text-white rounded-lg font-bold text-xs shadow-lg shadow-rose-500/20">
                                 {invoice.daysOverdue} days past due
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="grid grid-cols-3 divide-x divide-border/50 bg-muted/20 border-t border-border/50">
                        <div className="p-8 space-y-1.5">
                           <p className="text-[10px] font-bold text-muted-foreground/60 tracking-wider">Issue date</p>
                           <p className="text-base font-bold text-neutral-900 dark:text-neutral-100">{invoice.issueDate ? format(new Date(invoice.issueDate), 'dd MMM yyyy') : 'N/A'}</p>
                        </div>
                        <div className="p-8 space-y-1.5">
                           <p className="text-[10px] font-bold text-muted-foreground/60 tracking-wider">Status duration</p>
                           <p className="text-base font-bold text-neutral-900 dark:text-neutral-100">{invoice.issueDate ? differenceInCalendarDays(new Date(), new Date(invoice.issueDate)) : 0} days active</p>
                        </div>
                        <div className="p-8 space-y-1.5">
                           <p className="text-[10px] font-bold text-muted-foreground/60 tracking-wider">Last automation step</p>
                           <p className="text-base font-bold text-neutral-900 dark:text-neutral-100">Stage {lastSentStageValue !== null ? lastSentStageValue : 'None'}</p>
                        </div>
                     </div>
                  </Card>

                  {/* ENHANCED TIMELINE */}
                  <Card className="border border-border/50 shadow-xl shadow-neutral-900/5 dark:shadow-black/20 p-10 rounded-lg bg-white dark:bg-neutral-900">
                     <div className="flex items-center justify-between mb-12">
                        <div className="flex items-center gap-4">
                           <div className="p-3 bg-primary text-white rounded-lg shadow-lg shadow-primary/20">
                              <History className="w-6 h-6" />
                           </div>
                           <div>
                              <h4 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Collection journey</h4>
                              <p className="text-sm font-bold text-muted-foreground/60">Complete chronology of the automation sequence.</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg text-[10px] font-bold tracking-wider">
                           <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                           Live sequence monitoring
                        </div>
                     </div>

                     <div className="space-y-16 relative">
                        <div className="absolute left-6 top-4 bottom-4 w-1 bg-border/40" />

                        {/* INITIALIZATION */}
                        <div className="relative pl-16">
                           <div className="absolute -left-0.5 top-1 w-12 h-12 -translate-x-1/2 rounded-lg bg-muted border-4 border-background shadow-lg flex items-center justify-center text-muted-foreground">
                              <Zap className="w-5 h-5" />
                           </div>
                           <div className="space-y-1">
                              <div className="flex items-center gap-3">
                                 <span className="text-[11px] font-bold py-1 px-3 bg-muted text-neutral-900 dark:text-neutral-100 rounded-lg border border-border/50">Genesis</span>
                                 <span className="text-xs font-bold text-muted-foreground/60">{invoice.issueDate ? format(new Date(invoice.issueDate), 'PPpp') : 'N/A'}</span>
                              </div>
                              <h5 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mt-2">Case registry & protocol assignment</h5>
                              <p className="text-sm text-muted-foreground leading-relaxed max-w-xl font-bold">
                                 Invoice registered at <span className="text-neutral-900 dark:text-neutral-100">₹{invoice.amount.toLocaleString()}</span>. System applied the <b>{invoice.startFollowups === null ? 'Standard business rules' : `Custom offset (+${invoice.startFollowups}d)`}</b>.
                              </p>
                           </div>
                        </div>

                        {/* REMINDER STEPS */}
                        {invoice.reminder_dates && invoice.reminder_dates.length > 0 ? (
                           invoice.reminder_dates.map((date: string, i: number) => {
                              const stage = invoice.reminder_stages?.[i];
                              const tone = invoice.tones?.[i];
                              const ladderStep = settings?.escalationLadder?.[stage];
                              const stageLabel = ladderStep?.label || `Stage ${stage} Reminder`;
                              const stageTone = ladderStep?.tone || tone || 'Neutral';

                              return (
                                 <div key={i} className="relative pl-16">
                                    <div className="absolute -left-0.5 top-1 w-12 h-12 -translate-x-1/2 rounded-lg bg-primary border-4 border-background shadow-lg flex items-center justify-center text-white hover:scale-110 transition-transform duration-300">
                                       <Send className="w-5 h-5" />
                                    </div>
                                    <div className="space-y-4">
                                       <div className="flex items-center gap-3 flex-wrap">
                                          <span className="text-[11px] font-bold py-1.5 px-3 bg-primary/10 rounded-lg border border-primary/20 text-primary">Stage {stage + 1} sent</span>
                                          <span className="text-xs font-bold text-muted-foreground/60">{format(new Date(date), 'dd MMM yyyy')}</span>
                                          <span className="text-xs font-bold text-muted-foreground/40">{format(new Date(date), 'hh:mm a')}</span>
                                       </div>

                                       <div className="p-6 bg-muted/30 rounded-lg border border-border/50 space-y-4">
                                          <div className="space-y-1">
                                             <h5 className="text-base font-bold text-neutral-900 dark:text-neutral-100">{stageLabel}</h5>
                                             <p className="text-[11px] text-muted-foreground/60 font-bold tracking-wider">Automated communication</p>
                                          </div>
                                          <div className="flex items-center gap-6 flex-wrap">
                                             <div className="flex items-center gap-2">
                                                <div className="p-2 rounded-md bg-blue-500/10">
                                                   <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                                                </div>
                                                <div>
                                                   <span className="text-[10px] font-bold text-muted-foreground/60 block">Tone</span>
                                                   <span className="text-[12px] font-bold text-neutral-900 dark:text-neutral-100">{tone || stageTone}</span>
                                                </div>
                                             </div>
                                             <div className="flex items-center gap-2">
                                                <div className="p-2 rounded-md bg-primary/10">
                                                   <BrainCircuit className="w-3.5 h-3.5 text-primary" />
                                                </div>
                                                <span className="text-[11px] font-bold text-muted-foreground/60 tracking-wider">AI generated</span>
                                             </div>
                                          </div>
                                       </div>
                                    </div>
                                 </div>
                              );
                           })
                        ) : (
                           <div className="relative pl-16">
                              <div className="absolute -left-0.5 top-1 w-12 h-12 -translate-x-1/2 rounded-lg bg-muted border-4 border-background shadow-lg flex items-center justify-center text-muted-foreground opacity-50">
                                 <Send className="w-5 h-5" />
                              </div>
                              <div className="p-6 bg-muted/20 rounded-lg border border-dashed border-border text-center">
                                 <p className="text-sm text-muted-foreground/60 italic font-bold">No reminders sent yet. Automation will begin on the scheduled date.</p>
                              </div>
                           </div>
                        )}
                        {/* FINAL MILESTONE: FUTURE ACTION OR ESCALATION */}
                        {invoice.status !== 'Paid' && (
                           <div className="relative pl-16">
                              <div className={cn(
                                 "absolute -left-0.5 top-1 w-12 h-12 -translate-x-1/2 rounded-lg border-4 border-background shadow-lg flex items-center justify-center text-white",
                                 invoice.nextActionAt ? 'bg-amber-500 animate-pulse' : 'bg-rose-600'
                              )}>
                                 {invoice.nextActionAt ? <Clock className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                              </div>

                              <div className="p-8 rounded-lg border border-border/50 bg-muted/10">
                                 {invoice.nextActionAt ? (
                                    <div className="space-y-4">
                                       <div className="flex items-center gap-3">
                                          <span className="text-[11px] font-bold py-1 px-3 bg-amber-500 text-white rounded-lg shadow-lg shadow-amber-500/20">Upcoming check</span>
                                          <span className="text-xs font-bold text-amber-700/60">Scheduled by engine</span>
                                       </div>
                                       <h5 className="text-xl font-bold text-amber-950 dark:text-amber-200">
                                          {settings?.escalationLadder?.[(invoice.currentStage || 1) - 1]?.label || `Stage ${invoice.currentStage} Follow-up`}
                                       </h5>
                                       <div className="flex items-center gap-3">
                                          <div className="w-12 h-12 rounded-lg border border-amber-200 bg-white dark:bg-neutral-800 shadow-sm flex flex-col items-center justify-center">
                                             <span className="text-[10px] font-bold text-amber-500 leading-none">Day</span>
                                             <span className="text-xl font-bold text-amber-900 dark:text-amber-100 leading-none">{format(new Date(invoice.nextActionAt), 'dd')}</span>
                                          </div>
                                          <div>
                                             <p className="text-sm font-bold text-amber-950 dark:text-amber-100">{format(new Date(invoice.nextActionAt), 'MMMM yyyy')}</p>
                                             <p className="text-[11px] font-bold tracking-wider text-amber-500/60">Processing @ 12:00 AM</p>
                                          </div>
                                       </div>
                                    </div>
                                 ) : (
                                    <div className="space-y-4">
                                       <div className="flex items-center gap-3">
                                          <span className="text-[11px] font-bold py-1 px-3 bg-rose-600 text-white rounded-lg">Sequence handover</span>
                                          <span className="text-xs font-bold text-muted-foreground/60">Manual tier active</span>
                                       </div>
                                       <h5 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Manager review required</h5>
                                       <p className="text-sm font-bold text-muted-foreground/80 leading-relaxed">
                                          Automation sequence for <b>{invoice.invoice_number}</b> is now complete. Handing over to managerial tier for final collection resolution.
                                        </p>
                                        <div className="flex items-center gap-3 pt-4">
                                           <Button className="rounded-lg h-11 font-bold text-xs px-6">
                                              Initiate legal tier
                                           </Button>
                                           <Button variant="outline" className="rounded-lg h-11 border-rose-200 font-bold text-xs px-6 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30">
                                              Mark in-plan
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
