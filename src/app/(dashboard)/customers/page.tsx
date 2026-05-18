"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Users, AlertTriangle, ShieldCheck, TrendingUp, Star, Zap, ArrowRight, TrendingDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useCustomerStore } from "@/store/use-customer-store"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { CreateCustomerForm } from "@/components/customers/create-customer-form"

import { Checkbox } from "@/components/ui/checkbox"

export default function CustomersPage() {
  const { customers, loading, fetchCustomers, bulkDeleteCustomers } = useCustomerStore()
  const [open, setOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(customers.map(c => c.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectOne = (checked: boolean, id: string) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id])
    } else {
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id))
    }
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} customers? All their invoices will also be permanently deleted.`)) return
    setIsDeleting(true)
    try {
      await bulkDeleteCustomers(selectedIds)
      setSelectedIds([])
    } catch (error) {
      console.error(error)
    } finally {
      setIsDeleting(false)
    }
  }

  const topCustomers = [...customers]
    .sort((a, b) => (b.collectionScore) - (a.collectionScore))
    .slice(0, 3)

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Customer Intelligence</h2>
          <p className="text-muted-foreground font-medium">Analyze payment behavior and identify top performers.</p>
        </div>
        <div className="flex items-center gap-3">
          {selectedIds.length > 0 && (
            <Button variant="destructive" onClick={handleBulkDelete} disabled={isDeleting} className="shadow-lg shadow-destructive/20 animate-in fade-in zoom-in duration-200">
              {isDeleting ? (
                <><svg className="animate-spin mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Deleting...</>
              ) : (
                <><AlertTriangle className="mr-2 h-4 w-4" /> Delete Selected ({selectedIds.length})</>
              )}
            </Button>
          )}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger nativeButton={true} render={<Button className="shadow-lg shadow-primary/20" />}>
              <Plus className="mr-2 h-4 w-4" /> Add Customer
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Customer</DialogTitle>
                <DialogDescription>
                  Create a new customer profile to start tracking their invoices.
                </DialogDescription>
              </DialogHeader>
              <CreateCustomerForm onSuccess={() => setOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>


      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-green-500/20 bg-green-500/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-green-600">Reliable Payers</CardTitle>
            <ShieldCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">{customers.filter(c => c.riskLevel === 'LOW').length}</div>
            <p className="text-xs text-muted-foreground mt-1">Customers with 95%+ score</p>
          </CardContent>
        </Card>
        <Card className="border-orange-500/20 bg-orange-500/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-orange-600">At Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">{customers.filter(c => c.riskLevel === 'HIGH').length}</div>
            <p className="text-xs text-muted-foreground mt-1">Requires urgent intervention</p>
          </CardContent>
        </Card>
        <Card className="border-purple-500/20 bg-purple-500/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-purple-600">Avg. Delay</CardTitle>
            <TrendingDown className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">4.2 Days</div>
            <p className="text-xs text-muted-foreground mt-1">-15% from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-muted-foreground/10">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              <CardTitle>Top Reliable Customers</CardTitle>
            </div>
            <CardDescription>Target these for early-payment rewards or VIP upgrades.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCustomers.map((customer, i) => (
                <div key={customer.id} className="flex items-center justify-between p-3 rounded-xl border bg-muted/5 group hover:bg-muted/10 transition-all cursor-pointer" onClick={() => router.push(`/customers/${customer.id}`)}>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">#{i + 1}</div>
                    <div>
                      <p className="text-sm font-bold leading-none">{customer.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{customer.company}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">98% Loyalty</Badge>
                  </div>
                </div>
              ))}
              {customers.length === 0 && <p className="text-center text-sm text-muted-foreground py-4">No top performers yet.</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="border-muted-foreground/10">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <CardTitle>Future Opportunities</CardTitle>
            </div>
            <CardDescription>AI-driven growth and risk strategies.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 space-y-2">
              <h4 className="text-sm font-bold flex items-center gap-2 text-primary">
                <TrendingUp className="h-4 w-4" /> Expansion Target
              </h4>
              <p className="text-xs text-muted-foreground">
                {topCustomers[0]?.name || "None"} has a perfect payment record. Recommended for higher credit limits or discounted annual billing.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/10 space-y-2">
              <h4 className="text-sm font-bold flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-4 w-4" /> Risk Mitigation
              </h4>
              <p className="text-xs text-muted-foreground">
                Identified 3 customers with decreasing reliability scores. AI suggests shifting to "Firm" tone ladder earlier.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent text-[11px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/50">
              <TableHead className="w-[300px]">Customer Intelligence</TableHead>
              <TableHead>Reliability Score</TableHead>
              <TableHead>Risk Level</TableHead>
              <TableHead className="text-right">Outstanding</TableHead>
              <TableHead className="text-center">Delinquency</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-20"><Zap className="h-8 w-8 text-primary animate-pulse mx-auto mb-2" /> Loading Intelligence...</TableCell></TableRow>
            ) : customers.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-20 text-muted-foreground">No customers found. Start by adding one above.</TableCell></TableRow>
            ) : customers.map((customer) => (
              <TableRow
                key={customer.id}
                className="cursor-pointer hover:bg-muted/30 transition-all group border-b"
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  if (target.closest('button')) return;
                  router.push(`/customers/${customer.id}`)
                }}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center font-bold text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      {customer.name.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-foreground group-hover:text-primary transition-colors">{customer.name}</span>
                      <span className="text-xs text-muted-foreground">{customer.email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="w-[180px]">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      <span>Score</span>
                      <span>{customer.collectionScore}%</span>
                    </div>
                    <Progress value={customer.collectionScore} className="h-1.5 bg-muted" />
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`
                          text-[10px] font-bold uppercase
                          ${customer.riskLevel === 'LOW' ? 'bg-green-50 text-green-700 border-green-200' :
                      customer.riskLevel === 'MEDIUM' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                        'bg-red-50 text-red-700 border-red-200'}
                      `}>
                    {customer.riskLevel}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="text-sm font-black text-foreground">
                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(customer.unpaidAmount || 0)}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
                    <AlertTriangle className={`h-3 w-3 ${customer.overdueCount > 0 ? "text-orange-500" : "text-muted-foreground"}`} />
                    {customer.overdueCount || 0} times
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
