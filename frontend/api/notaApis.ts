import { customFetch } from "@/components/customFetch";
import { TNota } from "@/components/types/nota";
import { TPedido } from "@/components/types/pedido";

export const GetXMLNota = async (token: string | null, idnota: number) => {
  try {
    const response = await customFetch(token, `ventas/generar-xml-nota/${idnota}/`, {
      method: 'GET',
    });
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;    
    link.setAttribute('download', `nota-${idnota}.xml`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error('Error al generar el XML', error);
  }
};


type APIResponse<T> =
  | { error: false; data: T }
  | { error: true; message: string };

export async function PostNotaAPI(token: string | null, data: TNota): Promise<APIResponse<TNota>>  {
    try {
        const response = await customFetch(token, `ventas/nota-creacion/`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const responseData = await response.json();

        if (!response.ok) {
            if (responseData?.non_field_errors && responseData?.non_field_errors?.length>0) {
                const mensaje = responseData?.non_field_errors[0];
                alert(mensaje)
                return {
                    error: true,
                    //code: responseData.code,
                    message: mensaje
                };
            }

            throw new Error(`Error del servidor: ${response.status} - ${response.statusText}`);
        }

        return {
            error: false,
            data: responseData as TPedido
        };

    } catch (error) {
        console.error("Error al crear nota:", error);
        return {
            error: true,
            message: "Error inesperado al crear nota."
        };
    }
}

