"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Mail,
  Building2,
  Phone,
  Globe,
  MapPin,
  FileText,
  CreditCard,
  AlertTriangle,
  History,
  Clock
} from "lucide-react"
import { format } from "date-fns"
import { motion } from "framer-motion"
import axios from "axios"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { CreateInvoiceForm } from "@/components/invoices/create-invoice-form"
import Link from "next/link"

export default function CustomerDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const [customer, setCustomer] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [invoiceDialogOpen, setInvoiceDialogOpen] = React.useState(false)

  const fetchCustomer = React.useCallback(async () => {
    try {
      const response = await axios.get(`/api/customers/${id}`)
      setCustomer(response.data)
    } catch (error) {
      toast.error("Failed to fetch customer details")
    } finally {
      setLoading(false)
    }
  }, [id])

  React.useEffect(() => {
    fetchCustomer()
  }, [fetchCustomer])

  if (loading) return <div className="flex items-center justify-center h-[400px]">Loading details...</div>
  if (!customer) return <div className="text-center py-20">Customer not found.</div>

  const totalUnpaid = customer.invoices?.reduce((acc: number, inv: any) =>
    inv.status !== "PAID" ? acc + inv.amount : acc, 0) || 0

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()} className="-ml-2">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Customers
        </Button>
        <div className="flex gap-2">
          <Dialog open={invoiceDialogOpen} onOpenChange={setInvoiceDialogOpen}>
            <DialogTrigger nativeButton={true} render={<Button className="bg-primary hover:bg-primary/90" size="sm" />}>
              <Plus className="mr-2 h-4 w-4" /> Create Invoice
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create Invoice for {customer.name}</DialogTitle>
                <DialogDescription>
                  Enter the details to generate a new invoice.
                </DialogDescription>
              </DialogHeader>
              <CreateInvoiceForm
                onSuccess={() => {
                  setInvoiceDialogOpen(false)
                  fetchCustomer()
                }}
                preselectedCustomerId={id as string}
              />
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="sm">
            <Mail className="mr-2 h-4 w-4" /> Contact
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Building2 className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">{customer.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{customer.company || "Individual Account"}</p>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{customer.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>+1 (555) 000-0000</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>San Francisco, CA</span>
              </div>
            </div>

            <div className="pt-6 border-t space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Total Invoices</span>
                <span className="font-bold">{customer.invoices?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Outstanding Balance</span>
                <span className="font-bold text-red-500">
                  {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(totalUnpaid)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center">
                <History className="mr-2 h-5 w-5 text-primary" /> Invoice History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customer.invoices?.length > 0 ? (
                  customer.invoices.map((inv: any) => (
                    <Link
                      key={inv.id}
                      href={`/invoices/${inv.id}`}
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-md bg-muted group-hover:bg-background">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-bold">{inv.invoiceNumber}</p>
                          <p className="text-xs text-muted-foreground">{format(new Date(inv.issueDate), "MMM dd, yyyy")}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">
                          {new Intl.NumberFormat("en-IN", { style: "currency", currency: inv.currency || "INR" }).format(inv.amount)}
                        </p>
                        <Badge variant={inv.status === "PAID" ? "default" : "destructive"} className="text-[10px]">
                          {inv.status}
                        </Badge>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-12 text-muted-foreground">No invoice history found.</div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center">
                <Clock className="mr-2 h-5 w-5 text-primary" /> Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {customer.activityLogs?.length > 0 ? (
                  customer.activityLogs.map((log: any, i: number) => (
                    <div key={log.id} className="relative flex gap-3 pb-6 last:pb-0">
                      {i !== customer.activityLogs.length - 1 && (
                        <div className="absolute left-[11px] top-6 h-full w-[2px] bg-muted" />
                      )}
                      <div className="z-10 h-[22px] w-[22px] rounded-full border-4 border-background bg-primary/20" />
                      <div className="space-y-1">
                        <p className="text-sm font-semibold leading-tight">{log.description}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(log.timestamp), "MMM dd, h:mm a")}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-sm text-muted-foreground">No recent activity recorded.</div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-red-100 bg-red-50/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center text-red-600">
                  <AlertTriangle className="mr-2 h-4 w-4" /> Risk Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black">HIGH</span>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Payment Delay</p>
                    <p className="text-sm font-bold">Avg. 12 Days</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-green-100 bg-green-50/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center text-green-600">
                  <CreditCard className="mr-2 h-4 w-4" /> Collection Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black">42/100</span>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Since last month</p>
                    <p className="text-sm font-bold text-red-500">-5 pts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
