"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { useInvoiceStore } from "@/store/use-invoice-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Download,
  Mail,
  Play,
  CheckCircle,
  Clock,
  FileText,
  Calendar,
  DollarSign,
  User,
  Zap
} from "lucide-react"
import { format, addDays } from "date-fns"
import { motion } from "framer-motion"
import axios from "axios"
import { toast } from "sonner"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export default function InvoiceDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const [invoice, setInvoice] = React.useState<any>(null)
  const [ladderSteps, setLadderSteps] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [isPolling, setIsPolling] = React.useState(false)
  const runFollowup = useInvoiceStore(state => state.runFollowup)

  const [isDateOpen, setIsDateOpen] = React.useState(false)
  const [tempDate, setTempDate] = React.useState("")
  const [isSavingDate, setIsSavingDate] = React.useState(false)

  // Initialize tempDate based on active stage projected date or invoice nextActionDate
  React.useEffect(() => {
    if (invoice && ladderSteps.length > 0) {
      const activeStage = invoice.currentStage || 0
      const nextStep = ladderSteps[activeStage]
      let dateToUse = invoice.nextActionDate
      if (!dateToUse && nextStep) {
        const delay = activeStage === 0 ? (invoice.followupStartAfterDays ?? nextStep.delayDays) : nextStep.delayDays
        const projected = addDays(new Date(invoice.dueDate), delay)
        dateToUse = projected.toISOString()
      }
      if (dateToUse) {
        try {
          setTempDate(new Date(dateToUse).toISOString().split('T')[0])
        } catch (e) {
          console.error(e)
        }
      }
    }
  }, [invoice, ladderSteps, isDateOpen])

  const handleSaveDate = async () => {
    if (!tempDate) return
    setIsSavingDate(true)
    try {
      await axios.put(`/api/invoices/${id}`, { nextActionDate: new Date(tempDate) })
      toast.success("Followup action date updated successfully")
      setIsDateOpen(false)
      fetchInvoice()
    } catch (err) {
      toast.error("Failed to update action date")
    } finally {
      setIsSavingDate(false)
    }
  }

  const pollingIntervalRef = React.useRef<any>(null)
  const originalDraftIdRef = React.useRef<string | null>(null)

  const fetchInvoice = React.useCallback(async () => {
    try {
      const [invoiceRes, ladderRes] = await Promise.all([
        axios.get(`/api/invoices/${id}`),
        axios.get('/api/settings/ladder')
      ])
      setInvoice(invoiceRes.data)
      setLadderSteps(ladderRes.data)
    } catch (error) {
      toast.error("Failed to fetch invoice details")
    } finally {
      setLoading(false)
    }
  }, [id])

  React.useEffect(() => {
    fetchInvoice()
  }, [fetchInvoice])

  const startPolling = React.useCallback(() => {
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current)
    setIsPolling(true)

    let attempts = 0
    const maxAttempts = 15

    pollingIntervalRef.current = setInterval(async () => {
      attempts++
      try {
        const res = await axios.get(`/api/invoices/${id}`)
        const updatedInvoice = res.data

        if (updatedInvoice.gmailDraftId && updatedInvoice.gmailDraftId !== originalDraftIdRef.current) {
          clearInterval(pollingIntervalRef.current)
          pollingIntervalRef.current = null
          setIsPolling(false)
          setInvoice(updatedInvoice)
          return
        }
      } catch (err) {
        console.error("Polling error", err)
      }

      if (attempts >= maxAttempts) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
        setIsPolling(false)
        toast.info("Draft creation is taking longer than expected. Check activity log shortly.")
      }
    }, 2500)
  }, [id])

  React.useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current)
    }
  }, [])

  const handleRunFollowup = async () => {
    try {
      originalDraftIdRef.current = invoice?.gmailDraftId || null

      toast.promise(runFollowup(id as string), {
        loading: 'Orchestrating AI followup...',
        success: (data) => {
          startPolling()
          return `Followup initiated! Generating draft via n8n...`
        },
        error: 'Failed to run followup',
      })
      fetchInvoice()
    } catch (error) {
      console.error(error)
    }
  }

  const handleMarkPaid = async () => {
    try {
      await axios.put(`/api/invoices/${id}`, { status: "PAID" })
      toast.success("Invoice marked as paid")
      fetchInvoice()
    } catch (error) {
      toast.error("Failed to update status")
    }
  }

  if (loading) return <div className="flex items-center justify-center h-[400px]">Loading details...</div>
  if (!invoice) return <div className="text-center py-20">Invoice not found.</div>

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()} className="-ml-2">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Invoices
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" /> Export PDF
          </Button>
          {/* <Button variant="outline" size="sm">
            <Mail className="mr-2 h-4 w-4" /> Resend
          </Button> */}
          {(() => {
            const isOverdue = invoice.status === "OVERDUE";
            const isReady = invoice.nextActionDate && new Date(invoice.nextActionDate) <= new Date();
            return (
              <Button
                onClick={handleRunFollowup}
                size="sm"
                disabled={!isOverdue || !isReady}
                className={!isOverdue || !isReady ? "opacity-50" : "bg-primary hover:bg-primary/90"}
              >
                <Play className="mr-2 h-4 w-4" />
                {isReady ? "Run AI Followup" : "Followup Pending"}
              </Button>
            );
          })()}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader className="border-b bg-muted/30">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">{invoice.invoiceNumber}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Issued on {format(new Date(invoice.issueDate), "MMMM dd, yyyy")}</p>
              </div>
              <Badge variant={
                invoice.status === "PAID" ? "default" :
                  invoice.status === "OVERDUE" ? "destructive" : "outline"
              } className="px-4 py-1 text-sm font-semibold">
                {invoice.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-primary/10 text-primary">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Customer</h4>
                    <p className="text-lg font-bold">{invoice.customer?.name}</p>
                    <p className="text-sm text-muted-foreground">{invoice.customer?.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-primary/10 text-primary">
                    <DollarSign className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Amount Due</h4>
                    <p className="text-3xl font-black text-primary">
                      {new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: invoice.currency || "INR",
                      }).format(invoice.amount)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-primary/10 text-primary">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Due Date</h4>
                    <p className="text-lg font-bold">{format(new Date(invoice.dueDate), "MMMM dd, yyyy")}</p>
                    <p className="text-sm text-red-500 font-medium">
                      {invoice.status === "OVERDUE" ? `${invoice.overdueDays} days overdue` : "Due soon"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-primary/10 text-primary">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Automation Stage</h4>
                    <p className="text-lg font-bold">Stage {invoice.currentStage}</p>
                    <p className="text-sm text-muted-foreground">Next action scheduled: {format(new Date(invoice.nextActionDate), "MMM dd")}</p>
                  </div>
                </div>
              </div>
            </div>

            {invoice.gmailDraftId && (
              <div className="mt-8 p-4 rounded-xl border border-amber-200/50 bg-amber-500/5 dark:bg-amber-500/10 flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 dark:text-amber-400">
                    <Mail className="h-5 w-5 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                      Gmail Draft Created
                      <Badge variant="outline" className="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border-amber-200">Stage {invoice.currentStage}</Badge>
                    </h4>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5 truncate max-w-[280px] sm:max-w-md">
                      Draft ID: {invoice.gmailDraftId}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-amber-200 hover:bg-amber-100/50 text-amber-700 dark:text-amber-400 dark:border-amber-900 shrink-0"
                    onClick={() => {
                      navigator.clipboard.writeText(invoice.gmailDraftId)
                      toast.success("Draft ID copied!")
                    }}
                  >
                    Copy ID
                  </Button>
                  <Button
                    size="sm"
                    className="bg-amber-500 hover:bg-amber-600 text-white font-bold shrink-0 shadow-sm flex items-center gap-1.5"
                    onClick={() => {
                      window.open(`https://mail.google.com/mail/u/0/#drafts?compose=${invoice.gmailDraftId}`, '_blank')
                    }}
                  >
                    <Mail className="h-4 w-4" />
                    Open in Gmail
                  </Button>
                </div>
              </div>
            )}

            {isPolling && (
              <div className="mt-8 p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-center gap-3">
                <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin shrink-0" />
                <p className="text-sm text-primary font-medium animate-pulse">Waiting for n8n draft generation...</p>
              </div>
            )}

            {invoice.notes && (
              <div className="mt-8 p-4 rounded-lg bg-muted/50 border">
                <h4 className="text-sm font-medium flex items-center mb-2">
                  <FileText className="mr-2 h-4 w-4 text-muted-foreground" /> Notes
                </h4>
                <p className="text-sm text-muted-foreground">{invoice.notes}</p>
              </div>
            )}

            {invoice.status !== "PAID" && (
              <div className="mt-8 flex justify-end">
                <Button variant="outline" onClick={handleMarkPaid} className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200">
                  <CheckCircle className="mr-2 h-4 w-4" /> Mark as Paid
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Followup Roadmap */}
        {invoice.status !== "PAID" && (
          <Card className="md:col-span-2 border-primary/20 bg-primary/5">
            <CardHeader>
              <div className="flex items-center gap-2 text-primary">
                <Zap className="h-5 w-5" />
                <CardTitle>Automation Roadmap</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-4 rounded-lg bg-background border border-primary/10">
                  <h4 className="text-sm font-bold flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-primary" /> Initial Trigger
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Followups will start automatically <span className="text-primary font-bold">{invoice.followupStartAfterDays} days</span> after the due date ({format(addDays(new Date(invoice.dueDate), invoice.followupStartAfterDays), "MMM dd, yyyy")}).
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Escalation Forecast</h4>
                  <div className="grid gap-3">
                    {ladderSteps.map((step, i) => {
                      const delay = i === 0 ? (invoice.followupStartAfterDays ?? step.delayDays) : step.delayDays;
                      const projectedDate = addDays(new Date(invoice.dueDate), delay);
                      const isCompleted = invoice.currentStage > i;
                      const isNext = invoice.currentStage === i;
                      const stepDate = isNext && invoice.nextActionDate
                        ? new Date(invoice.nextActionDate)
                        : projectedDate;

                      return (
                        <div key={step.id} className={`flex items-center justify-between p-3 rounded-xl border ${isNext ? 'bg-primary/10 border-primary/30 ring-1 ring-primary/20' : 'bg-background'}`}>
                          <div className="flex items-center gap-3">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs ${isCompleted ? 'bg-green-500 text-white' : isNext ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                              {isCompleted ? <CheckCircle className="h-4 w-4" /> : i + 1}
                            </div>
                            <div>
                              <p className="text-sm font-bold">{step.tone} Tone</p>
                              {isNext ? (
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-xs font-semibold text-primary">{format(stepDate, "MMMM dd, yyyy")}</span>
                                  <Popover open={isDateOpen} onOpenChange={setIsDateOpen}>
                                    <PopoverTrigger nativeButton={true} render={
                                      <button className="text-[9px] font-bold text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-md px-1.5 py-0.5 cursor-pointer transition-all">
                                        Edit Date
                                      </button>
                                    } />
                                    <PopoverContent className="w-64 p-3 bg-popover shadow-xl ring-1 ring-foreground/10 border rounded-lg flex flex-col gap-3 isolate z-50">
                                      <div className="flex flex-col gap-1">
                                        <span className="font-semibold text-xs text-foreground">Edit Next Action Date</span>
                                        <span className="text-[10px] text-muted-foreground">Adjust when this followup email will be sent.</span>
                                      </div>
                                      <input
                                        type="date"
                                        value={tempDate}
                                        onChange={(e) => setTempDate(e.target.value)}
                                        className="w-full h-8 px-2 bg-background border border-input rounded-md text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-primary/20 text-foreground"
                                      />
                                      <div className="flex justify-end gap-2 mt-1">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="h-7 text-[10px] px-2.5"
                                          onClick={() => setIsDateOpen(false)}
                                          disabled={isSavingDate}
                                        >
                                          Cancel
                                        </Button>
                                        <Button
                                          size="sm"
                                          className="h-7 text-[10px] px-2.5 bg-primary text-white hover:bg-primary/90"
                                          onClick={handleSaveDate}
                                          disabled={isSavingDate}
                                        >
                                          {isSavingDate ? "Saving..." : "Save"}
                                        </Button>
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                </div>
                              ) : (
                                <p className="text-xs text-muted-foreground">{format(stepDate, "MMMM dd, yyyy")}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={isCompleted ? "secondary" : isNext ? "default" : "outline"}>
                              {isCompleted ? "Sent" : isNext ? "Next Action" : `${step.delayDays}d Delay`}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center">
              <Activity className="mr-2 h-5 w-5 text-primary" /> Activity Log
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {invoice.activityLogs?.map((log: any, i: number) => (
                <div key={log.id} className="relative flex gap-3 pb-6 last:pb-0">
                  {i !== invoice.activityLogs.length - 1 && (
                    <div className="absolute left-[11px] top-6 h-full w-[2px] bg-muted" />
                  )}
                  <div className={`z-10 h-[22px] w-[22px] rounded-full border-4 border-background ${log.eventType === 'INVOICE_CREATED' ? 'bg-blue-500' :
                    log.eventType === 'FOLLOWUP_SENT' ? 'bg-purple-500' :
                      log.eventType === 'STATUS_CHANGED' ? 'bg-green-500' :
                        log.eventType === 'DRAFT_CREATED' ? 'bg-amber-500' : 'bg-muted-foreground'
                    }`} />
                  <div className="space-y-1 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold leading-tight">{log.description}</p>
                      {log.eventType === 'DRAFT_CREATED' && invoice.gmailDraftId && (
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(invoice.gmailDraftId)
                              toast.success("Draft ID copied to clipboard!")
                            }}
                            className="text-[10px] text-primary hover:underline font-bold"
                          >
                            Copy ID
                          </button>
                          <span className="text-[10px] text-muted-foreground">|</span>
                          <button
                            onClick={() => {
                              window.open(`https://mail.google.com/mail/u/0/#drafts?compose=${invoice.gmailDraftId}`, '_blank')
                            }}
                            className="text-[10px] text-primary hover:underline font-bold flex items-center gap-0.5"
                          >
                            <Mail className="h-2.5 w-2.5" />
                            Open Draft
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{format(new Date(log.timestamp), "MMM dd, h:mm a")}</p>
                  </div>
                </div>
              ))}
              {!invoice.activityLogs?.length && (
                <div className="text-center py-6 text-sm text-muted-foreground">No activity recorded yet.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}

function Activity({ ...props }: any) {
  return <Clock {...props} />
}
