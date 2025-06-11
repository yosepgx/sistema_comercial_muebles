"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ReactNode } from "react";
import { Home, Armchair, ShoppingBag, LineChart, BadgePercent, Settings, Bell, ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/authContext";
import { usePermiso } from "@/hooks/usePermiso";
import { PERMISSION_KEYS } from "@/constants/constantRoles";

export default function Navbar() {
  interface IMenuItem {
    label:string;
    href: string;
}

const puedeVerProductos = usePermiso(PERMISSION_KEYS.PRODUCTO_LEER)
const puedeVerInventario = usePermiso(PERMISSION_KEYS.INVENTARIO_LEER)
const puedeVerCotizaciones = usePermiso(PERMISSION_KEYS.COTIZACION_LEER)
const puedeVerPedidos = usePermiso(PERMISSION_KEYS.PEDIDO_LEER_TODOS)
const puedeVerClientes = usePermiso(PERMISSION_KEYS.CLIENTE_LEER)
const puedeVerNotas = usePermiso(PERMISSION_KEYS.NOTAS_CREAR)
const puedeconfigurar = usePermiso(PERMISSION_KEYS.CONFIGURAR_SISTEMA)
const {fetchLogout} = useAuth();
const itemsInventario : IMenuItem[]= [
    puedeVerProductos &&{
      label: "Productos",
      href:  "/inventario/producto",
      },
    puedeVerInventario && {
      label: "Recuento de Stock",
      href: "/inventario/inventario",
      },
].filter(Boolean) as IMenuItem[];
const itemsVentas: IMenuItem[] = [
    {
        label: "Cotizaciones",
        href: "/cotizaciones",
    },
    {
        label: "Pedidos",
        href: "/pedidos",
    },
    {
        label: "Clientes",
        href: "/clientes",
    },
    {
        label: "Notas",
        href: "/notas",
    },
    
]

const itemsAjustes: IMenuItem[] = [
    {
        label: "Roles",
        href: "/ajustes/roles"
    },
    {
        label: "Usuarios",
        href: "/ajustes/usuarios"
    },
    {
        label: "Categorias",
        href: "/ajustes/categorias"
    },
    {
        label: "Datos Generales",
        href: "/ajustes/datos"
    },
]
  const pathname = usePathname();

  return (
    <nav className="bg-green-300 p-4 flex items-center justify-between">
      {/* Sección Izquierda */}
      <div className="flex space-x-6">
        <NavItem href="/" icon={<Home size={20} />} label="Inicio" pathname={pathname} />
        {(puedeVerInventario || puedeVerProductos) && <NavDropdown icon={<Armchair size={20} />} label="Productos" items={itemsInventario} pathname={pathname} />}
        {puedeVerCotizaciones && <NavDropdown icon={<ShoppingBag size={20} />} label="Ventas" items={itemsVentas} pathname={pathname} />}
        {puedeconfigurar && <NavItem href="/prediccion" icon={<LineChart size={20} />} label="Prediccion" pathname={pathname} />}
        {puedeconfigurar && <NavItem href="/descuentos" icon={<BadgePercent size={20} />} label="Descuentos" pathname={pathname} />}
        {puedeconfigurar && <NavDropdown icon={<Settings size={20} />} label="Ajustes" items={itemsAjustes} pathname={pathname} />}
      </div>

      {/* Sección Derecha */}
      <div className="flex items-center space-x-4">
        {/* <Bell size={20} className="cursor-pointer" /> */}
        <Button className="bg-blue-500 text-white" onClick={fetchLogout}>Cerrar Sesión</Button>
      </div>
    </nav>
  );
}

// Componente para un Item simple
function NavItem({ href, icon, label, pathname }: { href: string; icon: ReactNode; label: string; pathname: string }) {
  const isActive = pathname === href;
  return (
    <Link href={href} className={`flex items-center space-x-1 ${isActive ? "text-blue-500 font-bold" : "text-black hover:text-blue-500"}`}>
      {icon}
      <span>{label}</span>
    </Link>
  );
}

// Componente para Dropdown
function NavDropdown({ icon, label, items, pathname }: { icon: ReactNode; label: string; items: { label: string; href: string }[]; pathname: string }) {
  const isActive = items.some((item) => pathname === item.href);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={`flex items-center space-x-1 ${isActive ? "text-blue-500 font-bold" : "text-black hover:text-blue-500"}`}>
        {icon}
        <span>{label}</span>
        <ChevronDown size={16} className="ml-1" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {items.map((item, index) => (
          <DropdownMenuItem key={index}>
            <Link href={item.href} className={pathname === item.href ? "text-blue-500 font-bold" : ""}>
              {item.label}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
