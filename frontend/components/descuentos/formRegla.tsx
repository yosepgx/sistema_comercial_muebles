"use client"

import { useParams, useRouter } from "next/navigation"
import { TRegla } from "../types/reglaDescuento"
import { useEffect, useState } from "react"
import { GetReglaDetailApi, GetReglaListApi, PostReglaAPI, UpdateReglaAPI } from "@/api/reglaDescuentoApis"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { formReglaSchema, formReglaSchemaSend, FormReglaValues } from "../schemas/formReglaSchema"
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel } from '../ui/form'
import { Input } from '@/components/ui/input'
import {format} from 'date-fns'
import {z} from "zod"
import { BotonesFinales } from "../botonesFinales"
import { parseFechaTiempo } from "../utils/parseFecha"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
type Props = {
  tipo: 'nuevo' | 'edicion'
}

export default function FormRegla({tipo} : Props){
    const [regla, setRegla] = useState<TRegla | null>(null)
    const router = useRouter()
    const {id} = useParams()

    const cargarRegla = (regla: TRegla | null) => {
    if(!regla)return;
    form.setValue('id', regla.id.toString());
    form.setValue('producto', regla.producto.toString());
    form.setValue('fecha_inicio', parseFechaTiempo(regla.fecha_inicio));
    form.setValue('fecha_fin', parseFechaTiempo(regla.fecha_fin));
    form.setValue('monto_fijo', regla.monto_fijo.toString());
    form.setValue('porcentaje', regla.porcentaje.toString()); 
    form.setValue('cantidad_pagada', regla.cantidad_pagada.toString()); 
    form.setValue('cantidad_libre', regla.cantidad_libre.toString());
    form.setValue('cantidad_libre_maxima', regla.cantidad_libre_maxima.toString());
    form.setValue('tipo_descuento', regla.tipo_descuento);
    form.setValue('activo', regla.activo.toString() );
    }

    useEffect(()=>{
    if(tipo ==='edicion' && id){
        GetReglaDetailApi(null,parseInt(id as string, 10))
        .then(data => {
            setRegla(data)
            cargarRegla(data)
        })
    }
    },[tipo,id])
    
    const form = useForm<z.infer<typeof formReglaSchema>>({
        resolver: zodResolver(formReglaSchema),
        defaultValues: {
        id: "0",
        producto: "0",
        fecha_inicio: '',
        fecha_fin: '',
        monto_fijo: "0",
        porcentaje: "0",
        cantidad_pagada: "0",
        cantidad_libre: "0",
        cantidad_libre_maxima: "0",
        tipo_descuento: 'porcentaje',
        activo: "true",
        },
    })



    const onSubmit = async (rawdata: FormReglaValues) => {
        console.log('Datos del formulario:', rawdata)
        
        const data = formReglaSchemaSend.parse(rawdata)
        console.log('transformada:', data)
        if(tipo === 'nuevo'){
            PostReglaAPI(null,data)
        }
        else if(tipo ==='edicion'){
            UpdateReglaAPI(null,data.id,data)
        }
        router.push('/descuentos')
    }

    const wtipoDescuento = form.watch('tipo_descuento', 'porcentaje')

    useEffect(() => {
    if (wtipoDescuento === 'porcentaje') {
        form.setValue('cantidad_pagada', '0');
        form.setValue('cantidad_libre', '0');
        form.setValue('cantidad_libre_maxima', '0');
    } else if (wtipoDescuento === 'cantidad') {
        form.setValue('porcentaje', '0');
    }
    }, [wtipoDescuento]);


    
    return (
        <>
        <Form {...form}> 
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className=" space-y-2">
            <FormField
            control = {form.control}
            name = "tipo_descuento"
            render={({field}) => (
                <FormItem className='flex flex-col'>
                <FormLabel> Tipo de descuento</FormLabel>
                <Select onValueChange = {field.onChange} defaultValue={field.value}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Seleccionar Tipo de descuento"/>
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    <SelectItem value="porcentaje">Porcentaje</SelectItem>
                    <SelectItem value="cantidad">Cantidad</SelectItem>
                    </SelectContent>
                </Select>
                <FormMessage className="min-h-[24px]"/>
                </FormItem>
            )}
            />
            <FormField
            control = {form.control}
            name = "id"
            render={({field}) => (
                <FormItem className='flex flex-col'  hidden={tipo==='nuevo'}>
                <FormLabel > Codigo de Regla</FormLabel>
                <FormControl>
                    <Input type = "number" {...field} />
                </FormControl>
                <FormMessage className="min-h-[24px]"/>
                </FormItem>
            )}
            />
            <FormField
            control = {form.control}
            name = "producto"
            render={({field}) => (
                <FormItem className='flex flex-col'>
                <FormLabel> Codigo de producto</FormLabel>
                <FormControl>
                    <Input type = "number" {...field} />
                </FormControl>
                <FormMessage className="min-h-[24px]"/>
                </FormItem>
            )}
            />
            <FormField
            control = {form.control}
            name = "fecha_inicio"
            render={({field}) => (
                <FormItem className='flex flex-col'>
                <FormLabel> Fecha de inicio</FormLabel>
                <FormControl>
                    <Input type = "datetime-local" {...field} />
                </FormControl>
                <FormMessage className="min-h-[24px]"/>
                </FormItem>
            )}
            />
            <FormField
            control = {form.control}
            name = "fecha_fin"
            render={({field}) => (
                <FormItem className='flex flex-col'>
                <FormLabel> Fecha de fin</FormLabel>
                <FormControl>
                    <Input type = "datetime-local" {...field} />
                </FormControl>
                <FormMessage className="min-h-[24px]"/>
                </FormItem>
            )}
            />
            {/* <FormField
            control = {form.control}
            name = "monto_fijo"
            render={({field}) => (
                <FormItem className='flex flex-col'>
                <FormLabel> Monto_fijo</FormLabel>
                <FormControl>
                    <Input type = "number" {...field} />
                </FormControl>
                <FormMessage className="min-h-[24px]"/>
                </FormItem>
            )}
            /> */}
            <FormField
            control = {form.control}
            name = "porcentaje"
            render={({field}) => (
                <FormItem className='flex flex-col'>
                <FormLabel> Porcentaje</FormLabel>
                <FormControl>
                    <Input type = "number" {...field} disabled={wtipoDescuento !== 'porcentaje'}  />
                </FormControl>
                <FormMessage className="min-h-[24px]"/>
                </FormItem>
            )}
            />
            <FormField
            control = {form.control}
            name = "cantidad_pagada"
            render={({field}) => (
                <FormItem className='flex flex-col'>
                <FormLabel> Cantidad necesaria a pagar</FormLabel>
                <FormControl>
                    <Input type = "number" {...field} disabled={wtipoDescuento !== 'cantidad'} />
                </FormControl>
                <FormMessage className="min-h-[24px]"/>
                </FormItem>
            )}
            />
            <FormField
            control = {form.control}
            name = "cantidad_libre"
            render={({field}) => (
                <FormItem className='flex flex-col'>
                <FormLabel> Cantidad gratuita</FormLabel>
                <FormControl>
                    <Input type = "number" {...field} disabled={wtipoDescuento !== 'cantidad'}/>
                </FormControl>
                <FormMessage className="min-h-[24px]"/>
                </FormItem>
            )}
            />
            <FormField
            control = {form.control}
            name = "cantidad_libre_maxima"
            render={({field}) => (
                <FormItem className='flex flex-col'>
                <FormLabel> Cantidad gratuita maxima</FormLabel>
                <FormControl>
                    <Input type = "number" {...field} disabled={wtipoDescuento !== 'cantidad'}/>
                </FormControl>
                <FormMessage className="min-h-[24px]"/>
                </FormItem>
            )}
            />
            
            <FormField
            control = {form.control}
            name = "activo"
            render={({field}) => (
                <FormItem className='flex flex-col'>
                <FormLabel> Activo</FormLabel>
                <Select onValueChange = {field.onChange} defaultValue={field.value}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Seleccionar estado activo/inactivo"/>
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    <SelectItem value="true">Activo</SelectItem>
                    <SelectItem value="false">Inactivo</SelectItem>
                    </SelectContent>
                </Select>
                <FormMessage className="min-h-[24px]"/>
                </FormItem>
            )}
            />
            </div>
            {/* Botón de envío */}
            <BotonesFinales ruteo={()=>router.push('/descuentos')}></BotonesFinales>
            
        </form>
        </Form>
        </>
    )
}