'use client'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function FormOportunidad() {
    return (
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Card de formulario */}
      {/* Número de consulta */}
      <div>
        <Label htmlFor="consulta">Número de consulta</Label>
        <Input id="consulta" value="00001" disabled />
      </div>

      {/* Sede */}
      <div>
        <Label htmlFor="sede">Sede <span className="text-red-500">*</span></Label>
        <Select defaultValue="tienda-a">
          <SelectTrigger id="sede">
            <SelectValue placeholder="Seleccione una sede" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tienda-a">Tienda A</SelectItem>
            <SelectItem value="tienda-b">Tienda B</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Fecha de contacto */}
      <div>
        <Label htmlFor="contacto">Inicio de contacto</Label>
        <Input id="contacto" type="date" defaultValue="2025-01-18" />
      </div>

      {/* Vendedor responsable */}
      <div>
        <Label htmlFor="vendedor">Vendedor Responsable <span className="text-red-500">*</span></Label>
        <Select defaultValue="maria-benitez">
          <SelectTrigger id="vendedor">
            <SelectValue placeholder="Seleccione un vendedor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="maria-benitez">Maria Benitez</SelectItem>
            <SelectItem value="juan-perez">Juan Perez</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Observaciones */}
      <div className="col-span-1 md:col-span-2">
        <Label htmlFor="observaciones">Observaciones</Label>
        <Textarea id="observaciones" placeholder="Ingrese observaciones..." />
      </div>

      {/* Resultado */}
      <div>
        <Label>Resultado</Label>
        <RadioGroup defaultValue="nuevo" className="mt-2 flex gap-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="nuevo" id="nuevo" />
            <Label htmlFor="nuevo">Nuevo</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="negociacion" id="negociacion" />
            <Label htmlFor="negociacion">En Negociación</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="perdida" id="perdida" />
            <Label htmlFor="perdida">Perdida</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="ganada" id="ganada" />
            <Label htmlFor="ganada">Ganada</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Valor Neto */}
        <div>
          <Label htmlFor="valor">Valor Neto</Label>
          <Input id="valor" value="S/. 7650.00" disabled />
        </div>
      </div>
    );
}
