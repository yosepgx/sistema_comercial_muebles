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

export default function Reglas() {
    const [data, setData] = useState<TRegla[]>([])
    const router = useRouter()
    const columns: GridColDef<TRegla>[] = [
        { field: "id", headerName: "REGLA", flex: 1},
        { field: "producto", headerName: "CÓDIGO PRODUCTO", flex: 1 },
        { field: "porcentaje", headerName: "% DE DESCUENTO", flex: 1 },
        { field: "productName", headerName: "NOMBRE PRODUCTO", flex: 1 },
        { field: "cantidad_pagada", headerName: "CANTIDAD PAGADA", flex: 1 },
        { field: "cantidad_libre", headerName: "CANTIDAD LIBRE", flex: 1 },
        { field: "cantidad_libre_maxima", headerName: "CANTIDAD LIBRE MÁXIMA", flex: 1},
        { field: "fecha_inicio", headerName: "FECHA INICIO", flex: 1},
        { field: "fecha_fin", headerName: "FECHA FIN", flex: 1},
        { field: "activo", 
            headerName: "Activo", 
            flex: 1,
            renderCell: (value) => (
                value? "Activo": "Inactivo"
            )},
        {
            field: "actions",
            headerName: "ACCIONES",
            width: 120,
            renderCell: (params) => (
            <div className="flex gap-2">
            <IconButton>
                <Pencil onClick={() => router.push(`descuentos/${params.row.id}`)}/>
            </IconButton>
            
            </div>
            ),
        },

    ];

    useEffect(()=>{
        GetReglaListApi(null)
        .then(data => setData(data))
        .catch(error => console.error("No se pudo cargar los descuentos, error: ", error))
    },[])
    

return (
    <div className="bg-blue-50 p-4 rounded-md space-y-4">
        <div className="flex justify-between items-center">
            <CustomButton type="button" variant="primary"
            onClick={()=>router.push('/descuentos/nuevo')}
            >Agregar descuento</CustomButton>
            <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Preferencia de descuento</span>
            <select className="border border-gray-300 rounded px-2 py-1 text-sm">
                <option>Utilizar descuento por cantidad</option>
                <option>Utilizar descuento especifico</option>
            </select>
            </div>
        </div>

        <div style={{ height: 400, width: "100%" }}>
            <DataGrid
            rows = {data}
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