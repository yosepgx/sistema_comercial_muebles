import { customFetch } from "@/components/customFetch";
import { formatInTimeZone } from "date-fns-tz";

export async function CargarInventarioApi(token: string | null, archivo: File) {
    const formData = new FormData();
    formData.append("archivo", archivo); 

    try {
        const response = await customFetch(token, `inventario/cargar-inventario/`, {
            method: "POST",
            body: formData,
        });

        const data = await response.json();
        
        if (response.ok) {
            return { success: true, mensaje: data.mensaje || "Carga exitosa" };
        } else {
            return { success: false, error: data.error || "Error desconocido" };
        }
    } catch (error) {
        console.error("Error al cargar el inventario:", error);
        return { success: false, error: "Error de conexión con el servidor" };
    }
}

export async function CargarVentasApi(token: string | null, archivo: File) {
    const formData = new FormData();
    formData.append("archivo", archivo); 

    try {
        const response = await customFetch(token, `ventas/cargar-data-pedidos/`, {
            method: "POST",
            body: formData,
        });

        const data = await response.json();
        
        if (response.ok) {
            return { success: true, mensaje: data.mensaje || "Carga exitosa" };
        } else {
            return { success: false, error: data.error || "Error desconocido" };
        }
    } catch (error) {
        console.error("Error al cargar la data de ventas:", error);
        return { success: false, error: "Error de conexión con el servidor" };
    }
}

export async function CargarClientesApi(token: string | null, archivo: File) {
    const formData = new FormData();
    formData.append("archivo", archivo); 

    try {
        const response = await customFetch(token, `clientes/cargar-data-clientes/`, {
            method: "POST",
            body: formData,
        });

        const data = await response.json();
        
        if (response.ok) {
            return { success: true, mensaje: data.mensaje || "Carga exitosa" };
        } else {
            return { success: false, error: data.error || "Error desconocido" };
        }
    } catch (error) {
        console.error("Error al cargar la data de clientes:", error);
        return { success: false, error: "Error de conexión con el servidor" };
    }
}
export async function CargarComprasApi(token: string | null, archivo: File) {
    const formData = new FormData();
    formData.append("archivo", archivo); 

    try {
        const response = await customFetch(token, `predictivo/cargar-compras/`, {
            method: "POST",
            body: formData,
        });

        const data = await response.json();
        console.log("la data de la carga es", data)
        if (response.ok) {
            return { success: true, mensaje: data.mensaje || "Carga exitosa", data: data };
        } else {
            return { success: false, error: data.error || "Error desconocido", data: data };
        }
    } catch (error) {
        console.error("Error al cargar la data de compras:", error);
        return { success: false, error: "Error de conexión con el servidor",data:[] };
    }
}

export async function GenerarRequisicionesApi(token: string | null, horizonte: number, pasado: number, compras: any) {
    try {

        console.log("recibe: ", JSON.stringify({ horizonte, pasado, compras }))
        const response = await customFetch(token,
            `predictivo/generar-requisiciones/`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ horizonte, pasado, compras }),
            }
        );

        if (!response.ok) throw new Error('Error al generar el archivo');

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        // Generar el nombre del archivo con la fecha y los parámetros
        const now = new Date()
        const timestamp = formatInTimeZone(now, "America/Lima", 'yyyy-MM-dd HH:mm:ss');
        const filename = `${timestamp}_ho-${horizonte}_pa-${pasado}.xlsx`;

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        return { success: true, status: response.status };
    } catch (error) {
        console.error("Error al generar requisiciones:", error);
    }
}


export async function GenerarRequisicionesApiBucket(token: string | null, horizonte: number, pasado: number) {
    try {
        const response = await customFetch(token, 
            `/generar-requisiciones/?horizonte=${horizonte}&pasado=${pasado}`,
            { method: 'GET' }
        );

        if (!response.ok) throw new Error('Error al generar el archivo');

        // Convertir la respuesta a Blob (archivo)
        const blob = await response.blob();

        
        // Generar el nombre del archivo con la fecha y los parámetros
        const now = new Date();
        const timestamp = now.toISOString().replace(/[-T:]/g, "").split(".")[0]; // Formato YYYYMMDD_HHMMSS
        const filename = `${timestamp}_ho-${horizonte}_pa-${pasado}.xlsx`;

        // Crear un enlace de descarga
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;  
        document.body.appendChild(a);
        a.click();

        // Limpiar el objeto URL
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error(error);
    }
}
