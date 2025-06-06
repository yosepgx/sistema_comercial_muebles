"use client"
import { useRouter } from 'next/navigation';
import { useProductoContext } from '../../context/productoContext';
import { useAuth } from '@/context/authContext';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { UNIDADES_MEDIDA, UNIDADES_MEDIDA_BUSCA } from '@/constants/unidadesMedidaConstants';
import { PostProductoAPI, UpdateProductoAPI } from '@/api/productoApis';
import { TProducto } from '../types/productoTypes';
import { BotonesFinales } from '../botonesFinales';
const formSchema = z.object({
  id: z.string().min(1),
  nombre: z.string().min(1, "El nombre es obligatorio"),
  umedida_sunat: z.string(),
  descripcion: z.string(),
  categoria: z.string(),
  igv: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
    message: "IGV debe ser un número válido mayor o igual a 0"
  }),
  afecto_igv: z.boolean(),
  codigo_afecion_igv: z.enum(["10", "20", "30"]),
  es_servicio: z.boolean(),
  activo: z.enum(["true", "false"]),//CAMBIAR
  precio: z.string().refine(
    val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "El precio debe ser un número mayor a 0"
  }),
});

const formSendSchema = formSchema.transform(data => ({
    ...data,
    id: parseInt(data.id, 10),
    precio: parseFloat(data.precio),
    igv: parseFloat(data.igv),
    categoria: parseInt(data.categoria, 10),
    activo: data.activo === "true",
  }));

type FormValues = z.infer<typeof formSchema>;

interface FormularioProductoProps {
  crrProduct: TProducto | null;
  editing: boolean;
}

export default function FormularioProducto({
  crrProduct,
  editing,
}: FormularioProductoProps) {

    const {categorias} = useProductoContext()
    const {user, ct} = useAuth()
    const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        id: crrProduct?`${crrProduct.id}`:"0",
        nombre: crrProduct?`${crrProduct.nombre}`:"",
        precio: crrProduct?`${crrProduct.rprecio_actual}`:"0.00",
        categoria: crrProduct?`${crrProduct.categoria}`:"",
        umedida_sunat: crrProduct?`${crrProduct.umedida_sunat}`:'NIU',
        activo: crrProduct?"true":"true",
        igv: crrProduct?`${crrProduct.igv}`:"0.18",
        afecto_igv: crrProduct?crrProduct.afecto_igv:true,
        codigo_afecion_igv: crrProduct?`${crrProduct.codigo_afecion_igv}`:"10", //10 es afecto
        es_servicio: crrProduct?crrProduct.es_servicio: false,
        descripcion: crrProduct?`${crrProduct.descripcion??''}`:""
    },
    });
    const router = useRouter()

    const onSubmit = (rawdata: FormValues) => {
      try {
        const data = formSendSchema.parse(rawdata)
  
        data.codigo_afecion_igv === "10"? data.afecto_igv= true: data.afecto_igv= false;
        data.umedida_sunat === 'ZZ'? data.es_servicio = true: data.es_servicio = false;
        //console.log("Guardando producto:", data);
        if(crrProduct){
            UpdateProductoAPI(ct,crrProduct.id,data)
            router.back()
        }
        else{
            //crrProduct es None
            PostProductoAPI(ct,data)
            router.back()
        }

      } catch (error) {
        console.error("Error al validar o enviar el formulario: ", error)
      }
    
    };

    return (
        <Form {...form}>

          <form onSubmit={form.handleSubmit(onSubmit)} >
            <div className="grid grid-cols-2 gap-4">
            <FormField
              control = {form.control}
              name = "id"
              render={({field}) => (
                <FormItem className='flex flex-col' hidden={!editing}>
                  <FormLabel> Codigo</FormLabel>
                  <FormControl>
                    <Input type = "number" {...field} disabled={true}/>
                  </FormControl>
                  <FormMessage className="min-h-[24px]"/>
                </FormItem>
              )}
            />
            <FormField
              control = {form.control}
              name = "precio"
              render={({field}) => (
                <FormItem className='flex flex-col'>
                  <FormLabel> Precio</FormLabel>
                  <FormControl>
                    <Input type = "number" {...field}/>
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
                  <FormLabel> Nombre</FormLabel>
                  <FormControl>
                    <Input type = "text" {...field}/>
                  </FormControl>
                  <FormMessage className="min-h-[24px]"/>
                </FormItem>
              )}
            />
            
            <FormField
              control = {form.control}
              name = "categoria"
              render={({field}) => (
                <FormItem className='flex flex-col'>
                  <FormLabel> Categoria</FormLabel>
                  <Select onValueChange = {field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar categoria de producto"/>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categorias.map(c => <SelectItem key={c?.id} value={c?.id.toString()}>{c?.descripcion}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage className="min-h-[24px]"/>
                </FormItem>
              )}
            />
            <FormField
              control = {form.control}
              name = "umedida_sunat"
              render={({field}) => (
                <FormItem className='flex flex-col'>
                  <FormLabel>Unidad</FormLabel>
                  <Select onValueChange = {field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar unidad de medida"/>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {UNIDADES_MEDIDA.map(u => <SelectItem key={u.codigo} value={u.codigo}>{u.descripcion}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage className="min-h-[24px]"/>
                </FormItem>
              )}
            />
            <FormField
              control = {form.control}
              name = "activo"
              render={({field}) => (
                <FormItem className='flex flex-col' hidden={!editing}>
                  <FormLabel>Activo</FormLabel>
                  <Select onValueChange = {field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="activo o inactivo"/>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='true'>Activo</SelectItem>
                      <SelectItem value='false'>Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="min-h-[24px]"/>
                </FormItem>
              )}
            />
            <FormField
              control = {form.control}
              name = "igv"
              render={({field}) => (
                <FormItem className='flex flex-col'>
                  <FormLabel>IGV</FormLabel>
                  <FormControl>
                    <Input type = "number" {...field}/>
                  </FormControl>
                  <FormMessage className="min-h-[24px]"/>
                </FormItem>
              )}
            />
            <FormField
              control = {form.control}
              name = "codigo_afecion_igv"
              render={({field}) => (
                <FormItem className='flex flex-col'>
                  <FormLabel>Tipo de affección de igv:</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="10" />
                        </FormControl>
                        <FormLabel>
                          Afecto
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="20" />
                        </FormControl>
                        <FormLabel>
                          Inafecto
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="30" />
                        </FormControl>
                        <FormLabel>Exonerado</FormLabel>
                      </FormItem>
                    </RadioGroup>
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
                  <FormLabel>Descripcion</FormLabel>
                  <FormControl>
                    <Input type = "text" placeholder='Opcional'{...field}/>
                  </FormControl>
                  <FormMessage className="min-h-[24px]"/>
                </FormItem>
              )}
            />
            
          </div>
          
          <BotonesFinales ruteo={()=> router.push('/inventario/producto')}></BotonesFinales>
        </form>
        </Form>
    )
    //className="p-4 space-y-4  rounded-md"
}