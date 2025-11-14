import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useEffect, useRef, useState } from 'react';

export function CustomTooltip({
  text,
  children,
  className,
  style,
  props,
  timeout = 2500,
  timeoutLeave = 150,
}: {
  text: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  props?: Omit<
    React.ComponentProps<typeof TooltipContent>,
    'className' | 'style' | 'children'
  >;
  timeout?: number;
  timeoutLeave?: number;
}) {
  const [isActive, setIsActive] = useState(false);
  type TimeoutId = ReturnType<typeof setTimeout>;
  const [enterTimeoutIds, setEnterTimeoutIds] = useState<TimeoutId[]>([]);
  const [leaveTimeoutIds, setLeaveTimeoutIds] = useState<TimeoutId[]>([]);

  // Refs para capturar los últimos valores y limpiar correctamente en unmount
  const enterTimeoutsRef = useRef<TimeoutId[]>([]);
  const leaveTimeoutsRef = useRef<TimeoutId[]>([]);

  useEffect(() => {
    enterTimeoutsRef.current = enterTimeoutIds;
  }, [enterTimeoutIds]);

  useEffect(() => {
    leaveTimeoutsRef.current = leaveTimeoutIds;
  }, [leaveTimeoutIds]);

  // Limpieza al desmontar el componente para evitar timeouts pendientes
  useEffect(() => {
    return () => {
      enterTimeoutsRef.current.forEach(clearTimeout);
      leaveTimeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  return (
    <Tooltip>
      <TooltipTrigger
        onMouseEnter={() => {
          if (enterTimeoutIds.length) {
            enterTimeoutIds.forEach(clearTimeout);
            setEnterTimeoutIds([]);
          }
          const id = setTimeout(() => {
            setIsActive(true);
            // Limpiar cualquier timeout de salida pendiente
            setLeaveTimeoutIds((ids) => {
              ids.forEach(clearTimeout);
              return [];
            });
          }, timeout);
          setEnterTimeoutIds((prev) => [...prev, id]);
        }}
        onMouseLeave={() => {
          if (leaveTimeoutIds.length) {
            leaveTimeoutIds.forEach(clearTimeout);
            setLeaveTimeoutIds([]);
          }
          const id = setTimeout(() => {
            setIsActive(false);
            // Limpiar cualquier timeout de entrada pendiente
            setEnterTimeoutIds((ids) => {
              ids.forEach(clearTimeout);
              return [];
            });
          }, timeoutLeave);
          setLeaveTimeoutIds((prev) => [...prev, id]);
        }}
        asChild
      >
        {children}
      </TooltipTrigger>
      {isActive && (
        <TooltipContent className={className} style={style} {...props}>
          {text}
        </TooltipContent>
      )}
    </Tooltip>
  );
}
