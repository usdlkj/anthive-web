// BackofficeDataTable.tsx
"use client";

import React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
  OnChangeFn,
  PaginationState,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageCount?: number;
  pageIndex?: number;
  pageSize?: number;
  onPaginationChange?: OnChangeFn<PaginationState>;
  onFilterChange?: (filter: string) => void;
  manualPagination?: boolean;
  globalFilter?: string;
  showGlobalFilter?: boolean; // New prop
}

export function BackofficeDataTable<TData, TValue>({
  columns,
  data,
  pageCount,
  pageIndex,
  pageSize,
  onPaginationChange,
  onFilterChange,
  manualPagination,
  showGlobalFilter = true, // Default to true
}: DataTableProps<TData, TValue>) {
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const handleGlobalFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setGlobalFilter(value);
    if (manualPagination && onFilterChange) {
      onFilterChange(value);
    }
  };

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter: manualPagination ? undefined : globalFilter,
      pagination: manualPagination
        ? { pageIndex: pageIndex ?? 0, pageSize: pageSize ?? 10 }
        : pagination,
    },
    onPaginationChange: manualPagination ? onPaginationChange : setPagination,
    manualPagination: manualPagination ?? false,
    pageCount: manualPagination ? pageCount : undefined,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        {showGlobalFilter && (
          <Input
            placeholder="Search..."
            value={globalFilter}
            onChange={handleGlobalFilterChange}
            className="w-64"
          />
        )}
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {manualPagination ? pageCount : table.getPageCount()}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => manualPagination
              ? onPaginationChange?.({ pageIndex: (pageIndex ?? 0) - 1, pageSize: pageSize ?? 10 })
              : table.previousPage()}
            disabled={manualPagination ? (pageIndex ?? 0) === 0 : !table.getCanPreviousPage()}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => manualPagination
              ? onPaginationChange?.({ pageIndex: (pageIndex ?? 0) + 1, pageSize: pageSize ?? 10 })
              : table.nextPage()}
            disabled={manualPagination ? (pageIndex ?? 0) + 1 >= (pageCount ?? 0) : !table.getCanNextPage()}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}