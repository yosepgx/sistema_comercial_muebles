'use client'

import React, { Dispatch, SetStateAction, useMemo, useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table'
import { Edit, Pencil, Save, Trash2 } from 'lucide-react'
import { TCotizacionDetalle } from './types/cotizacion';
import { UNIDADES_MEDIDA_BUSCA } from '@/constants/unidadesMedidaConstants';
import { IconButton } from '@mui/material';

interface CotizacionTableProps {
  detalles: TCotizacionDetalle[];
  setDetalles: Dispatch<SetStateAction<TCotizacionDetalle[]>>;
}


export const CotizacionTable : React.FC<CotizacionTableProps>  = ({detalles, setDetalles}) => {
  const [editRowId, setEditRowId] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleCantidadChange = (id: string, value: number) => {
    setDetalles((prev) =>
      prev.map((row) => {
        if (`${row.producto}-${row.cotizacion}` === id) {
          const isValid = value > 0
          const newSubtotal = isValid ? (value * row.precio_unitario - row.descuento) : row.subtotal
          if (!isValid) {
            setErrors((e) => ({ ...e, [id]: 'Cantidad debe ser mayor a 0' }))
          } else {
            setErrors((e) => {
              const newErrors = { ...e }
              delete newErrors[id]
              return newErrors
            })
          }

          return {
            ...row,
            cantidad: value,
            subtotal: parseFloat(newSubtotal.toFixed(2)),
          }
        }
        return row
      })
    )
  }

  const handleSave = (id: string) => {
    if (errors[id]) return
    // Aquí podrías llamar a una función del contexto o API para guardar
    setEditRowId(null)
  }

  const handleDelete = (id: string) => {
    setDetalles((prev) =>
      prev.filter((row) => `${row.producto}-${row.cotizacion}` !== id)
    )
    setErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors[id]
      return newErrors
    })
  }

  const columns = useMemo<ColumnDef<TCotizacionDetalle>[]>(() => [
    {
      header: 'CODIGO',
      accessorKey: 'producto',
    },
    {
      header: 'NOMBRE',
      accessorKey: 'rnombre',
    },
    {
      header: 'UM',
      accessorKey: 'rum',
      cell: ({ getValue }) => {
        const clave = getValue() as string;
        return UNIDADES_MEDIDA_BUSCA[clave] ?? 'Sin unidad';
      }
    },
    {
      header: 'PRECIO UNITARIO',
      accessorKey: 'precio_unitario',
      cell: info => Number(info.getValue()).toFixed(2),
    },
    {
      header: 'CANTIDAD',
      accessorKey: 'cantidad',
      cell: info => {
        const row = info.row.original
        const id = `${row.producto}-${row.cotizacion}`
        const isEditing = editRowId === id

        return (
          <div>
            {isEditing ? (
              <>
                <input
                  type="number"
                  className="border rounded px-2 py-1 w-24"
                  style={{
                    fontFamily: 'monospace',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                  value={row.cantidad}
                  onChange={(e) => handleCantidadChange(id, Number(e.target.value))}
                  min={1}
                />
                <div className="text-xs h-4 mt-1">
                  <span className={errors[id] ? "text-red-500 visible" : "invisible"}>
                    {errors[id] ?? 'placeholder'}
                  </span>
                </div>
              </>
            ) : (
              row.cantidad
            )}
          </div>
        )
      }
    },
    {
      header: 'DESCUENTO',
      accessorKey: 'descuento',
      cell: info => Number(info.getValue()).toFixed(2),
    },
    {
      header: 'TOTAL',
      accessorKey: 'subtotal',
      cell: info => Number(info.getValue()).toFixed(2),
    },
    {
      header: 'Acciones',
      id: 'acciones',
      cell: ({ row }) => {
        const id = `${row.original.producto}-${row.original.cotizacion}`
        const isEditing = editRowId === id

        return (
          <div className="flex gap-2">
            {isEditing ? (
              <IconButton
                onClick={() => handleSave(id)}
                //className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                disabled={!!errors[id]}
              >
                <Save size={16} />
              </IconButton>
            ) : (
              <IconButton
                onClick={() => setEditRowId(id)}
                //className="p-1 hover:bg-gray-100 rounded"
              >
                <Pencil size={16} />
              </IconButton>
            )}
            <IconButton
              onClick={() => handleDelete(id)}
              //className="p-1 hover:bg-gray-100 rounded"
            >
              <Trash2 size={16} />
            </IconButton>
          </div>
        )
      }
    }
  ], [editRowId, errors])

  const table = useReactTable({
    data: detalles,
    columns,
    getCoreRowModel: getCoreRowModel()
  })

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border">
        <thead className="bg-gray-100">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id} className="px-3 py-2 text-left border">
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id} className="border-b">
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} className="px-3 py-2 border">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
