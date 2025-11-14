import React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { Logs, Menu } from 'lucide-react';
import { SubsystemSelect } from '../SubsystemSelect/SubsystemSelect';
import { CommandAvatar } from '../CommandAvatar/CommandAvatar';
import { CustomTooltip } from '../CustomTooltip/CustomTooltip';

export type MenuData = MenuItem[];

type MenuItem = {
  title: string;
  url?: string;
  icon?: string; // clave de icono (p. ej. "Home" o "List")
  children?: MenuItem[];
  defaultOpen?: boolean;
};

const iconMap: Record<string, React.ElementType> = {
  Home: Menu,
  List: Logs,
  GitBranch: Menu,
};

function renderMenuItem(
  item: MenuItem,
  key: string,
  deep = 0
): React.ReactNode {
  if (item.children && item.children.length > 0) {
    return deep < 2 ? (
      <Collapsible key={key} className='group/collapsible'>
        <SidebarGroup>
          <SidebarGroupLabel
            asChild
            className='text-(--text-color) text-sm hover:bg-accent'
          >
            <CollapsibleTrigger className='border-t-2'>
              <CustomTooltip
                text={item.title}
                className='text-(--text-color) bg-(--gray-background-light-2) border-3 border-(--gray-background-light-3) text-sm hover:bg-accent font-semibold rounded-lg'
              >
                <div className='w-full flex items-center'>
                  {item.icon &&
                    React.createElement(iconMap[item.icon] ?? Menu, {
                      className: 'w-4 h-4 mr-2',
                    })}
                  <span className='w-full text-left text-wrap wrap-anywhere line-clamp-1 '>
                    {item.title}
                  </span>
                  <ChevronDown className='ml-auto transition-transform group-data-[state=closed]/collapsible:-rotate-90' />
                </div>
              </CustomTooltip>
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent className='data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down flex flex-col gap-2 overflow-hidden transition-all duration-300'>
            <div className='border-l pl-2 w-full ml-2 '>
              <SidebarMenu className='rounded-lg'>
                <div className='flex flex-col '>
                  {item.children.map((child, ci) =>
                    renderMenuItem(child, `${key}-${ci}`, deep + 1)
                  )}
                </div>
              </SidebarMenu>
            </div>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>
    ) : (
      <SidebarMenuItem
        key={key}
        className={'rounded-lg max-w-full ' + (deep === 2 ? 'mr-2' : 'w-full')}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild className='focus:bg-transparent w-full'>
            <SidebarMenuButton asChild className='focus:bg-transparent w-full'>
              <div className='w-full flex justify-between items-center border-t-2 mt-1 pr-2 rounded-lg'>
                <div className='flex items-center w-full'>
                  {item.icon &&
                    React.createElement(iconMap[item.icon] ?? Menu, {
                      className: 'w-4 h-4 mr-2',
                    })}
                  <span className=' w-full text-wrap wrap-anywhere line-clamp-1 font-semibold'>
                    {item.title}
                  </span>
                </div>
                <MoreHorizontal />
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side='right'
            align='start'
            className='data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down overflow-hidden transition-all duration-200'
          >
            <DropdownMenuItem
              className='flex flex-col min-w-50 focus:bg-transparent max-w-100'
              style={{
                listStyleType: 'none',
              }}
            >
              {item.children.map((child, ci) =>
                renderMenuItem(child, `${key}-dm-${ci}`, deep + 1)
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem
      className={'rounded-lg ' + (deep > 2 ? 'w-full' : 'mr-2')}
      key={key}
      style={{
        listStyleType: 'none',
      }}
    >
      <SidebarMenuButton asChild>
        <div className='flex items-center gap-2'>
          {item.icon &&
            React.createElement(iconMap[item.icon] ?? Menu, {
              className: 'w-4 h-4',
            })}
          <span className='w-full text-wrap wrap-anywhere line-clamp-1 '>
            {item.title}
          </span>
        </div>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export default function CustomSidebar({
  data,
  subsystems = [],
  subsystemSelected,
  setSubsystemSelected,
  defaultSubsystem,
}: {
  data: MenuData;
  subsystems?: string[];
  subsystemSelected: string;
  setSubsystemSelected: (v: string) => void;
  defaultSubsystem?: string;
}) {
  return (
    <Sidebar className='min-w-72'>
      <SidebarHeader>
        <SubsystemSelect
          subsystems={subsystems}
          subsystemSelected={subsystemSelected}
          setSubsystemSelected={setSubsystemSelected}
          defaultOption={defaultSubsystem}
        />
      </SidebarHeader>

      <SidebarContent className='mt-5 z-5'>
        {data.length === 0 ? (
          <SidebarGroup>
            <SidebarGroupLabel>
              Sin opciones. Por favor seleccione un subsistema...
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu />
            </SidebarGroupContent>
          </SidebarGroup>
        ) : (
          <div
            className='flex flex-col gap-2 max-h-114 overflow-y-auto'
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor:
                'color-mix(in oklch, var(--sidebar-accent-foreground) 20%, transparent) transparent',
            }}
          >
            {data.map((it, i) => renderMenuItem(it, `root-${i}`))}
          </div>
        )}
      </SidebarContent>
      <SidebarFooter className='flex justify-center items-center'>
        <CommandAvatar />
      </SidebarFooter>
    </Sidebar>
  );
}
