"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { number, z } from "zod"

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import CustomButton from "@/components/customButtom"
import { GenerarRequisicionesApi, CargarInventarioApi, CargarClientesApi, CargarVentasApi, CargarComprasApi } from "../../api/prediccionApis"
import { useRef, useState } from "react"
import Navbar from "@/components/navbar"
import { ProtectedRoute } from "@/components/protectedRoute"
import { useAuth } from "@/context/authContext"
import MainWrap from "@/components/mainwrap"

const FormSchema = z.object({
  horizonte: z.coerce.number().int().max(12, {
    message: "El horizonte debe de ser un número menor a 12 meses",
  }),
  pasado: z.coerce.number().int().min(12,{
    message: "La cantidad de meses historicos debe de ser mayor o igual a 12 meses",
  }),
})

export default function PrediccionPage() {
  const  [mensaje,setMensaje] = useState<string>(
    "Es necesario completar todos los campos antes de generar el archivo");
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      horizonte: 1,
      pasado:24,
    },
  })
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tipoCarga, setTipoCarga] = useState<"inventario"|"compras"|"clientes"|"ventas">();
  const [compras, setCompras] = useState([]);
  const {ct} = useAuth();
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if(event.target.files && event.target.files.length > 0){
      const archivo = event.target.files[0]
      const token = ct;
      setMensaje( `Cargando ${tipoCarga} ...`);
      let respuesta;
      if(tipoCarga === "inventario"){
        respuesta = await CargarInventarioApi(token, archivo);
      }
      else if(tipoCarga === 'clientes'){
        respuesta = await CargarClientesApi(token, archivo);
      }
      else if(tipoCarga === 'ventas'){
        respuesta = await CargarVentasApi(token, archivo);
      }
      else if(tipoCarga === 'compras'){
        respuesta = await CargarComprasApi(token, archivo);
        if(respuesta?.data?.compras){
          const saca = respuesta.data.compras
          console.log("saca:", saca)
          setCompras(respuesta.data.compras);
        }

      }

      if (respuesta?.success) {
        setMensaje(`Carga de ${tipoCarga} completado correctamente.`);
      } else {
        setMensaje(`Error al cargar ${tipoCarga}. Intenta nuevamente.`);
      }

    }
  }

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    const token = ct;
    const respuesta = await GenerarRequisicionesApi(token, data.horizonte, data.pasado, compras);

    if (respuesta?.success) {
      setMensaje(
          `Se ha completado el procesamiento. Tu archivo se descargará en breve.`
      );
    } else {
        setMensaje(
          "Error, prueba nuevamente mas tarde"
        );
    }
  }

  const handleClick = (tipo: "inventario" | "compras" | "clientes" | "ventas") => {
    setTipoCarga(tipo);
    fileInputRef.current?.click();
  };

  return (
    <>
      <ProtectedRoute>
      <MainWrap>
      <div>
      <h1 className="text-xl font-bold mb-4">Módulo Predictivo</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} >
        
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="pasado"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Meses a promediar demanda</FormLabel>
                <FormDescription>
                Cantidad de meses historicos de venta a usar para los promedios moviles
                </FormDescription>
                <FormControl>
                  <Input type= "number" placeholder="24" {...field} />
                </FormControl>
                <FormMessage 
                  className="min-h-[24px]" 
                        />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="horizonte"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Cantidad de meses en horizonte</FormLabel>
                <FormDescription>
                  Cantidad de meses que se predeciran.
                </FormDescription>
                <FormControl>
                  <Input placeholder="1" {...field} />
                </FormControl>
                <FormMessage 
                  className="min-h-[24px]" 
                        />
              </FormItem>
            )}
          />
          </div>
          <input type="file" accept=".xlsx,.xls" ref={fileInputRef} style={{display:"none"}} 
          onChange={handleFileChange}/>
          <div className="flex row-auto justify-center mt-6 gap-4"> 
            <CustomButton type = "button" variant="primary" onClick={() => handleClick("inventario")}>Cargar Inventario</CustomButton>
            <CustomButton type = "button" variant="primary" onClick={() => handleClick("clientes")}>Cargar Clientes</CustomButton>
            <CustomButton type = "button" variant="primary" onClick={() => handleClick("ventas")}>Cargar Ventas</CustomButton>
            <CustomButton type = "button" variant="primary" onClick={() => handleClick("compras")}>Cargar Compras</CustomButton>
          </div>
          <div className="flex justify-center mt-6">
            <CustomButton variant="primary" type="submit">Generar Prediccion</CustomButton>
          </div>
          
        </form>
      </Form>
      <div className="flex flex-wrap gap-4 mt-6">
      </div>
      <div className="p-2 mt-4 text-center font-semibold text-white" style={{ backgroundColor: mensaje.includes("completado") ? "green" : "orange" }}>
        {mensaje}
      </div>
    </div>
    </MainWrap>
    </ProtectedRoute>
    </>
  )
}
