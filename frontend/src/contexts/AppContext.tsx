import React, { createContext, useState } from 'react';
import { SERVER_URL } from '../../config';
import toast from 'react-hot-toast';
import { toastStyles } from '../../config';
import { useNavigate } from 'react-router-dom';
import Loader from '@/components/Loader/Loader';

export type User = {
  id?: string;
  username?: string;
  email?: string;
  profile?: string;
} | null;

type FetchData = {
  tx: number;
  params: string;
};

export type ChangeProfileResponse = BasicResponseToProcess & {
  userData?: User;
  result: {
    message?: string;
    rows?: { profile_name: string }[];
  };
};

export type BasicResponseToProcess = {
  ok: boolean;
  errorCode?: number;
  message?: string;
  result: any;
};

export type AppContextType = {
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  userData: User;
  setUserData: (u: User) => void;
  fetchToProcess?: (fetchData: FetchData) => Promise<Response>;
  handleLogout?: () => Promise<void>;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (v: boolean) => void;
  isShowingPopup: boolean;
  setIsShowingPopup: (v: boolean) => void;
  childrenPopup: React.ReactNode;
  setChildrenPopup: (v: React.ReactNode) => void;
  contentHome: React.ReactNode;
  setContentHome: (v: React.ReactNode) => void;
};

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [userData, setUserData] = useState<User>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isShowingPopup, setIsShowingPopup] = useState(false);
  const [childrenPopup, setChildrenPopup] = useState<React.ReactNode>(null);
  const [contentHome, setContentHome] = useState<React.ReactNode>(null);

  const fetchToProcess: (fetchData: FetchData) => Promise<Response> = async (
    fetchData: FetchData | undefined
  ) => {
    let response: Response;
    try {
      response = await fetch(`${SERVER_URL}/toProcess`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tx: fetchData?.tx || -1,
          params: JSON.parse(fetchData?.params || '{}'),
        }),
        credentials: 'include',
      }).then((res) => res);
      const data = await response.json();

      const newUserData = data?.userData || null;
      if (newUserData?.activeProfile)
        newUserData.profile = newUserData.activeProfile;

      setUserData((prevUserData) => ({ ...prevUserData, ...newUserData }));
      return data;
    } catch (error) {
      console.error('Error fetching toProcess:', error);
      throw error;
    }
  };

  async function handleLogout() {
    await fetch(`${SERVER_URL}/logout`, {
      method: 'GET',
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((res) => {
        if (!res.errorCode) {
          toast.success('Sesión cerrada con éxito.', toastStyles);
          setUserData(null);
          setTimeout(() => {
            navigate('/login');
          }, 1000);
        } else {
          toast.error(res.message || 'Error al cerrar sesión.', toastStyles);
        }
      });
  }

  return (
    <AppContext.Provider
      value={{
        sidebarOpen,
        setSidebarOpen,
        userData,
        setUserData,
        fetchToProcess,
        handleLogout,
        isSidebarOpen,
        setIsSidebarOpen,
        isShowingPopup,
        setIsShowingPopup,
        childrenPopup,
        setChildrenPopup,
        contentHome,
        setContentHome,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;
