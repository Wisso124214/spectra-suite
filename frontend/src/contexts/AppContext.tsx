import React, { createContext, useEffect, useState } from 'react';
import { SERVER_URL } from '../../config';
import toast from 'react-hot-toast';
import { toastStyles } from '../../config';
import { useNavigate } from 'react-router-dom';

export type User = {
  id?: string;
  username?: string;
  email?: string;
  profile?: string;
} | null;

export type AppContextType = {
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  userData: User;
  setUserData: (u: User) => void;
  fetchToProcess?: (fetchData: FetchData) => Promise<Response>;
  handleLogout?: () => Promise<void>;
};

type FetchData = {
  tx: number;
  params: string;
};

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [userData, setUserData] = useState<User>(null);

  const fetchToProcess: (fetchData: FetchData) => Promise<Response> = async (
    fetchData: FetchData | undefined
  ) => {
    let response: Response;
    console.log(
      JSON.stringify(
        {
          tx: fetchData?.tx,
          params: JSON.parse(fetchData?.params || '{}'),
        },
        null,
        2
      )
    );
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
      const userData = data?.userData || null;
      const newUserData = {
        ...(userData?.activeProfile ? { profile: userData.activeProfile } : {}),
        ...(userData?.username ? { username: userData.username } : {}),
      };
      setUserData(newUserData);
      return response;
    } catch (error) {
      console.error('Error fetching toProcess:', error);
      throw error;
    }
  };

  async function handleLogout() {
    console.log('Logging out user...');
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
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;
