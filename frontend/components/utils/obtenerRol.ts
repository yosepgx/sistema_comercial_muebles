import {  User } from "@/context/authContext";
import { GRUPO_ID_TO_ROLE, RolUsuario } from "@/constants/constantRoles";

export default function obtenerRolDelUsuario(user: User): RolUsuario | null {
  const groupId = user.groups[0];
  if (groupId in GRUPO_ID_TO_ROLE) {
    return GRUPO_ID_TO_ROLE[groupId as keyof typeof GRUPO_ID_TO_ROLE];
  }
  return null;
}