"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

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
import { GenerarRequisicionesApi } from "./api/prediccionApis"
import { useState } from "react"

const FormSchema = z.object({
  horizonte: z.coerce.number().int().max(12, {
    message: "El horizonte debe de ser un número menor a 12 meses",
  }),
  pasado: z.coerce.number().int().min(24,{
    message: "La cantidad de meses historicos debe de ser mayor o igual a 24 meses",
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

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    const respuesta = await GenerarRequisicionesApi(data.horizonte, data.pasado);

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

  return (
    <div className="p-6">
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
                Cantidad de meses a usar de los historicos de venta
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
  )
}
