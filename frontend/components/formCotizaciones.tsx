'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid'
import { Eye, Edit, Trash2, ChevronRight } from 'lucide-react'

interface CotizacionData {
  id: number
  codigo: string
  fechaCreacion: string
  estado: string
  oportunidad: number
  direccion: string
  total: number
  validez: number
  vendedor: string
}

const cotizacionesData: CotizacionData[] = [
  {
    id: 1,
    codigo: '00001',
    fechaCreacion: '01/01/2025',
    estado: 'Propuesta',
    oportunidad: 1,
    direccion: 'Jr. Mártires 24 de Julio',
    total: 1000.00,
    validez: 14,
    vendedor: 'Maria'
  },
  {
    id: 2,
    codigo: '00002',
    fechaCreacion: '10/01/2025',
    estado: 'Propuesta',
    oportunidad: 1,
    direccion: 'Jr. Mártires 24 de Julio',
    total: 1000.00,
    validez: 14,
    vendedor: 'Maria'
  },
  {
    id: 3,
    codigo: '00003',
    fechaCreacion: '12/01/2025',
    estado: 'Aceptada',
    oportunidad: 1,
    direccion: 'Jr. Mártires 24 de Julio',
    total: 1083.30,
    validez: 14,
    vendedor: 'Maria'
  }
]

export default function FormCotizaciones() {
  const [direccionEntrega, setDireccionEntrega] = useState<'tienda' | 'otro'>('tienda')

  const columns: GridColDef[] = [
    {
      field: 'codigo',
      headerName: 'CODIGO',
      width: 100,
      headerClassName: 'data-grid-header'
    },
    {
      field: 'fechaCreacion',
      headerName: 'FECHA DE CREACION',
      width: 180,
      headerClassName: 'data-grid-header'
    },
    {
      field: 'estado',
      headerName: 'ESTADO',
      width: 130,
      headerClassName: 'data-grid-header',
      renderCell: (params) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          params.value === 'Aceptada' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {params.value}
        </span>
      )
    },
    {
      field: 'oportunidad',
      headerName: 'OPORTUNIDAD',
      width: 120,
      headerClassName: 'data-grid-header'
    },
    {
      field: 'direccion',
      headerName: 'DIRECCION',
      width: 200,
      headerClassName: 'data-grid-header'
    },
    {
      field: 'total',
      headerName: 'TOTAL',
      width: 100,
      headerClassName: 'data-grid-header',
      renderCell: (params) => `${params.value.toFixed(2)}`
    },
    {
      field: 'validez',
      headerName: 'VALIDEZ',
      width: 100,
      headerClassName: 'data-grid-header'
    },
    {
      field: 'vendedor',
      headerName: 'VENDEDOR',
      width: 120,
      headerClassName: 'data-grid-header'
    },
    {
      field: 'acciones',
      headerName: 'ACCIONES',
      width: 120,
      headerClassName: 'data-grid-header',
      sortable: false,
      renderCell: (params) => (
        <div className="flex gap-1">
          <button className="p-1 rounded hover:bg-gray-100">
            <Eye size={16} className="text-blue-600" />
          </button>
          <button className="p-1 rounded hover:bg-gray-100">
            <Edit size={16} className="text-green-600" />
          </button>
          <button className="p-1 rounded hover:bg-gray-100">
            <Trash2 size={16} className="text-red-600" />
          </button>
        </div>
      )
    }
  ]

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Tabs de navegación */}
      <Tabs defaultValue="cotizaciones" className="w-full mb-6">
        <TabsList className="grid w-full grid-cols-5 bg-transparent">
          <TabsTrigger 
            value="oportunidad" 
            className="text-gray-600 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-500"
          >
            Oportunidad
          </TabsTrigger>
          <TabsTrigger 
            value="cliente"
            className="text-gray-600 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-500"
          >
            Cliente
          </TabsTrigger>
          <TabsTrigger 
            value="cotizaciones"
            className="text-gray-900 bg-transparent border-b-2 border-blue-500"
          >
            Cotizaciones
          </TabsTrigger>
          <TabsTrigger 
            value="pedido"
            className="text-gray-600 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-500"
          >
            Pedido
          </TabsTrigger>
          <TabsTrigger 
            value="despacho"
            className="text-gray-600 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-500"
          >
            Despacho
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cotizaciones" className="mt-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-6 text-sm text-gray-600">
            <ChevronRight size={16} />
            <span>lista cotizaciones</span>
          </div>

          {/* Sección de dirección de entrega */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-4">Dirección de entrega</h3>
            <RadioGroup
              value={direccionEntrega}
              onValueChange={(value: 'tienda' | 'otro') => setDireccionEntrega(value)}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="tienda" id="tienda" />
                <Label htmlFor="tienda" className="text-sm">Tienda</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="otro" id="otro" />
                <Label htmlFor="otro" className="text-sm">Otro</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Botón Nueva Cotización */}
          <div className="flex justify-end mb-4">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6">
              Nueva Cotización
            </Button>
          </div>

          {/* Tabla de cotizaciones */}
          <div className="bg-white rounded-lg border">
            <DataGrid
              rows={cotizacionesData}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 10 }
                }
              }}
              pageSizeOptions={[5, 10, 25]}
              disableRowSelectionOnClick
              sx={{
                border: 'none',
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: '#f8f9fa',
                  borderBottom: '1px solid #e9ecef',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#6c757d'
                },
                '& .data-grid-header': {
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#6c757d'
                },
                '& .MuiDataGrid-cell': {
                  borderBottom: '1px solid #f1f3f4',
                  fontSize: '0.875rem'
                },
                '& .MuiDataGrid-row:hover': {
                  backgroundColor: '#f8f9fa'
                },
                '& .MuiDataGrid-footerContainer': {
                  borderTop: '1px solid #e9ecef'
                }
              }}
              autoHeight
            />
          </div>
        </TabsContent>
      </Tabs>

      <style jsx global>{`
        .MuiDataGrid-root {
          font-family: inherit;
        }
      `}</style>
    </div>
  )
}