"use client"
 
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table"
import { Pen, Pencil, Save, Trash2 } from 'lucide-react';
import { ArrowUpDown } from "lucide-react"
import * as inventarioApis from "./api/InventarioApis"
import React from "react";
import { Inventario, UpdateInventarioAPI } from "./api/InventarioApis";
import { useProductoContext } from "../producto/productoContext";
import { useAuth } from "@/context/authContext";
  
export const defaultColumnCell: Partial<ColumnDef<Inventario>> = {
    cell: ({ getValue, row: { index }, column: { id }, table }) => {
      const initialValue = getValue()
      const [value, setValue] = React.useState(initialValue)
  
      const onBlur = () => {
        table.options.meta?.updateData(index, id, value)
        table.options.meta?.setEditableRowIndex(null)
      }
  
      React.useEffect(() => {
        setValue(initialValue)
      }, [initialValue])
      
      const isEditing = table.options.meta?.editableRowIndex === index
      return (
        <input
          value={value as string}
          onChange={e => setValue(e.target.value)}
          onBlur={onBlur}
          disabled = {!isEditing}
        />
      )
    },
  }

export const columns: ColumnDef<Inventario>[] = [
    {
      accessorKey: "id",
      header: "Codigo",
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
      accessorKey: "almacen",
      header: "Almacen",
      cell: ({ getValue }) => <span>{getValue() as string}</span>,
      enableGlobalFilter: false
    },
    {
      accessorKey: "cantidad_disponible",
      header: "Cantidad Disponible",
      enableGlobalFilter: false
    },
    {
      accessorKey: "action",
      header: "Acciones",
      enableGlobalFilter: false,
      cell: ({row, table}) => {
        const rowIndex = row.index
        return (
        <div className="flex gap-2">
          <Pencil 
          className="cursor-pointer hover:text-blue-600 transition-colors duration-200 active:scale-90"
          onClick={() => {
          const current = table.options.meta?.editableRowIndex
          const setter = table.options.meta?.setEditableRowIndex
          if (setter) setter(current === rowIndex ? null : rowIndex)
          }}/>
          <Save
          className="cursor-pointer hover:text-blue-600 transition-colors duration-200 active:scale-90" 
          onClick={()=>{
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