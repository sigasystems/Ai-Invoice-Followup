"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft, Mail, TrendingUp, ShieldCheck, Phone, Eye, Zap } from "lucide-react"
import { fetchInvoices, fetchCustomers } from "@/lib/api"
import { Customer, Invoice } from "@/types"
import { ColumnDef } from "@tanstack/react-table"
import { cn } from "@/lib/utils"

export default function CustomerDetailPage() {
   const { id } = useParams()
   const router = useRouter()
   const [customer, setCustomer] = React.useState<Customer | null>(null)
   const [invoices, setInvoices] = React.useState<Invoice[]>([])
   const [loading, setLoading] = React.useState(true)

   React.useEffect(() => {
      async function load() {
         const allCust = await fetchCustomers()
         const allInv = await fetchInvoices()
         const found = allCust.find(c => c.id === id)
         setCustomer(found || null)
         setInvoices(allInv.filter(i => i.customerEmail === found?.email))
         setLoading(false)
      }
      load()
   }, [id])

   if (loading) return (
      <div className="p-20 text-center animate-pulse flex flex-col items-center gap-4">
         <div className="h-10 w-10 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
         <p className="font-bold text-muted-foreground/60 tracking-wider text-[12px]">Analyzing behavioral history...</p>
      </div>
   )
   
   if (!customer) return <div className="p-20 text-center font-bold text-rose-500">Customer profile not found.</div>

   const columns: ColumnDef<Invoice>[] = [
      {
         accessorKey: 'id',
         header: 'ID',
         cell: ({ row }) => (
            <span 
               onClick={() => router.push(`/invoices/${row.original.id}`)}
               className="font-mono text-xs font-bold text-primary hover:underline cursor-pointer"
            >
               {row.original.invoice_number || row.original.id}
            </span>
         ),
      },
      {
         accessorKey: 'amount',
         header: 'Amount',
         cell: ({ row }) => <span className="font-bold text-neutral-900 dark:text-neutral-100">₹{(row.getValue('amount') as number).toLocaleString('en-IN')}</span>,
      },
      {
         accessorKey: 'status',
         header: 'Status',
         cell: ({ row }) => <StatusBadge status={row.getValue('status')} />,
      },
      {
         accessorKey: 'dueDate',
         header: 'Due Date',
         cell: ({ row }) => <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">{new Date(row.getValue('dueDate')).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>,
      },
      {
         id: 'actions',
         header: '',
         cell: ({ row }) => (
            <div className="flex justify-end">
               <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/invoices/${row.original.id}`)}
                  className="rounded-lg h-8 px-3 gap-2 font-bold text-xs hover:bg-primary/5 hover:text-primary transition-all"
               >
                  <Eye className="w-3.5 h-3.5" />
                  View
               </Button>
            </div>
         )
      }
   ];

   return (
      <DashboardLayout>
         <PageHeader
            title={customer.name}
            description={`Behavioral score: ${customer.behaviorScore}/100 • Risk profile: ${customer.riskLevel} • ${customer.phone || 'No phone recorded'}`}
         >
            <Button variant="ghost" onClick={() => router.back()} className="rounded-lg h-10 px-4 border border-border/50 font-bold gap-2 text-neutral-900 dark:text-neutral-100">
               <ArrowLeft className="w-4 h-4" />
               Back
            </Button>
         </PageHeader>

         <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            <div className="xl:col-span-1 space-y-6">
               {/* Risk Summary */}
               <Card className={cn(
                  "rounded-lg border-none shadow-xl text-white p-8 relative overflow-hidden",
                  customer.behaviorScore > 70 ? "bg-emerald-600 shadow-emerald-500/20" : customer.behaviorScore > 40 ? "bg-amber-500 shadow-amber-500/20" : "bg-rose-600 shadow-rose-500/20"
               )}>
                  <div className="flex items-center justify-between mb-8">
                     <ShieldCheck className="w-8 h-8 opacity-20" />
                     <span className="text-[11px] font-bold tracking-wider px-2 py-1 bg-white/20 rounded-lg">Trust Level</span>
                  </div>
                  <h4 className="text-[11px] font-bold opacity-80 tracking-wider mb-1">Behavioral score</h4>
                  <h2 className="text-5xl font-bold mb-4">{customer.behaviorScore}</h2>
                  <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                     <div className="h-full bg-white shadow-lg" style={{ width: `${customer.behaviorScore}%` }} />
                  </div>
                  <p className="text-[11px] mt-6 font-bold opacity-80 italic leading-relaxed">
                     Based on historical payment delay, communication sentiment, and default frequency.
                  </p>
               </Card>

               {/* Contact Info */}
               <Card className="rounded-lg border border-border/50 shadow-xl shadow-neutral-900/5 dark:shadow-black/20 p-8 bg-white dark:bg-neutral-900">
                  <h4 className="text-[11px] font-bold text-muted-foreground/60 tracking-wider mb-8">Contact channels</h4>
                  <div className="space-y-6">
                     <div className="flex items-start gap-4">
                        <div className="h-9 w-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center shrink-0">
                           <Mail className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="min-w-0">
                           <p className="text-[10px] font-bold text-muted-foreground/60 tracking-wider mb-1">Email system</p>
                           <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate">{customer.email}</p>
                        </div>
                     </div>

                     <div className="flex items-start gap-4">
                        <div className="h-9 w-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center shrink-0">
                           <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className="min-w-0">
                           <p className="text-[10px] font-bold text-muted-foreground/60 tracking-wider mb-1">Mobile / WhatsApp</p>
                           <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate">{customer.phone || 'Not available'}</p>
                        </div>
                     </div>

                     <div className="pt-2">
                        <p className="text-[10px] font-bold text-muted-foreground/60 tracking-wider mb-3">Engagement</p>
                        <div className="flex items-center gap-2 bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
                           <TrendingUp className="w-4 h-4 text-emerald-600" />
                           <span className="text-xs font-bold text-emerald-700">{customer.onTimeRate}% Success Rate</span>
                        </div>
                     </div>
                  </div>
               </Card>
            </div>

            <div className="xl:col-span-3 space-y-8">
               {/* Financial Recap */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className=" p-6 rounded-lg border border-border/50 bg-white dark:bg-neutral-900 shadow-xl shadow-neutral-900/5 dark:shadow-black/20 flex flex-col gap-1.5">
                     <p className="text-[11px] font-bold text-muted-foreground/60 tracking-wider">Total outstanding</p>
                     <p className="text-3xl font-bold text-rose-600">₹{customer.totalOutstanding.toLocaleString()}</p>
                  </div>
                  <div className=" p-6 rounded-lg border border-border/50 bg-white dark:bg-neutral-900 shadow-xl shadow-neutral-900/5 dark:shadow-black/20 flex flex-col gap-1.5">
                     <p className="text-[11px] font-bold text-muted-foreground/60 tracking-wider">Avg. payment delay</p>
                     <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{customer.avgDelay} days</p>
                  </div>
                  <div className=" p-6 rounded-lg border border-border/50 bg-white dark:bg-neutral-900 shadow-xl shadow-neutral-900/5 dark:shadow-black/20 flex flex-col gap-1.5">
                     <p className="text-[11px] font-bold text-muted-foreground/60 tracking-wider">Total invoices</p>
                     <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{customer.totalInvoices}</p>
                  </div>
               </div>

               {/* Invoice History */}
               <Card className="rounded-lg border border-border/50 bg-white dark:bg-neutral-900 shadow-xl shadow-neutral-900/5 dark:shadow-black/20 overflow-hidden">
                  <CardHeader className="p-8 border-b border-border/40">
                     <CardTitle className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Billing record</CardTitle>
                     <CardDescription className="text-sm font-bold text-muted-foreground/60">Complete ledger for {customer.name}.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 pt-6">
                     <DataTable columns={columns} data={invoices} filterKey="id" />
                  </CardContent>
               </Card>

               {/* AI Analysis Card */}
               <Card className="rounded-lg border border-primary/20 bg-primary/5 p-8 shadow-xl shadow-primary/5">
                  <div className="flex items-start gap-6">
                     <div className="w-12 h-12 rounded-lg bg-primary text-white flex items-center justify-center shrink-0 shadow-lg shadow-primary/30">
                        <Zap className="w-6 h-6" />
                     </div>
                     <div className="space-y-3">
                        <h4 className="text-[11px] font-bold text-primary tracking-widest">Strategic recommendation</h4>
                        <p className="text-base font-bold text-neutral-900 dark:text-neutral-100 leading-relaxed italic">
                           "{customer.aiInsight || 'Customer exhibits regular payment behavior. Recommend neutral automated reminders 2 days prior to due date to maintain healthy DSO.'}"
                        </p>
                     </div>
                  </div>
               </Card>
            </div>
         </div>
      </DashboardLayout>
   )
}
