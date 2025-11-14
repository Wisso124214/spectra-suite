import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  validateUsername,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
} from '@/utils/validator/validator.tsx';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { toastStyles } from '../../../config';
import { SERVER_URL } from '../../../config';

export default function CreateUser({
  Title,
  perfil,
}: {
  Title?: string;
  perfil?: string[];
}) {
  const title = Title ? Title : 'Default Menu Title';
  perfil = perfil ? perfil : ['administrador', 'participante', 'invitado'];

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [selectedPerfil, setSelectedPerfil] = useState<string | null>(null);

  const [errorUsername, setErrorUsername] = useState('');
  const [errorEmail, setErrorEmail] = useState('');
  const [errorPassword, setErrorPassword] = useState('');
  const [errorConfirmPassword, setErrorConfirmPassword] = useState('');
  const [errorPerfil, setErrorPerfil] = useState('');

  const handleClear = () => {
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setEmail('');
    setSelectedPerfil(null);

    // Limpia también los errores
    setErrorUsername('');
    setErrorEmail('');
    setErrorPassword('');
    setErrorConfirmPassword('');
    setErrorPerfil('');
  };

  const runValidateUsername = async (value: string) => {
    const err = await validateUsername(value);
    setErrorUsername(
      err || (value.trim() === '' ? 'El username no puede estar vacío' : '')
    );
    return err;
  };

  const runValidateEmail = async (value: string) => {
    const err = await validateEmail(value);
    setErrorEmail(
      err || (value.trim() === '' ? 'El email no puede estar vacío' : '')
    );
    return err;
  };

  const runValidatePassword = (value: string) => {
    const err = validatePassword(value);
    setErrorPassword(
      err || (value.trim() === '' ? 'La contraseña no puede estar vacía' : '')
    );
    // también re-evaluar confirmPassword cuando cambie la password
    const errConfirm = validateConfirmPassword(value, confirmPassword);
    setErrorConfirmPassword(
      errConfirm ||
        (confirmPassword.trim() === '' ? 'Confirma la contraseña' : '')
    );
    return err;
  };

  const runValidateConfirmPassword = (value: string) => {
    const err = validateConfirmPassword(password, value);
    setErrorConfirmPassword(
      err || (value.trim() === '' ? 'Confirma la contraseña' : '')
    );
    return err;
  };

  const validatePerfilSelected = () => {
    if (!selectedPerfil) {
      setErrorPerfil('Selecciona un perfil');
      return 'Selecciona un perfil';
    }
    setErrorPerfil('');
    return null;
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // validar todos los campos antes de enviar
    const vUser = await runValidateUsername(username);
    const vEmail = await runValidateEmail(email);
    const vPass = runValidatePassword(password);
    const vConfirm = runValidateConfirmPassword(confirmPassword);
    const vPerfil = validatePerfilSelected();

    const hasError =
      Boolean(vUser) ||
      Boolean(vEmail) ||
      Boolean(vPass) ||
      Boolean(vConfirm) ||
      Boolean(vPerfil) ||
      username.trim() === '' ||
      email.trim() === '' ||
      password.trim() === '' ||
      confirmPassword.trim() === '';

    if (hasError) {
      toast.error(
        'Por favor, corrija los errores antes de continuar.',
        toastStyles
      );
      return;
    }

    try {
      console.log('data:', username, email, password, selectedPerfil);

      const res = await fetch(SERVER_URL + '/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
          email,
          confirmPassword,
          perfil: selectedPerfil,
        }),
        credentials: 'include',
      });

      const response = await res.json();
      if (!response.errorCode) {
        toast.success(response.message || 'Registro exitoso.', toastStyles);
        // opcional: limpiar el formulario
        setUsername('');
        setPassword('');
        setConfirmPassword('');
        setEmail('');
        setSelectedPerfil(null);
      } else {
        toast.error(response.message || 'Error al registrar.', toastStyles);
      }
    } catch (err) {
      toast.error(
        'Error en el registro. Por favor, intente más tarde.',
        toastStyles
      );
      console.error('Error en el registro:', err);
    }
  };

  return (
    <div
      className="w-[70vw] max-w-md p-4 border rounded-md bg-background z-10 
    max-h-[80vh] overflow-y-auto pr-4"
    >
      <form onSubmit={handleRegister} noValidate>
        <FieldSet>
          <FieldDescription>{title}</FieldDescription>

          <FieldGroup className="grid grid-cols-2 gap-4">
            <Field className="col-span-1">
              <FieldLabel htmlFor="username">Username</FieldLabel>
              <Input
                id="username"
                type="text"
                placeholder="Max Leiter"
                className="w-full"
                value={username}
                aria-invalid={!!errorUsername}
                onBlur={async (e) => await runValidateUsername(e.target.value)}
                onChange={async (e) => {
                  const value = e.target.value;
                  setUsername(value);
                  // validación en tiempo real
                  await runValidateUsername(value);
                }}
              />
              {errorUsername ? (
                <p className="mt-1 text-sm text-red-500" role="alert">
                  {errorUsername}
                </p>
              ) : null}
            </Field>

            <Field className="col-span-1">
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="w-full"
                value={password}
                aria-invalid={!!errorPassword}
                onChange={(e) => {
                  const value = e.target.value;
                  setPassword(value);
                  runValidatePassword(value);
                }}
                onBlur={() => runValidatePassword(password)}
              />
              {errorPassword ? (
                <p className="mt-1 text-sm text-red-500" role="alert">
                  {errorPassword}
                </p>
              ) : null}
            </Field>

            <Field className="col-span-1">
              <FieldLabel htmlFor="confirm-password">
                Confirm password
              </FieldLabel>
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                className="w-full"
                value={confirmPassword}
                aria-invalid={!!errorConfirmPassword}
                onChange={(e) => {
                  const value = e.target.value;
                  setConfirmPassword(value);
                  runValidateConfirmPassword(value);
                }}
                onBlur={() => runValidateConfirmPassword(confirmPassword)}
              />
              {errorConfirmPassword ? (
                <p className="mt-1 text-sm text-red-500" role="alert">
                  {errorConfirmPassword}
                </p>
              ) : null}
            </Field>

            {/* Email (ocupa 2 columnas) */}
            <Field className="col-span-2">
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="email@dominio.com"
                className="w-full"
                value={email}
                aria-invalid={!!errorEmail}
                onChange={async (e) => {
                  const value = e.target.value;
                  setEmail(value);
                  await runValidateEmail(value);
                }}
                onBlur={async (e) => {
                  await runValidateEmail(e.target.value);
                }}
              />
              {errorEmail ? (
                <p className="mt-1 text-sm text-red-500" role="alert">
                  {errorEmail}
                </p>
              ) : null}
            </Field>
          </FieldGroup>

          <FieldGroup className="grid grid-cols-2 gap-4 mt-4 items-start">
            {/* Select control (controlado) */}
            <div>
              <FieldLabel className="mb-2 block">Selecciona perfil</FieldLabel>
              <Select
                onValueChange={(v) => {
                  setSelectedPerfil(v);
                  if (v) setErrorPerfil('');
                }}
                value={selectedPerfil ?? undefined}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Selecciona perfil" />
                </SelectTrigger>

                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Perfiles</SelectLabel>
                    {perfil?.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {errorPerfil ? (
                <p className="mt-1 text-sm text-red-500" role="alert">
                  {errorPerfil}
                </p>
              ) : null}
            </div>

            <Field
              orientation="responsive"
              className="col-span-2 mt-2 flex gap-2 grid grid-cols-2"
            >
              <Button type="submit" className="w-[60px]">
                Crear
              </Button>
              <Button type="button" variant="outline" onClick={handleClear}>
                limpiar
              </Button>
            </Field>
          </FieldGroup>
        </FieldSet>
      </form>
    </div>
  );
}
