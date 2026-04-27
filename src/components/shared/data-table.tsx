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
  Filter,
  X,
} from 'lucide-react';

import { cn } from '@/lib/utils';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterKey?: string;
  className?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  filterKey,
  className,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

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

  const selectedCount = Object.keys(rowSelection).length;

  return (
    <div className={cn("space-y-5", className)}>

      {/* 🔹 TOOLBAR */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-3">

        {/* SEARCH */}
        {filterKey && (
          <div className="relative w-full lg:max-w-md group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary" />
            <Input
              placeholder={`Search ${filterKey}...`}
              value={(table.getColumn(filterKey)?.getFilterValue() as string) ?? ""}
              onChange={(e) =>
                table.getColumn(filterKey)?.setFilterValue(e.target.value)
              }
              className="pl-10 h-11 rounded-lg bg-muted/40 border-transparent focus:bg-background transition font-medium text-sm"
            />
          </div>
        )}

        {/* ACTIONS */}
        <div className="flex items-center gap-2 w-full lg:w-auto justify-end">

          {/* CLEAR FILTER */}
          {columnFilters.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setColumnFilters([])}
              className="h-10 px-3 rounded-xl"
            >
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
          )}

          {/* COLUMN TOGGLE */}
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <Button variant="outline" className="h-11 rounded-lg px-5 font-bold text-sm gap-3 border-border/60 hover:bg-muted">
                <Settings2 className="w-4 h-4" />
                Columns
              </Button>
            } />

            <DropdownMenuContent align="end" className="w-48 rounded-xl">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              {table.getAllColumns()
                .filter((col) => col.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={(v) => column.toggleVisibility(!!v)}
                  >
                    {column.id.replace(/_/g, ' ')}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 🔹 TABLE */}
      <div className="rounded-lg border border-border/50 bg-white dark:bg-neutral-900 overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-xs font-bold px-6 py-4 text-muted-foreground/60 tracking-wider"
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
                  className="hover:bg-muted/40 transition"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-6 py-4 text-sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-56 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Search className="w-6 h-6 text-muted-foreground" />
                    <div>
                      <p className="font-semibold">No results found</p>
                      <p className="text-xs text-muted-foreground">
                        Try adjusting filters or search
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* 🔹 FOOTER */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 text-sm">

        {/* LEFT */}
        <div className="text-muted-foreground text-xs">
          {selectedCount > 0 && (
            <span>{selectedCount} row(s) selected</span>
          )}
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4">

          {/* PAGE INFO */}
          <span className="text-xs text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
          </span>

          {/* PAGE SIZE */}
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="text-xs border rounded px-2 py-1"
          >
            {[10, 20, 30, 50].map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>

          {/* PAGINATION */}
          <div className="flex gap-2">
            <Button
              size="icon"
              variant="outline"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <Button
              size="icon"
              variant="outline"
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