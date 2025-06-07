"use client"
import * as React from "react"
import {
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  ColumnDef,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DataTablePagination } from "../table/tablePagination"
import { Input } from "@/components/ui/input"
import CustomButton from "../customButtom"
import { useSkipper } from "@/components/table/useSkipper"
import { useRouter } from "next/navigation"
import { Pencil, Save } from "lucide-react"
import { Inventario, UpdateInventarioAPI } from "@/api/InventarioApis"

declare module '@tanstack/react-table' {
  interface TableMeta<TData> {
    updateData: (rowIndex: number, columnId: string, value: unknown) => void;
    editableRowIndex: number | null,
    setEditableRowIndex: React.Dispatch<React.SetStateAction<number | null>>,
    setData: React.Dispatch<React.SetStateAction<TData[]>>,
  }
}

const EditableCell: React.FC<any> = ({ getValue, row, column, table }) => {
  const initialValue = getValue()
  const [value, setValue] = React.useState(initialValue)
  const isEditing = table.options.meta?.editableRowIndex === row.index

  const onBlur = () => {
    table.options.meta?.updateData(row.index, column.id, value)
    table.options.meta?.setEditableRowIndex(null)
  }

  React.useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  return (
    <input
      value={value as string}
      onChange={(e) => setValue(e.target.value)}
      onBlur={onBlur}
      disabled={!isEditing}
    />
  )
}

const columns: ColumnDef<Inventario>[] = [
  {
    accessorKey: "id",
    header: "Código",
    enableGlobalFilter: false,
    cell: ({ getValue }) => <span>{getValue() as string}</span>,
  },
  {
    accessorKey: "nombre_producto",
    header: "Producto",
    cell: ({ getValue }) => <span>{getValue() as string}</span>,
    filterFn: "includesString",
  },
  {
    accessorKey: "cantidad_disponible",
    header: "Cantidad Disponible",
    cell: (props) => <EditableCell {...props} />,
    enableGlobalFilter: false,
  },
  {
    accessorKey: "action",
    header: "Acciones",
    enableGlobalFilter: false,
    cell: ({ row, table }) => {
      const rowIndex = row.index
      return (
        <div className="flex gap-2">
          <Pencil
            className="cursor-pointer hover:text-blue-600"
            onClick={() => {
              const current = table.options.meta?.editableRowIndex
              const setter = table.options.meta?.setEditableRowIndex
              if (setter) setter(current === rowIndex ? null : rowIndex)
            }}
          />
          <Save
            className="cursor-pointer hover:text-blue-600"
            onClick={() => {
              const data = row.original
              const ct = localStorage.getItem('access-token')
              UpdateInventarioAPI(ct, data.id, data)
            }}
          />
        </div>
      )
    },
  },
]

interface InventarioTableProps {
  odata: Inventario[]
  placeholder?: string
  canFilterActivo?: boolean
  canExport?: boolean
  canCreate?: boolean
  directionCreate?: string
}

export function InventarioTable({
  odata,
  placeholder,
  canFilterActivo,
  canExport,
  canCreate,
  directionCreate,
}: InventarioTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper()
  const [data, setData] = React.useState(() => odata)
  const [editableRowIndex, setEditableRowIndex] = React.useState<number | null>(null)
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const router = useRouter()

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      globalFilter,
      columnFilters,
    },
    onColumnFiltersChange: setColumnFilters,
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
    },
    debugTable: true,
  })

  const columnaActivo = table.getAllColumns().find(col => col.id === 'activo')
  const filtroEstado = columnaActivo?.getFilterValue() as string | undefined

  return (
    <div>
      <div className="flex items-center py-4 flex-row gap-2">
        <Input
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder={placeholder ?? ""}
          className="border px-3 py-1 rounded w-full max-w-sm"
        />
        
        {canCreate && directionCreate && (
          <CustomButton type="button" onClick={() => router.push(directionCreate)}>
            Crear
          </CustomButton>
        )}
        {canExport && (
          <CustomButton
            type="button"
            onClick={() => {
              const exportData = table.getFilteredRowModel().rows.map(row => row.original)
              console.log("data a exportar:", exportData)
              // export logic va aqui
            }}
          >
            Exportar
          </CustomButton>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No hay resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  )
}
