    // setDetalles((prev) =>
    //   prev.map((row) => {
    //     if (`${row.producto}-${row.cotizacion}` === id) {
    //       const isValid = value > 0
    //       if (!isValid) {
    //         setErrors((e) => ({ ...e, [id]: 'Cantidad debe ser mayor a 0' }))
    //         return row
    //       } else {
    //         setErrors((e) => {
    //           const newErrors = { ...e }
    //           delete newErrors[id]
    //           return newErrors
    //         })
    //       }
    //       // Crear detalle temporal con nueva cantidad
    //       const detalleTemp = {
    //         ...row,
    //         cantidad: value
    //       }

    //       // Recalcular descuentos automáticamente
    //       let detalleConDescuento = row
    //       aplicarDescuentosADetalle(detalleTemp)
    //       .then(data => detalleConDescuento = data)
    //       return detalleConDescuento

    //       }
    //     return row
    //   })
    // )