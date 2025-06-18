"use client"

import { DataGrid, GridColDef } from "@mui/x-data-grid";
import CustomButton from "../customButtom";
import { Pencil, Router, Save, Trash2 } from "lucide-react";
import { IconButton } from "@mui/material";
import { CheckBox } from "@mui/icons-material";
import { TRegla } from "../types/reglaDescuento";
import { useEffect, useState } from "react";
import { GetReglaListApi } from "@/api/reglaDescuentoApis";
import { useRouter } from "next/navigation";
import { customFetch } from "../customFetch";

export default function Reglas() {
    const [data, setData] = useState<TRegla[]>([])
    const [filtroActivo, setFiltroActivo] = useState<"todos" | "activos" | "inactivos">("todos");

    const router = useRouter()
    const columns: GridColDef<TRegla>[] = [
        { field: "id", headerName: "REGLA", flex: 1},
        { field: "producto", headerName: "CÓDIGO PRODUCTO", flex: 1 },
        { field: "porcentaje", headerName: "% DE DESCUENTO", flex: 1 },
        { 
            field: "rproducto_info", 
            headerName: "NOMBRE PRODUCTO", 
            flex: 1,
        },
        { field: "cantidad_pagada", headerName: "CANTIDAD PAGADA", flex: 1 },
        { field: "cantidad_libre", headerName: "CANTIDAD LIBRE", flex: 1 },
        { field: "cantidad_libre_maxima", headerName: "CANTIDAD LIBRE MÁXIMA", flex: 1},
        { field: "fecha_inicio", headerName: "FECHA INICIO", flex: 1},
        { field: "fecha_fin", headerName: "FECHA FIN", flex: 1},
        { field: "activo", 
            headerName: "Activo", 
            flex: 1,
            valueFormatter: (value) => (value? "Activo":"Inactivo"),
        },
        {
            field: "actions",
            headerName: "ACCIONES",
            width: 120,
            renderCell: (params) => (
            <div className="flex gap-2">
            <IconButton>
                <Pencil onClick={() => router.push(`descuentos/${params.row.id}`)}/>
            </IconButton>
            <IconButton onClick={() => toggleActivoRegla(params.row.id)}>
                <CheckBox color={params.row.activo ? "primary" : "disabled"} />
            </IconButton>
            </div>
            ),
        },

    ];

    const toggleActivoRegla = async (id: number) => {
    try {
        const response = await customFetch(null,`descuentos/regla-descuento/${id}/toggle_activo/`, {
            method: "PATCH",
        });

        let responseData: any = null;

        try {
            responseData = await response.json();
            console.log(responseData)
        } catch {
            responseData = null;
        }


        if(!response.ok){
            
            if(responseData?.code?.includes('DESCUENTO_ERR')){
                alert(responseData?.message)
            }
            else{
                alert('Error inesperado del servidor');
            }
            throw new Error(`Error del servidor: ${response.status} - ${response.statusText}`)

        }
        
        setData((prev) =>
            prev.map((regla) =>
                regla.id === id ? { ...regla, activo: responseData.data.activo } : regla
            )
        );
    } catch (error) {
        console.error("Error en toggleActivo:", error);
        //alert("No se pudo cambiar el estado del descuento.");
    }
};

    useEffect(()=>{
        GetReglaListApi(null)
        .then(data => {setData(data); console.log(data);})
        .catch(error => console.error("No se pudo cargar los descuentos, error: ", error))
    },[])
    

return (
    <div className="bg-blue-50 p-4 rounded-md space-y-4">
        <div className="flex justify-between items-center">
            <CustomButton type="button" variant="primary"
            onClick={()=>router.push('/descuentos/nuevo')}
            >Agregar descuento</CustomButton>
            {/* <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Preferencia de descuento</span>
            <select className="border border-gray-300 rounded px-2 py-1 text-sm">
                <option>Utilizar descuento por cantidad</option>
                <option>Utilizar descuento especifico</option>
            </select>
            </div> */}
            <select
            className="border border-gray-300 rounded px-2 py-1 text-sm"
            value={filtroActivo}
            onChange={(e) => setFiltroActivo(e.target.value as "todos" | "activos" | "inactivos")}
            >
            <option value="todos">Mostrar todos</option>
            <option value="activos">Solo activos</option>
            <option value="inactivos">Solo inactivos</option>
            </select>
        </div>

        <div style={{ height: 400, width: "100%" }}>
            <DataGrid
            rows={data.filter((row) => {
                if (filtroActivo === "todos") return true;
                if (filtroActivo === "activos") return row.activo === true;
                if (filtroActivo === "inactivos") return row.activo === false;
            })}
            columns={columns}
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
    </div>
)}