import obtenerRolDelUsuario from "@/components/utils/obtenerRol";
import { PERMISOS, RolUsuario } from "@/constants/constantRoles";
import { useAuth } from "@/context/authContext";


export function usePermiso(permiso: keyof typeof PERMISOS): boolean {
  const { user } = useAuth();
  if (!user) return false;

  const rol = obtenerRolDelUsuario (user);
  //console.log("rol del usuario", rol)
  if(!rol)return false;
  
  const rolesPermitidos = PERMISOS[permiso] as readonly RolUsuario[];
  return rolesPermitidos.includes(rol);

}