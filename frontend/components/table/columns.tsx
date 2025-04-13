"use client"
 
import { ColumnDef } from "@tanstack/react-table"
import { Pencil, Save, Trash2 } from 'lucide-react';
import { ArrowUpDown } from "lucide-react"
import { Button } from "../ui/button";
import React from "react";
import {RowData} from '@tanstack/react-table'

declare module '@tanstack/react-table' {
    interface TableMeta<TData extends RowData> {
      updateData: (rowIndex: number, columnId: string, value: unknown) => void;
    }
  }

export type Payment = {
    id: string
    amount: number
    status: "pending" | "processing" | "success" | "failed"
    email: string
  }
   

  
export const defaultColumnCell: Partial<ColumnDef<Payment>> = {
    cell: ({ getValue, row: { index }, column: { id }, table }) => {
      const initialValue = getValue()
      const [value, setValue] = React.useState(initialValue)
  
      const onBlur = () => {
        table.options.meta?.updateData(index, id, value)
      }
  
      React.useEffect(() => {
        setValue(initialValue)
      }, [initialValue])
  
      return (
        <input
          value={value as string}
          onChange={e => setValue(e.target.value)}
          onBlur={onBlur}
        />
      )
    },
  }

export const columns: ColumnDef<Payment>[] = [
    {
      accessorKey: "status",
      footer: props => props.column.id,
      header: "Status",
    },
    {
      accessorKey: "email",
      footer: props => props.column.id,
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
      footer: props => props.column.id,
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
      footer: props => props.column.id,
      header: "Acciones",
      cell: ({row}) => {
        return <div className="flex gap-2"><Pencil/><Save/><Trash2/></div>
      },

    },
  ]