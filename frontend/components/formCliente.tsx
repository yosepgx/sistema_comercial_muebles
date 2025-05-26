'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface ClientFormData {
  nombres: string
  apellidos: string
  tipoCliente: string
  correo: string
  documento: string
  telefono: string
  tipoDocumento: 'DNI' | 'RUC'
}

export default function FormCliente() {
  const [formData, setFormData] = useState<ClientFormData>({
    nombres: '',
    apellidos: '',
    tipoCliente: 'Natural',
    correo: '',
    documento: '',
    telefono: '',
    tipoDocumento: 'DNI'
  })

  const handleInputChange = (field: keyof ClientFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Datos del formulario:', formData)
    // Aquí iría la lógica para enviar los datos
  }

  const handleBuscarCliente = () => {
    console.log('Buscar cliente')
    // Lógica para buscar cliente
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Tabs de navegación */}
          {/* Botones de acción */}
          <div className="flex gap-3 mb-6">
            <Button 
              onClick={handleBuscarCliente}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6"
            >
              Buscar Cliente
            </Button>
            <Button 
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50 px-6"
            >
              Registrar Cliente
            </Button>
          </div>

          {/* Formulario */}
          <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Primera fila */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="nombres" className="text-sm font-medium">
                      Nombres del cliente <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="nombres"
                      value={formData.nombres}
                      onChange={(e) => handleInputChange('nombres', e.target.value)}
                      className="w-full"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tipoCliente" className="text-sm font-medium">
                      Tipo de cliente <span className="text-red-500">*</span>
                    </Label>
                    <Select 
                      value={formData.tipoCliente} 
                      onValueChange={(value) => handleInputChange('tipoCliente', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Natural">Natural</SelectItem>
                        <SelectItem value="Jurídico">Jurídico</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Segunda fila */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="apellidos" className="text-sm font-medium">
                      Apellidos del cliente <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="apellidos"
                      value={formData.apellidos}
                      onChange={(e) => handleInputChange('apellidos', e.target.value)}
                      className="w-full"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="correo" className="text-sm font-medium">
                      Correo del cliente <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="correo"
                      type="email"
                      value={formData.correo}
                      onChange={(e) => handleInputChange('correo', e.target.value)}
                      className="w-full"
                      required
                    />
                  </div>
                </div>

                {/* Tercera fila */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="documento" className="text-sm font-medium">
                      Documento del cliente <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="documento"
                      value={formData.documento}
                      onChange={(e) => handleInputChange('documento', e.target.value)}
                      className="w-full"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefono" className="text-sm font-medium">
                      Teléfono de contacto <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="telefono"
                      value={formData.telefono}
                      onChange={(e) => handleInputChange('telefono', e.target.value)}
                      className="w-full"
                      required
                    />
                  </div>
                </div>

                {/* Tipo de documento */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Tipo de documento</Label>
                  <RadioGroup
                    value={formData.tipoDocumento}
                    onValueChange={(value: 'DNI' | 'RUC') => handleInputChange('tipoDocumento', value)}
                    className="flex gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="DNI" id="dni" />
                      <Label htmlFor="dni" className="text-sm">DNI</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="RUC" id="ruc" />
                      <Label htmlFor="ruc" className="text-sm">RUC</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Botón de envío */}
                <div className="flex justify-end pt-4">
                  <Button 
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                  >
                    Registrar Cliente
                  </Button>
                </div>
              </form>
            </div>
    </div>
  )
}