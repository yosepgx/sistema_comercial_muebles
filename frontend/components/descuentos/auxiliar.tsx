"use client"
import { useEffect, useState } from 'react';
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel } from '../ui/form'
import { Input } from '../ui/input'
import {z} from 'zod'
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { GetDatoGeneralDetailApi, UpdateDatoGeneralAPI } from '@/api/datogeneralApis';
import { TDGeneral } from '../types/dgeneralType';
import { formGeneralSchema, formGeneralSchemaSend, FormGeneralValues } from '../schemas/formGeneralSchema';
import CustomButton from '../customButtom';

export default function Auxiliar() {

    const [loading, setLoading] = useState(true);
    const id = 1; //Como no se crean nuevo regitros 
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
        GetDatoGeneralDetailApi(null, id)
        .then(data => cargarGeneral(data))
        .catch(error => console.error('no se pudo obtener los datos de configuracion general, error: ', error))
        .finally(() => setLoading(false))
    },[])
        
    const onSubmit = async (rawdata: FormGeneralValues) => {
        const data = formGeneralSchemaSend.parse(rawdata)
        if(data && data.activo) data.activo = true
        const respuesta = await UpdateDatoGeneralAPI(null, data.id, data)
        if(respuesta)alert('Se configuró exitosamente el margen de descuento')
    }

    return (
        <Form {...form}> 
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
            <CustomButton type='submit' >Guardar Margen</CustomButton>
            </form>
        </Form>
    )
}