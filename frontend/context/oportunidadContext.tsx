"use client"

import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authContext";
import { TOportunidad } from "@/components/types/oportunidad";
import { TCliente } from "@/components/types/clienteType";
import { TCotizacion } from "@/components/types/cotizacion";


interface OportunidadContextType{
    tipoEdicion: "nuevo" | "edicion" ;
    crrOportunidad: TOportunidad | null;
    setCrrOportunidad: Dispatch<SetStateAction<TOportunidad | null>>;
    setTipoEdicion: Dispatch<SetStateAction<"nuevo" | "edicion" >>;
    crrTab: string;
    setCrrTab: Dispatch<SetStateAction<string>>;
    cliente: TCliente | null;
    setCliente: Dispatch<SetStateAction<TCliente | null>>;
    modoCotizacion: "muchas"| "una";
    SetModoCotizacion: Dispatch<SetStateAction<"muchas" | "una">>;
    crrCotizacion: TCotizacion | null;
    setCrrCotizacion: Dispatch<SetStateAction<TCotizacion | null>>;
    edicionCotizacion: "nuevo" | "edicion";
    setEdicionCotizacion: Dispatch<SetStateAction<"nuevo" | "edicion">>;
}

//Para todas las pestañas se necesita:
//la oportunidad
// el cliente se puede consultar (fetch de cliente asociado a crrOportunidad)
// las cotizaciones se pueden consultar (fetch cotizaciones asociadas)
// el pedido se puede consultar (fetch pedido asociado a cotizacion aprobada??)
const OportunidadContext = createContext<OportunidadContextType | undefined>(undefined);

export const OportunidadProvider = ({children}: {children: ReactNode}) => {
    const [tipoEdicion, setTipoEdicion] = useState<"nuevo"| "edicion">("nuevo")
    const [crrOportunidad, setCrrOportunidad] = useState<TOportunidad | null>(null)
    const [cliente, setCliente] = useState<TCliente | null>(null);
    const [modoCotizacion, SetModoCotizacion] = useState<"muchas" | "una">("muchas")
    const [crrCotizacion, setCrrCotizacion] = useState<TCotizacion | null>(null)
    const [edicionCotizacion, setEdicionCotizacion] = useState<"nuevo" | "edicion">("nuevo")
    const router = useRouter();
    const {ct} = useAuth()
    const [crrTab, setCrrTab] = useState("oportunidad")

    return(
       <OportunidadContext.Provider value = {{
        tipoEdicion, 
        crrOportunidad, 
        setCrrOportunidad, 
        setTipoEdicion, 
        crrTab, 
        setCrrTab,
        cliente,
        setCliente,
        modoCotizacion,
        SetModoCotizacion,
        crrCotizacion,
        setCrrCotizacion,
        edicionCotizacion,
        setEdicionCotizacion}}>
            {children}
       </OportunidadContext.Provider> 
    )
}

export const useOportunidadContext = () => {
    const context = useContext(OportunidadContext);
    if (context === undefined) {
      throw new Error('useOportunidadContext debe ser usado dentro de un OportunidadContext Provider');
    }
    return context;
};