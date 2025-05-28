import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  IconButton,
  Box,
  Button,
  Typography
} from '@mui/material';
import { DataGrid, GridColDef, GridRowParams } from '@mui/x-data-grid';
import { Close as CloseIcon, Search as SearchIcon } from '@mui/icons-material';
import { TCliente } from './types/clienteType';

interface ClientSearchPopupProps {
  open: boolean;
  onClose: () => void;
  onSelectClient: (cliente: TCliente) => void;
}

const ClientSearchPopup: React.FC<ClientSearchPopupProps> = ({
  open,
  onClose,
  onSelectClient
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const [clientesData, SetClientesData] = useState<TCliente[]>([])

  // Filtrar clientes basado en el término de búsqueda
  const filteredClientes = clientesData.filter(cliente =>
    String(cliente.id).includes(searchTerm.toLowerCase()) ||
    cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.documento.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.naturaleza.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.tipo_interes.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectClient = (cliente: TCliente) => {
    onSelectClient(cliente);
    onClose();
  };

  const columns: GridColDef[] = [
    {
      field: 'codigo',
      headerName: 'CÓDIGO',
      width: 100,
      headerClassName: 'data-grid-header'
    },
    {
      field: 'docRuc',
      headerName: 'DOC/RUC',
      width: 120,
      headerClassName: 'data-grid-header'
    },
    {
      field: 'nombres',
      headerName: 'NOMBRES',
      width: 180,
      headerClassName: 'data-grid-header'
    },
    {
      field: 'tipoCliente',
      headerName: 'TIPO DE CLIENTE',
      width: 150,
      headerClassName: 'data-grid-header'
    },
    {
      field: 'telefono',
      headerName: 'TELÉFONO',
      width: 120,
      headerClassName: 'data-grid-header'
    },
    {
      field: 'correo',
      headerName: 'CORREO',
      width: 180,
      headerClassName: 'data-grid-header'
    },
    {
      field: 'grupoCliente',
      headerName: 'GRUPO CLIENTE',
      width: 140,
      headerClassName: 'data-grid-header'
    },
    {
      field: 'interes',
      headerName: 'INTERÉS',
      width: 100,
      headerClassName: 'data-grid-header'
    },
    {
      field: 'actions',
      headerName: 'SELECCIONAR',
      width: 120,
      sortable: false,
      filterable: false,
      headerClassName: 'data-grid-header',
      renderCell: (params) => (
        <Button
          variant="contained"
          size="small"
          onClick={() => handleSelectClient(params.row as TCliente)}
          sx={{
            backgroundColor: '#1976d2',
            '&:hover': {
              backgroundColor: '#1565c0'
            }
          }}
        >
          Seleccionar
        </Button>
      )
    }
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          height: '80vh',
          maxHeight: '80vh'
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#f5f5f5',
          borderBottom: '1px solid #e0e0e0'
        }}
      >
        <Typography variant="h6" component="div">
          Listado de clientes
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ padding: 2 }}>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Nombre, documento, tipo cliente, grupo"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: '#1976d2', mr: 1 }} />,
              sx: {
                backgroundColor: '#e3f2fd',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#1976d2'
                }
              }
            }}
            sx={{
              '& .MuiInputLabel-root': {
                color: '#1976d2'
              }
            }}
          />
        </Box>

        <Box sx={{ height: 450, width: '100%' }}>
          <DataGrid
            rows={filteredClientes}
            columns={columns}
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 10 }
              }
            }}
            disableRowSelectionOnClick
            sx={{
              '& .data-grid-header': {
                backgroundColor: '#f5f5f5',
                fontWeight: 'bold',
                fontSize: '0.875rem'
              },
              '& .MuiDataGrid-cell': {
                fontSize: '0.875rem'
              },
              '& .MuiDataGrid-root': {
                border: '1px solid #e0e0e0'
              }
            }}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ClientSearchPopup;