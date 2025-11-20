import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import toast from 'react-hot-toast';
import { SERVER_URL } from '../../config';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toastStyles } from '../../config';
import useAppContext from '@/hooks/useAppContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [profileSelected, setProfileSelected] = useState('');
  const navigate = useNavigate();
  const { setUserData, userData, setIsShowingPopup, setChildrenPopup } =
    useAppContext();

  useEffect(() => {
    setProfileSelected(userData?.profile || '');
  }, [userData]);

  useEffect(() => {
    if (profileSelected) {
      handleProfileSelected(`Bienvenido ${profileSelected}, ${username}.`);
    }
  }, [profileSelected]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleProfileSelected = async (message = '') => {
    setIsShowingPopup(false);
    toast.success(message || 'Inicio de sesión exitoso.', toastStyles);

    if (!userData?.profile) {
      await fetch(SERVER_URL + '/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
          activeProfile: profileSelected,
        }),
        credentials: 'include',
      })
        .then((res) => res.json())
        .then(async (response) => {
          if (!response.errorCode) {
            const newUserData = { ...userData, ...response.userData };
            if (newUserData?.activeProfile)
              newUserData.profile = newUserData.activeProfile;

            setUserData(newUserData);
            setTimeout(() => {
              navigate('/home');
            }, 1000);
          } else {
            toast.error(
              response.message ||
                'Error del servidor. Intente de nuevo más tarde.',
              toastStyles
            );
          }
        })
        .catch(async () => {
          toast.error(
            'Error al obtener datos del usuario. Por favor, intente más tarde.',
            toastStyles
          );
        });
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await fetch(SERVER_URL + '/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
      }),
      credentials: 'include',
    })
      .then((res) => res.json())
      .then(async (response) => {
        if (!response.errorCode) {
          if (response.profiles && response.profiles.length > 1) {
            setIsShowingPopup(true);
            setChildrenPopup(getChildrenPopup(response.profiles));
          } else {
            const data = await response.json();
            const userData = data?.userData || null;
            const newUserData = {
              ...(userData?.activeProfile
                ? { profile: userData.activeProfile }
                : {}),
              ...(userData?.username ? { username: userData.username } : {}),
            };
            setUserData(newUserData);
            setProfileSelected(response.userData?.activeProfile || null);
            setTimeout(() => {
              navigate('/home');
            }, 1000);
          }
        } else {
          toast.error(
            response.message || 'Usuario o contraseña incorrectos.',
            toastStyles
          );
        }
      })
      .catch(() => {
        toast.error(
          'Error en el inicio de sesión. Por favor, intente más tarde.',
          toastStyles
        );
      });
  };

  const getChildrenPopup = (profiles: string[]) => {
    return (
      <>
        <h1 className='text-lg font-bold text-foreground'>
          Seleccione a continuación su perfil:
        </h1>
        <Select onValueChange={setProfileSelected}>
          <SelectTrigger className='min-w-[200px] capitalize'>
            <SelectValue placeholder='Seleccione un perfil' />
          </SelectTrigger>
          <SelectContent>
            {profiles.map((profile) => (
              <SelectItem key={profile} value={profile} className='capitalize'>
                {profile}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </>
    );
  };

  return (
    <div className='flex items-center justify-center h-screen w-full'>
      <Card className='w-full max-w-sm'>
        <CardHeader className='text-left'>
          <CardTitle>Iniciar sesión</CardTitle>
          <CardDescription>
            Ingrese su nombre de usuario para iniciar sesión en su cuenta
          </CardDescription>
          <CardAction>
            <Button onClick={() => navigate('/signup')} variant='link'>
              Registrarse
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className='flex flex-col gap-6'>
              <div className='grid gap-2'>
                <Label htmlFor='username'>Nombre de usuario</Label>
                <Input
                  id='username'
                  type='text'
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder='usuario123'
                  required
                />
              </div>
              <div className='grid gap-2'>
                <div className='flex items-center'>
                  <Label htmlFor='password'>Contraseña</Label>
                  <a
                    href='/forgot-password'
                    className='ml-auto inline-block text-sm underline-offset-4 hover:underline'
                  >
                    Olvidó su contraseña?
                  </a>
                </div>
                <Input
                  id='password'
                  type='password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder='•••••••••••'
                  required
                />
              </div>
            </div>
            <div className='mt-6 flex flex-col gap-2'>
              <Button type='submit' className='w-full'>
                Iniciar sesión
              </Button>
              <Button variant='outline' className='w-full'>
                Iniciar sesión con Google
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
