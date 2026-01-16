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
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { toastStyles, SERVER_URL } from '../../../config';

type CreateEventProps = {
  Title?: string;
  perfil?: string[];
};

export default function CreateEvent({ Title, perfil }: CreateEventProps) {
  const title = Title ?? 'Crear Evento';
  perfil = perfil ?? ['privado', 'publico'];

  // campos
  const [eventName, setEventName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(''); // yyyy-mm-dd
  const [time, setTime] = useState(''); // HH:MM
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState<number | ''>('');
  const [visibility, setVisibility] = useState<string | null>(null);

  // nuevo: costo_entrada (string para mantener los decimales exactos en el input)
  const [costoEntrada, setCostoEntrada] = useState<string>('');

  // errores
  const [errName, setErrName] = useState('');
  const [errDate, setErrDate] = useState('');
  const [errCapacity, setErrCapacity] = useState('');
  const [errVisibility, setErrVisibility] = useState('');
  const [errCosto, setErrCosto] = useState('');

  const handleClear = () => {
    setEventName('');
    setDescription('');
    setDate('');
    setTime('');
    setLocation('');
    setCapacity('');
    setVisibility(null);
    setCostoEntrada('');

    setErrName('');
    setErrDate('');
    setErrCapacity('');
    setErrVisibility('');
    setErrCosto('');
  };

  const validateName = (v: string) => {
    if (!v || v.trim() === '') {
      setErrName('El título del evento no puede estar vacío');
      return 'El título del evento no puede estar vacío';
    }
    if (v.trim().length < 3) {
      setErrName('El título debe tener al menos 3 caracteres');
      return 'El título debe tener al menos 3 caracteres';
    }
    setErrName('');
    return null;
  };

  const validateDate = (d: string) => {
    if (!d) {
      setErrDate('Selecciona fecha del evento');
      return 'Selecciona fecha del evento';
    }
    const today = new Date();
    const selected = new Date(d + (time ? `T${time}:00` : 'T00:00:00'));
    if (!time) {
      selected.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
    }
    if (selected < today) {
      setErrDate('La fecha del evento no puede ser anterior a hoy');
      return 'La fecha del evento no puede ser anterior a hoy';
    }
    setErrDate('');
    return null;
  };

  const validateCapacity = (c: number | '') => {
    if (c === '') {
      setErrCapacity('');
      return null;
    }
    if (!Number.isInteger(c) || c <= 0) {
      setErrCapacity('La capacidad debe ser un número entero mayor que 0');
      return 'La capacidad debe ser un número entero mayor que 0';
    }
    setErrCapacity('');
    return null;
  };

  const validateVisibility = () => {
    if (!visibility) {
      setErrVisibility('Selecciona visibilidad');
      return 'Selecciona visibilidad';
    }
    setErrVisibility('');
    return null;
  };

  // validación costo_entrada (acepta decimales, con coma o punto)
  const validateCosto = (val: string) => {
    if (val === '' || val == null) {
      setErrCosto('');
      return null; // campo opcional
    }
    // Normalizar coma a punto
    const normalized = val.replace(',', '.').trim();
    // Permitimos 2 decimales como máximo
    if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
      setErrCosto('Formato inválido (ej: 12.50). Hasta 2 decimales.');
      return 'Formato inválido (ej: 12.50). Hasta 2 decimales.';
    }
    const num = parseFloat(normalized);
    if (Number.isNaN(num) || num < 0) {
      setErrCosto('El costo debe ser un número positivo');
      return 'El costo debe ser un número positivo';
    }
    setErrCosto('');
    return null;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const vName = validateName(eventName);
    const vDate = validateDate(date);
    const vCap = validateCapacity(capacity);
    const vVis = validateVisibility();
    const vCosto = validateCosto(costoEntrada);

    const hasError = Boolean(vName || vDate || vCap || vVis || vCosto);
    if (hasError) {
      toast.error('Corrige los errores antes de continuar', toastStyles);
      return;
    }

    // Preparar valores para la query: orderArray: ['name','descripcion','fecha','costo_entrada','lugar']
    // Convertir costoEntrada a number con 2 decimales o null
    const costoNormalized =
      costoEntrada && costoEntrada.trim() !== ''
        ? parseFloat(costoEntrada.replace(',', '.'))
        : null;

    // Fecha completa (si también envías hora)
    const fechaPayload = date ? (time ? `${date}T${time}:00` : date) : null;

    // enviamos como arreglo en el orden esperado por createEvento
    const paramsArray = [
      eventName.trim(),
      description.trim() || null,
      fechaPayload,
      time,
      costoNormalized,
      capacity === 10 ? null : capacity,
      visibility,
      location.trim() || null,
    ];

    try {
      const res = await fetch(SERVER_URL + '/toProcess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          nameQuery: 'createEvent',
          params: paramsArray,
        }),
      });

      const json = await res.json();
      if (!json.errorCode) {
        toast.success(
          json.message || 'Evento creado correctamente',
          toastStyles
        );
        handleClear();
      } else {
        toast.error(json.message || 'Error al crear el evento', toastStyles);
      }
    } catch (err) {
      console.error('Error creating event:', err);
      toast.error('Error en la creación. Intenta más tarde.', toastStyles);
    }
  };

  return (
    <div
      className="w-[70vw] max-w-2xl p-4 border rounded-md bg-background z-10
      max-h-[80vh] overflow-y-auto pr-4"
    >
      <form onSubmit={handleSubmit} noValidate>
        <FieldSet>
          <FieldDescription className="mb-4 text-lg font-semibold">
            {title}
          </FieldDescription>

          <FieldGroup className="grid grid-cols-2 gap-4">
            <Field className="col-span-2">
              <FieldLabel htmlFor="event-name">Título del evento</FieldLabel>
              <Input
                id="event-name"
                value={eventName}
                onChange={(e) => {
                  setEventName(e.target.value);
                  validateName(e.target.value);
                }}
                onBlur={() => validateName(eventName)}
                placeholder="Nombre del evento"
              />
              {errName ? (
                <p className="mt-1 text-sm text-red-500">{errName}</p>
              ) : null}
            </Field>

            <Field className="col-span-2">
              <FieldLabel htmlFor="description">Descripción</FieldLabel>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descripción detallada del evento"
                rows={4}
                className="w-full"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="date">Fecha</FieldLabel>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  validateDate(e.target.value);
                }}
                onBlur={() => validateDate(date)}
              />
              {errDate ? (
                <p className="mt-1 text-sm text-red-500">{errDate}</p>
              ) : null}
            </Field>

            <Field>
              <FieldLabel htmlFor="time">Hora</FieldLabel>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </Field>

            <Field className="col-span-1">
              <FieldLabel htmlFor="location">Ubicación</FieldLabel>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Sala / Dirección"
              />
            </Field>

            <Field className="col-span-1">
              <FieldLabel htmlFor="capacity">Capacidad</FieldLabel>
              <Input
                id="capacity"
                type="number"
                value={capacity === '' ? '' : String(capacity)}
                onChange={(e) => {
                  const v = e.target.value === '' ? '' : Number(e.target.value);
                  setCapacity(v === '' ? '' : Math.floor(Number(v)));
                  validateCapacity(v === '' ? '' : Number(v));
                }}
                placeholder="Número máximo de asistentes"
                min={1}
              />
              {errCapacity ? (
                <p className="mt-1 text-sm text-red-500">{errCapacity}</p>
              ) : null}
            </Field>

            {/* Campo nuevo: costo_entrada */}
            <Field className="col-span-1">
              <FieldLabel htmlFor="costo">Costo de entrada</FieldLabel>
              <Input
                id="costo"
                type="number"
                step="0.01"
                inputMode="decimal"
                value={costoEntrada}
                onChange={(e) => {
                  const v = e.target.value;
                  setCostoEntrada(v);
                  validateCosto(v);
                }}
                placeholder="0.00"
                min="0"
              />
              {errCosto ? (
                <p className="mt-1 text-sm text-red-500">{errCosto}</p>
              ) : null}
            </Field>
          </FieldGroup>

          <FieldGroup className="grid grid-cols-2 gap-4 mt-4 items-start">
            <div>
              <FieldLabel className="mb-2 block">Visibilidad</FieldLabel>
              <Select
                onValueChange={(v) => {
                  setVisibility(v);
                  if (v) setErrVisibility('');
                }}
                value={visibility ?? undefined}
              >
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Selecciona visibilidad" />
                </SelectTrigger>

                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Opciones</SelectLabel>
                    {perfil?.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {errVisibility ? (
                <p className="mt-1 text-sm text-red-500">{errVisibility}</p>
              ) : null}
            </div>

            <Field
              orientation="responsive"
              className="col-span-2 mt-2 grid grid-cols-2 gap-2"
            >
              <Button type="submit" className="w-[60px]">
                Crear
              </Button>
              <Button type="button" variant="outline" onClick={handleClear}>
                Limpiar
              </Button>
            </Field>
          </FieldGroup>
        </FieldSet>
      </form>
    </div>
  );
}
