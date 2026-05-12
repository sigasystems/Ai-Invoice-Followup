'use client';

import * as React from 'react';
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
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ChevronLeft,
  ChevronRight,
  Settings2,
  Search,
  X,
  Trash2,
  CheckSquare,
  Square,
  MoreVertical,
  Minus
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface BulkAction<TData> {
  label: string;
  icon?: React.ElementType;
  onClick: (rows: TData[]) => void;
  variant?: 'default' | 'destructive' | 'outline' | 'ghost';
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterKey?: string;
  className?: string;
  enableSelection?: boolean;
  bulkActions?: BulkAction<TData>[];
  onBulkDelete?: (rows: TData[]) => void;
}

export function DataTable<TData, TValue>({
  columns: initialColumns,
  data,
  filterKey,
  className,
  enableSelection = true,
  bulkActions = [],
  onBulkDelete,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const columns = React.useMemo(() => {
    if (!enableSelection) return initialColumns;

    const selectionColumn: ColumnDef<TData, TValue> = {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center pl-2">
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
            className="border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center pl-2">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40,
    };

    return [selectionColumn, ...initialColumns];
  }, [initialColumns, enableSelection]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const selectedRows = table.getSelectedRowModel().rows;
  const selectedCount = selectedRows.length;

  return (
    <div className={cn("space-y-4", className)}>

      {/* 🔹 TOOLBAR */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-3">

        {/* SEARCH & SELECTION INFO */}
        <div className="flex items-center gap-4 w-full lg:max-w-xl">
          {filterKey && (
            <div className="relative flex-1 group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder={`Search ${filterKey}...`}
                value={(table.getColumn(filterKey)?.getFilterValue() as string) ?? ""}
                onChange={(e) =>
                  table.getColumn(filterKey)?.setFilterValue(e.target.value)
                }
                className="pl-10 h-10 rounded-xl bg-muted/30 border-transparent focus:bg-background focus:ring-1 focus:ring-primary/20 transition-all font-medium text-sm"
              />
            </div>
          )}

          {selectedCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg animate-in fade-in zoom-in duration-200">
              <CheckSquare className="w-4 h-4" />
              <span className="text-xs font-bold whitespace-nowrap">{selectedCount} selected</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-5 w-5 hover:bg-primary/20 rounded-md" 
                onClick={() => table.resetRowSelection()}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
          
          {/* BULK ACTIONS */}
          {selectedCount > 0 && (
            <div className="flex items-center gap-2 mr-2 animate-in slide-in-from-right-4 duration-300">
              {onBulkDelete && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onBulkDelete(selectedRows.map(r => r.original))}
                  className="h-10 px-4 rounded-xl font-bold text-xs gap-2 shadow-sm"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Selected
                </Button>
              )}
              {bulkActions.map((action, i) => (
                <Button
                  key={i}
                  variant={action.variant || 'outline'}
                  size="sm"
                  onClick={() => action.onClick(selectedRows.map(r => r.original))}
                  className="h-10 px-4 rounded-xl font-bold text-xs gap-2"
                >
                  {action.icon && <action.icon className="w-3.5 h-3.5" />}
                  {action.label}
                </Button>
              ))}
              <div className="w-px h-6 bg-border/60 mx-1" />
            </div>
          )}

          {/* CLEAR FILTER */}
          {columnFilters.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setColumnFilters([])}
              className="h-10 px-3 rounded-xl text-xs font-bold"
            >
              <X className="w-4 h-4 mr-1.5" />
              Clear Filters
            </Button>
          )}

          {/* COLUMN TOGGLE */}
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <Button variant="outline" className="h-10 rounded-xl px-4 font-bold text-xs gap-2 border-border/60 hover:bg-muted/50 transition-colors">
                <Settings2 className="w-3.5 h-3.5 text-muted-foreground" />
                Columns
              </Button>
            } />

            <DropdownMenuContent align="end" className="w-48 rounded-xl p-1 shadow-2xl border-border/40">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest px-2 py-2">Toggle Columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-[300px] overflow-auto">
                {table.getAllColumns()
                  .filter((col) => col.getCanHide())
                  .map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="text-xs font-medium rounded-lg cursor-pointer py-2 focus:bg-primary/5 focus:text-primary transition-colors"
                      checked={column.getIsVisible()}
                      onCheckedChange={(v) => column.toggleVisibility(!!v)}
                    >
                      {column.id.replace(/_/g, ' ')}
                    </DropdownMenuCheckboxItem>
                  ))}
              </div>
            </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 🔹 TABLE */}
      <div className="rounded-2xl border border-border/40 bg-card overflow-hidden shadow-sm ring-1 ring-black/5">
        <Table>
          <TableHeader className="bg-muted/30 border-b border-border/40">
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="hover:bg-transparent border-none">
                {hg.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{ width: header.column.columnDef.size }}
                    className="text-[10px] font-bold px-6 py-3.5 text-muted-foreground/70 uppercase tracking-[0.1em]"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/20 transition-colors border-border/30 data-[state=selected]:bg-primary/[0.03]"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-6 py-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-72 text-center">
                  <div className="flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="p-4 rounded-full bg-muted/30">
                      <Search className="w-8 h-8 text-muted-foreground/40" />
                    </div>
                    <div>
                      <p className="font-bold text-lg text-foreground/80">No results found</p>
                      <p className="text-sm text-muted-foreground mt-1 max-w-[250px] mx-auto">
                        We couldn't find any data matching your current filters or search terms.
                      </p>
                    </div>
                    {(columnFilters.length > 0 || table.getState().globalFilter) && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setColumnFilters([]);
                          table.setGlobalFilter("");
                        }}
                        className="rounded-xl font-bold mt-2"
                      >
                        Reset all filters
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* 🔹 FOOTER */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 py-2">

        {/* LEFT */}
        <div className="flex items-center gap-4">
          <div className="text-muted-foreground text-xs font-bold">
            Showing {table.getRowModel().rows.length} of {data.length} entries
          </div>
          {selectedCount > 0 && (
            <div className="h-4 w-px bg-border/60" />
          )}
          <div className="text-primary text-xs font-bold">
            {selectedCount > 0 && (
              <span>{selectedCount} row(s) selected</span>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex flex-wrap items-center justify-center gap-4">

          {/* PAGE SIZE */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Rows per page</span>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="text-xs font-bold bg-muted/40 border-none rounded-lg px-2 py-1 focus:ring-1 focus:ring-primary/20 outline-none cursor-pointer"
            >
              {[10, 15, 20, 30, 50].map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>

          <div className="h-4 w-px bg-border/60 mx-1" />

          {/* PAGE INFO */}
          <span className="text-xs font-bold text-muted-foreground">
            Page <span className="text-foreground">{table.getState().pagination.pageIndex + 1}</span> of <span className="text-foreground">{table.getPageCount() || 1}</span>
          </span>

          {/* PAGINATION */}
          <div className="flex gap-1.5">
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8 rounded-lg border-border/40 hover:bg-muted/50 disabled:opacity-30"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8 rounded-lg border-border/40 hover:bg-muted/50 disabled:opacity-30"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}