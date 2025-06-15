'use client'

import React, { Dispatch, SetStateAction, useMemo, useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table'
import { Save, Pencil, Trash2 } from 'lucide-react'
import { IconButton } from '@mui/material'
import { TPedidoDetalle } from '../types/pedido'
import { UNIDADES_MEDIDA_BUSCA } from '@/constants/unidadesMedidaConstants'


// const pedidoDetalle = z.object({
//     producto: z.number(), si identifica linea
//     pedido: z.number(),  si
//     cantidad: z.number(), si //ajuste al numero de cantidad
//     precio_unitario: z.number(), //importe de ajuste del precio final
//     descuento: z.number(), no hay descuento por linea
//     subtotal: z.number(), si  //puede ser por la cantidad
//     nrolinea: z.number(), no
//     activo: z.boolean(), si
//     rnombre: z.string(), null
//     rum: z.string() null
// })

//en back no afecta en nada la correcion el documento de pedido queda igual
//lo unico que va a servir de aca para los pedidos sera la cantidad que se resta o suma

interface NotaCreditoDebitoTableProps {
  detalles: TPedidoDetalle[]
  setDetalles: Dispatch<SetStateAction<TPedidoDetalle[]>>
  isDisabled: boolean
}

export const NotaCreditoDebitoTable: React.FC<NotaCreditoDebitoTableProps> = ({
  detalles,
  setDetalles,
  isDisabled,
}) => {
  const [editRowId, setEditRowId] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleUpdate = (
    id: string,
    field: 'cantidad' | 'precio_unitario' ,
    value: number
  ) => {

    if (value < 0) {
        setErrors((e) => ({ ...e, [id]: 'Cantidad no debe ser menor a 0' }));
        return;
        } else {
          setErrors((e) => {
            const newErrors = { ...e };
            delete newErrors[id];
            return newErrors;
          });
        }

    setDetalles((prev) =>
    prev.map((row) => {
      if (`${row.producto}-${row.pedido}` === id) {
        
        const updated = {
          ...row,
          [field]: value,
        }

        updated.subtotal =
          updated.cantidad * updated.precio_unitario

        return updated 
      }
      return row;
    })
    );

    
  }

  const handleSave = (id: string) => {
    if (errors[id]) return
    setEditRowId(null)
  }

  const handleDelete = (id: string) => {
    setDetalles((prev) =>
      prev.filter((row) => `${row.producto}-${row.pedido}` !== id)
    )
    setErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors[id]
      return newErrors
    })
  }

  const columns = useMemo<ColumnDef<TPedidoDetalle>[]>(() => [
    
    {
      header: 'Producto',
      accessorKey: 'rnombre',
    },
    {
      header: 'UM',
      accessorKey: 'rum',
      cell: ({ getValue }) => {
        const clave = getValue() as string
        return UNIDADES_MEDIDA_BUSCA[clave] ?? 'Sin unidad'
      },
    },
    {
      header: 'Correción Cantidad',
      accessorKey: 'cantidad',
      cell: ({ row }) => {
        const id = `${row.original.producto}-${row.original.pedido}`
        const isEditing = editRowId === id

        return isEditing ? (
          <div>
            <input
              type="number"
              value={row.original.cantidad}
              onChange={(e) =>
                handleUpdate(id, 'cantidad', Number(e.target.value))
              }
              disabled={isDisabled}
              className="border rounded px-2 py-1 w-24"
              min={1}
            />
            <div className="text-xs h-4 mt-1">
              <span className={errors[id] ? 'text-red-500 visible' : 'invisible'}>
                {errors[id] ?? 'placeholder'}
              </span>
            </div>
          </div>
        ) : (
          row.original.cantidad
        )
      },
    },
    {
      header: 'Correción Unitaria',
      accessorKey: 'precio_unitario',
      cell: ({ row }) => {
        const id = `${row.original.producto}-${row.original.pedido}`
        const isEditing = editRowId === id

        return isEditing ? (
          <input
            type="number"
            value={row.original.precio_unitario}
            onChange={(e) =>
              handleUpdate(id, 'precio_unitario', Number(e.target.value))
            }
            disabled={isDisabled}
            className="border rounded px-2 py-1 w-24"
            min={0}
          />
        ) : (
          row.original.precio_unitario.toFixed(2)
        )
      },
    },
    {
      header: 'Subtotal',
      accessorKey: 'subtotal',
      cell: (info) => Number(info.getValue()).toFixed(2),
    },
    {
      header: 'Acciones',
      id: 'acciones',
      cell: ({ row }) => {
        const id = `${row.original.producto}-${row.original.pedido}`
        const isEditing = editRowId === id

        return (
          <div className="flex gap-2">
            {isEditing ? (
              <IconButton
                onClick={() => handleSave(id)}
                disabled={!!errors[id] || isDisabled}
              >
                <Save size={16} />
              </IconButton>
            ) : (
              <IconButton
                onClick={() => setEditRowId(id)}
                disabled={isDisabled}
              >
                <Pencil size={16} />
              </IconButton>
            )}
            {/* <IconButton
              onClick={() => handleDelete(id)}
              disabled={isDisabled}
            >
              <Trash2 size={16} />
            </IconButton> */}
          </div>
        )
      },
    },
  ], [editRowId, errors, isDisabled])

  const table = useReactTable({
    data: detalles,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border">
        <thead className="bg-gray-100">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="px-3 py-2 text-left border">
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-b">
              {row.getVisibleCells().map((cell) => (
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
