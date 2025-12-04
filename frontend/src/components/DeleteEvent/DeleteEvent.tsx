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
import { useEffect, useState } from 'react';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import { toastStyles, SERVER_URL } from '../../../config';

type EventItem = {
  id: number;
  name: string;
  descripcion?: string;
  fecha?: string;
  hora?: string;
  costo?: number;
  capacidad?: number;
  visibilidad?: string;
  lugar?: string;
};

export default function DeleteEvent({ Title }: { Title: string }) {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [markedForDelete, setMarkedForDelete] = useState<number[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Cargar eventos al montar
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${SERVER_URL}/toProcess`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            nameQuery: 'listEvents', // usa el nombre de tu query para listar
            params: {}, // no params
          }),
        });

        const json = await res.json();
        console.log('Datos de entrada eventos', json);

        // Aceptar varios formatos de respuesta
        let items: any[] = [];
        if (Array.isArray(json)) items = json;
        else if (Array.isArray(json.rows)) items = json.rows;
        else if (Array.isArray(json.result)) items = json.result;
        else if (Array.isArray(json.data)) items = json.data;
        else {
          // si el backend devuelve { ok: true, result: [...] }
          const maybeArray = json?.result ?? json?.rows ?? json?.data;
          if (Array.isArray(maybeArray)) items = maybeArray;
        }

        // Normalizar (asegurar id & name)
        const normalized = items.filter(Boolean).map((it) => ({
          id: Number(it.id),
          name: String(it.name ?? it.title ?? 'Sin nombre'),
          descripcion: it.descripcion ?? it.description ?? '',
          fecha: it.fecha ?? '',
          hora: it.hora ?? '',
          costo: it.costo ?? 0,
          capacidad: it.capacidad ?? 0,
          visibilidad: it.visibilidad ?? '',
          lugar: it.lugar ?? '',
        }));

        setEvents(normalized);
      } catch (error) {
        console.error('Error cargando eventos:', error);
        toast.error('Error cargando eventos', toastStyles);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleMarkForDelete = (id: number) => {
    setMarkedForDelete((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectAll = () => setSelectedIds(events.map((e) => e.id));
  const clearSelection = () => {
    setSelectedIds([]);
    setMarkedForDelete([]);
  };

  // Eliminar los marcados: realiza llamadas a la API y actualiza estado local
  const handleDeleteMarked = async () => {
    if (markedForDelete.length === 0) {
      toast('No hay elementos para eliminar', { icon: 'ℹ️' });
      return;
    }
    if (!confirm(`¿Eliminar ${markedForDelete.length} evento(s)?`)) return;

    setLoading(true);
    try {
      const promises = markedForDelete.map((id) =>
        fetch(`${SERVER_URL}/toProcess`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            nameQuery: 'deleteEvent',
            params: { id },
          }),
        }).then(async (res) => {
          const json = await res.json().catch(() => ({}));
          return { id, ok: res.ok, json };
        })
      );

      const results = await Promise.all(promises);

      const failed = results.filter((r) => !r.ok);
      if (failed.length > 0) {
        console.error('Fallaron eliminaciones:', failed);
        toast.error(
          `${failed.length} eliminación(es) fallaron. Revisa logs.`,
          toastStyles
        );
      }

      // Actualizar estado local eliminando los que se borraron correctamente
      const succeededIds = results.filter((r) => r.ok).map((r) => r.id);
      setEvents((prev) => prev.filter((e) => !succeededIds.includes(e.id)));
      setSelectedIds((prev) => prev.filter((id) => !succeededIds.includes(id)));
      setMarkedForDelete((prev) =>
        prev.filter((id) => !succeededIds.includes(id))
      );

      if (succeededIds.length > 0)
        toast.success(
          `${succeededIds.length} evento(s) eliminados`,
          toastStyles
        );
    } catch (err) {
      console.error('Error al eliminar eventos:', err);
      toast.error('Error eliminando eventos', toastStyles);
    } finally {
      setLoading(false);
    }
  };

  const selectedItems = events.filter((d) => selectedIds.includes(d.id));

  return (
    <div
      className="w-full max-w-md p-4 border rounded-md bg-background z-10 max-h-[80vh] overflow-y-auto pr-4"
      aria-busy={loading}
    >
      <FieldSet>
        <FieldDescription>{Title}</FieldDescription>
        <FieldGroup>
          <Field>
            <CommandDialog open={open} onOpenChange={setOpen}>
              <CommandInput placeholder="Buscar evento..." />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Eventos">
                  {events.map((item) => {
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
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleSelect(item.id);
                          }}
                        />
                        <User className="mr-2" />
                        <span>{item.name}</span>
                        <CommandShortcut>
                          {item.fecha ? item.fecha.split('T')[0] : ''}
                        </CommandShortcut>
                        {checked && <span className="ml-auto text-sm">✓</span>}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>

                <CommandGroup heading="Actions">
                  <CommandItem
                    onSelect={() => {
                      selectAll();
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

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Evento</TableHead>
                <TableHead className="text-right">Fecha</TableHead>
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
                    No hay eventos seleccionados
                  </td>
                </tr>
              ) : (
                selectedItems.map((q) => (
                  <TableRow key={q.id}>
                    <TableHead>{q.name}</TableHead>
                    <TableHead className="text-right">
                      {q.fecha ? q.fecha.split('T')[0] : ''}
                    </TableHead>
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

        <FieldGroup className="grid grid-cols-3 gap-4 mt-4">
          <Button
            onClick={() => setOpen(true)}
            className="col-span-1 w-[100px]"
          >
            Buscar
          </Button>

          <Button
            onClick={handleDeleteMarked}
            className="col-span-1 w-[100px]"
            disabled={markedForDelete.length === 0}
          >
            Eliminar ({markedForDelete.length})
          </Button>

          <Button onClick={clearSelection} className="col-span-1 w-[100px]">
            Limpiar
          </Button>
        </FieldGroup>
      </FieldSet>
    </div>
  );
}
