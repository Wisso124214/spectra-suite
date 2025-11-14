import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomSidebar from '../components/CustomSidebar/CustomSidebar';
import { Layout } from '@/components/ui/layout';
import { SERVER_URL } from '../../config';
import { type MenuData } from '../components/CustomSidebar/CustomSidebar';
import CreateUser from '../components/CreateUser/CreateUser';
import useAppContext from '@/hooks/useAppContext';

// Tipos del backend (estructura de seguridad)
type BackendOption = { description?: string; id?: number; tx?: number };
type BackendMenuNode = {
  description?: string;
  id?: number;
  options?: Record<string, BackendOption>;
  submenus?: Record<string, BackendMenuNode>;
};
type BackendSubsystem = Record<string, BackendMenuNode>;

type MenuBySubsystem = Record<string, BackendSubsystem>;

export default function Home() {
  const [menuData, setMenuData] = useState<MenuData>([]);
  const [rawData, setRawData] = useState<MenuBySubsystem>({});
  const [subsystems, setSubsystems] = useState<string[]>([]);

  const defaultSubsystem = 'subsistema...';
  const [subsystemSelected, setSubsystemSelected] =
    useState<string>(defaultSubsystem);

  const navigate = useNavigate();
  const { userData, isSidebarOpen } = useAppContext();

  useEffect(() => {
    // Helper: transforma el objeto de seguridad del backend al arreglo MenuData esperado por el Sidebar
    const transformToMenuData = (securityObj: BackendSubsystem): MenuData => {
      if (!securityObj || typeof securityObj !== 'object')
        return [] as MenuData;

      // Utilidades locales para convertir "options" y "submenus"
      const mapOptions = (optionsObj?: Record<string, BackendOption>) => {
        if (!optionsObj || typeof optionsObj !== 'object')
          return [] as MenuData;
        return Object.entries(optionsObj).map(([optTitle, optVal]) => ({
          title: optTitle,
          // Si viene tx generamos una url simbólica, de lo contrario dejamos '#'
          url: optVal?.tx ? `/tx/${optVal.tx}` : '#',
          icon: 'List',
        }));
      };

      const topLevelItems: MenuData = Object.entries(securityObj).map(
        ([groupTitle, groupVal]) => {
          const children: MenuData = [];

          // 1) Opciones directas en el grupo
          if (groupVal?.options) {
            children.push(...mapOptions(groupVal.options));
          }

          // 2) Submenús anidados
          if (groupVal?.submenus && typeof groupVal.submenus === 'object') {
            Object.entries(groupVal.submenus).forEach(
              ([submenuTitle, submenuVal]) => {
                const submenuChildren = mapOptions(submenuVal?.options);
                children.push({
                  title: submenuTitle,
                  icon: 'GitBranch',
                  children: submenuChildren,
                });
              }
            );
          }

          return {
            title: groupTitle,
            icon: 'Home',
            children,
          };
        }
      );

      return topLevelItems;
    };

    if (rawData && Object.keys(rawData).length > 0 && subsystems.length === 0) {
      setSubsystems(Object.keys(rawData));
    }
    if (subsystems.length > 0 && !subsystemSelected) {
      setSubsystemSelected(defaultSubsystem);
    }
    if (
      subsystems.length > 0 &&
      subsystemSelected &&
      subsystemSelected !== defaultSubsystem
    ) {
      // El backend devuelve una estructura jerárquica por subsistema.
      // La transformamos al arreglo MenuData que consume el Sidebar.
      const securityForSubsystem = rawData[subsystemSelected] as
        | BackendSubsystem
        | undefined;
      const transformed = transformToMenuData(
        securityForSubsystem ?? ({} as BackendSubsystem)
      );
      if (JSON.stringify(menuData) !== JSON.stringify(transformed))
        setMenuData(transformed);
    }
  }, [rawData, subsystems, subsystemSelected, menuData]);

  useEffect(() => {
    // use AppContext userData instead of session/local storage
    if (!userData) {
      navigate('/login');
      return;
    }

    const fetchMenus = async () => {
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
        setRawData((json.result as MenuBySubsystem) || {});
        // 1) Si el backend responde con estructura jerárquica (result.security)
      } catch (err) {
        console.warn('Error:', err);
      }
    };

    if (userData?.profile) fetchMenus();
    else navigate('/login');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData]);

  return (
    <>
      <div
        className={
          'flex flex-col p-6 gap-10 justify-center items-center ' +
          (isSidebarOpen ? 'ml-60 w-[calc(100vw-360px)] ' : 'w-full')
        }
      >
        <CreateUser Title={'Crear Usuario'} />
        {/* <DeleteUser Title={'Eliminar Usuario'} /> */}
        {/* <UpdateUser Title={'Actualizar Usuario'} /> */}
      </div>
      <div className='absolute z-12 w-0'>
        <Layout defaultOpen={true}>
          <CustomSidebar
            data={menuData}
            subsystems={subsystems}
            subsystemSelected={subsystemSelected}
            setSubsystemSelected={setSubsystemSelected}
            defaultSubsystem={defaultSubsystem}
          />
        </Layout>
      </div>
    </>
  );
}
