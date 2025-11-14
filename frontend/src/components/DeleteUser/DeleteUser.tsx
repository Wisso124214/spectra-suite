import {
  Field,
  FieldDescription,
  FieldGroup,
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
import { Table, TableHeader, TableHead, TableRow } from '@/components/ui/table';
import { useState } from 'react';
import React from 'react';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';

type UserItem = { id: number; username: string; profile: string };

export default function DeleteUser({ Title }: { Title: string }) {
  const [data, setData] = useState<UserItem[]>([
    { id: 1, username: 'usuario1', profile: 'admin' },
    { id: 2, username: 'usuario2', profile: 'participante' },
    { id: 3, username: 'usuario3', profile: 'invitado' },
  ]);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const [markedForDelete, setMarkedForDelete] = useState<number[]>([]);

  const [open, setOpen] = React.useState(false);

  const openDialog = () => setOpen(true);

  const handleClear = () => {
    setSelectedIds([]);
    setMarkedForDelete([]);
  };

  // toggle selección desde el CommandDialog (no cerramos el dialog para permitir multi-select)
  function handleToggleSelect(id: number) {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      return [...prev, id];
    });
  }

  // toggle marcado para borrado en la tabla
  function toggleMarkForDelete(id: number) {
    setMarkedForDelete((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  // borrar los items marcados (simulación local)
  function handleDeleteMarked() {
    if (markedForDelete.length === 0) return;
    if (!confirm(`¿Eliminar ${markedForDelete.length} usuario(s)?`)) return;

    setData((prev) =>
      prev.filter((item) => !markedForDelete.includes(item.id))
    );
    // también limpiar selecciones relacionadas
    setSelectedIds((prev) =>
      prev.filter((id) => !markedForDelete.includes(id))
    );
    setMarkedForDelete([]);
  }

  // lista de objetos seleccionados (para mostrar en la tabla)
  const selectedItems = data.filter((d) => selectedIds.includes(d.id));

  // helper para seleccionar todo en dialog (opcional)
  const selectAll = () => setSelectedIds(data.map((d) => d.id));

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <div
      className="w-full max-w-md p-4 border rounded-md bg-background z-10 
    max-h-[80vh] overflow-y-auto pr-4"
    >
      <FieldSet>
        <FieldDescription>{Title}</FieldDescription>
        <FieldGroup>
          <Field>
            <CommandDialog open={open} onOpenChange={setOpen}>
              <CommandInput placeholder="Type a command or search..." />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Suggestions">
                  {data.map((item) => {
                    const checked = selectedIds.includes(item.id);
                    return (
                      <CommandItem
                        key={item.id}
                        onSelect={() => handleToggleSelect(item.id)}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          readOnly
                          className="mr-2 h-4 w-4"
                          // detener el foco para que no dispare el onSelect del CommandItem extra
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleSelect(item.id);
                          }}
                        />
                        <User className="mr-2" />
                        <span>{item.username}</span>
                        <CommandShortcut>{item.profile}</CommandShortcut>
                        {/* indicador a la derecha */}
                        {checked && <span className="ml-auto text-sm">✓</span>}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>

                <CommandGroup heading="Actions">
                  <CommandItem
                    onSelect={() => {
                      selectAll(); /* no cerramos */
                    }}
                  >
                    <User />
                    <span>Seleccionar todo</span>
                    <CommandShortcut>⌘A</CommandShortcut>
                  </CommandItem>
                  <CommandItem
                    onSelect={() => {
                      setSelectedIds([]);
                    }}
                  >
                    Limpiar selección
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </CommandDialog>
          </Field>

          {/* Tabla que muestra los items seleccionados y permite marcar para eliminación */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">User</TableHead>
                <TableHead className="text-right">Profile</TableHead>
                <TableHead className="text-right">Borrar?</TableHead>
              </TableRow>
            </TableHeader>

            <tbody>
              {selectedItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="py-4 text-center text-sm text-muted-foreground"
                  >
                    No hay usuarios seleccionados
                  </td>
                </tr>
              ) : (
                selectedItems.map((q) => (
                  <TableRow key={q.id}>
                    <TableHead>{q.username}</TableHead>
                    <TableHead className="text-right">{q.profile}</TableHead>
                    <TableHead className="text-right">
                      <input
                        type="checkbox"
                        checked={markedForDelete.includes(q.id)}
                        onChange={() => toggleMarkForDelete(q.id)}
                      />
                    </TableHead>
                  </TableRow>
                ))
              )}
            </tbody>
          </Table>
        </FieldGroup>
        <FieldGroup className="grid grid-cols-3 gap-4">
          <Button onClick={openDialog} className="col-span-1 w-[100px]">
            Buscar
          </Button>

          {/* Borrar los marcados en la tabla */}
          <Button
            onClick={handleDeleteMarked}
            className="col-span-1 w-[100px]"
            disabled={markedForDelete.length === 0}
          >
            Eliminar ({markedForDelete.length})
          </Button>

          <Button onClick={handleClear} className="col-span-1 w-[100px]">
            Limpiar
          </Button>
        </FieldGroup>
      </FieldSet>
    </div>
  );
}
