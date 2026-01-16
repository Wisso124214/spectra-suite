import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomSidebar from '@/components/CustomSidebar';
import { Layout } from '@/components/ui/layout';
import { SERVER_URL } from '../../config';
import { type MenuData } from '@/components/CustomSidebar/CustomSidebar';
import CreateUser from '@/components/CreateUser';
import DeleteUser from '@/components/DeleteUser';
import UpdateUser from '@/components/UpdateUser';
import useAppContext from '@/hooks/useAppContext';
import Loader from '@/components/Loader/Loader';
import CreateEvent from '@/components/CreateEvent';
import UpdateEvent from '@/components/UpdateEvent';
import DeleteEvent from '@/components/DeleteEvent';
import ListEvents from '@/components/ListEvent';

const testSubmenu = [
  {
    title: 'Usuarios',
    icon: 'User',
    children: [
      {
        title: 'Crear Usuario',
        url: '/tx/3001',
        icon: 'UserPlus',
        children: [
          {
            title: 'Crear Usuario Admin',
            url: '/tx/4001',
            icon: 'ShieldCheck',
          },
          {
            title: 'Crear Usuario Normal',
            url: '/tx/4002',
            icon: 'UserCircle',
          },
          {
            title: 'Crear Usuario Invitado',
            url: '/tx/4003',
            icon: 'UserPlus',
            children: [
              {
                title: 'Crear Invitado Temporal',
                url: '/tx/5001',
                icon: 'Clock',
              },
              {
                title: 'Crear Invitado Permanente',
                url: '/tx/5002',
                icon: 'Infinity',
              },
              {
                title: 'Crear Invitado Restringido',
                url: '/tx/5003',
                icon: 'Lock',
                children: [
                  {
                    title: 'Crear Invitado Restringido por Tiempo',
                    url: '/tx/6001',
                    icon: 'Timer',
                  },
                  {
                    title: 'Crear Invitado Restringido por Funciones',
                    url: '/tx/6002',
                    icon: 'Function',
                  },
                  {
                    title: 'Crear Invitado Restringido por Ubicación',
                    url: '/tx/6003',
                    icon: 'MapPin',
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        title: 'Eliminar Usuario',
        url: '/tx/3002',
        icon: 'UserMinus',
      },
      {
        title: 'Actualizar Usuario',
        url: '/tx/3003',
        icon: 'UserCheck',
      },
    ],
  },
];

const menuComponents: Record<string, React.ReactNode> = {
  'Crear Usuario': <CreateUser Title={'Crear Usuario'} />,
  'Actualizar Usuario': <UpdateUser Title={'Actualizar Usuario'} />,
  'Eliminar Usuario': <DeleteUser Title={'Eliminar Usuario'} />,
  'Crear Evento': <CreateEvent Title={'Crear Evento'} />,
  'Actualizar Evento': <UpdateEvent Title={'Actualizar Evento'} />,
  'Eliminar Evento': <DeleteEvent Title={'Eliminar Evento'} />,
  'Listar Eventos': <ListEvents Title={'Lista de Eventos'} />,
};

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
  const { userData, isSidebarOpen, contentHome } = useAppContext();

  useEffect(() => {
    // Helper: transforma el objeto de seguridad del backend al arreglo MenuData esperado por el Sidebar
    const transformToMenuData = (securityObj: BackendSubsystem): MenuData => {
      if (!securityObj || typeof securityObj !== 'object')
        return [] as MenuData;

      // Utilidades locales para convertir "options" y "submenus"
      const mapOptions = (optionsObj?: Record<string, BackendOption>) => {
        if (!optionsObj || typeof optionsObj !== 'object')
          return [] as MenuData;

        return Object.entries(optionsObj).map(([optTitle]) => ({
          title: optTitle,
          icon: 'List',
          component: menuComponents[optTitle] || null,
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

      const newMenuData = [...transformed, ...testSubmenu];
      if (JSON.stringify(menuData) !== JSON.stringify(newMenuData))
        setMenuData(newMenuData);
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
          'flex flex-col p-0 m-0 mt-20 justify-center items-center w-full h-full overflow-auto ' +
          (isSidebarOpen ? 'md:ml-72 mr-0 md:w-[calc(100vw-290px)] ' : '')
        }
      >
        {contentHome || <Loader className='mb-35' />}
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
