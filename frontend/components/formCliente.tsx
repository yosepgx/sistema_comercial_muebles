'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {z} from 'zod'
import { TCliente } from './types/clienteType'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel } from './ui/form'
import CustomButton from './customButtom'
import ClientSearchPopup from './popupcliente'
import { GetClienteDetailApi, PostClienteAPI, UpdateClienteAPI } from '@/api/clienteApis'
import {format} from 'date-fns'
import { UpdateOportunidadAPI } from '@/api/oportunidadApis'
import { useOportunidadContext } from '@/context/oportunidadContext'
import { useRouter } from 'next/navigation'
import { formClienteSchema, formClienteSchemaSend, FormClienteValues } from './schemas/formClienteSchema'



export default function FormCliente() {
  const [registrarActivo, setRegistrarActivo] = useState(false);
  const [tipoRegistrar, setTipoRegistrar] = useState<"registrar" | "buscado">("buscado");
  const [isSearchPopupOpen, setIsSearchPopupOpen] = useState(false);
  const {crrOportunidad, setCrrOportunidad, setCrrTab, tipoEdicion,crrTab, cliente, setCliente} = useOportunidadContext()
  const router = useRouter()

  const cargarCliente = (cliente: TCliente | null) => {
    if(!cliente)return;
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
  }

  useEffect(()=>{
      if(crrOportunidad && crrTab === 'cliente'){
        if(crrOportunidad.cliente){
          GetClienteDetailApi('',crrOportunidad.cliente)
        .then(data => {
          setCliente(data)
          cargarCliente(data)
        })

      }
    }
  },[crrTab])

  
  const form = useForm<z.infer<typeof formClienteSchema>>({
      resolver: zodResolver(formClienteSchema),
      defaultValues: {
          id: cliente?cliente.id.toString():'0',
          nombre: cliente?cliente.nombre: '',
          correo: cliente?cliente.correo: '',
          telefono: cliente?cliente.telefono:'',
          tipo_interes: cliente?cliente.tipo_interes:'lead',
          fecha_conversion: cliente?cliente.fecha_conversion:`${format(new Date(), 'yyyy-MM-dd')}`,
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
    if(!crrOportunidad)
      return;

    let clienteId: number | null = null

    const verified = formClienteSchemaSend.parse(data)
    if (tipoRegistrar === "registrar" && !cliente) {
      const nuevoCliente = await PostClienteAPI('', verified)
      if (nuevoCliente) clienteId = nuevoCliente.id
    } 
    else if(tipoRegistrar === "registrar" && cliente && cliente.id === verified.id){
      const nuevoCliente = await UpdateClienteAPI(null, verified.id,verified)
      if (nuevoCliente) clienteId = nuevoCliente.id
    }
    else if (tipoRegistrar === 'buscado'){ 
      clienteId = verified.id
    }

    if (clienteId) {
      const nuevaOportunidad = { ...crrOportunidad, cliente: clienteId }

      await UpdateOportunidadAPI('', crrOportunidad.id, nuevaOportunidad)
      setCrrOportunidad(nuevaOportunidad) // Esto sí actualiza el estado
      setCliente(verified)// parece poco util
      setCrrTab('pedido') // Cambiar de tab
  }
}

  const handleBuscarCliente = () => {
    setTipoRegistrar("buscado")
    setIsSearchPopupOpen(true)
  }

  const handleSelectCliente = (cliente: TCliente) =>{
    try {
    
    cargarCliente(cliente)
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
              type='button'
              variant='primary'
              onClick={handleBuscarCliente}
            >
              Buscar Cliente
            </CustomButton>
            <CustomButton 
              type='button'
              variant="primary"
              onClick={()=>{
                setRegistrarActivo(true)
                setTipoRegistrar("registrar")
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
                  onClick={()=>{router.push('/'); localStorage.removeItem('nueva-oportunidad')}}>
                  Salir
                </CustomButton>
                <CustomButton
                  variant='primary'
                  type="submit"
                  disabled = {!registrarActivo}
                >
                  {tipoRegistrar === "registrar"? "Registrar Nuevo Cliente" : "Guardar y Continuar"}
                </CustomButton>
              </div>
            </div>
          </form>
        </Form>
    </div>
  )
}