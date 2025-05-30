'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {z} from 'zod'
import { cliente, TCliente } from './types/clienteType'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormMessage } from './ui/form'
import { FormLabel } from '@mui/material'
import CustomButton from './customButtom'
import ClientSearchPopup from './popupcliente'
import { GetClienteDetailApi, PostClienteAPI } from '@/api/clienteApis'
import {format} from 'date-fns'
import { UpdateOportunidadAPI } from '@/api/oportunidadApis'
import { Verified } from 'lucide-react'
import { useOportunidadContext } from '@/context/oportunidadContext'

const formSchema = z.object({
  id: z.string().min(1, 'no se encontro id'),
  nombre: z.string().min(1, 'Se necesita indicar un nombre'),
  correo: z.string().min(1, 'Se necesita llenar este campo o indicar ninguno'),
  telefono: z.string().min(1, 'Se necesita llenar este campo o indicar ninguno'),
  naturaleza: z.enum(["Natural","Empresa"]),
  tipo_interes: z.enum(["cliente","lead"]), //manejado por back
  fecha_conversion: z.string(), //se maneja en back
  documento: z.string(),
  tipo_documento: z.string(),
  activo: z.string(), //manejado por back
}).superRefine((data, ctx) => {
    if (data.tipo_documento === 'DNI' && data.documento.length !== 8) {
      ctx.addIssue({
        path: ['documento'],
        code: z.ZodIssueCode.custom,
        message: 'El DNI debe tener exactamente 8 dígitos',
      })
    }

    if (data.tipo_documento === 'RUC' && data.documento.length !== 11) {
      ctx.addIssue({
        path: ['documento'],
        code: z.ZodIssueCode.custom,
        message: 'El RUC debe tener exactamente 11 dígitos',
      })
    }

    if (!/^\d+$/.test(data.documento)) {
      ctx.addIssue({
        path: ['documento'],
        code: z.ZodIssueCode.custom,
        message: 'El documento debe contener solo números',
      })
    }
  })


type FormValues = z.infer<typeof formSchema>


const formSchemaSend = formSchema.transform(data => ({
    ...data,
    id: parseInt(data.id, 10),
    fecha_conversion: format(data.fecha_conversion, 'yyyy-MM-dd'),
    activo: data.activo === "true",
  })
)

export default function FormCliente() {
  const [registrarActivo, setRegistrarActivo] = useState(false);
  const [tipoRegistrar, setTipoRegistrar] = useState<"nuevo" | "buscado">("nuevo");
  const [isSearchPopupOpen, setIsSearchPopupOpen] = useState(false);
  const [cliente, setCliente] = useState(null);
  const {crrOportunidad, setCrrOportunidad, setCrrTab} = useOportunidadContext()

  useEffect(()=>{
    if(crrOportunidad){
      GetClienteDetailApi('',crrOportunidad.cliente)
    }
  },[])

  const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
          id: '0',
          nombre: '',
          correo: '',
          telefono: '',
          tipo_interes: 'lead',
          fecha_conversion: `${format(new Date(), 'yyyy-MM-dd')}`,
          naturaleza: 'Natural',
          documento: '',
          tipo_documento: 'DNI',
          activo: "true",
        },
      });


  const onSubmit = async (data: FormValues) => {
    console.log('Datos del formulario:', data)
    //TODO ver que solo haga post una sola vez 
    //TODO hacer POST solo si es nuevo cliente
    if(!crrOportunidad)
      return;

    let clienteId: number | null = null

    const verified = formSchemaSend.parse(data)
    if (tipoRegistrar === "nuevo") {
      const nuevoCliente = await PostClienteAPI('', verified)
      if (nuevoCliente) clienteId = nuevoCliente.id
    } else {
      clienteId = verified.id
    }

    if (clienteId) {
      const nuevaOportunidad = { ...crrOportunidad, cliente: clienteId }

      await UpdateOportunidadAPI('', crrOportunidad.id, nuevaOportunidad)
      setCrrOportunidad(nuevaOportunidad) // Esto sí actualiza el estado
      setCrrTab('pedido') // Cambiar de tab
  }
}

  const handleBuscarCliente = () => {
    setTipoRegistrar("buscado")
    setIsSearchPopupOpen(true)
  }

  const handleSelectCliente = (cliente: TCliente) =>{
    try {
    form.setValue('id', cliente.id.toString(10));
    form.setValue('nombre', cliente.nombre);
    form.setValue('correo', cliente.correo);
    form.setValue('telefono', cliente.telefono);
    form.setValue('naturaleza', cliente.naturaleza);
    form.setValue('tipo_interes', cliente.tipo_interes); 
    form.setValue('fecha_conversion', cliente.fecha_conversion.toString()); 
    form.setValue('documento', cliente.documento);
    form.setValue('tipo_documento', cliente.tipo_documento);
    form.setValue('activo', cliente.activo.toString());

    // Lógica para mapear tipo de cliente y documento
    console.log(cliente)
    setRegistrarActivo(true);//Todo diferencia el boton de actualizar y guardar. 
    setIsSearchPopupOpen(false);

    } catch (error) {
      console.error('Error al seleccionar cliente', error)
    }

  }


  return (
    <div className="container mx-auto px-4 py-6">
      {/* Tabs de navegación */}
      <ClientSearchPopup
        open={isSearchPopupOpen}
        onClose={() => setIsSearchPopupOpen(false)}
        onSelectClient={handleSelectCliente}
      />
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
              onClick={()=>{
                setRegistrarActivo(true)
                setTipoRegistrar("nuevo")
              }}
            >
              Nuevo Cliente
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
                <CustomButton
                  variant='primary'
                  type="submit"
                  disabled = {!registrarActivo}
                >
                  {tipoRegistrar === "nuevo"? "Registrar Nuevo Cliente" : "Guardar y Continuar"}
                </CustomButton>
              </div>
            </div>
          </form>
        </Form>
    </div>
  )
}