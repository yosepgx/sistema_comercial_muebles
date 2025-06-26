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
import { Form, FormControl, FormField, FormItem, FormMessage,FormLabel } from './ui/form'
import { format } from "date-fns-tz"
import { TOportunidad } from "./types/oportunidad"
import CustomButton from "./customButtom"
import { useOportunidadContext } from "@/context/oportunidadContext"
import { GetOportunidadDetailApi, PostOportunidadAPI, UpdateOportunidadAPI } from "@/api/oportunidadApis"
import { useRouter } from "next/navigation"
import { formOportunidadSchema, formOportunidadSchemaSend, FormOportunidadValues } from "./schemas/formOportunidadSchema"
import { GetSedeListApi } from "@/api/sedeApis"
import { TSede } from "./types/sede"


export default function FormOportunidad() {
  const {tipoEdicion, setCrrTab, setCrrOportunidad, crrOportunidad} = useOportunidadContext()
  const [sedes, setSedes] = useState<TSede[]>([])
  const [loading, setLoading] = useState(true)
  const form = useForm<z.infer<typeof formOportunidadSchema>>({
    resolver: zodResolver(formOportunidadSchema),
    defaultValues: {
      id: crrOportunidad?`${crrOportunidad.id}`: '0',
      cliente: crrOportunidad?`${crrOportunidad.cliente}`:null, 
      sede: crrOportunidad?`${crrOportunidad.sede}`:'',
      fecha_contacto: crrOportunidad?`${format(crrOportunidad.fecha_contacto, 'yyyy-MM-dd')}`:`${format(new Date(), 'yyyy-MM-dd')}`,
      estado_oportunidad: crrOportunidad?`${crrOportunidad.estado_oportunidad}`:'negociacion',
      activo: crrOportunidad?`${crrOportunidad.activo}`:'true',
      rcliente: null,
      rvalorneto: '0.00'
    }
  })
  const router = useRouter()
  
  useEffect(() => {
  if (crrOportunidad) {
    form.reset({
      id: `${crrOportunidad.id}`,
      cliente: `${crrOportunidad.cliente}`,
      sede: `${crrOportunidad.sede}`,
      fecha_contacto: format(crrOportunidad.fecha_contacto, 'yyyy-MM-dd'),
      estado_oportunidad: `${crrOportunidad.estado_oportunidad}`,
      activo: `${crrOportunidad.activo}`,
      rcliente: null,
      rvalorneto: crrOportunidad?.rvalor_neto ?? "0.00"
    });
  }
}, [crrOportunidad]);

useEffect(()=>{
  const obtenerSedes = async () =>{
    setLoading(true)
    const dataSedes = await GetSedeListApi(null)
    setSedes(dataSedes)
  }
  obtenerSedes().catch(error => console.error('no se pudo cargar las sedes, error: ', error))
  .finally(()=> setLoading(false))
},[])


   const onSubmit = async (rawdata: FormOportunidadValues) => {
    //console.log('Datos del formulario:', rawdata)
    const data = formOportunidadSchemaSend.parse(rawdata)
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
  if(loading)return (<div>Cargando...</div>);

    return (
      <div className="p-6" >
      {/* Card de formulario */}
      {/* Número de consulta */}
      <Form {...form}> 
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
        <div className="space-y-2" hidden= {tipoEdicion === "nuevo"}>
        <Label htmlFor="consulta">Número de oportunidad</Label>
        <Input id="consulta" value={crrOportunidad?.id?.toString() ?? '0'}  disabled={true} />
        </div>
      {/* Sede */}
        
        <FormField
          control = {form.control}
          name = "sede"
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
                  {sedes
                    .filter(sede => sede.activo) // opcional: solo mostrar sedes activas
                    .map((sede) => (
                      <SelectItem key={sede.id} value={String(sede.id)}>
                        {sede.nombre}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <FormMessage className="min-h-[24px]"/>
            </FormItem>
          )}
        />

      {/* Fecha de contacto */}
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
      {/* Resultado */}
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
        

      {/* Valor Neto */}
         <FormField
          control = {form.control}
          name = "rvalorneto"
          render = {({field}) => (
            <FormItem className="flex flex-col">
              <FormLabel>Valor Neto</FormLabel>
              <FormControl>
                <Input
                type="number"
                disabled={true}
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value)} // fuerza string
                name={field.name}
                ref={field.ref}
              />
              </FormControl>
              <FormMessage className="min-h-[24px]"/>
            </FormItem>
          )}
        /> 
        </div>
        <div className="flex justify-between w-full pt-4">
        <CustomButton variant="orange" type="button" 
        onClick={()=>{router.push('/'); localStorage.removeItem('nueva-oportunidad')}}>
          Salir
        </CustomButton>
        <CustomButton variant="primary" type="submit">Guardar Oportunidad</CustomButton>
        </div>
          </form>
          </Form>
      </div>
    );
}
