import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Home as HomeIcon, List, GitBranch } from "lucide-react";
import { AppSidebar as DemoAppSidebar } from "@/components/ui/app-sidebar"; // opcional demo
import { Link } from "react-router-dom";

export type MenuItem = {
  title: string;
  url?: string;
  icon?: string; // clave de icono (p. ej. "Home" o "List")
  children?: MenuItem[];
  defaultOpen?: boolean;
};

// mapa simple de icon keys -> componentes lucide
const iconMap: Record<string, React.ElementType> = {
  Home: HomeIcon,
  List,
  GitBranch,
};

// render recursivo: soporta niveles arbitrarios
function renderMenuItem(item: MenuItem): React.ReactNode {
  if (item.children && item.children.length > 0) {
    return (
      <SidebarGroup key={item.title}>
        <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {item.children.map((child) => renderMenuItem(child))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  return (
    <SidebarMenuItem key={item.title}>
      <SidebarMenuButton asChild>
        {/* usamos Link para navegación SPA */}
        <Link to={item.url ?? "#"} className="flex items-center gap-2">
          {item.icon &&
            React.createElement(iconMap[item.icon] ?? HomeIcon, {
              className: "w-4 h-4",
            })}
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export default function CustomSidebar({ items }: { items: MenuItem[] }) {
  return (
    <Sidebar>
      <SidebarHeader>Menu</SidebarHeader>

      <SidebarContent>
        {/* Si no hay items, mostramos un grupo vacío (evita crash) */}
        {items.length === 0 ? (
          <SidebarGroup>
            <SidebarGroupLabel>Sin opciones</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu />
            </SidebarGroupContent>
          </SidebarGroup>
        ) : (
          items.map((it) => renderMenuItem(it))
        )}
      </SidebarContent>
    </Sidebar>
  );
}

/**
 * Layout helper: envuelve SidebarProvider y coloca SidebarTrigger en main
 * Usa defaultOpen prop si quieres que desde el inicio esté abierto
 */
export function Layout({
  children,
  defaultOpen = true,
}: {
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      {/* opcional: DemoAppSidebar si quieres mostrar bloques estáticos */}
      <DemoAppSidebar />
      <main>
        <SidebarTrigger />{" "}
        {/* botón para abrir/cerrar, shadcn muestra atajo y trigger */}
        {children}
      </main>
    </SidebarProvider>
  );
}
