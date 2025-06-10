import { UseFormReturn } from "react-hook-form";
import { formPedidoSchema, FormPedidoValues } from "../schemas/pedidoSchemas";
import { TPedido } from "../types/pedido";
import { format } from "date-fns";
import { z } from "zod";

export const cargarPedido = (pedido: TPedido, form: UseFormReturn<z.infer<typeof formPedidoSchema>>) =>{
      form.setValue('id',`${pedido.id}`);
      form.setValue('fecha',format(pedido.fecha, 'yyyy-MM-dd'));
      form.setValue('fechaentrega',pedido.fechaentrega? format(pedido.fechaentrega, 'yyyy-MM-dd'): '');
      form.setValue('fecha_pago',pedido.fecha_pago? format(pedido.fecha_pago, 'yyyy-MM-dd'): '');
      form.setValue('serie',pedido.serie);
      form.setValue('correlativo',pedido.correlativo); 
      form.setValue('tipo_comprobante',pedido.tipo_comprobante); 
      form.setValue('direccion',pedido.direccion);
      form.setValue('cotizacion',`${pedido.cotizacion}`);
      form.setValue('moneda',pedido.moneda);
      form.setValue('estado_pedido',pedido.estado_pedido);
      form.setValue('monto_sin_impuesto',`${pedido.monto_sin_impuesto}`);
      form.setValue('monto_igv',`${pedido.monto_igv}`);
      form.setValue('monto_total',`${pedido.monto_total}`);
      form.setValue('descuento_adicional',`${pedido.descuento_adicional}`);
      form.setValue('observaciones',pedido.observaciones?pedido.observaciones:'' );
      form.setValue('codigo_tipo_tributo',pedido.codigo_tipo_tributo);
      form.setValue('activo',`${pedido.activo}`);
    }