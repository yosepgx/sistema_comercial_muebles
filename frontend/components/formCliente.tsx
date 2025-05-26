'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {z} from 'zod'
import { TCliente } from './types/clienteType'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormMessage } from './ui/form'
import { FormLabel } from '@mui/material'
import CustomButton from './customButtom'

const formSchema = z.object({
  id: z.string().min(1, 'no se encontro id'),
  nombre: z.string().min(1, 'Se necesita indicar un nombre'),
  correo: z.string().min(1, 'Se necesita llenar este campo o indicar ninguno'),
  telefono: z.string().min(1, 'Se necesita llenar este campo o indicar ninguno'),
  naturaleza: z.enum(["Natural","Empresa"]),
  tipo_interes: z.enum(["cliente","lead"]), //manejado por back
  fechaConversion: z.string().optional().nullable(), //se maneja en back
  documento: z.string().min(8,"El DNI debe de contener 8 digitos"),
  tipo_documento: z.string().min(11,'El RUC debe de contener 11 digitos'),
  activo: z.string(), //manejado por back
})

type FormValues = z.infer<typeof formSchema>


//1. antes de guardar se puede cambiar dni a ruc y dejar dni en blanco
//2. talvez sea mejor solo usar documento y tipo de documento
const formSchemaSend = formSchema.transform(data => ({
    ...data,
    id: parseInt(data.id, 10),
    activo: data.activo === "true",
  })
)

export default function FormCliente() {
  const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
          id: '0',
          nombre: '',
          correo: '',
          telefono: '',
          tipo_interes: 'cliente',
          fechaConversion: `${new Date()}`,
          naturaleza: 'Natural',
          documento: '',
          tipo_documento: 'DNI',
          activo: "true",
        },
      });


  const onSubmit = (data: FormValues) => {
    console.log('Datos del formulario:', data)
  }

  const handleBuscarCliente = () => {
    console.log('Buscar cliente')
    // Lógica para buscar cliente
  }

  const registrarCliente = () => {
    console.log('Registrar cliente')
    // Lógica para buscar cliente
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Tabs de navegación */}
          {/* Botones de acción */}
          <div className="flex gap-3 mb-6">
            <CustomButton
              variant='primary'
              onClick={handleBuscarCliente}
            >
              Buscar Cliente
            </CustomButton>
            <CustomButton 
              variant="primary"
              onClick={registrarCliente}
            >
              Registrar Cliente
            </CustomButton>
          </div>

          {/* Formulario */}
          <Form {...form}> 
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="p-6">
              {/* Primera fila */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <FormField
                    control = {form.control}
                    name = "nombre"
                    render={({field}) => (
                      <FormItem className='flex flex-col'>
                        <FormLabel> Nombres del cliente</FormLabel>
                        <FormControl>
                          <Input type = "text" {...field}/>
                        </FormControl>
                        <FormMessage className="min-h-[24px]"/>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <FormField
                    control = {form.control}
                    name = "naturaleza"
                    render={({field}) => (
                      <FormItem className='flex flex-col'>
                        <FormLabel> Tipo de cliente</FormLabel>
                        <Select onValueChange = {field.onChange} defaultValue={field.value}> {/*aca hay un problema si quiero traer una oportunidad con cliente*/}
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar Tipo de Cliente"/>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Natural">Natural</SelectItem>
                            <SelectItem value="Jurídico">Jurídico</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="min-h-[24px]"/>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Segunda fila */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="space-y-2">
                  <FormField
                    control = {form.control}
                    name = "correo"
                    render={({field}) => (
                      <FormItem className='flex flex-col'>
                        <FormLabel> Correo del cliente</FormLabel>
                        <FormControl>
                          <Input type = "text" {...field}/>
                        </FormControl>
                        <FormMessage className="min-h-[24px]"/>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Tercera fila */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <FormField
                    control = {form.control}
                    name = "documento"
                    render={({field}) => (
                      <FormItem className='flex flex-col'>
                        <FormLabel> Documento del cliente</FormLabel>
                        <FormControl>
                          <Input type = "text" {...field}/>
                        </FormControl>
                        <FormMessage className="min-h-[24px]"/>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <FormField
                    control = {form.control}
                    name = "telefono"
                    render={({field}) => (
                      <FormItem className='flex flex-col'>
                        <FormLabel> Teléfono de contacto</FormLabel>
                        <FormControl>
                          <Input type = "text" {...field}/>
                        </FormControl>
                        <FormMessage className="min-h-[24px]"/>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Tipo de documento */}
              {/* <div className="space-y-3">
                <FormField
                  control = {form.control}
                  name = ""
                  render={({field}) => (
                  <FormItem className='flex flex-col'>
                    <FormLabel>Tipo de documento</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={'DNI'}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="10" />
                          </FormControl>
                          <FormLabel>
                            DNI
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="20" />
                          </FormControl>
                          <FormLabel>
                            RUC
                          </FormLabel>
                        </FormItem>
                       
                      </RadioGroup>
                    </FormControl>
                    <FormMessage className="min-h-[24px]"/>
                  </FormItem>
                  )}
                />
              </div> */}

              {/* Botón de envío */}
              <div className="flex justify-end pt-4">
                <CustomButton
                  variant='primary'
                  type="submit"
                >
                  Registrar Cliente
                </CustomButton>
              </div>
            </div>
          </form>
        </Form>
    </div>
  )
}