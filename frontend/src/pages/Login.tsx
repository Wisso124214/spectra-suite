import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import toast from 'react-hot-toast';
import { SERVER_URL } from '../../config';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toastStyles } from '../../config';
import Popup from '@/components/CustomPopup/Popup';
import useAppContext from '@/hooks/useAppContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [profiles, setProfiles] = useState([]);
  const [profileSelected, setProfileSelected] = useState('');
  const navigate = useNavigate();
  const { setUserData } = useAppContext();

  useEffect(() => {
    if (profileSelected) {
      handleProfileSelected(`Bienvenido ${profileSelected}, ${username}.`);
    }
  }, [profileSelected]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleProfileSelected = async (message = '') => {
    setIsPopupOpen(false);
    toast.success(message || 'Inicio de sesión exitoso.', toastStyles);

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
          const newUserData = {
            ...(profileSelected ? { profile: profileSelected } : {}),
            ...(username ? { username } : {}),
          };

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
            setProfiles(response.profiles);
            setIsPopupOpen(true);
          } else {
            handleProfileSelected(response.message);
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
      {isPopupOpen && (
        <Popup profiles={profiles} setProfileSelected={setProfileSelected} />
      )}
    </div>
  );
}
