"use client";

import { useState } from "react";
import CustomButton from "@/components/customButtom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
export default function PredictivoPage() {
  const [mesesPromedio, setMesesPromedio] = useState("6");
  const [horizonteMeses, setHorizonteMeses] = useState("1");
  const [filesUploaded, setFilesUploaded] = useState({
    ventas: false,
    pedidos: false,
    stock: false,
  });
  const allFilesUploaded = Object.values(filesUploaded).every((val) => val);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Módulo Predictivo</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="cantmeses">Cantidad de meses en el historico</Label>
          <Input type="number" id="cantmeses" placeholder="Cantidad de meses en el historico" />
        </div>
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="horizonte">Horizonte de meses</Label>
          <Input type="number" id="horizonte" placeholder="Horizonte de meses" />
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mt-6">
        <CustomButton
          variant="secondary"
          onClick={() => setFilesUploaded({ ...filesUploaded, ventas: true })}
        >
          Cargar Ventas Históricas
        </CustomButton>
        <CustomButton
          variant="secondary"
          onClick={() => setFilesUploaded({ ...filesUploaded, pedidos: true })}
        >
          Cargar Pedidos Actuales
        </CustomButton>
        <CustomButton
          variant="secondary"
          onClick={() => setFilesUploaded({ ...filesUploaded, stock: true })}
        >
          Cargar Stock Actual
        </CustomButton>
        <CustomButton variant="primary" disabled={!allFilesUploaded}>
          Generar Predicción
        </CustomButton>
      </div>

      {!allFilesUploaded && (
        <div className="bg-orange-500 text-white p-2 mt-4 text-center font-semibold">
          Es necesario completar todos los campos y cargar todos los archivos
        </div>
      )}
    </div>
  );
}
