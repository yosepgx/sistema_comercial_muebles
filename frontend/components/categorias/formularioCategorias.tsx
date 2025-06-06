'use client'
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel } from '../ui/form';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { TCategoria } from '@/components/types/productoTypes';
import { GetCategoriaDetailApi, PostCategoriaAPI, UpdateCategoriaAPI } from '@/api/categoriaApis';
import { BotonesFinales } from '../botonesFinales';

const formSchema = z.object({
    id: z.string(),
    descripcion: z.string(),
    activo: z.string()
})

type FormValues = z.infer<typeof formSchema>


const formSchemaSend = formSchema.transform(data => ({
    ...data,
    id: parseInt(data.id, 10),
    activo: data.activo === "true",
  })
)

type Props = {
  tipo: 'nuevo' | 'edicion'
}

export default function FormularioCategorias({tipo}: Props){
    const [loading, setLoading] = useState(true);
    const router = useRouter()
    const {id} = useParams()
    const form = useForm<z.infer<typeof formSchema>>({
          resolver: zodResolver(formSchema),
          defaultValues: {
            id: '',
            descripcion: '',
            activo: 'true',
          }});

    const cargarCategoria = (categoria: TCategoria | null) => {
        if(!categoria)return;
        form.setValue('id', `${categoria.id}`);
        form.setValue('descripcion', categoria.descripcion);
        form.setValue('activo', `${categoria.activo}`);
      }
      
    useEffect(()=>{
        if(tipo ==='edicion' && id){
            GetCategoriaDetailApi(null, parseInt(id as string, 10)).then(
                data => cargarCategoria(data)
            ).finally(() => setLoading(false))
        }
        
      },[tipo,id])
      
    const onSubmit = async (rawdata: FormValues) => {
        const data = formSchemaSend.parse(rawdata)
        if(tipo === 'nuevo'){
            await PostCategoriaAPI(null,data);
        }
        else{
            await UpdateCategoriaAPI(null, data.id, data)
        }
        router.push('/ajustes/categorias')
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
                    <FormItem className='flex flex-col'>
                    <FormLabel> Codigo de categoria</FormLabel>
                    <FormControl>
                        <Input type = "text" {...field} hidden = {tipo === 'nuevo'} disabled={true}/>
                    </FormControl>
                    <FormMessage className="min-h-[24px]"/>
                    </FormItem>
                )}
                />
                <FormField
                control = {form.control}
                name = "descripcion"
                render={({field}) => (
                    <FormItem className='flex flex-col'>
                    <FormLabel> Descripcion de categoria</FormLabel>
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
                <BotonesFinales ruteo={()=>router.push('/ajustes/categorias')}></BotonesFinales>
           </form>
          </Form>
            
        </div>

    )
}