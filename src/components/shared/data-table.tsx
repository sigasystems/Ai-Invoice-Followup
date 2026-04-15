// 'use client';

// import * as React from 'react';
// import {
//   ColumnDef,
//   ColumnFiltersState,
//   SortingState,
//   VisibilityState,
//   flexRender,
//   getCoreRowModel,
//   getFilteredRowModel,
//   getPaginationRowModel,
//   getSortedRowModel,
//   useReactTable,
// } from '@tanstack/react-table';

// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import {
//   DropdownMenu,
//   DropdownMenuCheckboxItem,
//   DropdownMenuContent,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu';
// import { ChevronLeft, ChevronRight, Settings2, Search, Filter } from 'lucide-react';
// import { cn } from '@/lib/utils';

// interface DataTableProps<TData, TValue> {
//   columns: ColumnDef<TData, TValue>[];
//   data: TData[];
//   filterKey?: string;
//   className?: string;
// }

// export function DataTable<TData, TValue>({
//   columns,
//   data,
//   filterKey,
//   className,
// }: DataTableProps<TData, TValue>) {
//   const [sorting, setSorting] = React.useState<SortingState>([]);
//   const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
//   const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
//   const [rowSelection, setRowSelection] = React.useState({});

//   const table = useReactTable({
//     data,
//     columns,
//     onSortingChange: setSorting,
//     onColumnFiltersChange: setColumnFilters,
//     getCoreRowModel: getCoreRowModel(),
//     getPaginationRowModel: getPaginationRowModel(),
//     getSortedRowModel: getSortedRowModel(),
//     getFilteredRowModel: getFilteredRowModel(),
//     onColumnVisibilityChange: setColumnVisibility,
//     onRowSelectionChange: setRowSelection,
//     state: {
//       sorting,
//       columnFilters,
//       columnVisibility,
//       rowSelection,
//     },
//   });

//   return (
//     <div className={cn("space-y-6 p-3 ", className)} >
//       <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
//         {filterKey && (
//           <div className="relative w-full sm:max-w-md group">
//             <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
//               <Search className="w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
//             </div>
//             <Input
//               placeholder={`Search by ${filterKey}...`}
//               value={(table.getColumn(filterKey)?.getFilterValue() as string) ?? ""}
//               onChange={(event) =>
//                 table.getColumn(filterKey)?.setFilterValue(event.target.value)
//               }
//               className="pl-10 rounded-2xl h-11 bg-muted/40 border-border focus:bg-background transition-all shadow-sm focus:shadow-md"
//             />
//           </div>
//         )}
//         <div className="flex items-center gap-2 w-full sm:w-auto">
//           <DropdownMenu>
//             <DropdownMenuTrigger render={<Button variant="outline" size="sm" className="h-11 rounded-2xl flex gap-2 font-bold px-5 bg-card hover:bg-muted/60 transition-all border-border" />}>
//               <Settings2 className="w-4 h-4" />
//               Columns
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end" className="rounded-2xl border-border shadow-2xl p-2 w-48 bg-card">
//               <DropdownMenuLabel className="text-[10px] uppercase font-black tracking-widest text-muted-foreground px-2 py-1.5">Toggle Columns</DropdownMenuLabel>
//               <DropdownMenuSeparator className="bg-border" />
//               {table
//                 .getAllColumns()
//                 .filter((column) => column.getCanHide())
//                 .map((column) => {
//                   return (
//                     <DropdownMenuCheckboxItem
//                       key={column.id}
//                       className="capitalize font-semibold text-xs rounded-xl focus:bg-primary/5 focus:text-primary transition-colors cursor-pointer"
//                       checked={column.getIsVisible()}
//                       onCheckedChange={(value) => column.toggleVisibility(!!value)}
//                     >
//                       {column.id.replace(/_/g, ' ')}
//                     </DropdownMenuCheckboxItem>
//                   );
//                 })}
//             </DropdownMenuContent>
//           </DropdownMenu>
//         </div>
//       </div>

