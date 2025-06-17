"use client"
import { useParams, useRouter } from 'next/navigation';
import { useProductoContext } from '../../context/productoContext';
import { useAuth } from '@/context/authContext';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from "react";
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
import { GetProductoDetailApi, PostProductoAPI, UpdateProductoAPI } from '@/api/productoApis';
import { TCategoria, TProducto } from '../types/productoTypes';
import { BotonesFinales } from '../botonesFinales';
import { GetCategoriaListApi } from '@/api/categoriaApis';
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
  editing: boolean;
}

export default function FormularioProducto({
  editing,
}: FormularioProductoProps) {
    const {crrProduct, setCrrProduct} = useProductoContext()
    const {crrTab} = useProductoContext()
    const {user, ct} = useAuth()
    const {id} = useParams()
    const [loading, setLoading] = useState(true)
    const [categorias, setCategorias] = useState<TCategoria[]>([])
    const [loadingCategorias, setLoadingCategorias] = useState(true)
    const router = useRouter()
    //console.log("el crr",crrProduct);

    
    
    const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        id: "0",
        nombre: "",
        precio: "0.00",
        categoria: "",
        umedida_sunat: 'NIU',
        activo: "true",
        igv: "0.18",
        afecto_igv: true,
        codigo_afecion_igv: "10", //10 es afecto
        es_servicio: false,
        descripcion: ""
    },
    });
    
    const cargarProducto = (producto: TProducto | null) =>{
      if(!producto)return
      form.setValue("id",`${producto.id}`);
      form.setValue("nombre",producto.nombre);
      form.setValue("precio",producto.rprecio_actual?.toFixed(2) ??"0.00");
      form.setValue("categoria",`${producto.categoria}`);
      form.setValue("umedida_sunat",producto.umedida_sunat);
      form.setValue("activo",`${producto.activo}`);
      form.setValue("igv",producto.igv?.toFixed(2) ?? "0.00");
      form.setValue("afecto_igv",producto.afecto_igv);
      form.setValue("codigo_afecion_igv",producto.codigo_afecion_igv);
      form.setValue("es_servicio",producto.es_servicio);
      form.setValue("descripcion",producto.descripcion ?? "");
    }


    useEffect(() => {
      const cargarDatos = async () => {
        if (!id)return
        setLoading(true);
        let producto = null;
        try {
          producto = await GetProductoDetailApi(null, parseInt(id as string, 10));
          
          setCrrProduct(producto);
        } catch (error) {
          console.error("Error al cargar datos del producto", error);
        } finally {
          cargarProducto(producto);
          setLoading(false);
        }
      };
      const cargarCategorias = async () =>{
          try{
            const cats = await GetCategoriaListApi(null);
            setCategorias(cats);
          }finally{
            setLoadingCategorias(false);
          }
      }
      cargarCategorias();
      cargarDatos();
      
    }, [id]);

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

    if(loadingCategorias) return (<>Cargando...</>)
    if(editing && loading)return (<>Cargando...</>)


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
                  <Select onValueChange = {field.onChange} value={field.value}>
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
                  <Select onValueChange = {field.onChange} value={field.value}>
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
                  <Select onValueChange = {field.onChange} value={field.value}>
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