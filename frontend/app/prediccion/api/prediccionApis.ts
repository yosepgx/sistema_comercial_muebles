import { formatInTimeZone } from "date-fns-tz";

export async function GenerarRequisicionesApi(horizonte: number, pasado: number) {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}predictivo/generar-requisiciones/`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ horizonte, pasado }),
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


export async function GenerarRequisicionesApiBucket(horizonte: number, pasado: number) {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/generar-requisiciones/?horizonte=${horizonte}&pasado=${pasado}`,
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
