# Cargar las cantidades originales por producto
# sin cantidades editables ya no es necesario verificar que no se pase
# cantidades_originales = {}
# for detalle in pedido_original.detalles.all():
#     cantidades_originales[detalle.producto_id] = detalle.cantidad

# if tipo in [Pedido.TIPONCBOLETA, Pedido.TIPONCFACTURA]:
#     # Validar que no se exceda lo comprado
#     for detalle in detalles_nota:
#         prod_id = detalle["producto"]
#         cant_nota = float(detalle["cantidad"])

#         cant_original = cantidades_originales.get(int(prod_id), 0)
#         if cant_nota > cant_original:
#             raise serializers.ValidationError(
#                 f"No se puede devolver más de lo comprado para el producto ID {prod_id}."
#             )


# else:
#     raise serializers.ValidationError("Tipo de comprobante no válido para una nota.")
