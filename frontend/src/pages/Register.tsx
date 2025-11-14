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
import { toastStyles } from '../../config';
import { SERVER_URL } from '../../config';
import { useState } from 'react';
import {
  validateUsername,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
} from '@/utils/validator/validator.tsx';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [errorUsername, setErrorUsername] = useState('');
  const [errorEmail, setErrorEmail] = useState('');
  const [errorPassword, setErrorPassword] = useState('');
  const [errorConfirmPassword, setErrorConfirmPassword] = useState('');

  const navigate = useNavigate();
  // Context disponible si se requiere en el futuro

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (errorUsername || errorEmail || errorPassword || errorConfirmPassword) {
      toast.error(
        'Por favor, corrija los errores antes de continuar.',
        toastStyles
      );
      return;
    }
    fetch(SERVER_URL + '/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
        email,
        confirmPassword,
      }),
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((response) => {
        if (!response.errorCode) {
          toast.success(
            response.message || 'Inicio de sesión exitoso.',
            toastStyles
          );
          localStorage.setItem(
            'userData',
            JSON.stringify({ isLoggedIn: true })
          );
          setTimeout(() => {
            navigate('/home');
          }, 2000);
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
          <CardTitle>Registrarse</CardTitle>
          <CardDescription>
            Ingrese sus datos para crear una cuenta
          </CardDescription>
          <CardAction>
            <Button onClick={() => navigate('/login')} variant='link'>
              Login
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className='w-full'>
            <div
              className='flex flex-col gap-6 max-h-[50vh] overflow-y-auto pr-4'
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'var(--primary-color) transparent',
              }}
            >
              <div className='grid gap-2'>
                <Label htmlFor='username'>Nombre de usuario</Label>
                <Input
                  id='username'
                  type='text'
                  value={username}
                  onChange={async (e) => {
                    const value = e.target.value;
                    setUsername(value);
                    const error = await validateUsername(value);
                    setErrorUsername(error);
                  }}
                  placeholder='usuario123'
                  required
                />
                {errorUsername !== '' && (
                  <span className='text-destructive text-sm font-semibold'>
                    {errorUsername}
                  </span>
                )}
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='email'>Correo electrónico</Label>
                <Input
                  id='email'
                  type='email'
                  value={email}
                  onChange={async (e) => {
                    const value = e.target.value;
                    setEmail(value);
                    const error = await validateEmail(value);
                    setErrorEmail(error);
                  }}
                  placeholder='usuario@ejemplo.com'
                  required
                />
                {errorEmail !== '' && (
                  <span className='text-destructive text-sm font-semibold'>
                    {errorEmail}
                  </span>
                )}
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='password'>Contraseña</Label>
                <Input
                  id='password'
                  type='password'
                  value={password}
                  onChange={(e) => {
                    const value = e.target.value;
                    setPassword(value);
                    const error = validatePassword(value);
                    setErrorPassword(error);
                  }}
                  placeholder='•••••••••••'
                  required
                />
                {errorPassword !== '' && (
                  <span className='text-destructive text-sm font-semibold'>
                    {errorPassword}
                  </span>
                )}
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='confirm-password'>Confirmar contraseña</Label>
                <Input
                  id='confirm-password'
                  type='password'
                  value={confirmPassword}
                  onChange={(e) => {
                    const value = e.target.value;
                    setConfirmPassword(value);
                    const error = validateConfirmPassword(password, value);
                    setErrorConfirmPassword(error);
                  }}
                  placeholder='•••••••••••'
                  required
                />
                {errorConfirmPassword !== '' && (
                  <span className='text-destructive text-sm font-semibold'>
                    {errorConfirmPassword}
                  </span>
                )}
              </div>
            </div>
            <div className='mt-6 flex flex-col gap-2'>
              <Button type='submit' className='w-full'>
                Registrarse
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
