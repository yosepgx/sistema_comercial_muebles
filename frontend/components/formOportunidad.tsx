'use client'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import {z} from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormMessage } from './ui/form'
import { FormLabel } from "@mui/material"
import { format } from "date-fns-tz"
import { TOportunidad } from "./types/oportunidad"
import CustomButton from "./customButtom"
import { useOportunidadContext } from "@/context/oportunidadContext"
import { GetOportunidadDetailApi, PostOportunidadAPI, UpdateOportunidadAPI } from "@/api/oportunidadApis"
import { cliente } from "./types/clienteType"
import { useRouter } from "next/navigation"
const formSchema = z.object({
  id: z.string(),
  cliente: z.string().nullable(), 
  sede_id: z.string(),
  fecha_contacto: z.string(), //manejado por back
  estado_oportunidad: z.enum(["ganado","perdido","negociacion"]),
  activo: z.string(),
  rcliente: cliente.optional().nullable(),
})

const formSchemaSend = formSchema.transform(data => ({
  ...data,
  id: parseInt(data.id,10),
  cliente: data.cliente?parseInt(data.cliente,10):null,
  sede_id: parseInt(data.sede_id,10),
  fecha_contacto: format(data.fecha_contacto, 'yyyy-MM-dd'),
  activo: data.activo === 'true',
  })
)
type FormValues = z.infer<typeof formSchema>


export default function FormOportunidad() {
  const {tipoEdicion, setCrrTab, setCrrOportunidad, crrOportunidad} = useOportunidadContext()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: crrOportunidad?`${crrOportunidad.id}`: '0',
      cliente: crrOportunidad?`${crrOportunidad.cliente}`:null, 
      sede_id: crrOportunidad?`${crrOportunidad.sede_id}`:'',
      fecha_contacto: crrOportunidad?`${format(crrOportunidad.fecha_contacto, 'yyyy-MM-dd')}`:`${format(new Date(), 'yyyy-MM-dd')}`,
      estado_oportunidad: crrOportunidad?`${crrOportunidad.estado_oportunidad}`:'negociacion',
      activo: crrOportunidad?`${crrOportunidad.activo}`:'true',
      rcliente: null,
    }
  })
  const router = useRouter()
  
  useEffect(() => {
  if (crrOportunidad) {
    form.reset({
      id: `${crrOportunidad.id}`,
      cliente: `${crrOportunidad.cliente}`,
      sede_id: `${crrOportunidad.sede_id}`,
      fecha_contacto: format(crrOportunidad.fecha_contacto, 'yyyy-MM-dd'),
      estado_oportunidad: `${crrOportunidad.estado_oportunidad}`,
      activo: `${crrOportunidad.activo}`,
      rcliente: null,
    });
  }
}, [crrOportunidad]);


   const onSubmit = async (rawdata: FormValues) => {
    console.log('Datos del formulario:', rawdata)
    const data = formSchemaSend.parse(rawdata)
    let nuevaOportunidad = null
    if(tipoEdicion === 'nuevo' && !crrOportunidad){
      nuevaOportunidad = await PostOportunidadAPI('',data)
    }
    //si estas creando (nuevo) y hay oportunidad -> update
    //si estas editando (edicion) hay oportunidad -> update
    //si estas editando y no hay oportunidad por alguna razon -> es un error
    else if(crrOportunidad){ //caso es edicion o ya fue creada el id no va cambiar
      nuevaOportunidad = await UpdateOportunidadAPI(null,data.id, data)
    }
    if(nuevaOportunidad){
      localStorage.setItem('nueva-oportunidad', `${nuevaOportunidad.id}`)
      setCrrOportunidad(nuevaOportunidad)
      setCrrTab('cotizaciones')
    }
    
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
      <div >
         <FormField
            control = {form.control}
            name = "estado_oportunidad"
            render={({field}) => (
            <FormItem >
              <FormLabel>Resultado</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={'negociacion'}
                  className='flex flex-row'
                >
                  <FormItem >
                    <FormControl>
                      <RadioGroupItem value="negociacion" />
                    </FormControl>
                    <FormLabel>
                      Negociacion
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
        <CustomButton variant="orange" type="button" 
        onClick={()=>{router.push('/'); localStorage.removeItem('nueva-oportunidad')}}>
          Salir
        </CustomButton>
        <CustomButton variant="primary" type="submit">Guardar Oportunidad</CustomButton>
          </form>
          </Form>
      </div>
    );
}
