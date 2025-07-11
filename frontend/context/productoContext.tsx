"use client"

import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useState } from "react";
import { TCategoria, TProducto } from "../components/types/productoTypes";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authContext";
import { GetCategoriaListApi } from "../api/categoriaApis";


interface ProductoContextType{
    editing: boolean;
    crrProduct: TProducto | null;
    setCrrProduct: Dispatch<SetStateAction<TProducto | null>>;
    setEditing: Dispatch<SetStateAction<boolean>>;
    editRedirect : (data: TProducto) => void;
    viewRedirect : (data: TProducto) => void;
    crrTab: string;
    setCrrTab: Dispatch<SetStateAction<string>>;
}

const ProductoContext = createContext<ProductoContextType | undefined>(undefined);

export const ProductoProvider = ({children}: {children: ReactNode}) => {
    const [editing, setEditing] = useState(false)
    const [crrTab, setCrrTab] = useState ('formulario')
    const [crrProduct, setCrrProduct] = useState<TProducto | null>(null)
    const router = useRouter();
    
    const editRedirect = (data: TProducto) => {
        setCrrProduct(data);
        if(crrProduct) router.push(`/inventario/producto/${data.id}`);
        setEditing(true);
    }
    const viewRedirect = (data: TProducto) => {
        setCrrProduct(data);
        if(crrProduct) router.push(`/inventario/producto/${data.id}`);
        setEditing(false);
    }


    return(
       <ProductoContext.Provider value = {{editing, crrProduct, setCrrProduct, setEditing, editRedirect, viewRedirect, crrTab, setCrrTab}}>
            {children}
       </ProductoContext.Provider> 
    )
}

export const useProductoContext = () => {
    const context = useContext(ProductoContext);
    if (context === undefined) {
      throw new Error('useProductoContext debe ser usado dentro de un ProductoContext Provider');
    }
    return context;
};