'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DataGrid, GridColDef } from '@mui/x-data-grid'

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
    valorUnitario: 1500,
    um: 'Unidades',
    cantidad: 1,
    descuento: '-',
    total: 1500
  },
  {
    id: 4,
    codigo: '0034',
    producto: 'Tocador digital',
    valorUnitario: 2300,
    um: 'Unidades',
    cantidad: 1,
    descuento: '-',
    total: 2300
  },
  {
    id: 5,
    codigo: 'S002',
    producto: 'Servicio de envío',
    valorUnitario: 50,
    um: 'Unidades',
    cantidad: 1,
    descuento: '-',
    total: 50
  }
]

export default function FormPedido() {
  const [formData, setFormData] = useState({
    codigoPedido: 'P0000001',
    direccionEntrega: 'Jirón Manuel Belgrano 130, Pueblo Libre',
    valorNeto: '7650.00',
    solicitante: 'Pedro Cuellar Solís',
    fechaPedido: '10/02/2025',
    igv: '1377.00',
    descuentoAuxiliar: '100.00',
    descuentoTotal: '100.00',
    valorTotal: '9027.00',
    estado: 'Por validar',
    observaciones: ''
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

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
    }
  ]

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Información del pedido en grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Primera columna */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-600">Código de Pedido</Label>
            <Input
              value={formData.codigoPedido}
              onChange={(e) => handleInputChange('codigoPedido', e.target.value)}
              className="bg-gray-100"
              readOnly
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-600">Solicitante</Label>
            <Input
              value={formData.solicitante}
              onChange={(e) => handleInputChange('solicitante', e.target.value)}
              className="bg-gray-100"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-600">Descuento auxiliar</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">S/.</span>
              <Input
                value={formData.descuentoAuxiliar}
                onChange={(e) => handleInputChange('descuentoAuxiliar', e.target.value)}
                className="pl-8 bg-gray-100"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-600">Estado</Label>
            <Select value={formData.estado} onValueChange={(value) => handleInputChange('estado', value)}>
              <SelectTrigger className="bg-gray-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Por validar">Por validar</SelectItem>
                <SelectItem value="Validado">Validado</SelectItem>
                <SelectItem value="Rechazado">Rechazado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Segunda columna */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-600">Dirección de entrega</Label>
            <Input
              value={formData.direccionEntrega}
              onChange={(e) => handleInputChange('direccionEntrega', e.target.value)}
              className="bg-gray-100"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-600">Fecha del pedido</Label>
            <Input
              value={formData.fechaPedido}
              onChange={(e) => handleInputChange('fechaPedido', e.target.value)}
              className="bg-gray-100"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-600">Descuento total</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">S/.</span>
              <Input
                value={formData.descuentoTotal}
                onChange={(e) => handleInputChange('descuentoTotal', e.target.value)}
                className="pl-8 bg-gray-100"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium text-blue-600">Observaciones</Label>
            <Textarea
              value={formData.observaciones}
              onChange={(e) => handleInputChange('observaciones', e.target.value)}
              className="bg-blue-50 border-blue-200 min-h-[80px]"
              placeholder="Ingrese observaciones..."
            />
          </div>
        </div>

        {/* Tercera columna */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-600">Valor Neto</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">S/.</span>
              <Input
                value={formData.valorNeto}
                onChange={(e) => handleInputChange('valorNeto', e.target.value)}
                className="pl-8 bg-gray-100"
                readOnly
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-600">IGV</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">S/.</span>
              <Input
                value={formData.igv}
                onChange={(e) => handleInputChange('igv', e.target.value)}
                className="pl-8 bg-gray-100"
                readOnly
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-600">Valor Total</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">S/.</span>
              <Input
                value={formData.valorTotal}
                onChange={(e) => handleInputChange('valorTotal', e.target.value)}
                className="pl-8 bg-gray-100"
                readOnly
              />
            </div>
          </div>

          {/* Botones de acción */}
          <div className="space-y-3 pt-4">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Generar archivo XML
            </Button>
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
              Marcar como Pagado
            </Button>
            <Button className="w-full bg-pink-600 hover:bg-pink-700 text-white">
              Anular Pedido
            </Button>
          </div>
        </div>
      </div>

      {/* Sección RESUMEN PRODUCTOS */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">RESUMEN PRODUCTOS</h3>
        
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
            hideFooterPagination
            hideFooter
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
              '& .MuiDataGrid-row:nth-of-type(even)': {
                backgroundColor: '#fafafa'
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