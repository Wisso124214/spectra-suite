import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import toast from 'react-hot-toast';
import { toastStyles } from '../../config';
import { SERVER_URL } from '../../config';
import { useState, useEffect } from 'react';
import {
  validatePassword,
  validateConfirmPassword,
} from '@/utils/validator/validator.tsx';
import { useNavigate } from 'react-router-dom';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorPassword, setErrorPassword] = useState('');
  const [errorConfirmPassword, setErrorConfirmPassword] = useState('');
  const [token, setToken] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
      setToken(token);
    }
  }, []);

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (errorPassword || errorConfirmPassword) {
      toast.error(
        'Por favor, corrija los errores antes de continuar.',
        toastStyles
      );
      return;
    }
    fetch(SERVER_URL + '/resetPassword', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        password,
        confirmPassword,
        token,
      }),
    })
      .then((res) => res.json())
      .then((response) => {
        if (!response.errorCode) {
          toast.success(
            response.message ||
              'Su contraseña ha sido reestablecida exitosamente. Por favor inicie sesión de nuevo para continuar.',
            toastStyles
          );
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        } else {
          toast.error(
            response.message || 'Hubo un error inesperado, intente de nuevo.',
            toastStyles
          );
        }
      })
      .catch(() => {
        toast.error(
          'Lo sentimos. Hubo un error inesperado. Por favor, intente más tarde.',
          toastStyles
        );
      });
  };

  return (
    <div className='flex items-center justify-center h-screen w-full'>
      <Card className='w-full max-w-sm'>
        <CardHeader className='text-left'>
          <CardTitle>Reestablezca su contraseña</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleResetPassword}
            className='w-full max-h-[50vh] overflow-y-auto pr-4'
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'var(--primary-color) transparent',
            }}
          >
            <div className='flex flex-col gap-6'>
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
              <div className='mt-2'>
                <Button type='submit' className='w-full'>
                  Reestablecer contraseña
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
