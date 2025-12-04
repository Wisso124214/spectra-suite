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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { toastStyles, SERVER_URL } from '../../../config';

type EventItem = {
  id: number;
  name: string;
  descripcion: string;
  fecha: string;
  hora: string;
  costo: number;
  capacidad: number;
  visibilidad: string;
  lugar: string;
};

export default function UpdateEvent({ Title }: { Title: string }) {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  const [name, setName] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [costo, setCosto] = useState(0);
  const [capacidad, setCapacidad] = useState(0);
  const [visibilidad, setVisibilidad] = useState<string | null>(null);
  const [lugar, setLugar] = useState('');

  const visibilidades = ['publico', 'privado'];

  // Fetch de eventos
  useEffect(() => {
    const fetchEvents = async () => {
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
        const json = await res.json();
        console.log('Datos de entrada', json);
        if (Array.isArray(json.result)) {
          setEvents(json.result); // ahora events es un array
        } else {
          setEvents([]);
          toast.error('No se obtuvieron eventos válidos', toastStyles);
        }
      } catch (err) {
        toast.error('Error cargando eventos', toastStyles);
      }
    };
    fetchEvents();
  }, []);

  const handleSelectEvent = (event: EventItem) => {
    setSelectedEvent(event);
    setName(event.name);
    setDescripcion(event.descripcion);
    setFecha(event.fecha);
    setHora(event.hora);
    setCosto(event.costo);
    setCapacidad(event.capacidad);
    setVisibilidad(event.visibilidad);
    setLugar(event.lugar);
  };

  const handleClear = () => {
    setSelectedEvent(null);
    setName('');
    setDescripcion('');
    setFecha('');
    setHora('');
    setCosto(0);
    setCapacidad(0);
    setVisibilidad(null);
    setLugar('');
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) {
      toast.error('Selecciona un evento primero', toastStyles);
      return;
    }

    const payload = {
      name,
      descripcion,
      fecha,
      hora,
      costo,
      capacidad,
      visibilidad: visibilidad ?? '',
      lugar,
      id: selectedEvent.id,
    };
    try {
      const res = await fetch(SERVER_URL + '/toProcess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          nameQuery: 'updateEvent',
          params: payload,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.message || 'Error actualizando evento', toastStyles);
        return;
      }
      toast.success(json.message || 'Evento actualizado', toastStyles);

      setEvents((prevEvents) =>
        prevEvents.map((ev) =>
          ev.id === selectedEvent.id ? { ...ev, ...payload } : ev
        )
      );
      handleClear();
    } catch (err) {
      toast.error('Error actualizando evento', toastStyles);
    }
  };

  return (
    <div className="w-full max-w-md p-4 border rounded-md bg-background">
      <form onSubmit={handleUpdate} noValidate>
        <FieldSet>
          <FieldDescription>{Title}</FieldDescription>

          <FieldGroup className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Evento</FieldLabel>
              <Select
                value={selectedEvent?.id?.toString() ?? undefined}
                onValueChange={(v) => {
                  const ev = events.find((e) => e.id.toString() === v);
                  if (ev) handleSelectEvent(ev);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un evento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Eventos</SelectLabel>
                    {events.map((ev) => (
                      <SelectItem key={ev.id} value={ev.id.toString()}>
                        {ev.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            {/* Nombre del evento */}
            <Field>
              <FieldLabel>Nombre</FieldLabel>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </Field>

            {/* Descripción */}
            <Field className="col-span-2">
              <FieldLabel>Descripción</FieldLabel>
              <Input
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />
            </Field>

            <Field>
              <FieldLabel>Fecha</FieldLabel>
              <Input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
              />
            </Field>

            <Field>
              <FieldLabel>Hora</FieldLabel>
              <Input
                type="time"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
              />
            </Field>

            <Field>
              <FieldLabel>Costo</FieldLabel>
              <Input
                type="number"
                value={costo}
                onChange={(e) => setCosto(parseFloat(e.target.value))}
              />
            </Field>

            <Field>
              <FieldLabel>Capacidad</FieldLabel>
              <Input
                type="number"
                value={capacidad}
                onChange={(e) => setCapacidad(parseInt(e.target.value))}
              />
            </Field>

            <Field>
              <FieldLabel>Visibilidad</FieldLabel>
              <Select
                value={visibilidad ?? undefined}
                onValueChange={setVisibilidad}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona visibilidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {visibilidades.map((v) => (
                      <SelectItem key={v} value={v}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel>Lugar</FieldLabel>
              <Input value={lugar} onChange={(e) => setLugar(e.target.value)} />
            </Field>
          </FieldGroup>

          <FieldGroup className="grid grid-cols-3 gap-2 mt-4">
            <Button type="submit" disabled={!selectedEvent}>
              Actualizar
            </Button>
            <Button type="button" variant="destructive" onClick={handleClear}>
              Limpiar
            </Button>
          </FieldGroup>
        </FieldSet>
      </form>
    </div>
  );
}
