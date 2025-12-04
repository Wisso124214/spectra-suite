// EventList.tsx
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
} from '@/components/ui/command';
import { Table, TableHeader, TableHead, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { toastStyles, SERVER_URL } from '../../../config';

type EventItem = {
  id: number;
  name: string;
  descripcion?: string;
  fecha?: string; // ISO string from backend
  hora?: string; // e.g. "12:12:00"
  costo?: number;
  capacidad?: number;
  visibilidad?: string;
  lugar?: string;
};

export default function ListEvents({ Title }: { Title: string }) {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selected, setSelected] = useState<EventItem | null>(null);
  const [query, setQuery] = useState('');
  const [refreshToken, setRefreshToken] = useState(0);

  // fetch events
  useEffect(() => {
    let mounted = true;
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${SERVER_URL}/toProcess`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            nameQuery: 'listEvents',
            params: {},
          }),
        });
        const json = await res.json().catch(() => null);
        if (!mounted) return;

        // Normalize response -> items array
        let items: any[] = [];
        if (Array.isArray(json)) items = json;
        else if (Array.isArray(json.rows)) items = json.rows;
        else if (Array.isArray(json.result)) items = json.result;
        else if (Array.isArray(json.data)) items = json.data;
        else if (json && Array.isArray(json.result?.rows))
          items = json.result.rows;
        else {
          const maybeArray = json?.result ?? json?.rows ?? json?.data;
          if (Array.isArray(maybeArray)) items = maybeArray;
        }

        // If still no array, error
        if (!Array.isArray(items)) {
          throw new Error('Respuesta inválida del servidor al listar eventos');
        }

        // Normalize each item to EventItem
        const normalized: EventItem[] = items.map((it) => ({
          id: Number(it.id),
          name: String(it.name ?? it.Title ?? 'Sin nombre'),
          descripcion: it.descripcion ?? it.description ?? '',
          fecha: it.fecha ? String(it.fecha) : '',
          hora: it.hora ? String(it.hora) : '',
          costo: typeof it.costo !== 'undefined' ? Number(it.costo) : 0,
          capacidad:
            typeof it.capacidad !== 'undefined' ? Number(it.capacidad) : 0,
          visibilidad: it.visibilidad ?? it.visibility ?? '',
          lugar: it.lugar ?? it.location ?? '',
        }));

        setEvents(normalized);
      } catch (err: any) {
        console.error('Error fetching events', err);
        setError(err?.message ?? 'Error cargando eventos');
        toast.error('Error cargando eventos', toastStyles);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
    return () => {
      mounted = false;
    };
  }, [refreshToken]);

  // filtered list by search query
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return events;
    return events.filter(
      (e) =>
        (e.name ?? '').toLowerCase().includes(q) ||
        (e.descripcion ?? '').toLowerCase().includes(q) ||
        (e.lugar ?? '').toLowerCase().includes(q)
    );
  }, [events, query]);

  // helpers
  const formatDate = (iso?: string) => {
    if (!iso) return '';
    try {
      // some backends return ISO with timezone; create Date and format yyyy-mm-dd
      const d = new Date(iso);
      if (isNaN(d.getTime())) return iso.split('T')[0] ?? iso;
      return d.toISOString().slice(0, 10);
    } catch {
      return iso.split('T')[0] ?? iso;
    }
  };

  const openDetails = (ev: EventItem) => {
    setSelected(ev);
    setOpenDialog(true);
  };

  const handleRefresh = () => setRefreshToken((t) => t + 1);

  return (
    <div className="w-full max-w-4xl p-4 border rounded-md bg-background">
      <FieldSet>
        <FieldDescription>{Title ?? 'Lista de eventos'}</FieldDescription>

        <FieldGroup className="flex gap-2 items-center mb-4">
          <Input
            placeholder="Buscar por nombre, descripción o lugar..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleRefresh}>Recargar</Button>
        </FieldGroup>

        {loading ? (
          <div className="py-8 text-center">Cargando eventos…</div>
        ) : error ? (
          <div className="py-4 text-center text-red-600">Error: {error}</div>
        ) : filtered.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No hay eventos.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Evento</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Costo</TableHead>
                <TableHead className="text-right">Capacidad</TableHead>
                <TableHead className="text-right">Visibilidad</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <tbody>
              {filtered.map((ev) => (
                <TableRow key={ev.id}>
                  <td className="py-2 px-3">{ev.name}</td>
                  <td className="py-2 px-3">{formatDate(ev.fecha)}</td>
                  <td className="py-2 px-3 text-right">{ev.costo ?? 0}</td>
                  <td className="py-2 px-3 text-right">{ev.capacidad ?? 0}</td>
                  <td className="py-2 px-3 text-right">{ev.visibilidad}</td>
                  <td className="py-2 px-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <Button onClick={() => openDetails(ev)}>Ver</Button>
                      {/* Placeholders: reemplaza por navegación o abrir edit/delete */}
                      <Button
                        variant="outline"
                        onClick={() => {
                          // ejemplo: navegar a la vista de edición
                          window.location.href = `/events/edit/${ev.id}`;
                        }}
                      >
                        Editar
                      </Button>
                    </div>
                  </td>
                </TableRow>
              ))}
            </tbody>
          </Table>
        )}

        {/* Detalle en CommandDialog (puedes cambiar por un Modal real) */}
        <CommandDialog open={openDialog} onOpenChange={setOpenDialog}>
          <CommandInput placeholder="Detalle del evento (cerrar para salir)" />
          <CommandList>
            <CommandEmpty>No seleccionado</CommandEmpty>
            <CommandGroup heading="Detalle">
              {selected ? (
                <CommandItem onSelect={() => setOpenDialog(false)}>
                  <div className="w-full">
                    <h3 className="font-semibold">{selected.name}</h3>
                    <p className="text-sm mt-2">{selected.descripcion}</p>
                    <div className="text-sm mt-2">
                      <div>
                        <strong>Fecha:</strong> {formatDate(selected.fecha)}{' '}
                        {selected.hora ?? ''}
                      </div>
                      <div>
                        <strong>Costo:</strong> {selected.costo ?? 0}
                      </div>
                      <div>
                        <strong>Capacidad:</strong> {selected.capacidad ?? 0}
                      </div>
                      <div>
                        <strong>Visibilidad:</strong> {selected.visibilidad}
                      </div>
                      <div>
                        <strong>Lugar:</strong> {selected.lugar}
                      </div>
                    </div>
                  </div>
                </CommandItem>
              ) : null}
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      </FieldSet>
    </div>
  );
}
