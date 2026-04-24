"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft, Mail, TrendingUp, ShieldCheck, Phone, Eye } from "lucide-react"
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
   console.log("customers,", customer);

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

   if (loading) return <div className="p-20 text-center animate-pulse font-bold text-muted-foreground">Analyzing Behavioral History...</div>
   if (!customer) return <div className="p-20 text-center font-bold text-rose-500">Customer profile not found.</div>

   const columns: ColumnDef<Invoice>[] = [
      {
         accessorKey: 'id',
         header: 'ID',
         cell: ({ row }) => (
            <span 
               onClick={() => router.push(`/invoices/${row.getValue('id')}`)}
               className="font-mono text-xs font-bold text-primary hover:underline cursor-pointer"
            >
               {row.getValue('id')}
            </span>
         ),
      },
      {
         accessorKey: 'amount',
         header: 'Amount',
         cell: ({ row }) => <span className="font-bold">₹{(row.getValue('amount') as number).toLocaleString('en-IN')}</span>,
      },
      {
         accessorKey: 'status',
         header: 'Status',
         cell: ({ row }) => <StatusBadge status={row.getValue('status')} />,
      },
      {
         accessorKey: 'dueDate',
         header: 'Due Date',
         cell: ({ row }) => <span className="text-xs font-medium">{new Date(row.getValue('dueDate')).toLocaleDateString()}</span>,
      },
      {
         id: 'actions',
         header: '',
         cell: ({ row }) => (
            <div className="flex justify-end">
               <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/invoices/${row.getValue('id')}`)}
                  className="rounded-xl h-8 px-3 gap-2 font-bold text-xs hover:bg-primary/5 hover:text-primary transition-all"
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
            <Button variant="ghost" onClick={() => router.back()} className="rounded-xl h-10 px-4">
               <ArrowLeft className="w-4 h-4 mr-2" />
               Back
            </Button>
         </PageHeader>

         <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1 space-y-6">
               {/* Risk Summary */}
               <Card className={cn(
                  "rounded-3xl border-none shadow-xl text-white p-6 relative overflow-hidden",
                  customer.behaviorScore > 70 ? "bg-emerald-600" : customer.behaviorScore > 40 ? "bg-amber-500" : "bg-rose-600"
               )}>
                  <div className="flex items-center justify-between mb-8">
                     <ShieldCheck className="w-8 h-8 opacity-20" />
                     <span className="text-[12px] font-semibold uppercase  /20 px-2 py-1 rounded-lg">Trust Level</span>
                  </div>
                  <h4 className="text-sm font-bold opacity-80 mb-1">Behavioral Score</h4>
                  <h2 className="text-5xl font-semibold mb-4">{customer.behaviorScore}</h2>
                  <div className="h-1.5 w-full /20 rounded-full overflow-hidden">
                     <div className="h-full  shadow-lg" style={{ width: `${customer.behaviorScore}%` }} />
                  </div>
                  <p className="text-[12px] mt-4 font-bold opacity-70 italic leading-snug">
                     Based on historical payment delay, communication sentiment, and default frequency.
                  </p>
               </Card>

               {/* Contact Info */}
               <Card className="rounded-3xl border-none shadow-xl shadow-primary/5  p-6">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase mb-6">Contact Channels</h4>
                  <div className="space-y-5">
                     <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                           <Mail className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div className="min-w-0">
                           <p className="text-[10px] font-bold uppercase text-muted-foreground leading-none mb-1">Email System</p>
                           <p className="text-sm font-semibold truncate">{customer.email}</p>
                        </div>
                     </div>

                     <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                           <Phone className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div className="min-w-0">
                           <p className="text-[10px] font-bold uppercase text-muted-foreground leading-none mb-1">Mobile / WhatsApp</p>
                           <p className="text-sm font-semibold truncate">{customer.phone || 'Not available'}</p>
                        </div>
                     </div>

                     <div className="pt-2">
                        <p className="text-[10px] font-bold uppercase text-muted-foreground mb-2 px-1">Engagement</p>
                        <div className="flex items-center gap-2 bg-emerald-50/50 p-2 rounded-xl">
                           <TrendingUp className="w-4 h-4 text-emerald-600" />
                           <span className="text-xs font-black text-emerald-700">{customer.onTimeRate}% Success Rate</span>
                        </div>
                     </div>
                  </div>
               </Card>
            </div>

            <div className="lg:col-span-3 space-y-8">
               {/* Financial Recap */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className=" p-6 rounded-3xl border-none shadow-xl shadow-primary/5 flex flex-col gap-1">
                     <p className="text-[12px] font-semibold text-muted-foreground uppercase">Total Outstanding</p>
                     <p className="text-2xl font-semibold text-rose-600">₹{customer.totalOutstanding.toLocaleString()}</p>
                  </div>
                  <div className=" p-6 rounded-3xl border-none shadow-xl shadow-primary/5 flex flex-col gap-1">
                     <p className="text-[12px] font-semibold text-muted-foreground uppercase">Avg. Payment Delay</p>
                     <p className="text-2xl font-semibold ">{customer.avgDelay} Days</p>
                  </div>
                  <div className=" p-6 rounded-3xl border-none shadow-xl shadow-primary/5 flex flex-col gap-1">
                     <p className="text-[12px] font-semibold text-muted-foreground uppercase">Total Invoices</p>
                     <p className="text-2xl font-semibold ">{customer.totalInvoices}</p>
                  </div>
               </div>

               {/* Invoice History */}
               <Card className="rounded-3xl border-none shadow-xl shadow-primary/5  overflow-hidden">
                  <CardHeader className="p-8">
                     <CardTitle className="text-lg font-semibold">Billing Record</CardTitle>
                     <CardDescription className="text-xs font-semibold">Complete ledger for {customer.name}.</CardDescription>
                  </CardHeader>
                  <CardContent className="px-8 pb-8 pt-0">
                     <DataTable columns={columns} data={invoices} filterKey="id" />
                  </CardContent>
               </Card>

               {/* AI Analysis Card */}
               <Card className="rounded-3xl border-none shadow-xl shadow-primary/5  p-8">
                  <div className="flex items-start gap-4">
                     <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0">
                        <TrendingUp className="w-6 h-6 text-indigo-600" />
                     </div>
                     <div>
                        <h4 className="text-sm font-semibold  mb-2 underline decoration-indigo-200 underline-offset-4">Strategic Recommendation</h4>
                        <p className="text-sm font-medium  leading-relaxed italic">
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
