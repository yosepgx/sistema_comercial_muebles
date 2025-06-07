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
import { DataTablePagination } from "./tablePagination"
import { Input } from "@/components/ui/input"
import { useSkipper } from "./useSkipper"
import CustomButton from "../customButtom"
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useRouter } from "next/navigation"
import { descargarInventarioAPI } from "@/api/InventarioApis"
import { descargarProductoAPI } from "@/api/productoApis"

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
  placeholder?: string
  canFilterActivo?: boolean
  canExport?: boolean
  canFilterDate?: boolean
  canCreate?: boolean
  directionCreate?: string
}

export function DataTable<TData, TValue>({
    columns,
    odata: odata,
    defaultColumn,
    saveFunction,
    viewFunction,
    placeholder,
    canFilterActivo,
    canExport,
    canFilterDate,
    canCreate,
    directionCreate,
  }: DataTableProps<TData, TValue>) {

    const [sorting, setSorting] = React.useState<SortingState>([])
    const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper()
    const [data, setData] = React.useState(() => odata)
    const [editableRowIndex, setEditableRowIndex] = React.useState<number | null>(null)
    const [globalFilter, setGlobalFilter] = React.useState("")
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [fechaDesde, setFechaDesde] = React.useState<Date| null>(null);
    const [fechaHasta, setFechaHasta] = React.useState<Date| null>(null);
    
    const router = useRouter()
    const table = useReactTable({
      data,
      columns,
      ...(defaultColumn && {defaultColumn}),
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
      filterFns:{
        fechaEntre: (row, columnId, value) => {
          const rowDate = new Date(row.getValue(columnId));
          const [inicio, fin] = value; // value será [fechaInicio, fechaFin]
          if (inicio && rowDate < inicio) return false;
          if (fin && rowDate > fin) return false;
          return true;
        },
        rangoActivo: (row, columnId, value) => {
          const [filtroInicio, filtroFin] = value; // rango que selecciona el usuario
          const inicio = new Date(row.original.fecha_inicio);
          const fin = new Date(row.original.fecha_fin);

          // Si no hay filtro, no filtrar
          if (!filtroInicio && !filtroFin) return true;

          if (filtroInicio && fin < filtroInicio) return false;
          if (filtroFin && inicio > filtroFin) return false;

          return true;
        },
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
        ...(saveFunction && {saveFunction}),
        ...(viewFunction && {viewFunction}),
      },
      debugTable: true,
    })
    
    const columnaActivo = table.getAllColumns().find(col => col.id === 'activo');
    const filtroEstado = columnaActivo?.getFilterValue() as string | undefined;


    return (
    <div>
      <div className="flex items-center py-4 flex-row">
      <Input
        value={globalFilter ?? ""}
        onChange={(e) => setGlobalFilter(e.target.value)}
        placeholder={placeholder? placeholder:""}
        className="border px-3 py-1 rounded w-full max-w-sm"
        
      />
      {canFilterActivo && 
      <select
          value={filtroEstado ?? ''}
          onChange={e => {
            const val = e.target.value
            table.getColumn('activo')?.setFilterValue(
              val === '' ? undefined : val === 'true'
            )
          }}
        >
          <option value="">Todos</option>
          <option value="true">Activo</option>
          <option value="false">Inactivo</option>
        </select>}

      {canCreate && <CustomButton 
        type='button'
        onClick={()=> {
        if(directionCreate)router.push(directionCreate);
      }}>Crear</CustomButton>}
      {canExport && <CustomButton 
        type='button'
        onClick={()=>{
        const exportData = table.getFilteredRowModel().rows.map(row => row.original)
        console.log("data a exportar:", exportData)
        if(!!defaultColumn)descargarInventarioAPI(null) //inventario
        else if (!defaultColumn)descargarProductoAPI(null) //producto
      }}
      >Exportar</CustomButton>}
      {canFilterDate && (<div>
          <DatePicker
            value={fechaDesde}
            onChange={(date) => {
              setFechaDesde(date);
              table.getColumn("fecha_inicio")?.setFilterValue([date, fechaHasta]);
            }}
            label="Fecha inicio"
          />

          <DatePicker
            value={fechaHasta}
            onChange={(date) => {
              setFechaHasta(date);
              table.getColumn("fecha_inicio")?.setFilterValue([fechaDesde, date]);
            }}
            label="Fecha fin"
          />
          </div>)}
      </div>
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