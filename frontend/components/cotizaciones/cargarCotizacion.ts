import { UseFormReturn } from "react-hook-form";
import { format } from "date-fns";
import { z } from "zod";
import { formCotizacionSchema } from "../schemas/formCotizacionSchema";
import { TCotizacion } from "../types/cotizacion";

export const cargarCotizacion = (cotizacion: TCotizacion | null, form: UseFormReturn<z.infer<typeof formCotizacionSchema>>) => {
    if(!cotizacion) return;
    console.log("la cotizacion a cargar es:", cotizacion)
    form.setValue('id', `${cotizacion.id}`);
    form.setValue('fecha', cotizacion.fecha);
    form.setValue('estado_cotizacion', cotizacion.estado_cotizacion);
    form.setValue('oportunidad', `${cotizacion.oportunidad}`);
    form.setValue('monto_sin_impuesto', cotizacion.monto_sin_impuesto.toFixed(2));
    form.setValue('monto_igv', cotizacion.monto_igv.toFixed(2));
    form.setValue('monto_total', cotizacion.monto_total.toFixed(2));
    form.setValue('descuento_adicional', cotizacion.descuento_adicional.toFixed(2));
    form.setValue('observaciones', cotizacion.observaciones?? '');
    form.setValue('direccion_entrega', cotizacion.direccion_entrega ?? '');
    form.setValue('activo', cotizacion.activo ? 'true' : 'false');
    form.setValue('vendedor',cotizacion.vendedor)
  };