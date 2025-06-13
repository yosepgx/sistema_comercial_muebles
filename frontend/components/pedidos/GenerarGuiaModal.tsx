import { Dialog, DialogContent, DialogTitle, DialogActions } from "@mui/material";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { customFetch } from "../customFetch";

interface GenerarGuiaModalProps {
  open: boolean;
  onClose: () => void;
  pedidoId: string | undefined;
}

export function GenerarGuiaModal({ open, onClose, pedidoId }: GenerarGuiaModalProps) {
  const [direccionPartida, setDireccionPartida] = useState("");

  const handleGenerarGuia = async () => {
    if(!pedidoId)return
    try {
      const response = await customFetch(null,`ventas/generar-guia/${pedidoId}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ direccion_partida: direccionPartida }),
      });

      if (!response.ok) throw new Error("No se pudo generar la guía");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `guia-${pedidoId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      //alert("Guía generada y descargada con éxito");
      onClose(); // cerrar el modal externo
    } catch (error) {
      console.error(error);
      alert("Error al generar la guía");
    }
  };
  if(!pedidoId)return(<></>)

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Dirección de Partida</DialogTitle>
      <DialogContent>
        <div className="space-y-2 mt-2">
          <Label htmlFor="direccion">Dirección</Label>
          <Input
            id="direccion"
            value={direccionPartida}
            onChange={(e) => setDireccionPartida(e.target.value)}
          />
        </div>
      </DialogContent>
      <DialogActions>
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button onClick={handleGenerarGuia}>
          Aceptar y Descargar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