//       <div className="rounded-[2rem] border border-border bg-card/40 backdrop-blur-sm overflow-hidden shadow-2xl shadow-neutral-500/5">
//         <Table>
//           <TableHeader className="bg-muted/40 border-b border-border">
//             {table.getHeaderGroups().map((headerGroup) => (
//               <TableRow key={headerGroup.id} className="hover:bg-transparent border-none">
//                 {headerGroup.headers.map((header) => {
//                   return (
//                     <TableHead key={header.id} className="text-muted-foreground font-black text-[10px] uppercase tracking-[0.15em] h-12 py-3 px-6 select-none">
//                       {header.isPlaceholder
//                         ? null
//                         : flexRender(
//                           header.column.columnDef.header,
//                           header.getContext()
//                         )}
//                     </TableHead>
//                   );
//                 })}
//               </TableRow>
//             ))}
//           </TableHeader>
//           <TableBody>
//             {table.getRowModel().rows?.length ? (
//               table.getRowModel().rows.map((row) => (
//                 <TableRow
//                   key={row.id}
//                   data-state={row.getIsSelected() && "selected"}
//                   className="border-b border-border/50 last:border-0 hover:bg-primary/[0.02] transition-all duration-300 group"
//                 >
//                   {row.getVisibleCells().map((cell) => (
//                     <TableCell key={cell.id} className="py-5 px-6 text-sm font-medium transition-transform duration-300">
//                       {flexRender(cell.column.columnDef.cell, cell.getContext())}
//                     </TableCell>
//                   ))}
//                 </TableRow>
//               ))
//             ) : (
//               <TableRow>
//                 <TableCell colSpan={columns.length} className="h-64 text-center">
//                   <div className="flex flex-col items-center justify-center space-y-3">
//                     <div className="p-4 bg-muted rounded-full">
//                       <Search className="w-6 h-6 text-muted-foreground" />
//                     </div>
//                     <div>
//                       <h3 className="text-sm font-bold text-foreground">No matches found</h3>
//                       <p className="text-xs text-muted-foreground">Try adjusting your search or filters.</p>
//                     </div>
//                   </div>
//                 </TableCell>
//               </TableRow>
//             )}
//           </TableBody>
//         </Table>
//       </div>

//       <div className="flex flex-col sm:flex-row items-center justify-between px-2 gap-4">
//         <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-60">
//           Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
//         </div>
        
//         <div className="flex items-center gap-6">
//           <div className="flex items-center gap-1.5">
//             <span className="text-[11px] font-bold text-muted-foreground">Rows per page:</span>
//             <select
//               value={table.getState().pagination.pageSize}
//               onChange={e => {
//                 table.setPageSize(Number(e.target.value))
//               }}
//               className="bg-transparent text-[11px] font-bold text-primary focus:outline-none cursor-pointer hover:underline underline-offset-4"
//             >
//               {[10, 20, 30, 40, 50].map(pageSize => (
//                 <option key={pageSize} value={pageSize} className="bg-card text-foreground">
//                   {pageSize}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="flex items-center space-x-2">
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() => table.previousPage()}
//               disabled={!table.getCanPreviousPage()}
//               className="h-10 w-10 rounded-xl p-0 hover:bg-primary/5 hover:text-primary border-border transition-all shadow-sm active:scale-95 disabled:opacity-30"
//             >
//               <ChevronLeft className="w-5 h-5" />
//             </Button>
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() => table.nextPage()}
//               disabled={!table.getCanNextPage()}
//               className="h-10 w-10 rounded-xl p-0 hover:bg-primary/5 hover:text-primary border-border transition-all shadow-sm active:scale-95 disabled:opacity-30"
//             >
//               <ChevronRight className="w-5 h-5" />
//             </Button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }






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
              className="pl-10 h-11 rounded-xl bg-muted/40 focus:bg-background transition"
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
            <DropdownMenuTrigger >
              <Button variant="outline" className="h-10 rounded-xl px-4">
                <Settings2 className="w-4 h-4 mr-2" />
                Columns
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-48 rounded-xl">
              <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
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
      <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-xs uppercase tracking-wide font-bold px-6 py-3"
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