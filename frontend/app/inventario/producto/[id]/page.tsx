"use client"
import { useRouter } from 'next/navigation';
import { useProductoContext } from '../productoContext';
import { useAuth } from '@/context/authContext';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  codigo: z.string().min(1),
  nombre: z.string().min(1),
  precio: z.string().min(1),
  precioFechaInicio: z.string().min(1),
  precioFechaFin: z.string().min(1),
  categoria: z.string(),
  unidad: z.string(),
  activo: z.enum(["Activo", "Inactivo"]),
  igv: z.string(),
  afectoIgv: z.enum(["10", "20", "30"]),
  descripcion: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

const categorias = ["Comedores", "Sillas", "Otros"];
const unidades = ["Unidades (Bienes)", "Servicios"];
const enumActivo = ["Activo", "Inactivo"];

export default function ProductoDetailPage() {
  const {crrProduct} = useProductoContext()
  const {user, ct} = useAuth()
  const {register, handleSubmit, formState: { errors },} = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      codigo: crrProduct?`${crrProduct.id}`:"",
      nombre: crrProduct?`${crrProduct.nombre}`:"",
      precio: crrProduct?`${crrProduct.precio}`:"",
      precioFechaInicio: crrProduct?`${crrProduct.id}`:"",
      precioFechaFin: crrProduct?`${crrProduct.id}`:"",
      categoria: crrProduct?`${crrProduct.categoria}`:"",
      unidad: crrProduct?`${crrProduct.umedida_sunat}`:"Unidades (Bienes)",
      activo: crrProduct?"Inactivo":"Activo",
      igv: crrProduct?`${crrProduct.igv}`:"0.18",
      afectoIgv: crrProduct?`30`:"10", //10 es afecto
      descripcion: crrProduct?`${crrProduct.descripcion}`:""
    },
  });

  
  const router = useRouter()
  const onSubmit = (data: FormValues) => {
    console.log("Guardando producto:", data);
    // Aquí se puede hacer un POST o PUT al backend
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4  rounded-md">
      <h2 className="text-xl font-bold">Detalles</h2>
      <div className="grid grid-cols-2 gap-4">
        
        <Input className="p-2 rounded" {...register("codigo")} placeholder="Código" disabled />
        <Input className="p-2 rounded" {...register("precio")} placeholder="Precio" />

        <Input className="p-2 rounded" {...register("nombre")} placeholder="Nombre" />
        <div className="flex gap-2">
          <Input className="p-2 rounded w-1/2" {...register("precioFechaInicio")} placeholder="Fecha Inicio" />
          <Input className="p-2 rounded w-1/2" {...register("precioFechaFin")} placeholder="Fecha Fin" />
        </div>

        <select className="p-2 rounded" {...register("categoria")}>{categorias.map(c => <option key={c}>{c}</option>)}</select>
        <select className="p-2 rounded" {...register("unidad")}>{unidades.map(u => <option key={u}>{u}</option>)}</select>

        <select className="p-2 rounded" {...register("activo")}> 
          <option value="Activo">Activo</option>
          <option value="Inactivo">Inactivo</option>
        </select>

        <select className="p-2 rounded" {...register("igv")}> 
          <option value="0.18">0.18</option>
          <option value="0">0</option>
        </select>

        <div className="col-span-2">
          <label className="block mb-2">Afecto a IGV</label>
          <div className="flex gap-4">
            <label><Input type="radio" value="10" {...register("afectoIgv")} /> Afecto</label>
            <label><Input type="radio" value="20" {...register("afectoIgv")} /> Inafecto</label>
            <label><Input type="radio" value="30" {...register("afectoIgv")} /> Exonerado</label>
          </div>
        </div>

        <textarea className="p-2 rounded col-span-2" {...register("descripcion")} placeholder="Descripción" />
      </div>

      <div className="flex justify-end gap-4 mt-4">
        <button type="button" className="bg-orange-400 px-4 py-2 rounded" onClick={()=> router.push('/inventario/producto')}>Cancelar</button>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Guardar</button>
      </div>
    </form>
  );
}

