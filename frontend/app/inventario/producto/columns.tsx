"use client"
 
import { ColumnDef } from "@tanstack/react-table"
import { Eye, Trash2 } from 'lucide-react';
import React from "react";
import { TProducto } from "./api/productoTypes";
import { useProductoContext } from "./productoContext";


export const columns: ColumnDef<TProducto>[] = [
    {
      accessorKey: "id",
      header: "Codigo",
      filterFn: "includesString",
    },
    
    {
      accessorKey: "nombre",
      header: "Producto",
      filterFn: "includesString",
    },
    {
      accessorKey: "precio",
      header: "Precio",
      enableGlobalFilter: false,
    },
    {
      accessorKey: "umedida_sunat",
      header: "UM",
      enableGlobalFilter: false,
    },
    {
        accessorKey: "categoria",
        header: "Categoria",
        filterFn: "includesString",
      },
    {
        accessorKey: "activo",
        header: "Activo",
        cell: info => info.row.original.activo ? 'Activo' : 'Inactivo',
      },
    {
      accessorKey: "action",
      header: "Acciones",
      enableGlobalFilter: false,
      cell: ({row, table}) => {
        const rowData = row.original;
        const {viewRedirect, setCrrProduct} = useProductoContext()
        return (
        <div className="flex gap-2">
          <Eye 
          className="cursor-pointer hover:text-blue-600 transition-colors duration-200 active:scale-90"
          onClick={()=> viewRedirect(rowData)}
          
          />
          <Trash2
          className="cursor-pointer hover:text-red-500 transition"
          onClick={() => {
            const setter = table.options.meta?.setData
            const rowIndex = row.index
            if(window.confirm("Esta seguro que desea borrar?"))
            setter && setter(prev => prev.filter((_, i) => i !== rowIndex))
          }}
        />
        </div>
        )
      },

    },
  ]