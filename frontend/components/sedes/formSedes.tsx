'use client'
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel } from '../ui/form';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { TSede } from '../types/sede';
import { GetSedeDetailApi, PostSedeAPI, UpdateSedeAPI } from '@/api/sedeApis';
import { BotonesFinales } from '../botonesFinales';

const formSchema = z.object({
    id: z.string(),
    nombre: z.string().min(1,"Es necesario llenar este campo"),
    dgeneral: z.string(),
    activo: z.string()
})

type FormValues = z.infer<typeof formSchema>


const formSchemaSend = formSchema.transform(data => ({
    ...data,
    id: parseInt(data.id, 10),
    dgeneral: parseInt(data.dgeneral, 10),
    activo: data.activo === "true",
  })
)

type Props = {
  tipo: 'nuevo' | 'edicion'
}

export default function FormularioSede({tipo}: Props){
    const [loading, setLoading] = useState(true);
    const {id} = useParams()
    const router = useRouter()
    const form = useForm<z.infer<typeof formSchema>>({
          resolver: zodResolver(formSchema),
          defaultValues: {
            id: '',
            nombre: '',
            dgeneral: '1',
            activo: 'true',
          }});

    const cargarCategoria = (sede: TSede | null) => {
        if(!sede)return;
        form.setValue('id', `${sede.id}`);
        form.setValue('dgeneral',`${sede.dgeneral}`)
        form.setValue('nombre', sede.nombre);
        form.setValue('activo', `${sede.activo}`);
      }
      
    useEffect(()=>{
        if(tipo ==='edicion' && id){
            GetSedeDetailApi(null, parseInt(id as string, 10)).then(
                data => cargarCategoria(data)
            ).finally(() => setLoading(false))
        }
        
      },[tipo,id])
      
    const onSubmit = async (rawdata: FormValues) => {
        //se podria traer un listado de data general y saca el ultimo activo 
        const data = formSchemaSend.parse(rawdata)
        if(tipo === 'nuevo'){
            await PostSedeAPI(null,data);
        }
        else{
            await UpdateSedeAPI(null, data.id, data)
        }
        router.push('/ajustes/datos/')
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
                    <FormLabel> Código de sede</FormLabel>
                    <FormControl>
                        <Input type = "text" {...field}  disabled={true}/>
                    </FormControl>
                    <FormMessage className="min-h-[24px]"/>
                    </FormItem>
                )}
                />
                <FormField
                control = {form.control}
                name = "nombre"
                render={({field}) => (
                    <FormItem className='flex flex-col'>
                    <FormLabel> Nombre de sede</FormLabel>
                    <FormControl>
                        <Input type = "text" {...field}/>
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
                <BotonesFinales ruteo={()=>router.push('/ajustes/datos')}></BotonesFinales>
           </form>
          </Form>
            
        </div>

    )
}