import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { toastStyles, SERVER_URL } from '../../../config';
import useAppContext from '@/hooks/useAppContext';
import {
  type BasicResponseToProcess,
  type User,
} from '../../contexts/AppContext';

type ChangeProfileResponse = BasicResponseToProcess & {
  userData?: User;
  result: {
    message?: string;
    rows?: { profile_name: string }[];
  };
};

export default function ChangeProfile() {
  const {
    setUserData,
    fetchToProcess,
    userData,
    setIsShowingPopup,
    isShowingPopup,
    setChildrenPopup,
  } = useAppContext();

  const [selectedProfile, setSelectedProfile] = useState(
    userData?.profile || ''
  );
  const [activeProfile, setActiveProfile] = useState(userData?.profile || '');

  useEffect(() => {
    if (userData && userData.profile) {
      setActiveProfile(userData.profile || '');
    }
  }, [userData]);

  useEffect(() => {
    if (
      isShowingPopup &&
      selectedProfile &&
      selectedProfile !== activeProfile
    ) {
      handleProfileSelected();
    }
  }, [isShowingPopup, selectedProfile]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleProfileSelected = async () => {
    setIsShowingPopup(false);
    setChildrenPopup(<></>);

    await fetch(SERVER_URL + '/changeProfile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: userData?.username,
        activeProfile: selectedProfile,
      }),
      credentials: 'include',
    })
      .then((res) => res.json())
      .then(async (data) => {
        if (data.ok) {
          const newUserData = { ...userData, ...data.userData };

          if (newUserData?.activeProfile)
            newUserData.profile = newUserData.activeProfile;

          setUserData(newUserData);
          toast.success(
            data.result.message ||
              `Perfil cambiado con éxito, ${selectedProfile}.`,
            toastStyles
          );
        } else {
          toast.error(
            data.result.message ||
              'Error del servidor. Intente de nuevo más tarde.',
            toastStyles
          );
        }
      })
      .catch(() => {
        toast.error(
          'Lo sentimos, ocurrió un error inesperado al cambiar el perfil. Por favor, intente más tarde.',
          toastStyles
        );
      });
  };

  useEffect(() => {
    if (isShowingPopup) {
      // Limpiar la selección previa para que no se auto-confirme inmediatamente
      setSelectedProfile('');
      fetchToProcess!({
        tx: 2621,
        params: JSON.stringify({
          username: userData?.username,
        }),
      })
        .then((res) => res as unknown as ChangeProfileResponse)
        .then(async (data) => {
          if (data.ok) {
            const profiles = (data.result ?? []).map(
              (row: { profile_name: string }) => row.profile_name
            );
            setChildrenPopup(
              getChildrenPopup({
                activeProfile,
                profilesState: profiles,
                setSelectedProfile,
              })
            );
          } else {
            console.error('Error fetching user profiles');
            toast.error(
              'No se pudieron cargar los perfiles. Por favor, intente de nuevo.',
              toastStyles
            );
          }
        })
        .catch(() => {
          console.error('Error fetching user profiles');
          toast.error(
            'No se pudieron cargar los perfiles. Por favor, intente de nuevo.',
            toastStyles
          );
        });
    }
  }, [isShowingPopup]); // eslint-disable-line react-hooks/exhaustive-deps

  const getChildrenPopup = ({
    activeProfile,
    profilesState,
    setSelectedProfile,
  }: {
    activeProfile: string | null;
    profilesState: string[];
    setSelectedProfile: (profile: string) => void;
  }) => {
    return (
      <>
        <h1 className='text-lg font-bold text-foreground'>
          Seleccione a continuación su perfil:
        </h1>
        <Select
          onValueChange={setSelectedProfile}
          defaultValue={activeProfile || ''}
        >
          <SelectTrigger className='min-w-[200px] capitalize'>
            <SelectValue placeholder='Seleccione un perfil' />
          </SelectTrigger>
          <SelectContent>
            {profilesState.map((profile) => (
              <SelectItem key={profile} value={profile} className='capitalize'>
                {profile}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </>
    );
  };

  return <></>;
}
