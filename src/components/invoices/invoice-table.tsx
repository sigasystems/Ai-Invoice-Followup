"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { useRouter } from "next/navigation"
import { ArrowUpDown, ChevronDown, MoreHorizontal, Play, Eye, Edit, CheckCircle, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { FollowupPreviewModal } from "./followup-preview-modal"
import { Checkbox } from "@/components/ui/checkbox"
import { useInvoiceStore } from "@/store/use-invoice-store"
import { useSettingsStore } from "@/store/use-settings-store"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CreateInvoiceForm } from "./create-invoice-form"


export const columns: ColumnDef<any>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "invoiceNumber",
    header: "Invoice #",
    cell: ({ row }) => <div className="font-bold text-primary">{row.getValue("invoiceNumber")}</div>,
  },
  {
    accessorKey: "issueDate",
    header: "Issued",
    cell: ({ row }) => <div className="text-xs text-muted-foreground">{format(new Date(row.getValue("issueDate")), "MMM dd, yyyy")}</div>,
  },
  {
    accessorKey: "dueDate",
    header: "Due",
    cell: ({ row }) => <div className="text-xs text-muted-foreground">{format(new Date(row.getValue("dueDate")), "MMM dd, yyyy")}</div>,
  },
  {
    accessorKey: "followupStartAfterDays",
    header: "Delay",
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium text-xs">{row.original.followupStartAfterDays}</span>
        <span className="text-[10px] text-muted-foreground">days</span>
      </div>
    ),
  },
  {
    accessorKey: "customer.name",
    header: "Customer",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium text-sm">{row.original.customer?.name}</span>
        <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{row.original.customer?.company || "Personal"}</span>
      </div>
    ),
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="-ml-4"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Amount
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"))
      const formatted = new Intl.NumberFormat("en-IN", {
        style: 'currency',
        currency: row.original.currency || 'INR',
      }).format(amount)
      return <div className="font-black text-foreground">{formatted}</div>
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge variant={
          status === "PAID" ? "default" :
            status === "OVERDUE" ? "destructive" :
              status === "PENDING" ? "outline" : "secondary"
        } className="font-bold text-[10px] uppercase">
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: "lastFollowupSentAt",
    header: "Last Followup",
    cell: function LastFollowupCell({ row }) {
      const invoice = row.original
      const dateVal = invoice.lastFollowupSentAt
      const [isOpen, setIsOpen] = React.useState(false)
      const [tempDate, setTempDate] = React.useState(
        dateVal ? new Date(dateVal).toISOString().split('T')[0] : ""
      )
      const [isSaving, setIsSaving] = React.useState(false)
      const updateInvoice = useInvoiceStore((state) => state.updateInvoice)

      // Sync local state if props change
      React.useEffect(() => {
        if (dateVal) {
          try {
            setTempDate(new Date(dateVal).toISOString().split('T')[0])
          } catch (e) {
            setTempDate("")
          }
        } else {
          setTempDate("")
        }
      }, [dateVal])

      const handleSave = async (e: React.MouseEvent) => {
        e.stopPropagation()
        if (!tempDate) {
          toast.error("Please select a valid date")
          return
        }

        setIsSaving(true)
        try {
          await updateInvoice(invoice.id, { lastFollowupSentAt: new Date(tempDate) })
          toast.success("Followup date updated successfully")
          setIsOpen(false)
        } catch (err) {
          toast.error("Failed to update followup date")
        } finally {
          setIsSaving(false)
        }
      }

      return (
        <div onClick={(e) => e.stopPropagation()}>
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger nativeButton={true} render={
              <button className="focus:outline-hidden active:scale-95 transition-transform">
                {dateVal ? (
                  <Badge variant="outline" className="font-bold text-[10px] uppercase cursor-pointer hover:bg-muted/70 hover:border-primary/30 transition-all border border-dashed py-0.5 px-2 bg-muted/20 text-muted-foreground flex items-center gap-1">
                    <span>{format(new Date(dateVal), "MMM dd, yyyy")}</span>
                    <span className="text-[9px] text-primary">(Edit)</span>
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="font-bold text-[9px] cursor-pointer hover:bg-muted/70 hover:border-primary/20 transition-all border border-dashed py-0.5 px-2 bg-muted/10 text-muted-foreground flex items-center gap-1">
                    <span>— No Followup</span>
                    <span className="text-[8px] text-primary">(Set)</span>
                  </Badge>
                )}
              </button>
            } />
            <PopoverContent className="w-64 p-3 bg-popover shadow-xl ring-1 ring-foreground/10 border rounded-lg flex flex-col gap-3 isolate z-50">
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-xs text-foreground">Edit Followup Date</span>
                <span className="text-[10px] text-muted-foreground">Adjust the last sent email date.</span>
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
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsOpen(false)
                  }}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="h-7 text-[10px] px-2.5 bg-primary text-primary-foreground hover:bg-primary/95"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )
    },
  },
  {
    accessorKey: "currentStage",
    header: "Collection Path",
    cell: function CollectionPathCell({ row }) {
      const { ladderSteps, hasFetched, fetchSettings } = useSettingsStore()

      React.useEffect(() => {
        if (!hasFetched) {
          fetchSettings()
        }
      }, [hasFetched, fetchSettings])

      if (!hasFetched) {
        return <div className="h-2 w-24 bg-muted rounded animate-pulse" />
      }

      const stage = row.original.currentStage || 0
      const status = row.original.status
      const totalSteps = ladderSteps.length > 0 ? ladderSteps.length : 1

      let barColor = 'bg-primary'
      let textColor = 'text-muted-foreground'
      let textLabel = `Stage ${stage} Reached`

      if (status === 'PAID') {
        textColor = 'text-green-600'
        textLabel = 'Collection Complete'
      } else if (status === 'CANCELLED') {
        textLabel = 'Path Halted'
      } else if (stage === 0) {
        textLabel = 'Monitoring'
      } else {
        textColor = 'text-orange-600'
        textLabel = `Escalation Lvl ${stage}`
      }

      return (
        <div className="flex flex-col gap-1.5 min-w-[100px]">
          <div className="flex gap-0.5">
            {[...Array(totalSteps)].map((_, i) => {
              const isCompleted = status === 'PAID' ? true : i < stage;
              const isNext = status !== 'PAID' && status !== 'CANCELLED' && i === stage;

              let bgClass = "bg-muted/40"; // future
              if (isCompleted) {
                bgClass = status === 'PAID' ? "bg-green-500" : "bg-primary";
              } else if (isNext) {
                bgClass = "bg-primary/50 animate-pulse ring-1 ring-primary/30";
              } else if (status === 'CANCELLED') {
                bgClass = "bg-muted-foreground/20";
              }

              return (
                <div
                  key={i}
                  className={`h-1.5 w-full first:rounded-l-full last:rounded-r-full transition-all duration-500 ${bgClass}`}
                />
              )
            })}
          </div>
          <span className={`text-[9px] font-bold uppercase tracking-tighter ${textColor}`}>
            {textLabel}
          </span>
        </div>
      )

    }

  },
  {
    accessorKey: "nextActionDate",
    header: "Next Intervention",
    cell: function NextInterventionCell({ row }) {
      const { ladderSteps, hasFetched, fetchSettings } = useSettingsStore()
      const updateInvoice = useInvoiceStore((state) => state.updateInvoice)

      const invoice = row.original
      const [isOpen, setIsOpen] = React.useState(false)
      const [tempDate, setTempDate] = React.useState("")
      const [isSaving, setIsSaving] = React.useState(false)

      React.useEffect(() => {
        if (!hasFetched) fetchSettings()
      }, [hasFetched, fetchSettings])

      // Compute final next action date and tone
      let date = invoice.nextActionDate
      let tone = invoice.expectedTone

      const currentStage = invoice.currentStage || 0
      if (!date && ladderSteps.length > currentStage) {
        const nextStep = ladderSteps[currentStage]
        const delay = currentStage === 0
          ? (invoice.followupStartAfterDays ?? nextStep.delayDays)
          : nextStep.delayDays

        const projectedDate = new Date(invoice.dueDate)
        projectedDate.setDate(projectedDate.getDate() + delay)
        date = projectedDate.toISOString()
        tone = nextStep.tone
      }

      // Initialize date input hook - placed unconditionally before any early returns!
      React.useEffect(() => {
        if (date) {
          try {
            setTempDate(new Date(date).toISOString().split('T')[0])
          } catch (e) {
            setTempDate("")
          }
        }
      }, [date, isOpen])

      const handleSave = async (e: React.MouseEvent) => {
        e.stopPropagation()
        if (!tempDate) {
          toast.error("Please select a valid date")
          return
        }

        setIsSaving(true)
        try {
          await updateInvoice(invoice.id, { nextActionDate: new Date(tempDate) })
          toast.success("Intervention date updated successfully")
          setIsOpen(false)
        } catch (err) {
          toast.error("Failed to update intervention date")
        } finally {
          setIsSaving(false)
        }
      }

      // Early returns for loading/status states
      if (!hasFetched) return <div className="h-2 w-20 bg-muted rounded animate-pulse" />

      if (invoice.status === "PAID") {
        return <Badge variant="secondary" className="text-[9px] opacity-70 bg-green-50 text-green-700">Resolved</Badge>
      }

      if (invoice.status === "CANCELLED") {
        return <Badge variant="secondary" className="text-[9px] opacity-50">Cancelled</Badge>
      }

      if (!date) {
        return <Badge variant="secondary" className="text-[9px] bg-yellow-200 dark:text-white dark:bg-yellow-200/50">Ladders Completed</Badge>
      }

      const isReady = (invoice.status === "OVERDUE" || invoice.status === "PENDING") && new Date(date) <= new Date()

      return (
        <div className="flex flex-col gap-1" onClick={(e) => e.stopPropagation()}>
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger nativeButton={true} render={
              <button className="focus:outline-hidden active:scale-95 transition-transform text-left group">
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-bold ${isReady ? "text-orange-600" : "text-foreground"} group-hover:text-primary transition-colors flex items-center gap-1`}>
                    {format(new Date(date), "MMM dd")}
                    <span className="text-[8px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity font-medium">(Edit)</span>
                  </span>
                  {tone && (
                    <Badge variant="outline" className={`text-[9px] py-0 px-1 border-primary/20 bg-primary/5 uppercase font-bold`}>
                      {tone}
                    </Badge>
                  )}
                </div>
              </button>
            } />
            <PopoverContent className="w-64 p-3 bg-popover shadow-xl ring-1 ring-foreground/10 border rounded-lg flex flex-col gap-3 isolate z-50">
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-xs text-foreground">Edit Intervention Date</span>
                <span className="text-[10px] text-muted-foreground">Adjust when this followup action triggers.</span>
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
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsOpen(false)
                  }}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="h-7 text-[10px] px-2.5 bg-primary text-primary-foreground hover:bg-primary/95"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {isReady && (
            <div className="flex items-center gap-1">
              <div className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-[9px] font-black text-orange-500 uppercase tracking-tighter">Ready to send</span>
            </div>
          )}
          {!isReady && invoice.status === "PENDING" && (
            <div className="flex items-center gap-1">
              <span className="text-[9px] font-bold text-muted-foreground tracking-tighter uppercase">Projected</span>
            </div>
          )}
        </div>
      )
    }

  },
]

export function InvoiceTable({ data }: { data: any[] }) {
  const router = useRouter()
  const { deleteInvoice, bulkDeleteInvoices, updateInvoice } = useInvoiceStore()
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false)
  const [selectedInvoice, setSelectedInvoice] = React.useState<any>(null)
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [invoiceToEdit, setInvoiceToEdit] = React.useState<any>(null)
  const [isBulkDeleting, setIsBulkDeleting] = React.useState(false)
  const [deletingId, setDeletingId] = React.useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this invoice?")) return
    setDeletingId(id)
    try {
      await deleteInvoice(id)
      toast.success("Invoice deleted successfully")
    } catch (error) {
      toast.error("Failed to delete invoice")
    } finally {
      setDeletingId(null)
    }
  }

  const handleBulkDelete = async () => {
    const selectedIds = table.getFilteredSelectedRowModel().rows.map(row => row.original.id)
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} invoices?`)) return
    setIsBulkDeleting(true)
    try {
      await bulkDeleteInvoices(selectedIds)
      setRowSelection({})
      toast.success("Invoices deleted successfully")
    } catch (error) {
      toast.error("Failed to bulk delete invoices")
    } finally {
      setIsBulkDeleting(false)
    }
  }

  const table = useReactTable({
    data,
    columns: [
      ...columns,
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const invoice = row.original

          return (
            <DropdownMenu>
              <DropdownMenuTrigger nativeButton={true} render={
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              } />
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => navigator.clipboard.writeText(invoice.id)}>
                    Copy ID
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push(`/invoices/${invoice.id}`)}>
                    <Eye className="mr-2 h-4 w-4" /> View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    setInvoiceToEdit(invoice)
                    setIsEditOpen(true)
                  }}>
                    <Edit className="mr-2 h-4 w-4" /> Edit Invoice
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-green-600 font-semibold" onClick={async () => {
                    try {
                      await updateInvoice(invoice.id, { status: "PAID" })
                      toast.success("Invoice marked as paid")
                    } catch (error) {
                      toast.error("Failed to update status")
                    }
                  }}>
                    <CheckCircle className="mr-2 h-4 w-4" /> Mark Paid
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDelete(invoice.id)} className="text-destructive focus:bg-destructive/10">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete Invoice
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {(() => {
                    // eslint-disable-next-line react-hooks/rules-of-hooks
                    const { ladderSteps } = useSettingsStore()
                    let date = invoice.nextActionDate
                    const currentStage = invoice.currentStage || 0

                    if (!date && ladderSteps.length > currentStage) {
                      const nextStep = ladderSteps[currentStage]
                      const delay = currentStage === 0 ? (invoice.followupStartAfterDays ?? nextStep.delayDays) : nextStep.delayDays
                      const projectedDate = new Date(invoice.dueDate)
                      projectedDate.setDate(projectedDate.getDate() + delay)
                      date = projectedDate.toISOString()
                    }

                    const isReady = date && (invoice.status === "OVERDUE" || invoice.status === "PENDING") && new Date(date) <= new Date();
                    const isDisabled = !isReady || invoice.status === "PAID" || invoice.status === "CANCELLED";

                    return (
                      <DropdownMenuItem
                        disabled={isDisabled}
                        onClick={() => {
                          setSelectedInvoice(invoice)
                          setIsPreviewOpen(true)
                        }}
                        className={`${isDisabled ? "opacity-50 cursor-not-allowed" : "bg-primary text-primary-foreground focus:bg-primary/90"}`}
                      >
                        <Play className="mr-2 h-4 w-4" />
                        {isReady ? "Run Followup" : "Followup Pending"}
                      </DropdownMenuItem>
                    );
                  })()}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        }
      }
    ],
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <div className="w-full">
      <div className="flex items-center py-4 gap-4">
        <Input
          placeholder="Search invoice number..."
          value={(table.getColumn("invoiceNumber")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("invoiceNumber")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        {Object.keys(rowSelection).length > 0 && (
          <Button variant="destructive" size="sm" onClick={handleBulkDelete} disabled={isBulkDeleting}>
            {isBulkDeleting ? (
              <><svg className="animate-spin mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Deleting...</>
            ) : (
              <><Trash2 className="mr-2 h-4 w-4" /> Delete Selected ({Object.keys(rowSelection).length})</>
            )}
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger nativeButton={true} render={
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          } />
          <DropdownMenuContent align="end" className="w-56">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {selectedInvoice && (
        <FollowupPreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          invoice={selectedInvoice}
          onSuccess={() => {
            // Store automatically refreshes
          }}
        />
      )}

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="font-bold text-xs uppercase tracking-wider py-4">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="cursor-pointer hover:bg-muted/30 transition-all group"
                  onClick={(e) => {
                    const target = e.target as HTMLElement;
                    if (target.closest('button') || target.closest('[role="menuitem"]') || target.closest('input[type="checkbox"]')) return;
                    router.push(`/invoices/${row.original.id}`);
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-4">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={table.getAllColumns().length}
                  className="h-32 text-center text-muted-foreground"
                >
                  No invoices found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between py-4">
        <div className="text-sm text-muted-foreground font-medium">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-8 w-24"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-8 w-24"
          >
            Next
          </Button>
        </div>
      </div>
      {selectedInvoice && (
        <FollowupPreviewModal
          isOpen={isPreviewOpen}
          onClose={() => {
            setIsPreviewOpen(false)
            setSelectedInvoice(null)
          }}
          invoice={selectedInvoice}
          onSuccess={() => {
            setIsPreviewOpen(false)
            setSelectedInvoice(null)
            useInvoiceStore.getState().fetchInvoices()
          }}
        />
      )}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Invoice</DialogTitle>
            <DialogDescription>
              Update the details of the invoice.
            </DialogDescription>
          </DialogHeader>
          <CreateInvoiceForm
            invoice={invoiceToEdit}
            onSuccess={() => {
              setIsEditOpen(false)
              setInvoiceToEdit(null)
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
