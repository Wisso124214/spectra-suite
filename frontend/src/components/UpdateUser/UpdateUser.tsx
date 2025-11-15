import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from '@/components/ui/field';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from '@/components/ui/command';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Table, TableHeader, TableHead, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import React from 'react';
import { User } from 'lucide-react';
import toast from 'react-hot-toast';
import { toastStyles, SERVER_URL } from '../../../config'; // ajusta path

// Tipos
type UserItem = {
  id: number;
  username: string;
  profile: string;
  email?: string;
};

export default function ManageUsers({ Title }: { Title: string }) {
  // datos (puedes cargar con fetch en useEffect)
  const [data, setData] = useState<UserItem[]>([
    { id: 1, username: 'usuario1', profile: 'admin', email: 'u1@mail' },
    { id: 2, username: 'usuario2', profile: 'participante', email: 'u2@mail' },
    { id: 3, username: 'usuario3', profile: 'invitado', email: 'u3@mail' },
  ]);

  // estado del CommandDialog (buscar usuarios)
  const [open, setOpen] = useState(false);

  // estado del usuario seleccionado para editar
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);

  // campos del formulario (controlados)
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // opcional: si vacío no se actualiza
  const [selectedPerfil, setSelectedPerfil] = useState<string | null>(null);

  // errores (puedes integrar tus validadores)
  const [errorUsername, setErrorUsername] = useState('');
  const [errorEmail, setErrorEmail] = useState('');

  // perfiles de ejemplo (puede venir por props)
  const perfiles = ['admin', 'participante', 'invitado'];

  // Al seleccionar del CommandDialog: prefillea los campos y cierra el dialog
  function handleSelectForEdit(item: UserItem) {
    setSelectedUser(item);
    setUsername(item.username ?? '');
    setEmail(item.email ?? '');
    setSelectedPerfil(item.profile ?? null);
    setPassword(''); // contraseña en blanco por seguridad
    setOpen(false);
    // limpiar errores previos
    setErrorEmail('');
    setErrorUsername('');
  }

  // limpiar formulario y selección
  const handleClear = () => {
    setSelectedUser(null);
    setUsername('');
    setEmail('');
    setPassword('');
    setSelectedPerfil(null);
    setErrorUsername('');
    setErrorEmail('');
  };

  // eliminar usuario (simula con estado local; sustituir por API)
  const handleDelete = async () => {
    if (!selectedUser) {
      toast.error('Selecciona un usuario primero', toastStyles);
      return;
    }
    if (!confirm(`¿Eliminar ${selectedUser.username}?`)) return;

    // si tu API: await fetch(`${SERVER_URL}/users/${selectedUser.id}`, { method: 'DELETE' })
    setData((prev) => prev.filter((d) => d.id !== selectedUser.id));
    toast.success('Usuario eliminado', toastStyles);
    handleClear();
  };

  // actualizar usuario (PUT). Si password vacío, no lo mandamos.
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) {
      toast.error('Selecciona un usuario para actualizar', toastStyles);
      return;
    }

    // validaciones simples (puedes usar tus validadores async)
    if (!username.trim()) {
      setErrorUsername('El username no puede quedar vacío');
      toast.error('Corrige los errores', toastStyles);
      return;
    }
    if (!email.trim()) {
      setErrorEmail('El email no puede quedar vacío');
      toast.error('Corrige los errores', toastStyles);
      return;
    }

    const payload: any = {
      username,
      email,
      profile: selectedPerfil,
    };
    if (password.trim()) payload.password = password;

    try {
      // ejemplo: llamar a tu API. Ajusta endpoint/respuesta
      const res = await fetch(`${SERVER_URL}/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!res.ok) {
        toast.error(json.message || 'Error actualizando usuario', toastStyles);
        return;
      }

      // actualizar state local con la nueva info (si tu API retorna el usuario actualizado, úsalo)
      setData((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id
            ? { ...u, username, email, profile: selectedPerfil ?? u.profile }
            : u
        )
      );

      toast.success(json.message || 'Usuario actualizado', toastStyles);
      // opcional: mantener seleccionado o limpiar
      setSelectedUser((s) =>
        s ? { ...s, username, email, profile: selectedPerfil ?? s.profile } : s
      );
      setPassword(''); // limpiar contraseña por seguridad
    } catch (err) {
      toast.error('Error actualizando usuario', toastStyles);
    }
  };

  // hotkey para abrir dialog (Cmd/Ctrl + K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <div
      className='w-full max-w-md p-4 border rounded-md bg-background z-10 
    max-h-[80vh] overflow-y-auto pr-4'
    >
      <form onSubmit={handleUpdate} noValidate>
        <FieldSet>
          <FieldDescription>{Title}</FieldDescription>

          <FieldGroup className='grid grid-cols-2 gap-4'>
            {/* Username */}
            <Field>
              <FieldLabel htmlFor='username'>Username</FieldLabel>
              <Input
                id='username'
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (e.target.value.trim()) setErrorUsername('');
                }}
                placeholder='Username'
                className='w-full'
              />
              {errorUsername && (
                <p className='text-sm text-red-500'>{errorUsername}</p>
              )}
            </Field>

            {/* Profile select */}
            <Field>
              <FieldLabel>Perfil</FieldLabel>
              <Select
                value={selectedPerfil ?? undefined}
                onValueChange={(v) => {
                  setSelectedPerfil(v);
                }}
              >
                <SelectTrigger className='w-[180px]'>
                  <SelectValue placeholder='Selecciona perfil' />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Perfiles</SelectLabel>
                    {perfiles.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            {/* Email (ocupa 2 columnas) */}
            <Field className='col-span-2'>
              <FieldLabel htmlFor='email'>Email</FieldLabel>
              <Input
                id='email'
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (e.target.value.trim()) setErrorEmail('');
                }}
                placeholder='email@dominio.com'
                className='w-full'
              />
              {errorEmail && (
                <p className='text-sm text-red-500'>{errorEmail}</p>
              )}
            </Field>

            {/* Password (nuevo valor opcional) */}
            <Field className='col-span-2'>
              <FieldLabel htmlFor='password'>
                Nueva contraseña (opcional)
              </FieldLabel>
              <Input
                id='password'
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder='Dejar vacío para no cambiar'
                className='w-full'
              />
            </Field>
          </FieldGroup>

          {/* CommandDialog: buscar usuario a editar */}
          <FieldGroup className='mt-4'>
            <CommandDialog open={open} onOpenChange={setOpen}>
              <CommandInput placeholder='Buscar usuario...' />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading='Usuarios'>
                  {data.map((item) => (
                    <CommandItem
                      key={item.id}
                      onSelect={() => handleSelectForEdit(item)}
                    >
                      <User className='mr-2' />
                      <span>{item.username}</span>
                      <CommandShortcut>{item.profile}</CommandShortcut>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </CommandDialog>
          </FieldGroup>

          {/* Tabla resumen del usuario seleccionado */}
          <FieldGroup className='mt-4'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead className='text-right'>Profile</TableHead>
                </TableRow>
              </TableHeader>
              <tbody>
                {selectedUser ? (
                  <TableRow key={selectedUser.id}>
                    <TableHead>{selectedUser.username}</TableHead>
                    <TableHead className='text-right'>
                      {selectedUser.profile}
                    </TableHead>
                  </TableRow>
                ) : (
                  <tr>
                    <td
                      colSpan={2}
                      className='py-4 text-center text-sm text-muted-foreground'
                    >
                      No hay usuario seleccionado
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </FieldGroup>

          {/* Botones: Abrir buscador / Actualizar / Eliminar / Limpiar */}
          <FieldGroup className='grid grid-cols-4 gap-2 mt-4'>
            <Button type='button' onClick={() => setOpen(true)}>
              Buscar
            </Button>
            <Button
              type='submit'
              className='col-span-1'
              disabled={!selectedUser}
            >
              Actualizar
            </Button>
            <Button
              type='button'
              variant='destructive'
              onClick={handleDelete}
              disabled={!selectedUser}
            >
              Eliminar
            </Button>
            <Button type='button' variant='outline' onClick={handleClear}>
              Limpiar
            </Button>
          </FieldGroup>
        </FieldSet>
      </form>
    </div>
  );
}
