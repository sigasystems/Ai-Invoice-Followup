"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import axios from "axios"
import { useInvoiceStore } from "@/store/use-invoice-store"
import { useCustomerStore } from "@/store/use-customer-store"
import { useSettingsStore } from "@/store/use-settings-store"
import { useEffect } from "react"

const formSchema = z.object({
  invoiceNumber: z.string().min(2, {
    message: "Invoice number must be at least 2 characters.",
  }),
  customerId: z.string().min(1, "Customer is required"),
  amount: z.coerce.number().positive(),
  issueDate: z.string(),
  dueDate: z.string(),
  followupStartAfterDays: z.coerce.number().min(0),
  nextActionDate: z.string().optional().nullable(),
  notes: z.string().optional(),
})

type FormValues = {
  invoiceNumber: string;
  customerId: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  followupStartAfterDays: number;
  nextActionDate?: string | null;
  notes?: string;
}

export function CreateInvoiceForm({ onSuccess, preselectedCustomerId, invoice }: { onSuccess: () => void, preselectedCustomerId?: string, invoice?: any }) {
  const fetchInvoices = useInvoiceStore(state => state.fetchInvoices)
  const { customers, loading, fetchCustomers } = useCustomerStore()
  const { fetchSettings, followupStartAfterDays, hasFetched } = useSettingsStore()

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  useEffect(() => {
    if (!hasFetched) {
      fetchSettings()
    }
  }, [hasFetched, fetchSettings])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      invoiceNumber: invoice?.invoiceNumber || "",
      customerId: invoice?.customerId || preselectedCustomerId || "",
      amount: invoice?.amount || 0,
      issueDate: invoice?.issueDate ? new Date(invoice.issueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      dueDate: invoice?.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      followupStartAfterDays: (invoice?.followupStartAfterDays !== undefined && invoice?.followupStartAfterDays !== null) ? invoice.followupStartAfterDays : (followupStartAfterDays ?? 1),
      nextActionDate: invoice?.rawNextActionDate ? new Date(invoice.rawNextActionDate).toISOString().split('T')[0] : null,
      notes: invoice?.notes || "",
    },
  })

  useEffect(() => {
    if (!invoice && hasFetched) {
      form.setValue("followupStartAfterDays", followupStartAfterDays)
    }
  }, [followupStartAfterDays, hasFetched, invoice, form])


  async function onSubmit(values: FormValues) {
    try {
      const payload = {
        ...values,
        nextActionDate: values.nextActionDate ? new Date(values.nextActionDate).toISOString() : null
      }

      if (invoice) {
        await axios.put(`/api/invoices/${invoice.id}`, payload)
        toast.success("Invoice updated successfully")
      } else {
        await axios.post("/api/invoices", payload)
        toast.success("Invoice created successfully")
      }

      fetchInvoices()
      onSuccess()
    } catch (error: any) {
      toast.error(error.response?.data?.error || `Failed to ${invoice ? 'update' : 'create'} invoice`)
    }
  }


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="invoiceNumber"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel>Invoice Number</FormLabel>
              <FormControl>
                <Input placeholder="INV-001" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="customerId"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel>Customer</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {customers.length > 0 ? (
                    customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-4 text-sm text-center space-y-2">
                      <p className="text-muted-foreground">
                        {loading ? "Loading customers..." : "No customers found"}
                      </p>
                      {!loading && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => window.location.href = "/customers"}
                        >
                          Add Customer first
                        </Button>
                      )}
                    </div>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="followupStartAfterDays"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Follow-up Delay (Days)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" {...field} />
                </FormControl>
                <FormDescription className="text-[10px]">Days after due date to start</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="issueDate"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Issue Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Due Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {invoice && (
          <FormField
            control={form.control}
            name="nextActionDate"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  Next Action Date (Testing/Override)
                </FormLabel>
                <FormControl>
                  <Input type="date" {...field} value={field.value || ""} />
                </FormControl>
                <FormDescription>
                  Change this to today's date if you want to test the manual followup trigger immediately.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Input placeholder="Optional notes..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? (
            <><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Saving...</>
          ) : (
            invoice ? 'Save Changes' : 'Create Invoice'
          )}
        </Button>
      </form>
    </Form>
  )
}
