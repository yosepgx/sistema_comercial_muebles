'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { z } from 'zod'
import { TCliente } from '../types/clienteType'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel } from '../ui/form'
import CustomButton from '../customButtom'
import { GetClienteDetailApi, PostClienteAPI, UpdateClienteAPI } from '@/api/clienteApis'
import { format } from 'date-fns'
import { useParams, useRouter } from 'next/navigation'
import { formClienteSchema, formClienteSchemaSend, FormClienteValues } from '../schemas/formClienteSchema'


type Props = {
  tipo: 'nuevo' | 'edicion'
}

export default function FormClienteStandAlone({tipo}:Props) {
  const [cliente, setCliente] = useState<TCliente | null>(null)
  const router = useRouter()
  const {id} = useParams()

  const cargarCliente = (cliente: TCliente | null) => {
    if(!cliente)return;
    form.setValue('id', cliente.id.toString(10));
    form.setValue('nombre', cliente.nombre);
    form.setValue('correo', cliente.correo);
    form.setValue('telefono', cliente.telefono);
    form.setValue('naturaleza', cliente.naturaleza);
    form.setValue('tipo_interes', cliente.tipo_interes); 
    form.setValue('fecha_conversion', cliente.fecha_conversion?format(cliente.fecha_conversion,'dd-MM-yyyy'): ''); 
    form.setValue('documento', cliente.documento);
    form.setValue('tipo_documento', cliente.tipo_documento);
    form.setValue('activo', cliente.activo.toString());
  }

  useEffect(()=>{
    if(tipo ==='edicion' && id){
        GetClienteDetailApi(null,parseInt(id as string, 10))
        .then(data => {
            setCliente(data)
            cargarCliente(data)
        })
    }
  },[tipo,id])
  
  const form = useForm<z.infer<typeof formClienteSchema>>({
      resolver: zodResolver(formClienteSchema),
      defaultValues: {
          id: cliente?cliente.id.toString():'0',
          nombre: cliente?cliente.nombre: '',
          correo: cliente?cliente.correo: '',
          telefono: cliente?cliente.telefono:'',
          tipo_interes: cliente?cliente.tipo_interes:'lead',
          fecha_conversion: cliente?.fecha_conversion
            ? format(cliente.fecha_conversion, 'dd-MM-yyyy')
            : format(new Date(), 'dd-MM-yyyy'),
          naturaleza: cliente?cliente.naturaleza:'Natural',
          documento: cliente?cliente.documento:'',
          tipo_documento: cliente?cliente.tipo_documento:'DNI',
          activo: cliente?cliente.activo.toString():"true",
        },
      });


  const onSubmit = async (data: FormClienteValues) => {
        console.log('Datos del formulario:', data)
        //TODO ver que solo haga post una sola vez 
        //TODO hacer POST solo si es registrar cliente
        let clienteId: number | null = null

        const verified = formClienteSchemaSend.parse(data)
        if (tipo === "nuevo" && !cliente) {
        const nuevoCliente = await PostClienteAPI('', verified)
        if (nuevoCliente) clienteId = nuevoCliente.id
        } 
        else if(tipo === "edicion" && cliente && cliente.id === verified.id){
        const nuevoCliente = await UpdateClienteAPI(null, verified.id,verified)
        if (nuevoCliente) clienteId = nuevoCliente.id
        }

        if (clienteId) {
        setCliente(verified)
        }
    }


  return (
    <div className="container mx-auto px-4 py-6">
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
                    <Select onValueChange = {field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccionar Tipo de Cliente"/>
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        <SelectItem value="Natural">Natural</SelectItem>
                        <SelectItem value="Empresa">Empresa</SelectItem>
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
            <div className="space-y-3">
            <FormField
                control = {form.control}
                name = "tipo_documento"
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
                        <RadioGroupItem value="DNI" />
                        </FormControl>
                        <FormLabel>
                        DNI
                        </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                        <RadioGroupItem value="RUC" />
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
            </div>

            {/* Botón de envío */}
            <div className="flex justify-end pt-4">
            <CustomButton variant="orange" type="button" 
                onClick={()=>router.push('/clientes')}>
                Salir
            </CustomButton>
            <CustomButton
                variant='primary'
                type="submit"
            >
                Guardar
            </CustomButton>
            </div>
        </div>
        </form>
    </Form>
    </div>
  )
}