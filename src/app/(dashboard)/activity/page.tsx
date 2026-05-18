"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CheckCircle2, Mail, Clock, Zap } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { format, formatDistanceToNow } from "date-fns"
import { useEffect, useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function ActivityPage() {
  const router = useRouter()
  const [activities, setActivities] = useState<any[]>([])
  const [drafts, setDrafts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(7)

  const fetchData = async (dayCount: number) => {
    setLoading(true)
    try {
      const [actRes, draftRes] = await Promise.all([
        axios.get(`/api/activity?days=${dayCount}`),
        axios.get('/api/invoices/drafts')
      ])
      setActivities(actRes.data)
      setDrafts(draftRes.data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData(days)
  }, [days])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Activity & Drafts</h2>
          <p className="text-muted-foreground">Track system events and manage your pending drafts.</p>
        </div>
        <div className="flex gap-2">
          <Button variant={days === 7 ? "default" : "outline"} size="sm" onClick={() => setDays(7)}>Last 7 Days</Button>
          <Button variant={days === 30 ? "default" : "outline"} size="sm" onClick={() => setDays(30)}>Last 30 Days</Button>
          <Button variant={days === 0 ? "default" : "outline"} size="sm" className={days === 0 ? "shadow-md shadow-primary/10 border-primary" : ""} onClick={() => setDays(0)}>All Time</Button>
        </div>
      </div>

      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList>
          <TabsTrigger value="timeline">Activity Timeline</TabsTrigger>
          <TabsTrigger value="drafts">
            Draft Invoices
            {drafts.length > 0 && <Badge className="ml-2 px-1.5 py-0 h-4 min-w-4 justify-center">{drafts.length}</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Event History</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                {loading ? (
                  <div className="flex items-center justify-center py-20 text-muted-foreground">Loading activity...</div>
                ) : activities.length === 0 ? (
                  <div className="text-center py-20 text-muted-foreground">
                    {days === 0 ? "No activity recorded yet." : `No activity recorded in the last ${days} days.`}
                  </div>
                ) : (
                  <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-muted-foreground/20 before:to-transparent">
                    {activities.map((activity) => (
                      <div 
                        key={activity.id} 
                        className="relative flex items-center group cursor-pointer hover:bg-muted/30 p-2 rounded-xl transition-all"
                        onClick={() => {
                            if (activity.invoiceId) {
                                router.push(`/invoices/${activity.invoiceId}`)
                            }
                        }}
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-background shadow-sm ring-8 ring-background group-hover:border-primary/50 transition-colors">
                          {activity.eventType === 'INVOICE_CREATED' && <Zap className="h-5 w-5 text-blue-500" />}
                          {activity.eventType === 'FOLLOWUP_SENT' && <Mail className="h-5 w-5 text-purple-500" />}
                          {activity.eventType === 'STATUS_CHANGED' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                          {activity.eventType === 'DRAFT_CREATED' && <Mail className="h-5 w-5 text-amber-500 animate-pulse" />}
                          {!['INVOICE_CREATED', 'FOLLOWUP_SENT', 'STATUS_CHANGED', 'DRAFT_CREATED'].includes(activity.eventType) && <Clock className="h-5 w-5 text-muted-foreground" />}
                        </div>
                        <div className="ml-6 flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">{activity.description}</span>
                            <Badge variant="secondary" className="text-[10px] py-0 px-1.5 h-4">
                              {activity.eventType.replace('_', ' ')}
                            </Badge>
                            {activity.eventType === 'DRAFT_CREATED' && activity.invoice?.gmailDraftId && (
                              <Badge 
                                className="bg-amber-500/15 hover:bg-amber-500/25 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] py-0 px-1.5 h-4 cursor-pointer flex items-center gap-1 transition-colors"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  window.open(`https://mail.google.com/mail/u/0/#drafts?compose=${activity.invoice.gmailDraftId}`, '_blank')
                                }}
                              >
                                <Mail className="h-2.5 w-2.5" />
                                Open Draft
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">Invoice: {activity.invoice?.invoiceNumber || 'N/A'}</p>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drafts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Draft Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {loading ? (
                  <div className="col-span-full text-center py-20 text-muted-foreground">Loading drafts...</div>
                ) : drafts.length === 0 ? (
                  <div className="col-span-full text-center py-20 text-muted-foreground">No draft invoices found.</div>
                ) : drafts.map((draft) => (
                  <Link key={draft.id} href={`/invoices/${draft.id}`}>
                    <Card className="hover:bg-muted/50 hover:border-amber-500/35 dark:hover:border-amber-500/20 transition-all duration-200 border border-dashed cursor-pointer">
                      <CardContent className="p-4 flex flex-col justify-between h-full min-h-[190px]">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold">{draft.invoiceNumber}</span>
                            {draft.gmailDraftId ? (
                              <Badge 
                                className="bg-amber-500/15 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-500/20 font-bold text-[10px] hover:bg-amber-500/30 transition-colors flex items-center gap-1 cursor-pointer"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  window.open(`https://mail.google.com/mail/u/0/#drafts?compose=${draft.gmailDraftId}`, '_blank')
                                }}
                              >
                                <Mail className="h-2.5 w-2.5" />
                                GMAIL DRAFT
                              </Badge>
                            ) : (
                              <Badge variant="outline">DRAFT</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">{draft.customer?.name}</p>
                          <p className="text-lg font-black text-primary">
                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: draft.currency || 'INR' }).format(draft.amount)}
                          </p>
                          {draft.gmailDraftId && (
                            <div className="mt-2 p-1.5 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/15 rounded-md text-[10px] text-amber-600 dark:text-amber-400 font-mono truncate">
                              Draft ID: {draft.gmailDraftId}
                            </div>
                          )}
                          <p className="text-[10px] text-muted-foreground mt-2 italic">Created {format(new Date(draft.createdAt), 'MMM dd, yyyy')}</p>
                        </div>
                        {draft.gmailDraftId && (
                          <div className="mt-4 w-full" onClick={(e) => e.stopPropagation()}>
                            <Button 
                              size="sm"
                              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all duration-200"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                window.open(`https://mail.google.com/mail/u/0/#drafts?compose=${draft.gmailDraftId}`, '_blank')
                              }}
                            >
                              <Mail className="h-3.5 w-3.5" />
                              Open Draft in Gmail
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
