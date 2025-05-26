'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { ChevronRight, ChevronDown, Edit, Printer, Trash2 } from 'lucide-react'

interface ProductoData {
  id: number
  codigo: string
  producto: string
  valorUnitario: number
  um: string
  cantidad: number
  descuento: string
  total: number
}

const productosData: ProductoData[] = [
  {
    id: 1,
    codigo: '0005',
    producto: 'Comedor de 8 sillas',
    valorUnitario: 2000,
    um: 'Unidades',
    cantidad: 1,
    descuento: '10%',
    total: 1800
  },
  {
    id: 2,
    codigo: '0006',
    producto: 'Comedor de 6 sillas',
    valorUnitario: 1800,
    um: 'Unidades',
    cantidad: 1,
    descuento: '10%',
    total: 1620
  },
  {
    id: 3,
    codigo: '0017',
    producto: 'portaTV',
    valorUnitario: 2000,
    um: 'Unidades',
    cantidad: 1,
    descuento: '10%',
    total: 1800
  },
  {
    id: 4,
    codigo: '0034',
    producto: 'Tocador digital',
    valorUnitario: 1800,
    um: 'Unidades',
    cantidad: 1,
    descuento: '10%',
    total: 1620
  }
]

export default function FormCotizacionDetalle() {
  const [descuentoAuxiliar, setDescuentoAuxiliar] = useState('400.00')
  const [maximoPermisible, setMaximoPermisible] = useState('382.5')
  const [observaciones, setObservaciones] = useState('')
  const [isDescuentoOpen, setIsDescuentoOpen] = useState(true)

  const columns: GridColDef[] = [
    {
      field: 'codigo',
      headerName: 'CODIGO',
      width: 100,
      headerClassName: 'data-grid-header'
    },
    {
      field: 'producto',
      headerName: 'PRODUCTO',
      width: 200,
      headerClassName: 'data-grid-header'
    },
    {
      field: 'valorUnitario',
      headerName: 'VALOR UNITARIO',
      width: 150,
      headerClassName: 'data-grid-header',
      renderCell: (params) => params.value.toLocaleString()
    },
    {
      field: 'um',
      headerName: 'UM',
      width: 100,
      headerClassName: 'data-grid-header'
    },
    {
      field: 'cantidad',
      headerName: 'CANTIDAD',
      width: 100,
      headerClassName: 'data-grid-header'
    },
    {
      field: 'descuento',
      headerName: 'DESCUENTO',
      width: 120,
      headerClassName: 'data-grid-header'
    },
    {
      field: 'total',
      headerName: 'TOTAL',
      width: 100,
      headerClassName: 'data-grid-header',
      renderCell: (params) => params.value.toLocaleString()
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
            <Edit size={16} className="text-blue-600" />
          </button>
          <button className="p-1 rounded hover:bg-gray-100">
            <Printer size={16} className="text-gray-600" />
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
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm text-gray-600">
        <ChevronRight size={16} />
        <span>lista cotizaciones/ cotizacion 1 (Propuesta)</span>
      </div>

      {/* Sección desplegable de Descuento y observaciones */}
      <Collapsible open={isDescuentoOpen} onOpenChange={setIsDescuentoOpen}>
        <CollapsibleTrigger className="flex items-center gap-2 w-full p-3 bg-gray-50 rounded-t-lg border hover:bg-gray-100">
          {isDescuentoOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          <span className="font-medium">Descuento y observaciones</span>
        </CollapsibleTrigger>
        <CollapsibleContent className="border border-t-0 rounded-b-lg p-6 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Descuento auxiliar */}
            <div className="space-y-2">
              <Label htmlFor="descuentoAuxiliar" className="text-sm font-medium text-blue-600">
                Descuento auxiliar
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">S/.</span>
                <Input
                  id="descuentoAuxiliar"
                  value={descuentoAuxiliar}
                  onChange={(e) => setDescuentoAuxiliar(e.target.value)}
                  className="pl-8 bg-blue-50 border-blue-200"
                />
              </div>
            </div>

            {/* Máximo permisible */}
            <div className="space-y-2">
              <Label htmlFor="maximoPermisible" className="text-sm font-medium">
                Máximo permisible
              </Label>
              <Input
                id="maximoPermisible"
                value={maximoPermisible}
                onChange={(e) => setMaximoPermisible(e.target.value)}
                className="bg-gray-100"
              />
            </div>

            {/* Observación/Razón de rechazo */}
            <div className="space-y-2">
              <Label htmlFor="observaciones" className="text-sm font-medium text-blue-600">
                Observación/Razón de rechazo
              </Label>
              <Textarea
                id="observaciones"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                className="bg-blue-50 border-blue-200 min-h-[80px]"
                placeholder="Ingrese observaciones..."
              />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Sección de Listado */}
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-4">Listado</h3>
        
        {/* Botones de acción */}
        <div className="flex justify-between items-center mb-4">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            Agregar Línea
          </Button>
          <div className="flex gap-3">
            <Button className="bg-pink-600 hover:bg-pink-700 text-white">
              Rechazar Cotización
            </Button>
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              Generar Pedido
            </Button>
          </div>
        </div>

        {/* Tabla de productos */}
        <div className="bg-white rounded-lg border">
          <DataGrid
            rows={productosData}
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
      </div>

      <style jsx global>{`
        .MuiDataGrid-root {
          font-family: inherit;
        }
      `}</style>
    </div>
  )
}