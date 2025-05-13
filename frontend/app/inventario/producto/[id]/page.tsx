"use client"
import { useRouter } from 'next/navigation';
import { useProductoContext } from '../productoContext';
import { useAuth } from '@/context/authContext';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { Input } from '@/components/ui/input';
import { ProtectedRoute } from '@/components/protectedRoute';
import MainWrap from '@/components/mainwrap';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import HistorialPrecio from './HistorialPrecio';
import { UNIDADES_MEDIDA } from '@/constants/unidadesMedidaConstants';

const formSchema = z.object({
  codigo: z.string().min(1),
  nombre: z.string().min(1),
  precio: z.string().min(1),
  precioFechaInicio: z.string().min(1),
  precioFechaFin: z.string().min(1),
  categoria: z.string(),
  unidad: z.string(),
  activo: z.enum(["true", "false"]),
  igv: z.string(),
  afectoIgv: z.enum(["10", "20", "30"]),
  descripcion: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

const unidades = ["Unidades (Bienes)", "Servicios"];


export default function ProductoDetailPage() {
  const {crrProduct, categorias} = useProductoContext()
  const {user, ct} = useAuth()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      codigo: crrProduct?`${crrProduct.id}`:"",
      nombre: crrProduct?`${crrProduct.nombre}`:"",
      precio: crrProduct?`${crrProduct.precio}`:"",
      precioFechaInicio: crrProduct?`${crrProduct.id}`:"",
      precioFechaFin: crrProduct?`${crrProduct.id}`:"",
      categoria: crrProduct?`${crrProduct.categoria}`:"",
      unidad: crrProduct?`${crrProduct.umedida_sunat}`:"Unidades (Bienes)",
      activo: crrProduct?"true":"false",
      igv: crrProduct?`${crrProduct.igv}`:"0.18",
      afectoIgv: crrProduct?`${crrProduct.codigo_afecion_igv}`:"10", //10 es afecto
      descripcion: crrProduct?`${crrProduct.descripcion}`:""
    },
  });
  const router = useRouter()

  const onSubmit = (data: FormValues) => {
    console.log("Guardando producto:", data);
    // Aquí se puede hacer un POST o PUT al backend
  };
  //className="p-4 space-y-4  rounded-md"
  return (
    <ProtectedRoute>
      <MainWrap>
      <Tabs defaultValue="formulario">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value= "formulario">Formulario</TabsTrigger>
          <TabsTrigger value= "precios">Historial de precios</TabsTrigger>
        </TabsList>
        
        <TabsContent value = "formulario">
          <h2 className="text-xl font-bold">Detalles</h2>
          <Form {...form}>

          <form onSubmit={form.handleSubmit(onSubmit)} >
            <div className="grid grid-cols-2 gap-4">
            <FormField
              control = {form.control}
              name = "codigo"
              render={({field}) => (
                <FormItem className='flex flex-col'>
                  <FormLabel> Codigo</FormLabel>
                  <FormControl>
                    <Input type = "number" {...field}/>
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
            <div className='flex grid-rows-2 gap-4'>
            <FormField
              control = {form.control}
              name = "precioFechaInicio"
              render={({field}) => (
                <FormItem className='flex flex-col'>
                  <FormLabel> Fecha de Inicio</FormLabel>
                  <FormControl>
                    <Input type = "date" {...field}/>
                  </FormControl>
                  <FormMessage className="min-h-[24px]"/>
                </FormItem>
              )}
            />
            <FormField
              control = {form.control}
              name = "precioFechaFin"
              render={({field}) => (
                <FormItem className='flex flex-col'>
                  <FormLabel> Fecha de Fin</FormLabel>
                  <FormControl>
                    <Input type = "date" {...field}/>
                  </FormControl>
                  <FormMessage className="min-h-[24px]"/>
                </FormItem>
              )}
            />
            </div>
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
              name = "unidad"
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
                <FormItem className='flex flex-col'>
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
              name = "afectoIgv"
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

          <div className="flex justify-end gap-4 mt-4">
            <button type="button" className="bg-orange-400 px-4 py-2 rounded" onClick={()=> router.push('/inventario/producto')}>Cancelar</button>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Guardar</button>
          </div>
        </form>
        </Form>
        </TabsContent>
        <TabsContent value = "precios"><label>Hola</label></TabsContent>
      </Tabs>
      
    </MainWrap>
  </ProtectedRoute>
  );
}

