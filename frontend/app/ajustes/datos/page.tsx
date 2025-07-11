"use client"

import { GetDatoGeneralListApi } from "@/api/datogeneralApis"
import { GetSedeListApi, UpdateSedeAPI } from "@/api/sedeApis"
import CustomButton from "@/components/customButtom"
import MainWrap from "@/components/mainwrap"
import { ProtectedRoute } from "@/components/protectedRoute"
import { TDGeneral } from "@/components/types/dgeneralType"
import { TSede } from "@/components/types/sede"
import { PERMISSION_KEYS } from "@/constants/constantRoles"
import { useAuth } from "@/context/authContext"
import { usePermiso } from "@/hooks/usePermiso"
import { IconButton } from "@mui/material"
import { DataGrid, GridColDef } from "@mui/x-data-grid"
import { Edit, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function DatosPage(){
    const puedeGestionarDatosGenerales = usePermiso(PERMISSION_KEYS.CONFIGURAR_SISTEMA)
    const [datasede, setDataSede] = useState<TSede[]>([])
    const [datagen, setDataGen] = useState<TDGeneral[]>([])
    const [loadingsede, setLoadingSede] = useState(true)
    const [loadinggen, setLoadingGen] = useState(true)
    const router = useRouter()
    const cargarSedes = async () => {
        try {
        const res = await GetSedeListApi(null)
        setDataSede(res)
        } catch (error) {
        console.error("Error al cargar los datos", error)
        } finally {
        setLoadingSede(false)
        }
    }

    const cargarGen = async () => {
        try {
        const res = await GetDatoGeneralListApi(null)
        setDataGen(res)
        } catch (error) {
        console.error("Error al cargar los datos", error)
        } finally {
        setLoadingGen(false)
        }
    }

    useEffect(() => {
        cargarSedes()
        cargarGen()
    }, [])

    if (loadingsede && loadinggen) {
    return <div>Cargando...</div>
    }

    const genColumns: GridColDef<TDGeneral>[] = [
        {   field: 'id', 
            headerName: 'Id',
            resizable: false,
            flex: 1
        },
        {   field: 'codigo_RUC', 
            headerName: 'RUC de la empresa', 
            resizable: false,
            flex: 1
        },
        {   field: 'razon_social', 
            headerName: 'Razon social', 
            resizable: false,
            flex: 1,
        },
        {   field: 'nombre_comercial', 
            headerName: 'Nombre comercial', 
            resizable: false,
            flex: 1,
        },
        {   field: 'direccion_fiscal', 
            headerName: 'Direccion fiscal', 
            resizable: false,
            flex: 1,
        },
        {   field: 'margen_general', 
            headerName: 'Margen de descuento auxiliar', 
            resizable: false,
            flex: 1,
        },
        {
        field: 'acciones',
        headerName: 'Acciones',
        resizable: false,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        width: 120,
        renderCell: (params) => (
        <div>
            <IconButton onClick={() => router.push(`/ajustes/datos/general/${params.row.id}`)}>
            <Edit />
            </IconButton>
        </div>
        ),
        }
    ];

    const sedeColumns: GridColDef<TSede>[] = [
        {   field: 'id', 
            headerName: 'Codigo', 
            resizable: false,
            flex: 1,
        },
        {   field: 'nombre', 
            headerName: 'Nombre', 
            resizable: false,
            flex: 1,
        },
        {   field: 'activo', 
            headerName: 'Activo', 
            resizable: false,
            flex: 1,
            valueFormatter: (value) => (value? "Activo":"Inactivo"),
        },
        {
        field: 'acciones',
        headerName: 'Acciones',
        resizable: false,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        width: 120,
        renderCell: (params) => (
        <div>
            <IconButton onClick={() => router.push(`/ajustes/datos/sede/${params.row.id}`)}>
            <Edit />
            </IconButton>
            <IconButton onClick={() => {
            const confirmDelete = window.confirm('¿Estás seguro de que deseas eliminar esta sede?');
            if (confirmDelete) {
                const nuevo = { ...params.row, activo: false };
                UpdateSedeAPI(null, params.row.id, nuevo);
            }
            }}>
            <Trash2 />
            </IconButton>
        </div>
        ),
        }
    ];


    return (
        <ProtectedRoute>
            <MainWrap>
                {puedeGestionarDatosGenerales && <>
                <h1 className="text-xl font-semibold mb-4">Ajuste de datos generales</h1>
                <DataGrid
                    rows = {datagen}
                    columns={genColumns}
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

                <div className="flex justify-end mb-4">
                <CustomButton type='button' variant='primary' onClick={()=>{router.push('/ajustes/datos/sede/nuevo')}}>
                    Nueva Sede
                </CustomButton>
                </div>
                <DataGrid
                    rows = {datasede}
                    columns={sedeColumns}
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
                    </>}
            </MainWrap>
        </ProtectedRoute>
    )
}