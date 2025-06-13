'use client'

import React, { Dispatch, SetStateAction, useMemo, useState, useCallback, memo } from 'react'
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

// Componente separado para la celda de cantidad editable
const EditableCantidadCell = memo(({ 
  row, 
  isEditing, 
  onCantidadChange, 
  onStartEdit, 
  errors, 
  isDisabled 
}: {
  row: TCotizacionDetalle;
  isEditing: boolean;
  onCantidadChange: (id: string, value: number) => Promise<void>;
  onStartEdit: (id: string) => void;
  errors: Record<string, string>;
  isDisabled: boolean;
}) => {
  const id = `${row.producto}-${row.cotizacion}`;
  
  if (isEditing) {
    return (
      <div>
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
          onChange={(e) => onCantidadChange(id, Number(e.target.value))}
          min={1}
          autoFocus
        />
        <div className="text-xs h-4 mt-1">
          <span className={errors[id] ? "text-red-500 visible" : "invisible"}>
            {errors[id] ?? 'placeholder'}
          </span>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className="cursor-pointer hover:bg-gray-100 p-1 rounded"
      onClick={() => !isDisabled && onStartEdit(id)}
    >
      {row.cantidad}
    </div>
  );
});

EditableCantidadCell.displayName = 'EditableCantidadCell';

// Componente separado para las acciones
const ActionsCell = memo(({ 
  row, 
  isEditing, 
  onSave, 
  onStartEdit, 
  onDelete, 
  errors, 
  isDisabled 
}: {
  row: TCotizacionDetalle;
  isEditing: boolean;
  onSave: (id: string) => void;
  onStartEdit: (id: string) => void;
  onDelete: (id: string) => void;
  errors: Record<string, string>;
  isDisabled: boolean;
}) => {
  const id = `${row.producto}-${row.cotizacion}`;
  
  return (
    <div className="flex gap-2">
      {isEditing ? (
        <IconButton
          onClick={() => onSave(id)}
          disabled={!!errors[id] || isDisabled}
        >
          <Save size={16} />
        </IconButton>
      ) : (
        <IconButton
          onClick={() => onStartEdit(id)}
          disabled={isDisabled}
        >
          <Pencil size={16} />
        </IconButton>
      )}
      <IconButton
        onClick={() => onDelete(id)}
        disabled={isDisabled}
      >
        <Trash2 size={16} />
      </IconButton>
    </div>
  );
});

ActionsCell.displayName = 'ActionsCell';

export const NewCotizacionTable: React.FC<CotizacionTableProps> = memo(({
  detalles, 
  setDetalles, 
  isDisabled
}) => {
  const [editRowId, setEditRowId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [localDetalles, setLocalDetalles] = useState<TCotizacionDetalle[]>([]);
  const { aplicarDescuentosADetalle } = useDescuentosAutomaticos();

  // Sincronizar detalles locales con los del padre solo cuando sea necesario
  React.useEffect(() => {
    // Solo actualizar si hay diferencias significativas
    const detailsChanged = detalles.length !== localDetalles.length || 
      detalles.some((detalle, index) => {
        const local = localDetalles[index];
        return !local || 
          detalle.producto !== local.producto || 
          detalle.cotizacion !== local.cotizacion ||
          detalle.rnombre !== local.rnombre ||
          detalle.precio_unitario !== local.precio_unitario;
      });

    if (detailsChanged) {
      setLocalDetalles(detalles);
      // Limpiar el estado de edición si se agregan/eliminan productos
      if (detalles.length !== localDetalles.length) {
        setEditRowId(null);
        setErrors({});
      }
    }
  }, [detalles, localDetalles]);

  const handleCantidadChange = useCallback(async (id: string, value: number) => {
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

    // Actualizar estado local inmediatamente para evitar re-render
    setLocalDetalles((prev) =>
      prev.map((row) => {
        if (`${row.producto}-${row.cotizacion}` === id) {
          return { ...row, cantidad: value };
        }
        return row;
      })
    );

    // Aplicar descuentos de forma asíncrona
    try {
      const detalleOriginal = localDetalles.find((row) => `${row.producto}-${row.cotizacion}` === id);
      if (!detalleOriginal) return;

      const detalleTemp = { ...detalleOriginal, cantidad: value };
      const detalleConDescuento = await aplicarDescuentosADetalle(detalleTemp);

      // Actualizar tanto el estado local como el del padre
      const updatedDetalles = localDetalles.map((row) =>
        `${row.producto}-${row.cotizacion}` === id ? detalleConDescuento : row
      );
      
      setLocalDetalles(updatedDetalles);
      setDetalles(updatedDetalles);
    } catch (error) {
      console.error('Error aplicando descuentos', error);
    }
  }, [localDetalles, aplicarDescuentosADetalle, setDetalles]);

  const handleStartEdit = useCallback((id: string) => {
    setEditRowId(id);
  }, []);

  const handleSave = useCallback((id: string) => {
    if (errors[id]) return;
    setEditRowId(null);
  }, [errors]);

  const handleDelete = useCallback((id: string) => {
    const updatedDetalles = localDetalles.filter((row) => `${row.producto}-${row.cotizacion}` !== id);
    setLocalDetalles(updatedDetalles);
    setDetalles(updatedDetalles);
    
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[id];
      return newErrors;
    });
  }, [localDetalles, setDetalles]);

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
      cell: ({ row }) => {
        const id = `${row.original.producto}-${row.original.cotizacion}`;
        const isEditing = editRowId === id;

        return (
          <EditableCantidadCell
            row={row.original}
            isEditing={isEditing}
            onCantidadChange={handleCantidadChange}
            onStartEdit={handleStartEdit}
            errors={errors}
            isDisabled={isDisabled}
          />
        );
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
        const id = `${row.original.producto}-${row.original.cotizacion}`;
        const isEditing = editRowId === id;

        return (
          <ActionsCell
            row={row.original}
            isEditing={isEditing}
            onSave={handleSave}
            onStartEdit={handleStartEdit}
            onDelete={handleDelete}
            errors={errors}
            isDisabled={isDisabled}
          />
        );
      }
    }
  ], [editRowId, errors, isDisabled, handleCantidadChange, handleStartEdit, handleSave, handleDelete]);

  const table = useReactTable({
    data: localDetalles,
    columns,
    getCoreRowModel: getCoreRowModel()
  });

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
  );
});

NewCotizacionTable.displayName = 'CotizacionTable';