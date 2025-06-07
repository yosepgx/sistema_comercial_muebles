"use client"
 
import { ColumnDef } from "@tanstack/react-table"
import { Edit, Eye, Trash2 } from 'lucide-react';
import React from "react";
import { TProducto } from "../types/productoTypes";
import { useProductoContext } from "@/context/productoContext";
import { UNIDADES_MEDIDA_BUSCA } from "@/constants/unidadesMedidaConstants";
import { IconButton } from "@mui/material";

const ActionCell: React.FC<{ row: any; table: any }> = ({ row, table }) => {
  const rowData = row.original;
  const { viewRedirect, setCrrProduct } = useProductoContext();

  return (
    <div className="flex gap-2">
      <IconButton onClick={() => viewRedirect(rowData)}>
      <Edit />
      </IconButton>
      <IconButton onClick={() => {
          const setter = table.options.meta?.setData;
          const rowIndex = row.index;
          if (window.confirm("¿Está seguro que desea borrar?")) {
            setter && setter((prev: any[]) => prev.filter((_, i) => i !== rowIndex));
          }
        }}>
      <Trash2/>
      </IconButton>
    </div>
  );
};


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
      accessorKey: "rprecio_actual",
      header: () => <div className="text-center">Precio</div>,
      enableGlobalFilter: false,
      cell: ({ getValue }) => {
        const valor = getValue() as number;
        return (
      <div className="flex justify-center">
          <div className="text-right">{valor?.toFixed(2) ?? "0.00"}</div>
        </div>
        );
      },
    },
    {
      accessorKey: "umedida_sunat",
      header: "UM",
      enableGlobalFilter: false,
      cell: ({ getValue }) => {
      const codigo = getValue() as string;
      if (typeof codigo === "string") {
        return UNIDADES_MEDIDA_BUSCA[codigo] ?? codigo;
      }
      return codigo;
      },
    },
    {
        accessorKey: "rcategoria_producto.descripcion",
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
      cell: ({ row, table }) => <ActionCell row={row} table={table} />,

    },
  ]