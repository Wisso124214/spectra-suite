'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

function capitalize(text: string) {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function SubsystemSelect({
  subsystems,
  subsystemSelected,
  setSubsystemSelected,
  defaultOption = 'subsistema...',
}: {
  subsystems: string[];
  subsystemSelected: string;
  setSubsystemSelected: (v: string) => void;
  defaultOption?: string;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className='mt-2 ml-14'>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            role='combobox'
            aria-expanded={open}
            className={
              'w-[200px] justify-between ' +
              (subsystemSelected === defaultOption
                ? 'text-gray-400 font-normal italic'
                : '')
            }
          >
            {capitalize(subsystemSelected)}
            <ChevronsUpDown className='opacity-50' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-[200px] p-0 z-20'>
          <Command>
            <CommandInput placeholder='Search subsystem...' className='h-9' />
            <CommandList>
              <CommandEmpty>No subsystem found.</CommandEmpty>
              <CommandGroup>
                {subsystems.map((subsystem) => (
                  <CommandItem
                    key={subsystem}
                    value={subsystem}
                    onSelect={(currentValue) => {
                      setSubsystemSelected(
                        currentValue === subsystemSelected ? '' : currentValue
                      );
                      setOpen(false);
                    }}
                  >
                    {capitalize(subsystem)}
                    <Check
                      className={cn(
                        'ml-auto',
                        subsystemSelected === subsystem
                          ? 'opacity-100'
                          : 'opacity-0'
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
