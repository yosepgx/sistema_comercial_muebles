import {  User } from "@/context/authContext";
import { GRUPO_ID_TO_ROLE, ROLES, RolUsuario } from "@/constants/constantRoles";

export default function obtenerRolDelUsuario(user: User): RolUsuario | null {
  const groupId = Array.isArray(user.groups) && user.groups.length > 0 ? user.groups[0] : null;

  const validRoles = Object.values(ROLES);

  if (groupId && validRoles.includes(groupId as RolUsuario)) {
    return groupId as RolUsuario;
  }

  return null;
}