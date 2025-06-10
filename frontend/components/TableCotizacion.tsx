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
import { useDescuentosAutomaticos } from './descuentos/useDescuentosAutomaticos';

interface CotizacionTableProps {
  detalles: TCotizacionDetalle[];
  setDetalles: Dispatch<SetStateAction<TCotizacionDetalle[]>>;
  isDisabled: boolean;
}


export const CotizacionTable : React.FC<CotizacionTableProps>  = ({detalles, setDetalles, isDisabled}) => {
  const [editRowId, setEditRowId] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { aplicarDescuentosADetalle } = useDescuentosAutomaticos()


  const handleCantidadChange =  async (id: string, value: number) => {
    if (value <= 0) {
    setErrors((e) => ({ ...e, [id]: 'Cantidad debe ser mayor a 0' }));
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
      if (`${row.producto}-${row.cotizacion}` === id) {
        return { ...row, cantidad: value }; 
      }
      return row;
    })
    );

    // Luego aplicas el descuento
    const detalleOriginal = detalles.find((row) => `${row.producto}-${row.cotizacion}` === id);
    if (!detalleOriginal) return;

    const detalleTemp = { ...detalleOriginal, cantidad: value };
    const detalleConDescuento = await aplicarDescuentosADetalle(detalleTemp);

    setDetalles((prev) =>
      prev.map((row) =>
        `${row.producto}-${row.cotizacion}` === id ? detalleConDescuento : row
      )
    );
    
    // setDetalles((prev) =>
    //   prev.map((row) => {
    //     if (`${row.producto}-${row.cotizacion}` === id) {
    //       const isValid = value > 0
    //       if (!isValid) {
    //         setErrors((e) => ({ ...e, [id]: 'Cantidad debe ser mayor a 0' }))
    //         return row
    //       } else {
    //         setErrors((e) => {
    //           const newErrors = { ...e }
    //           delete newErrors[id]
    //           return newErrors
    //         })
    //       }
    //       // Crear detalle temporal con nueva cantidad
    //       const detalleTemp = {
    //         ...row,
    //         cantidad: value
    //       }

    //       // Recalcular descuentos automáticamente
    //       let detalleConDescuento = row
    //       aplicarDescuentosADetalle(detalleTemp)
    //       .then(data => detalleConDescuento = data)
    //       return detalleConDescuento

    //       }
    //     return row
    //   })
    // )
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
                  disabled={isDisabled}
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
                disabled={!!errors[id] || isDisabled}
              >
                <Save size={16} />
              </IconButton>
            ) : (
              <IconButton
                onClick={() => setEditRowId(id)}
                //className="p-1 hover:bg-gray-100 rounded"
                disabled ={isDisabled}
              >
                <Pencil size={16} />
              </IconButton>
            )}
            <IconButton
              onClick={() => handleDelete(id)}
              //className="p-1 hover:bg-gray-100 rounded"
              disabled = {isDisabled}
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
