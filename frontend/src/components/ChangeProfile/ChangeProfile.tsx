import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { toastStyles } from '../../../config';
import useAppContext from '@/hooks/useAppContext';

export default function ChangeProfile({
  isPopupOpen = false,
  setIsPopupOpen,
}: {
  isPopupOpen: boolean;
  setIsPopupOpen: (isOpen: boolean) => void;
}) {
  const [profilesState, setProfilesState] = useState<string[]>([]);
  const { setUserData, fetchToProcess, userData } = useAppContext();
  const [selectedProfile, setSelectedProfile] = useState('');
  const [activeProfile, setActiveProfile] = useState(userData?.profile || '');

  useEffect(() => {
    if (userData && userData.profile) {
      setActiveProfile(userData.profile || '');
    }
  }, [userData]);

  useEffect(() => {
    console.log('selectedProfile', selectedProfile);
    if (isPopupOpen && selectedProfile && profilesState.length > 0) {
      handleProfileSelected(
        `Bienvenido ${selectedProfile}, ${userData?.username}.`
      );
    }
  }, [isPopupOpen, selectedProfile, profilesState]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleProfileSelected = async (message = '') => {
    setIsPopupOpen(false);
    toast.success(message || 'Inicio de sesión exitoso.', toastStyles);

    console.log('handleProfileSelected', selectedProfile);
    fetchToProcess!({
      tx: 2590,
      params: JSON.stringify({
        userData: {
          username: userData?.username,
          activeProfile: selectedProfile,
        },
      }),
    })
      .then(async (response) => {
        const data = await response.json();
        if (response.ok) {
          setUserData(data.userData);
          toast.success(
            data.result.message || 'Perfil cambiado con éxito.',
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
    console.log('profilesState', profilesState);
    if (isPopupOpen && profilesState.length === 0) {
      console.log('Fetching user profiles for', userData?.username);
      console.log('userData', userData);
      console.log('fetchToProcess', fetchToProcess);
      // const style = 'background-color: yellow; color: black; font-style: bold;';
      // console.log('%cThis message is styled!', style);
      fetchToProcess!({
        tx: 2580,
        params: JSON.stringify({
          nameQuery: 'getUserProfiles',
          params: {
            username: userData?.username,
          },
        }),
      })
        .then((res) => res.json())
        .then(async (response) => {
          if (response.ok) {
            const data = await response.json();
            console.log('----------------------');
            console.log('profiles fetched: ', data.result.rows);
            console.log('----------------------');
            const profiles = data.result.rows.map(
              (row: any) => row.profile_name
            );
            console.log('profiles mapped: ', profiles);
            setProfilesState(profiles || []);
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
  }, [isPopupOpen, profilesState]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    isPopupOpen &&
    profilesState &&
    profilesState.length > 0 && (
      <div className='w-full h-full bg-(--gray-background-translucent-light) absolute justify-center items-center flex '>
        <div className='flex flex-col bg-(--gray-background) w-100 h-55 rounded-lg p-6 gap-10 justify-center items-center shadow-[0_0_30px_var(--primary-color-translucent)]'>
          <h1 className='text-lg font-bold text-foreground'>
            Seleccione a continuación su perfil:
          </h1>
          <Select onValueChange={setSelectedProfile}>
            <SelectTrigger
              className='min-w-[200px] capitalize'
              value={selectedProfile || activeProfile}
            >
              <SelectValue placeholder='Seleccione un perfil' />
            </SelectTrigger>
            <SelectContent>
              {profilesState.map((profile) => (
                <SelectItem
                  key={profile}
                  value={profile}
                  className='capitalize'
                >
                  {profile}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    )
  );
}
