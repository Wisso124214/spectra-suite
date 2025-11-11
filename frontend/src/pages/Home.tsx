import { useEffect, useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";
import CustomSidebar from "../components/sidebar/sidebar";
import type { MenuItem } from "../components/sidebar/sidebar";

// --- Dummy data ---
const DUMMY_SESSION_DATA = {
  username: "usuario123",
  profile: "admin",
  subsystems: [
    {
      name: "Gestion",
      menu: {
        Usuarios: [
          { id: "u1", title: "Listar usuarios", url: "/users" },
          { id: "u2", title: "Crear usuario", url: "/users/new" },
        ],
        Roles: [
          { id: "r1", title: "Listar roles", url: "/roles" },
          { id: "r2", title: "Crear rol", url: "/roles/new" },
        ],
      },
    },
    {
      name: "Operaciones",
      menu: {
        Pedidos: [
          { id: "p1", title: "Todos los pedidos", url: "/orders" },
          { id: "p2", title: "Crear pedido", url: "/orders/new" },
        ],
        Inventario: [{ id: "i1", title: "Stock", url: "/stock" }],
      },
    },
  ],
};

function buildMenuFromSession(
  sessionData: typeof DUMMY_SESSION_DATA
): MenuItem[] {
  const items: MenuItem[] = [];
  for (const subsystem of sessionData.subsystems) {
    const children: MenuItem[] = [];
    for (const submenuKey of Object.keys(subsystem.menu) as Array<
      keyof typeof subsystem.menu
    >) {
      const methods = subsystem.menu[submenuKey];
      if (!methods) continue;
      const methodChildren: MenuItem[] = methods.map((m) => ({
        title: m.title,
        url: m.url,
        icon: "List",
      }));
      children.push({
        title: submenuKey,
        children: methodChildren,
        icon: "GitBranch",
      });
    }
    items.push({
      title: subsystem.name,
      children,
      icon: "Home",
    });
  }
  return items;
}

export default function Home() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [username, setUsername] = useState<string | null>(null);
  const navigate = useNavigate();

  const saved = sessionStorage.getItem("userData");
  const userData = saved ? JSON.parse(saved) : { isLoggedIn: false };

  if (!userData.isLoggedIn) {
    navigate("/login");
  }

  //   useEffect(() => {
  //     const fetchMenu = async () => {
  //       try {
  //         // Llamada al backend
  //         const res = await fetch("/toProccess", {
  //           method: "POST",
  //           headers: { "Content-Type": "application/json" },
  //           body: JSON.stringify({
  //             tx: 401,
  //             params: {
  //               nameQuery: "getMenusOptionsProfile",
  //               params: { profile_name: "Bustos" },
  //             },
  //           }),
  //           credentials: "include",
  //         });

  //         if (!res.ok) throw new Error("Error al cargar el menú");

  //         const data = await res.json();

  //         // Aquí debes transformar 'data' al formato de MenuItem[]
  //         const builtMenu = buildMenuFromSession(data);
  //         setMenuItems(builtMenu);

  //         // Opcional: guardar username si viene del backend
  //         setUsername(data.username ?? userData.username);
  //       } catch (error) {
  //         console.error("Error cargando menú:", error);
  //       }
  //     };

  //     fetchMenu();
  //   }, []);

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <aside className="w-64 border-r">
          <CustomSidebar items={menuItems} />
        </aside>

        <main className="flex-1 p-6">
          <h1 className="text-2xl font-bold">
            Bienvenido{username ? `, ${username}` : ""}
          </h1>
          <p className="mt-4">Contenido principal aqui...</p>
        </main>
      </div>
    </SidebarProvider>
  );
}
