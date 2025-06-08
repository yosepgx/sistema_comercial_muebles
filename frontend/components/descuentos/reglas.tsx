"use client"

import { DataGrid, GridColDef } from "@mui/x-data-grid";
import CustomButton from "../customButtom";
import { Pencil, Save, Trash2 } from "lucide-react";
import { IconButton } from "@mui/material";
import { CheckBox } from "@mui/icons-material";

export default function Reglas() {
    const columns: GridColDef[] = [
        { field: "id", headerName: "REGLA", flex: 1},
        { field: "productCode", headerName: "CÓDIGO PRODUCTO", flex: 1 },
        { field: "discount", headerName: "% DE DESCUENTO", flex: 1 },
        { field: "productName", headerName: "NOMBRE PRODUCTO", flex: 1 },
        { field: "qtyPaid", headerName: "CANTIDAD PAGADA", flex: 1 },
        { field: "qtyFree", headerName: "CANTIDAD LIBRE", flex: 1 },
        { field: "qtyFreeMax", headerName: "CANTIDAD LIBRE MÁXIMA", flex: 1},
        { field: "startDate", headerName: "FECHA INICIO", flex: 1},
        { field: "endDate", headerName: "FECHA FIN", flex: 1},
        {
            field: "actions",
            headerName: "ACCIONES",
            width: 120,
            renderCell: () => (
            <div className="flex gap-2">
            <IconButton>
                <Pencil/>
            </IconButton>
            <CheckBox></CheckBox>
            </div>
            ),
        },
    ];

    const rows = [
    {
        id: "0001",
        productCode: "0027",
        discount: "10.00%",
        productName: "Comedor de 6 sillas",
        qtyPaid: 0,
        qtyFree: 0,
        qtyFreeMax: 0,
        startDate: "01/11/2025",
        endDate: "31/12/2025",
    },
    {
        id: "0002",
        productCode: "0004",
        discount: "0.00%",
        productName: "Perchero",
        qtyPaid: 3,
        qtyFree: 1,
        qtyFreeMax: 5,
        startDate: "01/01/2025",
        endDate: "31/04/2025",
    },
    {
        id: "0003",
        productCode: "0001",
        discount: "5.00%",
        productName: "Separador",
        qtyPaid: 0,
        qtyFree: 0,
        qtyFreeMax: 0,
        startDate: "01/01/2025",
        endDate: "31/04/2025",
    },
    {
        id: "0004",
        productCode: "0003",
        discount: "10.00%",
        productName: "Comedor de 8 sillas",
        qtyPaid: 0,
        qtyFree: 0,
        qtyFreeMax: 0,
        startDate: "01/11/2025",
        endDate: "31/12/2025",
    },
    {
        id: "0005",
        productCode: "0001",
        discount: "8.00%",
        productName: "PortaTV de 2m",
        qtyPaid: 0,
        qtyFree: 0,
        qtyFreeMax: 0,
        startDate: "01/01/2025",
        endDate: "31/04/2025",
    },
];

return (
    <div className="bg-blue-50 p-4 rounded-md space-y-4">
        <div className="flex justify-between items-center">
            <CustomButton type="button" variant="primary">Agregar descuento</CustomButton>
            <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Preferencia de descuento</span>
            <select className="border border-gray-300 rounded px-2 py-1 text-sm">
                <option>Utilizar descuento por cantidad</option>
                <option>Utilizar descuento especifico</option>
            </select>
            </div>
        </div>

        <div style={{ height: 400, width: "100%" }}>
            <DataGrid
            rows = {rows}
            columns={columns}
            initialState={{
            pagination: {
                paginationModel: {
                pageSize: 10,
                },
            },
            
            }}
            pageSizeOptions={[5, 10, 25]}
            disableRowSelectionOnClick
            disableColumnMenu
            />
        </div>
    </div>
)}