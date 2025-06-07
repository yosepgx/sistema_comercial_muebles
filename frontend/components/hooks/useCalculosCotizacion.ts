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


    // Calcular total con IGV sumando todos los subtotales
    const totalConIGV = listaDetalles.reduce((acc, item) => {
      const sub = Number(item.subtotal);
      return acc + (isNaN(sub) ? 0 : sub);
    }, 0);

    if (totalConIGV === 0) return;

    //descuento auxiliar
    const descuentoConIGV = Number(descuento || 0);

    let totalBase = 0;
    let totalIGV = 0;

    listaDetalles.forEach(item => {
      const subtotal = Number(item.subtotal);
      const igvRate = Number(item.rigv ?? 0.18); // ej: 0.18
      const proporcion = subtotal / totalConIGV;
      const descuentoLineaConIGV = descuentoConIGV * proporcion;

      // Convertir subtotal y descuento de IGV a base imponible
      const baseLinea = subtotal / (1 + igvRate);
      const descuentoBase = descuentoLineaConIGV / (1 + igvRate);

      totalBase += baseLinea - descuentoBase;
      totalIGV += (baseLinea - descuentoBase) * igvRate;
    });

    const totalFinal = totalBase + totalIGV;
    //console.log("rawtotal descontado: ",totalConIGV - descuentoConIGV)
    //console.log("total procesado: ",totalFinal)

    form.setValue('monto_sin_impuesto', totalBase.toFixed(2));
    form.setValue('monto_igv', totalIGV.toFixed(2));
    form.setValue('monto_total', totalFinal.toFixed(2));
    
    
  }, [listaDetalles, descuento, form]);
};