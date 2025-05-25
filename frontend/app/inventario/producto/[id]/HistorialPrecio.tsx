"use client"
import { useProductoContext } from "../productoContext";
import { Column, DataTableMUI } from "@/components/table/tableMUI";
import { useMemo, useState } from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

const columns: Column[] = [
    { id: 'valor', label: 'Valor', minWidth: 100 },
    {
        id: 'fecha_inicio',
        label: 'Fecha de Inicio',
        minWidth: 170,
        format: (value) => new Date(value).toLocaleDateString(),
    },
    {
        id: 'fecha_fin',
        label: 'Fecha de Fin',
        minWidth: 170,
        format: (value) => new Date(value).toLocaleDateString(),
    },
    { id: 'activo', label: 'Activo', minWidth: 100, 
          format: (value) => (value ? 'Activo' : 'Inactivo'),
    },
  ];

export default function HistorialPrecio(){
    const {crrProduct} = useProductoContext()
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);

    const filteredData = useMemo(() => {
        return crrProduct?.rhistorial_precio?.filter((row) => {
        const fecha = new Date(row.fecha_inicio);
        const afterStart = startDate ? fecha >= startDate : true;
        const beforeEnd = endDate ? fecha <= endDate : true;
        return afterStart && beforeEnd;
        });
    }, [startDate, endDate]);
    if(!crrProduct?.rhistorial_precio){
        return (<div>Cargando</div>)
    }
    console.log("datos de historial: ", crrProduct.rhistorial_precio)
    return(
        <div>
            <div className="flex flex-row mb-8 space-x-8">
            <DatePicker
            label="Fecha inicio"
            value={startDate}
            onChange={(newValue) => setStartDate(newValue)}
            
            />
            <DatePicker
            label="Fecha fin"
            value={endDate}
            onChange={(newValue) => setEndDate(newValue)}
            
            />
            </div>
            <DataTableMUI
                columns={columns}
                data={filteredData? filteredData : []}
                emptyMessage="No se encontro precios"/>
        </div>
    )
}