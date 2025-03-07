"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ReactNode } from "react";
import { Home, Armchair, ShoppingBag, LineChart, BadgePercent, Settings, Bell } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  interface IMenuItem {
    label:string;
    href: string;
}
const itemsInventario : IMenuItem[]= [
    {
    label: "Productos",
    href:  "/productos",
    },
    {label: "Recuento de Stock",
    href: "/recuento",
    },
]
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
        label: "Consultas",
        href: "/consultas",
    },
]
const itemsDescuentos: IMenuItem[] = [
    {
        label: "Reglas",
        href: "/reglas"
    },
    {
        label: "Solicitudes",
        href: "/solicitudes"
    },
]
const itemsAjustes: IMenuItem[] = [
    {
        label: "Roles",
        href: "/roles"
    },
    {
        label: "Usuarios",
        href: "/usuarios"
    },
    {
        label: "Zonas de Envio",
        href: "/zonasenvio"
    },
    {
        label: "Categorias",
        href: "/categorias"
    },
    {
        label: "Sede",
        href: "/sede"
    },
]
  const pathname = usePathname();

  return (
    <nav className="bg-green-300 p-4 flex items-center justify-between">
      {/* Sección Izquierda */}
      <div className="flex space-x-6">
        <NavItem href="/" icon={<Home size={20} />} label="Inicio" pathname={pathname} />
        <NavDropdown icon={<Armchair size={20} />} label="Productos" items={itemsInventario} pathname={pathname} />
        <NavDropdown icon={<ShoppingBag size={20} />} label="Ventas" items={itemsVentas} pathname={pathname} />
        <NavItem href="/prediccion" icon={<LineChart size={20} />} label="Prediccion" pathname={pathname} />
        <NavDropdown icon={<BadgePercent />} label="Descuentos" items={itemsDescuentos} pathname={pathname} />
        <NavDropdown icon={<Settings size={20} />} label="Ajustes" items={itemsAjustes} pathname={pathname} />
      </div>

      {/* Sección Derecha */}
      <div className="flex items-center space-x-4">
        <Bell size={20} className="cursor-pointer" />
        <Button className="bg-blue-500 text-white">Cerrar Sesión</Button>
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
