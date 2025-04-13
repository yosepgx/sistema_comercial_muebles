"use client"
 
import { ColumnDef } from "@tanstack/react-table"
import { Pen, Pencil, Save, Trash2 } from 'lucide-react';
import { ArrowUpDown } from "lucide-react"
import { Button } from "../ui/button";
import React from "react";



export type Payment = {
    id: string
    amount: number
    status: "pending" | "processing" | "success" | "failed"
    email: string
    editable: boolean
  }
   

  
export const defaultColumnCell: Partial<ColumnDef<Payment>> = {
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

export const columns: ColumnDef<Payment>[] = [
    {
      accessorKey: "id",
      header: "Codigo",
      cell: ({ getValue }) => <span>{getValue() as string}</span>,
    }, 
    {
      accessorKey: "status",
      header: "Status",
    },
    {
      accessorKey: "email",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Email
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: "amount",
      header: () => <div className="text-right">Amount</div>,
      cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"))
      const formatted = new Intl.NumberFormat("es-PE", {
        style: "currency",
        currency: "PEN",
      }).format(amount)
 
      return <div className="text-right font-medium">{formatted}</div>
     },
    },
    {
      accessorKey: "action",
      header: "Acciones",
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
            const setter = table.options.meta?.saveFunction
            setter && setter()}}
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