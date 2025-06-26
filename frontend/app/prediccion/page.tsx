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
import { GenerarRequisicionesApi, CargarInventarioApi, CargarClientesApi, CargarVentasApi, CargarComprasApi, GenerarRequisicionesJSONApi } from "../../api/prediccionApis"
import { useRef, useState } from "react"
import { ProtectedRoute } from "@/components/protectedRoute"
import { useAuth } from "@/context/authContext"
import MainWrap from "@/components/mainwrap"
import { DataGrid, GridColDef } from "@mui/x-data-grid"
import { TRequisicion } from "@/components/types/requisicion"
import { descargarExcel } from "./descargar"
import { Box } from "@mui/material"
import { formatInTimeZone } from "date-fns-tz";
import { PERMISSION_KEYS } from "@/constants/constantRoles"
import { usePermiso } from "@/hooks/usePermiso"

const FormSchema = z.object({
  horizonte: z.coerce.number().int().max(12, {
    message: "El horizonte debe de ser un número menor a 12 meses",
  }),
  pasado: z.coerce.number().int().min(12,{
    message: "La cantidad de meses historicos debe de ser mayor o igual a 12 meses",
  }),
})

const Columns: GridColDef<TRequisicion>[] = [
    {   field: 'Codigo de producto', 
        headerName: 'Codigo de producto',
        renderHeader: () => <>Codigo de<br />Producto</>,
        resizable: false,
        
    },
    {   field: 'Nombre de Producto', 
        headerName: 'Nombre de Producto',
        renderHeader: () => <>Nombre de<br />Producto</>,
        resizable: false,
        flex: 1,
    },
    {   field: 'Cantidad Predicha', 
        headerName: 'Cantidad Predicha',
        renderHeader: () => <>Cantidad<br />Predicha</>,
        resizable: false,
    },
    {   field: 'Stock Actual', 
        headerName: 'Stock Físico',
        renderHeader: () => <>Stock<br />Actual</>,
        resizable: false,
    },
    {   field: 'Pedidos en Transito', 
        headerName: 'Pedidos en Transito',
        renderHeader: () => <>Pedidos en<br />Transito</>,
        resizable: false,
    },
    {   field: 'Cantidad Recomendada', 
        headerName: 'Cantidad Recomendada',
        renderHeader: () => <>Cantidad<br />Recomendada</>,
        resizable: false,
    },
    {   field: 'Promedio Movil', 
        headerName: 'Promedio Movil',
        renderHeader: () => <>Promedio<br />Movil</>,
        resizable: false,
        
    },
    {   field: 'Indices Estacionales', 
        headerName: 'Indices Estacionales',
        resizable: false,
        minWidth: 250, 
        flex: 1,
    },
    {   field: 'Factor Crecimiento', 
        headerName: 'Factor Crecimiento',
        resizable: false,
        minWidth: 250, 
        flex: 1,
        
    },

  ]

export default function PrediccionPage() {
  const puedeHacerPredicciones = usePermiso(PERMISSION_KEYS.CONFIGURAR_SISTEMA)
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
  const [requisiciones, setRequisiciones] = useState<any>([]);
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
    const respuesta = await GenerarRequisicionesJSONApi(token, data.horizonte, data.pasado, compras);

    if (respuesta?.success && respuesta?.data) {
      setMensaje(
          `Se ha completado el procesamiento exitosamente.`
      );

      const rowsWithId = respuesta.data.map((row, index) => ({
        id: index,  // o usa otro valor único si tienes (ej: codigo_producto)
        ...row,
      }));
      setRequisiciones(rowsWithId)
      
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
      {puedeHacerPredicciones && <>
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
                Cantidad de meses históricos de venta a usar para los promedios móviles
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
                  Cantidad de meses que se predecirán.
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
            <CustomButton type = "button" variant="primary" onClick={() => handleClick("compras")}>Cargar Pedidos en transito</CustomButton>
          </div>
          <div className="flex justify-center mt-6 gap-4">
            <CustomButton variant="primary" type="submit">Generar Prediccion</CustomButton>
            <CustomButton 
            variant="primary" 
            type="button" 
            disabled={requisiciones.length === 0} 
            onClick={() => {
              const now = new Date()
              const timestamp = formatInTimeZone(now, "America/Lima", 'yyyy-MM-dd HH:mm:ss');
              const values = form.getValues(); // Obtiene los valores actuales del formulario
              const filename = `${timestamp}_ho-${values.horizonte}_pa-${values.pasado}.xlsx`;
              descargarExcel(requisiciones, filename);
              }
              }>Descargar</CustomButton>
          </div>
          
        </form>
      </Form>
      
      <div className="p-2 mt-4 text-center font-semibold text-white" style={{ backgroundColor: mensaje.includes("completado") ? "green" : "orange" }}>
        {mensaje}
      </div>
      <Box sx={{ width: '100%', overflowX: 'auto' }}>
      <div className="mt-6">
      <DataGrid
        rows = {requisiciones? requisiciones : []}
        columns={Columns}
        initialState={{
        pagination: {
            paginationModel: {
            pageSize: 10,
            },
        },
        
        }}
        pageSizeOptions={[5, 10, 25]}
        disableRowSelectionOnClick
        disableColumnMenu
        />
        </div>
      </Box>
    </div>
    </>}
    </MainWrap>
    </ProtectedRoute>
    </>
  )
}
