"use client"
import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"
 
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {RowData} from '@tanstack/react-table'

import { Button } from "@/components/ui/button"
import { DataTablePagination } from "./tablePagination"
import { Input } from "@/components/ui/input"
import { useSkipper } from "./useSkipper"

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    updateData: (rowIndex: number, columnId: string, value: unknown) => void;
    editableRowIndex: number | null,
    setEditableRowIndex: React.Dispatch<React.SetStateAction<number | null>>,
    setData: React.Dispatch<React.SetStateAction<TData[]>>,
    saveFunction?: Function,
    viewFunction?: Function,
  }
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  odata: TData[]
  defaultColumn?: Partial<ColumnDef<TData>>
  saveFunction?: Function
  viewFunction?: Function
}

export function DataTable<TData, TValue>({
    columns,
    odata: odata,
    defaultColumn,
    saveFunction,
    viewFunction,
  }: DataTableProps<TData, TValue>) {

    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper()
    const [data, setData] = React.useState(() => odata)
    const [editableRowIndex, setEditableRowIndex] = React.useState<number | null>(null)

    const table = useReactTable({
      data,
      columns,
      ...(defaultColumn && {defaultColumn}),
      getCoreRowModel: getCoreRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      onSortingChange: setSorting,
      getSortedRowModel: getSortedRowModel(),
      onColumnFiltersChange: setColumnFilters,
      getFilteredRowModel: getFilteredRowModel(),
      state: {
        sorting,
        columnFilters,
      },
      autoResetPageIndex,
      meta: {
        updateData: (rowIndex, columnId, value) => {
          skipAutoResetPageIndex()
          setData(old =>
            old.map((row, index) => {
              if (index === rowIndex) {
                return {
                  ...old[rowIndex]!,
                  [columnId]: value,
                }
              }
              return row
            })
          )
        },
        editableRowIndex,
        setEditableRowIndex,
        setData,
        ...(saveFunction && {saveFunction}),
        ...(viewFunction && {viewFunction}),
      },
      debugTable: true,
    })
    

    return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
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
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
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
      <DataTablePagination table={table}/>
    </div>
    )
  }