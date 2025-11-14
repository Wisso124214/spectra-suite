import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomSidebar from '../components/CustomSidebar/CustomSidebar';
import { Layout } from '@/components/ui/layout';
import { SERVER_URL } from '../../config';
import { type MenuData } from '../components/CustomSidebar/CustomSidebar';
// import CreateUser from '../components/CreateUser/CreateUser';
import DeleteUser from '@/components/DeleteUser/DeleteUser';
// import UpdateUser from '@/components/UpdateUser/UpdateUser';
import useAppContext from '@/hooks/useAppContext';

export default function Home() {
  // MenuData ya está definido como MenuItem[] en CustomSidebar
  const [menuData, setMenuData] = useState<MenuData>([]);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawResponse, setRawResponse] = useState<unknown | null>(null); // para mostrar JSON.stringify

  const navigate = useNavigate();
  const { userData } = useAppContext();

  useEffect(() => {
    // use AppContext userData instead of session/local storage
    if (!userData) {
      navigate('/login');
      return;
    }

    setUsername(userData.username ?? null);

    const fetchMenus = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(SERVER_URL + '/toProcess', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tx: 2620,
            params: {
              profile: userData.profile ?? 'participante', // pasa el perfil actual
            },
          }),
          credentials: 'include',
        });

        const json = await res.json();
        setMenuData(json.result || []);
        setRawResponse(json.result);
        console.log(json.userData);

        // 1) Si el backend responde con estructura jerárquica (result.security)
      } catch (err) {
        console.warn('Fetch to backend failed, using DUMMY. Error:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    if (userData?.profile) fetchMenus();
    else navigate('/login');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="flex-1 p-6 overflow-auto">
        <h1 className="text-2xl font-bold">
          Bienvenido{username ? `, ${username}` : ''}
        </h1>

        {loading && <p className="mt-4">Cargando menú...</p>}
        {error && <p className="mt-4 text-red-600">Error: {error}</p>}

        <p className="mt-4">Contenido principal aqui...</p>
        {/* <CreateUser Title={'Crear Usuario'} /> */}
        <DeleteUser Title={'Eliminar Usuario'} />
        {/* <UpdateUser Title={'Actualizar Usuario'} /> */}

        <section className="mt-6">
          <h2 className="text-lg font-semibold">Respuesta cruda del backend</h2>
          <p className="text-sm text-muted-foreground">
            (Se muestra JSON.stringify de lo que devuelve el fetch)
          </p>
          <div className="mt-2">
            <pre className="max-h-96 overflow-auto border rounded p-3 bg-black/5">
              {rawResponse
                ? JSON.stringify(rawResponse, null, 2)
                : 'No hay respuesta aún'}
            </pre>
          </div>
        </section>
      </div>
      <div className="absolute z-12 bg-red-500 w-0">
        <Layout defaultOpen={true}>
          <CustomSidebar data={menuData} />
        </Layout>
      </div>
    </>
  );
}
