import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomSidebar, {
  Layout,
  type MenuItem,
} from "../components/sidebar/sidebar";
import { SERVER_URL } from "../../config";
import type { MenuItem as MenuItemType } from "../components/sidebar/sidebar";

// Dummy fallback (usa éste mientras backend no está listo)
const DUMMY_SESSION_DATA = {
  username: "usuario123",
  profile: "admin",
  subsystems: [
    {
      name: "Gestión",
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
  ],
};

type BackendRow = {
  subsystem_id?: string;
  subsystem_name?: string;
  class_id?: string;
  class_name?: string;
  method_id?: string;
  method_name?: string;
};

// Convierte filas planas (resultado SQL) en MenuItem[]
function rowsToMenu(rows: BackendRow[]): MenuItem[] {
  const subsystemsMap = new Map<string, Map<string, MenuItem[]>>();

  for (const r of rows) {
    const subName = r.subsystem_name ?? "unknown";
    const className = r.class_name ?? "unknown";
    const methodName = r.method_name ?? "unnamed";

    if (!subsystemsMap.has(subName)) subsystemsMap.set(subName, new Map());
    const classesMap = subsystemsMap.get(subName)!;

    if (!classesMap.has(className)) classesMap.set(className, []);
    const methodsArr = classesMap.get(className)!;

    const url = `/${encodeURIComponent(subName)}/${encodeURIComponent(
      className
    )}/${encodeURIComponent(methodName)}`;
    methodsArr.push({ title: methodName, url, icon: "List" });
  }

  const result: MenuItem[] = [];
  for (const [subName, classesMap] of subsystemsMap.entries()) {
    const classChildren: MenuItem[] = [];
    for (const [className, methodsArr] of classesMap.entries()) {
      classChildren.push({
        title: className,
        children: methodsArr,
        icon: "GitBranch",
      });
    }
    result.push({ title: subName, children: classChildren, icon: "Home" });
  }

  return result;
}

export default function Home() {
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawResponse, setRawResponse] = useState<any | null>(null); // para mostrar JSON.stringify

  const navigate = useNavigate();

  useEffect(() => {
    // lee sessionStorage primero, luego localStorage
    const rawSaved =
      sessionStorage.getItem("userData") ?? localStorage.getItem("userData");
    const userData = rawSaved
      ? JSON.parse(rawSaved)
      : { isLoggedIn: false, profile: "", username: null };

    if (!userData.isLoggedIn) {
      navigate("/login");
      return;
    }

    setUsername(userData.username ?? null);

    const fetchMethods = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(SERVER_URL + "/toProcess", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tx: 2620,
            params: {
              profile: userData.profile ?? "participante", // pasa el perfil actual
            },
          }),
          credentials: "include",
        });

        const json = await res.json();
        setRawResponse(json.result); // mostramos crudo al usuario

        // 1) Si el backend responde con estructura jerárquica (result.security)
      } catch (err) {
        console.warn("Fetch to backend failed, using DUMMY. Error:", err);
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    if (userData?.profile) fetchMethods();
    else navigate("/login");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Layout defaultOpen={true}>
      <div className="flex h-screen">
        <CustomSidebar items={menuItems} />

        <main className="flex-1 p-6 overflow-auto">
          <h1 className="text-2xl font-bold">
            Bienvenido{username ? `, ${username}` : ""}
          </h1>

          {loading && <p className="mt-4">Cargando menú...</p>}
          {error && <p className="mt-4 text-red-600">Error: {error}</p>}

          <p className="mt-4">Contenido principal aqui...</p>

          <section className="mt-6">
            <h2 className="text-lg font-semibold">
              Respuesta cruda del backend
            </h2>
            <p className="text-sm text-muted-foreground">
              (Se muestra JSON.stringify de lo que devuelve el fetch)
            </p>
            <div className="mt-2">
              <pre className="max-h-96 overflow-auto border rounded p-3 bg-black/5">
                {rawResponse
                  ? JSON.stringify(rawResponse, null, 2)
                  : "No hay respuesta aún"}
              </pre>
            </div>
          </section>
        </main>
      </div>
    </Layout>
  );
}
