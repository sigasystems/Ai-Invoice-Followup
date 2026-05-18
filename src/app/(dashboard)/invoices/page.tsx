"use client"

import { useEffect } from "react"
import { useInvoiceStore } from "@/store/use-invoice-store"
import { InvoiceTable } from "@/components/invoices/invoice-table"
import { Button } from "@/components/ui/button"
import { PlusCircle, Download } from "lucide-react"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CreateInvoiceForm } from "@/components/invoices/create-invoice-form"

export default function InvoicesPage() {
  const { invoices, fetchInvoices, loading } = useInvoiceStore()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Invoices</h2>
          <p className="text-muted-foreground">Manage and track your customer invoices.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger nativeButton={true} render={<Button />}>
              <PlusCircle className="mr-2 h-4 w-4" /> Create Invoice
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Invoice</DialogTitle>
                <DialogDescription>
                  Enter the details of the new invoice. Click create when you're done.
                </DialogDescription>
              </DialogHeader>
              <CreateInvoiceForm onSuccess={() => setOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="h-10 w-full animate-pulse rounded bg-muted" />
          <div className="h-[400px] w-full animate-pulse rounded bg-muted" />
        </div>
      ) : (
        <InvoiceTable data={invoices} />
      )}
    </div>
  )
}
