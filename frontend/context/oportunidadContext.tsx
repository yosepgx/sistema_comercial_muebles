"use client"

import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authContext";
import { TOportunidad } from "@/components/types/oportunidad";


interface OportunidadContextType{
    tipoEdicion: "nuevo" | "edicion" | "vista";
    crrOportunidad: TOportunidad | null;
    setCrrOportunidad: Dispatch<SetStateAction<TOportunidad | null>>;
    setTipoEdicion: Dispatch<SetStateAction<"nuevo" | "edicion" | "vista">>;
    crrTab: string;
    setCrrTab: Dispatch<SetStateAction<string>>;
}

//Para todas las pestañas se necesita:
//la oportunidad
// el cliente se puede consultar (fetch de cliente asociado a crrOportunidad)
// las cotizaciones se pueden consultar (fetch cotizaciones asociadas)
// el pedido se puede consultar (fetch pedido asociado a cotizacion aprobada??)
const OportunidadContext = createContext<OportunidadContextType | undefined>(undefined);

export const OportunidadProvider = ({children}: {children: ReactNode}) => {
    const [tipoEdicion, setTipoEdicion] = useState<"nuevo"| "edicion" | "vista">("nuevo")
    const [crrOportunidad, setCrrOportunidad] = useState<TOportunidad | null>(null)
    const router = useRouter();
    const {ct} = useAuth()
    const [crrTab, setCrrTab] = useState("oportunidad")

    return(
       <OportunidadContext.Provider value = {{tipoEdicion, crrOportunidad, setCrrOportunidad, setTipoEdicion, crrTab, setCrrTab}}>
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