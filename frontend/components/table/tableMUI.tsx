"use client"
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  TablePagination,
  Box,
  Typography
} from '@mui/material';
import { Edit, Delete, Visibility, MoreVert } from '@mui/icons-material';

// Tipo para las acciones disponibles
type ActionType = 'view' | 'edit' | 'delete' | 'more';

// Interfaz para cada acción
export interface TableAction {
  type: ActionType;
  tooltip: string;
  onClick: (id: string | number) => void;
  icon?: React.ReactNode;
  hide?: (item: any) => boolean;
}

// Interfaz para las columnas
export interface Column {
  id: string;
  label: string;
  minWidth?: number;
  align?: 'right' | 'left' | 'center';
  format?: (value: any) => React.ReactNode;
}

// Propiedades para nuestro componente de tabla
interface DataTableProps {
  columns: Column[];
  data: any[];
  actions?: TableAction[];
  idField?: string;
  title?: string;
  pagination?: boolean;
  emptyMessage?: string;
}

// Componente de tabla reutilizable
export const DataTableMUI: React.FC<DataTableProps> = ({
  columns,
  data,
  actions = [],
  idField = 'id',
  title,
  pagination = true,
  emptyMessage = 'No hay datos disponibles'
}) => {
  // Estado para la paginación
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  // Manejadores para la paginación
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  // Renderiza el ícono correcto según el tipo de acción
  const getActionIcon = (action: TableAction) => {
    if (action.icon) return action.icon;
    
    switch (action.type) {
      case 'view':
        return <Visibility />;
      case 'edit':
        return <Edit />;
      case 'delete':
        return <Delete />;
      case 'more':
        return <MoreVert />;
      default:
        return <MoreVert />;
    }
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      {title && (
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        </Box>
      )}
      
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="tabla de datos">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  style={{ minWidth: column.minWidth || 100 }}
                >
                  {column.label}
                </TableCell>
              ))}
              {actions.length > 0 && (
                <TableCell align="center" style={{ minWidth: 120 }}>
                  Acciones
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length > 0 ? (
              data
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => {
                  return (
                    <TableRow hover role="checkbox" tabIndex={-1} key={row[idField]}>
                      {columns.map((column) => {
                        const value = row[column.id];
                        return (
                          <TableCell key={column.id} align={column.align || 'left'}>
                            {column.format ? column.format(value) : value}
                          </TableCell>
                        );
                      })}
                      {actions.length > 0 && (
                        <TableCell align="center">
                          {actions.map(
                            (action) =>
                              (!action.hide || !action.hide(row)) && (
                                <Tooltip key={action.type} title={action.tooltip}>
                                  <IconButton
                                    size="small"
                                    onClick={() => action.onClick(row[idField])}
                                    color="primary"
                                  >
                                    {getActionIcon(action)}
                                  </IconButton>
                                </Tooltip>
                              )
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (actions.length > 0 ? 1 : 0)}
                  align="center"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {pagination && data.length > 0 && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 100]}
          component="div"
          count={data.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} de ${count}`
          }
        />
      )}
    </Paper>
  );
};


// Ejemplo de uso:
export const DataTableExample: React.FC = () => {
  // Definimos nuestras columnas
  const columns: Column[] = [
    { id: 'nombre', label: 'Nombre', minWidth: 170 },
    { id: 'apellido', label: 'Apellido', minWidth: 100 },
    {
      id: 'email',
      label: 'Email',
      minWidth: 170,
      format: (value) => <a href={`mailto:${value}`}>{value}</a>,
    },
    {
      id: 'fechaRegistro',
      label: 'Fecha de Registro',
      minWidth: 170,
      format: (value) => new Date(value).toLocaleDateString(),
    },
  ];

  // Datos de ejemplo
  const data = [
    {
      id: 1,
      nombre: 'Juan',
      apellido: 'Pérez',
      email: 'juan.perez@ejemplo.com',
      fechaRegistro: '2023-01-15',
    },
    {
      id: 2,
      nombre: 'María',
      apellido: 'González',
      email: 'maria.gonzalez@ejemplo.com',
      fechaRegistro: '2023-02-20',
    },
    {
      id: 3,
      nombre: 'Carlos',
      apellido: 'Rodríguez',
      email: 'carlos.rodriguez@ejemplo.com',
      fechaRegistro: '2023-03-10',
    },
  ];

  // Acciones para nuestra tabla
  const actions: TableAction[] = [
    {
      type: 'view',
      tooltip: 'Ver detalles',
      onClick: (id) => console.log(`Ver el elemento con ID: ${id}`),
    },
    {
      type: 'edit',
      tooltip: 'Editar',
      onClick: (id) => console.log(`Editar el elemento con ID: ${id}`),
    },
    {
      type: 'delete',
      tooltip: 'Eliminar',
      onClick: (id) => console.log(`Eliminar el elemento con ID: ${id}`),
      // Solo mostrar esta acción para ciertos elementos
      hide: (item) => item.id === 2,
    },
  ];

  return (
    <DataTableMUI
      columns={columns}
      data={data}
      actions={actions}
      
      emptyMessage="No hay usuarios disponibles"
    />
  );
};