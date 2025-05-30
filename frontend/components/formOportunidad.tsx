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
import { TOportunidad } from "./types/oportunidad"
import CustomButton from "./customButtom"

const formSchema = z.object({
  id: z.string(),
  cliente: z.string(), 
  sede_id: z.string(),
  fecha_contacto: z.string().optional(), //manejado por back
  estado_oportunidad: z.enum(["ganado","perdido","en negociacion"]),
  activo: z.string(),
  rcliente: z.string().optional().nullable(),
})

const formSchemaSend = formSchema.transform(data => ({
  ...data,
  id: parseInt(data.id,10),
  cliente: parseInt(data.id,10),
  sede_id: parseInt(data.id,10),
  fecha_contacto: parseInt(data.id,10),
  activo: data.activo === 'true',
  })
)
type FormValues = z.infer<typeof formSchema>

interface FormOportunidadProps {
  crrOportunidad?: TOportunidad | null; 
}

export default function FormOportunidad({crrOportunidad}: FormOportunidadProps) {
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: '0',
      cliente: '', 
      sede_id: '',
      fecha_contacto: '',
      estado_oportunidad: 'en negociacion',
      activo: 'true',
      rcliente: null,
    }
  })

   const onSubmit = (data: FormValues) => {
    console.log('Datos del formulario:', data)
  }

    return (
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Card de formulario */}
      {/* Número de consulta */}
      <Form {...form}> 
      <form onSubmit={form.handleSubmit(onSubmit)}>
      <div>
        <Label htmlFor="consulta">Número de consulta</Label>
        <Input id="consulta" value="00001" disabled={true} />
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
        <FormField
          control = {form.control}
          name = "fecha_contacto"
          render = {({field}) => (
            <FormItem className="flex flex-col">
              <FormLabel>Inicio de contacto</FormLabel>
              <FormControl>
                <Input type="date" disabled={true} {...field}/>
              </FormControl>
              <FormMessage className="min-h-[24px]"/>
            </FormItem>
          )}
          />
      </div>
      {/* Resultado */}
      <div>
         <FormField
            control = {form.control}
            name = "estado_oportunidad"
            render={({field}) => (
            <FormItem className='flex flex-row'>
              <FormLabel>Resultado</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={'negociacion'}
                >
                  <FormItem >
                    <FormControl>
                      <RadioGroupItem value="negociacion" />
                    </FormControl>
                    <FormLabel>
                      En negociacion
                    </FormLabel>
                  </FormItem>
                  <FormItem >
                    <FormControl>
                      <RadioGroupItem value="perdida" />
                    </FormControl>
                    <FormLabel>
                      Perdida
                    </FormLabel>
                  </FormItem>
                  <FormItem >
                    <FormControl>
                      <RadioGroupItem value="ganada" />
                    </FormControl>
                    <FormLabel>
                      Ganada
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage className="min-h-[24px]"/>
            </FormItem>
            )}
          />
        
      </div>

      {/* Valor Neto */}
        {/* <FormField
          control = {form.control}
          name = "rvalorneto"
          render = {({field}) => (
            <FormItem className="flex flex-col">
              <FormLabel>Valor Neto</FormLabel>
              <FormControl>
                <Input type="number" disabled={true} {...field}/>
              </FormControl>
              <FormMessage className="min-h-[24px]"/>
            </FormItem>
          )}
        /> 
        */}

        <CustomButton variant="primary" type="submit">Guardar Oportunidad</CustomButton>
          </form>
          </Form>
        </div>
    );
}
