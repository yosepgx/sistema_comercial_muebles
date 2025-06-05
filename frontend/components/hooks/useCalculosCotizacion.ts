// hooks/useCotizacionCalculations.ts
import { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { TCotizacionDetalle, TCotizacion } from '../types/cotizacion';
import { FormCotizacionValues } from '../schemas/formCotizacionSchema';

interface UseCotizacionCalculationsProps {
  listaDetalles: TCotizacionDetalle[];
  descuento: string;
  form: UseFormReturn<FormCotizacionValues>;
  crrCotizacion: TCotizacion | null;
}

export const useCalculosCotizacion = ({
  listaDetalles,
  descuento,
  form,
  crrCotizacion
}: UseCotizacionCalculationsProps) => {
  
  useEffect(() => {
    // Si no hay detalles, no calcular
    if (!listaDetalles.length) return;

    // Verificar que existan los datos necesarios
    if (!(form && crrCotizacion?.monto_igv !== undefined && 
          crrCotizacion?.monto_sin_impuesto !== undefined && 
          crrCotizacion?.monto_total !== undefined && 
          crrCotizacion?.descuento_adicional !== undefined && 
          descuento)) {
      return;
    }

    // Calcular total con IGV sumando todos los subtotales
    const totalConIGV = listaDetalles.reduce((acc, item) => {
      const sub = Number(item.subtotal);
      return acc + (isNaN(sub) ? 0 : sub);
    }, 0);

    // Calcular base sin IGV (dividiendo entre 1.18)
    const totalSinIGV = totalConIGV / 1.18;

    // Procesar descuento
    const descuentoConIGV = Number(descuento || 0);
    const descuentoBase = descuentoConIGV / 1.18;

    // Calcular IGV sobre el monto final
    const igvCalculado = (totalSinIGV - descuentoBase) * 0.18;
    
    // Calcular total final
    const totalFinal = (totalConIGV - descuentoConIGV);

    // Actualizar valores en el formulario
    form.setValue('monto_sin_impuesto', (totalSinIGV - descuentoBase).toFixed(2));
    form.setValue('monto_igv', igvCalculado.toFixed(2));
    form.setValue('monto_total', totalFinal.toFixed(2));
    
  }, [listaDetalles, descuento, form, crrCotizacion]);
};