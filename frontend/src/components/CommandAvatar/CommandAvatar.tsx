import { LogOut, RotateCcwKey, UserRoundPen } from 'lucide-react';
import React from 'react';

import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible';

import { useAppContext } from '../../hooks/useAppContext';
import ChangeProfile from '../ChangeProfile/ChangeProfile';

export function CommandAvatar() {
  const { handleLogout, userData, setIsShowingPopup } = useAppContext();

  type MenuItem = {
    icon?: React.ElementType;
    label: string;
    shortcut?: string;
    onClick?: () => void;
  };
  type MenuGroup = { heading?: string; items: MenuItem[] };

  const menuData: MenuGroup[] = [
    {
      // heading: 'Suggestions',
      items: [
        {
          icon: UserRoundPen,
          label: 'Actualizar cuenta',
          onClick: () => console.log('Actualizar cuenta'),
        },
        {
          icon: RotateCcwKey,
          label: 'Cambiar perfil',
          onClick: () => setIsShowingPopup(true),
        },
        {
          icon: LogOut,
          label: 'Cerrar sesión',
          onClick: handleLogout,
        },
      ],
    },
  ];

  function capitalize(s: string | undefined) {
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
  }

  function cardUser({ type = 'button' }: { type?: string }) {
    return (
      <>
        <div
          className={
            'w-65 flex items-center p-2 rounded-md cursor-pointer bottom-0 gap-2 ' +
            (type === 'button'
              ? 'hover:bg-accent '
              : type === 'div'
                ? 'hover:cursor-auto '
                : '')
          }
        >
          <div
            id='user-icon'
            className='w-10 h-10 text-white flex items-center justify-center'
          >
            <svg viewBox='0 0 24 24' fill='none'>
              <g id='_bgCarrier' strokeWidth='0'></g>
              <g
                id='_tracerCarrier'
                strokeLinecap='round'
                strokeLinejoin='round'
              ></g>
              <g id='_iconCarrier'>
                {' '}
                <path
                  d='M12.1303 13C13.8203 13 15.1903 11.63 15.1903 9.94C15.1903 8.25001 13.8203 6.88 12.1303 6.88C10.4403 6.88 9.07031 8.25001 9.07031 9.94C9.07031 11.63 10.4403 13 12.1303 13Z'
                  stroke='currentColor'
                  strokeWidth='1.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                ></path>{' '}
                <path
                  d='M17 3H7C4.79086 3 3 4.79086 3 7V17C3 19.2091 4.79086 21 7 21H17C19.2091 21 21 19.2091 21 17V7C21 4.79086 19.2091 3 17 3Z'
                  stroke='currentColor'
                  strokeWidth='1.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                ></path>{' '}
                <path
                  d='M6.30969 20.52C6.27753 19.7534 6.40079 18.9882 6.67199 18.2704C6.94319 17.5526 7.35674 16.8971 7.88781 16.3433C8.41888 15.7894 9.05649 15.3488 9.76226 15.0477C10.468 14.7467 11.2274 14.5916 11.9947 14.5916C12.762 14.5916 13.5214 14.7467 14.2272 15.0477C14.9329 15.3488 15.5705 15.7894 16.1016 16.3433C16.6326 16.8971 17.0462 17.5526 17.3174 18.2704C17.5886 18.9882 17.7118 19.7534 17.6797 20.52'
                  stroke='currentColor'
                  strokeWidth='1.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                ></path>{' '}
              </g>
            </svg>
          </div>
          <div className='flex flex-col items-baseline justify-center'>
            <span
              className={
                'text-md font-medium text-wrap wrap-anywhere text-left ' +
                (type === 'button'
                  ? 'line-clamp-1'
                  : type === 'div'
                    ? 'leading-5 mb-1'
                    : '')
              }
            >
              {userData?.username || 'User Name'}
            </span>
            <span
              className={
                'text-xs text-muted-foreground text-wrap wrap-anywhere text-left ' +
                (type === 'button'
                  ? 'line-clamp-1'
                  : type === 'div'
                    ? 'leading-5 mb-1'
                    : '')
              }
            >
              {userData?.email || 'user@example.com'}
            </span>
          </div>
        </div>
        {type === 'div' && (
          <>
            <span
              className={
                'flex text-sm px-3 w-full text-primary font-bold text-wrap wrap-anywhere text-left leading-5'
              }
            >
              {capitalize(userData?.profile) || 'Guest'}
            </span>
            <CommandSeparator className='mt-4 mb-1 mx-2' />
          </>
        )}
      </>
    );
  }

  return (
    <>
      <Collapsible className='w-full p-1 flex items-end absolute bottom-2 left-2'>
        <CollapsibleTrigger className='w-full z-5'>
          {cardUser({})}
        </CollapsibleTrigger>
        <CollapsibleContent className='ml-5' style={{ zIndex: -1 }}>
          <Command
            className='min-w-50 max-h-max max-w-70 rounded-lg border shadow-md pb-2 pt-3 px-1.5 '
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(100, 100, 100, 0.5) transparent',
            }}
          >
            <CommandList>
              {cardUser({ type: 'div' })}
              {menuData.map((group, gi) => (
                <React.Fragment key={(group.heading ?? 'group') + gi}>
                  <CommandGroup heading={group.heading}>
                    {group.items.map((item, ii) => {
                      const Icon = item.icon;
                      return (
                        <div
                          onClick={item.onClick}
                          key={(item.label ?? ii) + ii}
                        >
                          <CommandItem>
                            {Icon && <Icon />}
                            <span className='text-wrap wrap-anywhere line-clamp-1 text-left'>
                              {item.label}
                            </span>
                            {item.shortcut && (
                              <CommandShortcut>{item.shortcut}</CommandShortcut>
                            )}
                          </CommandItem>
                        </div>
                      );
                    })}
                  </CommandGroup>
                  {gi < menuData.length - 1 && <CommandSeparator />}
                </React.Fragment>
              ))}
            </CommandList>
          </Command>
        </CollapsibleContent>
      </Collapsible>
      <ChangeProfile />
    </>
  );
}
