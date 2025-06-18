"use client"
import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  IconButton,
  Box,
  Typography
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Close as CloseIcon } from '@mui/icons-material';
import { GetProductoListApi } from '@/api/productoApis'; // asegúrate de tener esta API
import CustomButton from './customButtom';
import { TCategoria, TProducto } from '@/components/types/productoTypes';
import { GetCategoriaListApi } from '@/api/categoriaApis';

interface ProductSearchPopupProps {
  open: boolean;
  onClose: () => void;
  onSelectProducto: (producto: TProducto) => void;
}

const ProductSearchPopup: React.FC<ProductSearchPopupProps> = ({
  open,
  onClose,
  onSelectProducto
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categorias, setCategorias] = useState<TCategoria[]>([]);
  const [productos, setProductos] = useState<TProducto[]>([]);

  useEffect(() => {
    GetProductoListApi(null).then(data => setProductos(data));
    GetCategoriaListApi(null).then(data => setCategorias(data));
  }, []);

  //FIX: filtrado de categoria tambien
  const filteredProductos = productos.filter(producto =>{
    const categoria = categorias.find(cat => cat.id === producto.categoria);
    const lowerSearchTerm = searchTerm.toLowerCase()
    return (
    String(producto.id).includes(lowerSearchTerm) ||
    producto.nombre?.toLowerCase().includes(lowerSearchTerm) ||
    categoria?.descripcion?.toLowerCase().includes(lowerSearchTerm)
    );
  }
  );

  const handleSelectProducto = (producto: TProducto) => {
    onSelectProducto(producto);
    onClose();
  };

  const columns: GridColDef<TProducto>[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 80,
      flex: 1,
    },
    {
      field: 'nombre',
      headerName: 'NOMBRE DEL PRODUCTO',
      width: 200,
      flex: 1,
    },
    {
      field: 'rprecio_actual',
      headerName: 'PRECIO',
      width: 100,
      flex: 1,
    },
    {
      field: 'rstock',
      headerName: 'STOCK FÍSICO',
      width: 100,
      flex: 1,
    },
    {
      field: 'actions',
      headerName: 'Acción',
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <CustomButton
          type='button'
          variant="primary"
          onClick={() => handleSelectProducto(params.row as TProducto)}
        >
          Seleccionar
        </CustomButton>
      )
    }
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle>
        <Typography >Listado de productos</Typography>
        <IconButton aria-label="close" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ padding: 2 }}>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Buscar por nombre o código"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Box>

        <Box sx={{ height: 450, width: '100%' }}>
          <DataGrid
            rows={filteredProductos}
            columns={columns}
            getRowId={(row) => row.id}
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 10 }
              }
            }}
            disableRowSelectionOnClick
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ProductSearchPopup;
