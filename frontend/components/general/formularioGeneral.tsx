'use client'
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel } from '../ui/form';
import { Input } from '../ui/input';
import { TDGeneral } from '../types/dgeneralType';
import { GetDatoGeneralDetailApi, PostDatoGeneralAPI, UpdateDatoGeneralAPI } from '@/api/datogeneralApis';
import { BotonesFinales } from '../botonesFinales';
import { formGeneralSchema, formGeneralSchemaSend, FormGeneralValues } from '../schemas/formGeneralSchema';

type Props = {
  tipo: 'nuevo' | 'edicion'
}

export default function FormularioGeneral({tipo}: Props){
    const [loading, setLoading] = useState(true);
    const {id} = useParams()
    const router = useRouter()
    const form = useForm<z.infer<typeof formGeneralSchema>>({
          resolver: zodResolver(formGeneralSchema),
          defaultValues: {
            id: '',
            codigo_RUC: '',
            razon_social: '',
            nombre_comercial: '',
            direccion_fiscal: '',
            margen_general: '0.00',
            activo: 'true',
          }});

    const cargarGeneral = (general: TDGeneral | null) => {
        if(!general)return;
        form.setValue('id', `${general.id}`);
        form.setValue('codigo_RUC',`${general.codigo_RUC}`)
        form.setValue('razon_social', general.razon_social);
        form.setValue('nombre_comercial', general.nombre_comercial);
        form.setValue('direccion_fiscal', general.direccion_fiscal);
        form.setValue('margen_general',`${general.margen_general}`)
        form.setValue('activo', `${general.activo}`);
      }
      
    useEffect(()=>{
        if(tipo ==='edicion' && id){
            GetDatoGeneralDetailApi(null, parseInt(id as string, 10)).then(
                data => cargarGeneral(data)
            )
            .catch(error => console.error('no se pudo obtener los datos de configuracion general, error: ', error))
            .finally(() => setLoading(false))
        }
        
      },[tipo,id])
      
    const onSubmit = async (rawdata: FormGeneralValues) => {
        
        const data = formGeneralSchemaSend.parse(rawdata)
        if(data && data.activo) data.activo = true
        if(tipo === 'nuevo'){
            await PostDatoGeneralAPI(null,data);
        }
        else{
            await UpdateDatoGeneralAPI(null, data.id, data)
        }
        router.push('/ajustes/datos')
    }


    if(loading && tipo === 'edicion')return (<div>Cargando...</div>)
      
    return (
        <div>
          <Form {...form}> 
           <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                control = {form.control}
                name = "id"
                render={({field}) => (
                    <FormItem className='flex flex-col' hidden = {tipo === 'nuevo'}>
                    <FormLabel> Codigo de dato general</FormLabel>
                    <FormControl>
                        <Input type = "text" {...field}  disabled={true}/>
                    </FormControl>
                    <FormMessage className="min-h-[24px]"/>
                    </FormItem>
                )}
                />
                <FormField
                control = {form.control}
                name = "codigo_RUC"
                render={({field}) => (
                    <FormItem className='flex flex-col'>
                    <FormLabel> RUC de la empresa</FormLabel>
                    <FormControl>
                        <Input type = "text" {...field}/>
                    </FormControl>
                    <FormMessage className="min-h-[24px]"/>
                    </FormItem>
                )}
                />
                <FormField
                control = {form.control}
                name = "razon_social"
                render={({field}) => (
                    <FormItem className='flex flex-col'>
                    <FormLabel> Razon social</FormLabel>
                    <FormControl>
                        <Input type = "text" {...field}/>
                    </FormControl>
                    <FormMessage className="min-h-[24px]"/>
                    </FormItem>
                )}
                />
                <FormField
                control = {form.control}
                name = "nombre_comercial"
                render={({field}) => (
                    <FormItem className='flex flex-col'>
                    <FormLabel> Nombre comercial</FormLabel>
                    <FormControl>
                        <Input type = "text" {...field}/>
                    </FormControl>
                    <FormMessage className="min-h-[24px]"/>
                    </FormItem>
                )}
                />
                <FormField
                control = {form.control}
                name = "direccion_fiscal"
                render={({field}) => (
                    <FormItem className='flex flex-col'>
                    <FormLabel> Direccion fiscal</FormLabel>
                    <FormControl>
                        <Input type = "text" {...field}/>
                    </FormControl>
                    <FormMessage className="min-h-[24px]"/>
                    </FormItem>
                )}
                />
                <FormField
                control = {form.control}
                name = "margen_general"
                render={({field}) => (
                    <FormItem className='flex flex-col'>
                    <FormLabel> Margen de descuento Auxiliar</FormLabel>
                    <FormControl>
                        <Input type = "number" {...field}/>
                    </FormControl>
                    <FormMessage className="min-h-[24px]"/>
                    </FormItem>
                )}
                />

                {/* <FormField
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
                /> */}
                <BotonesFinales ruteo={()=>router.push('/ajustes/datos')}></BotonesFinales>
           </form>
          </Form>
            
        </div>

    )
}