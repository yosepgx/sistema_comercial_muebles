'use client'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useState } from "react"
import { useForm } from "react-hook-form"
import {z} from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormMessage } from './ui/form'
import { FormLabel } from "@mui/material"
import { format } from "date-fns-tz"

const formSchema = z.object({
  id: z.string(),
  contacto: z.string(), //TODO cambiar nombre a cliente
  sede_id: z.string(),
  fecha_contacto: z.string().optional(), //manejado por back
  vendedor_asignado: z.string(), //TODO quitar 
  estado_oportunidad: z.enum(["ganado","perdido","en negociacion"]),
  activo: z.string(),
  rcliente: z.string().optional().nullable(),
})

const formSchemaSend = formSchema.transform(data => ({
  ...data,
  id: parseInt(data.id,10),
  contacto: parseInt(data.id,10),
  sede_id: parseInt(data.id,10),
  fecha_contacto: parseInt(data.id,10),
  activo: data.activo === 'true',
  })
)

export default function FormOportunidad() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: '0',
      contacto: '', //cambiar nombre a cliente
      sede_id: '',
      fecha_contacto: '',
      vendedor_asignado: '', //quitar 
      estado_oportunidad: 'en negociacion',
      activo: 'true',
      rcliente: null,
    }
  })

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
        <FormField
          control = {form.control}
          name = "sede_id"
          render={({field}) => (
            <FormItem className='flex flex-col'>
              <FormLabel> Sede</FormLabel>
              <Select onValueChange = {field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar sede"/>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="1">Tienda A</SelectItem>
                  <SelectItem value="2">Tienda B</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage className="min-h-[24px]"/>
            </FormItem>
          )}
        />
      </div>

      {/* Fecha de contacto */}
      <div>
        <Label htmlFor="contacto">Inicio de contacto</Label>
        <Input id="contacto" type="date" defaultValue= {format(new Date(), 'yyyy-MM-dd')} disabled={true}/>
      </div>

      {/* Vendedor responsable */}
      <div>
        <Label htmlFor="vendedor">Vendedor Responsable </Label>
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
