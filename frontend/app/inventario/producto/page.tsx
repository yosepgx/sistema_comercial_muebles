"use client"
import MainWrap from "@/components/mainwrap";
import { ProtectedRoute } from "@/components/protectedRoute";
import { useEffect, useState } from "react";
import { descargarProductoAPI, GetProductoListApi, PatchProductoAPI } from "@/api/productoApis";
import { TCategoria, TProducto } from "@/components/types/productoTypes";
import { usePermiso } from "@/hooks/usePermiso";
import { PERMISSION_KEYS } from "@/constants/constantRoles";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { UNIDADES_MEDIDA_BUSCA } from "@/constants/unidadesMedidaConstants";
import { IconButton } from "@mui/material";
import { Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { GetCategoriaListApi } from "@/api/categoriaApis";
import { Input } from "@/components/ui/input";
import CustomButton from "@/components/customButtom";

export default function ProductoPage(){
    const puedeGestionarProducto = usePermiso(PERMISSION_KEYS.PRODUCTO_ACTUALIZAR)
    const [productos, setProductos] = useState<TProducto[]>([])
    const [categorias, setCategorias] = useState<TCategoria[]>([]);
    const [loading, setLoading] = useState(true)
    const router = useRouter() //rutear e ir a producto
    const [searchTerm, setSearchTerm] = useState("");
    
    useEffect(() => {
    const cargarCategorias = async () =>{
        try {
            const cats = await GetCategoriaListApi(null)
            setCategorias(cats)
        } catch (error) {
            console.error("Error al cargar categorias" )
        } 
    }
    const cargarDatos = async () => {
        try {
        const res = await GetProductoListApi(null)
        console.log("Datos cargados:", res)
        setProductos(res)
        } catch (error) {
        console.error("Error al cargar los datos", error)
        } finally {
        await cargarCategorias()
        setLoading(false)
        }
    }

    cargarDatos()
    }, [])

    const filteredProductos = productos.filter(producto =>{
    const categoria = categorias.find(cat => cat.id === producto.categoria);
    const lowerSearchTerm = searchTerm.toLowerCase()
    return (
    String(producto.id).includes(lowerSearchTerm) ||
    producto.nombre?.toLowerCase().includes(lowerSearchTerm) ||
    categoria?.descripcion?.toLowerCase().includes(lowerSearchTerm)
    );
  }
  );


    const Columns: GridColDef<TProducto>[] = [
      {   field: 'id', 
          headerName: 'Codigo', //filtrable
          resizable: false,
          flex: 1
      },
      
      {   field: 'nombre', 
          headerName: 'Producto',
          resizable: false,
          flex: 1
      },

      {   field: 'rprecio_actual', 
          headerName: 'Precio',
          resizable: false,
          flex: 1
      },
      {   field: 'umedida_sunat', 
          headerName: 'UM',
          resizable: false,
          flex: 1,
          valueFormatter: (value) => (UNIDADES_MEDIDA_BUSCA[value] ?? value)
      },
      {   field: 'rcategoria_producto', 
          headerName: 'Categoria', //incluido en busqueda
          resizable: false,
          flex: 1,
          renderCell: (params) => (
            params.row.rcategoria_producto?.descripcion ?? 'Otros'
          )
      },
      {   field: 'activo', 
          headerName: 'Activo',
          resizable: false,
          flex: 1,
          valueFormatter: (value) => (value? 'Activo' : 'Inactivo')
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
          <IconButton onClick={() => router.push(`/inventario/producto/${params.row.id}`)}>
            <Edit />
          </IconButton>
          <IconButton onClick={async() => {
                if (window.confirm("¿Está seguro que desea borrar?")) {
                    const idproducto = params.row.id
                    await PatchProductoAPI(null, idproducto, {activo: false})
                    setProductos((prev) =>
                        prev.map((prod) =>
                        prod.id === idproducto ? { ...prod, activo: false } : prod
                        )
                    );
                }
                }}>
            <Trash2/>
            </IconButton>
        </div>
      ),
    }
  ];

    if (loading) {
    return <div>Cargando...</div>
    }

    return(
    <>
        <ProtectedRoute>
            <MainWrap>
                {puedeGestionarProducto && 
                <>
                <div>Productos</div>
                <div className="flex flex-row space-x-8 mb-4">
                    <div className="flex-1 flex items-center">
                    <Input
                        className="w-full"
                        placeholder='Buscar por codigo, nombre o categoria'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    </div>
                <CustomButton 
                    type='button'
                    onClick={()=> {
                    router.push(`/inventario/producto/nuevo`);
                    }}>Nuevo</CustomButton>
                <CustomButton 
                    type='button'
                    onClick={()=>{
                    const exportData = descargarProductoAPI(null)
                    console.log("data a exportar:", exportData)
                    }
                }
                >Exportar</CustomButton>
                
                </div>
                <DataGrid
                className="mt-2"
                rows = {filteredProductos? filteredProductos : []}
                columns={Columns}
                initialState={{
                pagination: {
                    paginationModel: {
                    pageSize: 10,
                    },
                },
                
                }}
                sx={{
                  '& .MuiDataGrid-columnHeader': {
                    whiteSpace: 'normal',
                    lineHeight: '1.2',
                    textAlign: 'center',
                    wordBreak: 'break-word',
                  }
                }}
                pageSizeOptions={[5, 10, 25]}
                disableRowSelectionOnClick
                disableColumnMenu
                />
                </>}
            </MainWrap>
        </ProtectedRoute>
    </>
    )
}