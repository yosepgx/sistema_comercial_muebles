"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { ChangePasswordAPI } from "@/api/usuarioApis";
import { FormPasswordData, formPasswordSchema } from "../schemas/formPasswordSchema";
import CustomButton from "../customButtom";

interface Props {
  open: boolean;
  onClose: () => void;
  userId: number | null;
}

export const ChangePasswordPopup = ({ open, onClose, userId }: Props) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormPasswordData>({
    resolver: zodResolver(formPasswordSchema),
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
        reset();
    }
    }, [open, reset]);

  const onSubmit = async (data: FormPasswordData) => {
    console.log(data)
    if (!userId) return;
    setLoading(true);
    try {
      data.user_id = userId;
      const response = await ChangePasswordAPI(null, data);

      if (!response) throw new Error("Error al cambiar la contraseña");
      
      onClose();
      reset();
      alert("Contraseña cambiada exitosamente");
    } catch (error) {
      console.error(error);
      alert("Hubo un error al cambiar la contraseña");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
        <DialogTitle>Cambiar Contraseña</DialogTitle>
        <DialogContent>
        <form
            onSubmit={handleSubmit(onSubmit, (err) => {
              console.log("Errores de validación", err);
            })}
          className="space-y-4">
          <Input type="password" placeholder="Nueva contraseña" {...register("new_password")} />
          {errors.new_password && (
            <p className="text-sm text-red-500">{errors.new_password.message}</p>
          )}

          <Input type="password" placeholder="Confirmar contraseña" {...register("confirm_password")} />
          {errors.confirm_password && (
            <p className="text-sm text-red-500">{errors.confirm_password.message}</p>
          )}

          <div className="flex justify-end">
            <CustomButton type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar"}
            </CustomButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
