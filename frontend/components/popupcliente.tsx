import React, { useEffect, useState } from 'react';
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
import { GetClienteListApi } from '@/api/clienteApis';
import CustomButton from './customButtom';

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

  useEffect(()=>{
    GetClienteListApi('').then(
      (data) => SetClientesData(data)
    )
  },[])

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

  const columns: GridColDef<TCliente>[] = [
    {
      field: 'id',
      headerName: 'CÓDIGO',
      width: 100,
      headerClassName: 'data-grid-header',
      flex: 1,
    },
    {
      field: 'documento',
      headerName: 'DOC/RUC',
      width: 120,
      headerClassName: 'data-grid-header',
      flex: 1,
    },
    {
      field: 'nombre',
      headerName: 'NOMBRES',
      width: 180,
      headerClassName: 'data-grid-header',
      flex: 1,
    },
    {
      field: 'naturaleza',
      headerName: 'TIPO DE CLIENTE',
      width: 150,
      headerClassName: 'data-grid-header',
      flex: 1,
    },
    {
      field: 'telefono',
      headerName: 'TELÉFONO',
      width: 120,
      headerClassName: 'data-grid-header',
      flex: 1,
    },
    {
      field: 'correo',
      headerName: 'CORREO',
      width: 180,
      headerClassName: 'data-grid-header',
      flex: 1,
    },
    {
      field: 'tipo_interes',
      headerName: 'INTERÉS',
      width: 100,
      headerClassName: 'data-grid-header',
      flex: 1,
    },
    {
      field: 'actions',
      headerName: 'Accion',
      width: 120,
      sortable: false,
      filterable: false,
      headerClassName: 'data-grid-header',
      renderCell: (params) => (
        <CustomButton
          variant="primary"
          onClick={() => handleSelectClient(params.row as TCliente)}
          
        >
          Seleccionar
        </CustomButton>
      )
    }
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
    >
      <DialogTitle
        
      >
        <Typography variant="h6" component="div">
          Listado de clientes
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ padding: 2 }}>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Nombre, documento, tipo cliente"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            
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
            
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ClientSearchPopup;