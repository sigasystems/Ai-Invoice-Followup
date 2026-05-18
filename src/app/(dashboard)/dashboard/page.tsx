"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { FileText, Users, AlertCircle, CheckCircle, TrendingUp, Clock, Zap, ArrowUpRight, ArrowRight } from "lucide-react"
import { useEffect, useState } from "react"
import axios from "axios"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

export default function DashboardPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("/api/dashboard/stats")
        setData(res.data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const getIcon = (name: string) => {
    switch (name) {
      case "FileText": return FileText
      case "Users": return Users
      case "AlertCircle": return AlertCircle
      case "CheckCircle": return CheckCircle
      default: return FileText
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-[400px]">
      <div className="flex flex-col items-center gap-2">
        <Zap className="h-8 w-8 text-primary animate-pulse" />
        <p className="text-sm text-muted-foreground">Syncing dashboard data...</p>
      </div>
    </div>
  )

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
          <p className="text-muted-foreground">Here's an overview of your AI-managed collections.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" render={<Link href="/invoices" />}>
            View All Invoices
          </Button>
          {/* <Button size="sm" render={<Link href="/invoices/create" />}>
            <Zap className="mr-2 h-4 w-4" /> Create Invoice
          </Button> */}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {data?.stats.map((stat: any) => {
          const Icon = getIcon(stat.icon)
          return (
            <Card key={stat.title} className="overflow-hidden border-muted-foreground/10 hover:shadow-md transition-all group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/5 group-hover:bg-muted/10 transition-colors">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-2xl font-black">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-muted-foreground/10">
          <CardHeader>
            <CardTitle>Collection Health</CardTitle>
            <CardDescription>Overall collection efficiency and recovery rate.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Total Recovery Rate</span>
                <span className="font-bold">{data?.collectionRate.toFixed(1)}%</span>
              </div>
              <Progress value={data?.collectionRate} className="h-3 bg-muted" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-green-50 border border-green-100 dark:bg-green-950/20 dark:border-green-900/30">
                <p className="text-xs text-green-600 dark:text-green-400 font-bold uppercase tracking-wider mb-1">Recovered This Month</p>
                <p className="text-xl font-black text-green-700 dark:text-green-300">
                  {data ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(data.recoveredThisMonth || 0) : "₹0.00"}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-orange-50 border border-orange-100 dark:bg-orange-950/20 dark:border-orange-900/30">
                <p className="text-xs text-orange-600 dark:text-orange-400 font-bold uppercase tracking-wider mb-1">Projected Next 7 Days</p>
                <p className="text-xl font-black text-orange-300">
                  {data ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(data.projectedNext7Days || 0) : "₹0.00"}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-dashed p-6 text-center space-y-3 bg-muted/5">
              <Zap className="h-8 w-8 text-primary mx-auto opacity-50" />
              <h4 className="font-bold">AI Orchestration Active</h4>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Your collection ladder is fully operational. {data?.scheduledFollowupsCount || 0} followups are scheduled for the next 24 hours.
              </p>

              <Button variant="outline" size="sm" render={<Link href="/settings" />}>
                Configure Ladder
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-muted-foreground/10">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system events and communications.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {data?.recentActivity.map((activity: any) => (
                <div key={activity.id} className="flex gap-4 group cursor-pointer">
                  <div className="h-9 w-9 shrink-0 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <Clock className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none group-hover:text-primary transition-colors">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
              <Button variant="ghost" className="w-full text-xs" render={<Link href="/activity" />}>
                View Full Timeline <ArrowRight className="ml-2 h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-muted-foreground/10">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Upcoming Reminders</CardTitle>
            <CardDescription>Invoices scheduled for AI intervention.</CardDescription>
          </div>
          <Button variant="ghost" size="sm" render={<Link href="/invoices" />}>
            View all <ArrowUpRight className="ml-2 h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data?.recentInvoices.filter((inv: any) => inv.status === "OVERDUE").map((invoice: any) => (
              <div key={invoice.id} className="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-muted/20 transition-all">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-orange-100 dark:bg-orange-950 flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="font-bold">{invoice.invoiceNumber}</p>
                    <p className="text-sm text-muted-foreground">{invoice.customer.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right hidden md:block">
                    <p className="text-sm font-medium">Amount</p>
                    <p className="font-bold">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: invoice.currency || 'INR' }).format(invoice.amount)}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="mb-1">Next Action</Badge>
                    <p className="text-xs text-muted-foreground">In 2 days (Firm)</p>
                  </div>
                  <Button size="icon" variant="ghost" render={<Link href={`/invoices/${invoice.id}`} />}>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {data?.recentInvoices.filter((inv: any) => inv.status === "OVERDUE").length === 0 && (
              <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-xl">
                No overdue invoices require immediate attention.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function Badge({ children, variant = "default", className }: any) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variant === "outline" ? "border border-input bg-background hover:bg-accent hover:text-accent-foreground" : "bg-primary text-primary-foreground hover:bg-primary/80"
      } ${className}`}>
      {children}
    </span>
  )
}
