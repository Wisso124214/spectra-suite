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
import { Home as HomeIcon, List, GitBranch } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SubsystemSelect } from '../SubsystemSelect/SubsystemSelect';

export type MenuData = MenuItem[];

type MenuItem = {
  title: string;
  url?: string;
  icon?: string; // clave de icono (p. ej. "Home" o "List")
  children?: MenuItem[];
  defaultOpen?: boolean;
};

// mapa simple de icon keys -> componentes lucide
const iconMap: Record<string, React.ElementType> = {
  Home: HomeIcon,
  List,
  GitBranch,
};

// render recursivo: soporta niveles arbitrarios
function renderMenuItem(
  item: MenuItem,
  index: number,
  deep = 0
): React.ReactNode {
  if (item.children && item.children.length > 0) {
    return deep < 2 ? (
      <Collapsible key={index} className='group/collapsible'>
        <SidebarGroup>
          <SidebarGroupLabel
            className='text-(--text-color) text-sm hover:bg-accent'
            asChild
          >
            <CollapsibleTrigger className='border-t-2'>
              {item.icon &&
                React.createElement(iconMap[item.icon] ?? HomeIcon, {
                  className: 'w-4 h-4 mr-2',
                })}
              <span>{item.title}</span>
              <ChevronDown className='ml-auto transition-transform group-data-[state=closed]/collapsible:-rotate-90' />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent className='data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down flex flex-col gap-2 overflow-hidden transition-all duration-300'>
            <div className='border-l pl-2 w-full ml-2'>
              <SidebarMenu className='rounded-lg'>
                <SidebarMenuItem>
                  {item.children.map((child) =>
                    renderMenuItem(child, index, deep + 1)
                  )}
                </SidebarMenuItem>
              </SidebarMenu>
            </div>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>
    ) : (
      <SidebarMenuItem key={index} className='rounded-lg w-full'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild className='focus:bg-transparent'>
            <SidebarMenuButton asChild className='focus:bg-transparent'>
              <div className='flex w-full justify-between items-center border-t-2 mt-1'>
                <div className='flex items-center'>
                  {item.icon &&
                    React.createElement(iconMap[item.icon] ?? HomeIcon, {
                      className: 'w-4 h-4 mr-2',
                    })}
                  <span>{item.title}</span>
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
              {item.children.map((child) =>
                renderMenuItem(child, index, deep + 1)
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem className='rounded-lg w-full' key={index}>
      <SidebarMenuButton asChild>
        {/* usamos Link para navegación SPA */}
        <Link to={item.url ?? '#'} className='flex items-center gap-2'>
          {item.icon &&
            React.createElement(iconMap[item.icon] ?? HomeIcon, {
              className: 'w-4 h-4',
            })}
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export default function CustomSidebar({ data }: { data: MenuData }) {
  const subsystems = ['next.js', 'sveltekit', 'nuxt.js', 'remix', 'astro'];
  const items = [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: 'Home',
    },
    {
      title: 'Projects',
      icon: 'Home',
      children: [
        {
          title: 'Project A',
          url: '/projects/a',
          icon: 'Home',
          children: [
            {
              title: 'Subproject A1',
              children: [
                {
                  icon: 'Home',
                  title:
                    'Task A1.1 aslkdjalskdjlzxkdjzlkxjclzkxjclkzxjzalksjdlkasjdlksjdsdjkjasdkjasldjaslkdjaslkjalksdjalksjdlkasjdaslkdjalskdjlzxkdjzlkxjclzkxjclkzxjzalksjdlkasjdlksjdsdjkjasdkjasldjaslkdjaslkjalksdjalksjdlkasjdaslkdjalskdjlzxkdjzlkxjclzkxjclkzxjzalksjdlkasjdlksjdsdjkjasdkjasldjaslkdjaslkjalksdjalksjdlkasjdaslkdjalskdjlzxkdjzlkxjclzkxjclkzxjzalksjdlkasjdlksjdsdjkjasdkjasldjaslkdjaslkjalksdjalksjdlkasjd',
                  url: '/projects/a/subproject-a1/task-a1-1',
                  children: [
                    {
                      title: 'Subtask A1.1.1',
                      url: '/projects/a/subproject-a1/task-a1-1/subtask-a1-1-1',
                      children: [
                        {
                          title: 'Subtask A1.1.1.1',
                          url: '/projects/a/subproject-a1/task-a1-1/subtask-a1-1-1/subtask-a1-1-1-1',
                        },

                        {
                          title: 'Subtask A1.1.1.2',
                          url: '/projects/a/subproject-a1/task-a1-1/subtask-a1-1-1/subtask-a1-1-1-2',
                        },
                        {
                          title: 'Subtask A1.1.1.3',
                          url: '/projects/a/subproject-a1/task-a1-1/subtask-a1-1-1/subtask-a1-1-1-3',
                        },
                      ],
                    },
                    {
                      title: 'Subtask A1.1.2',
                      url: '/projects/a/subproject-a1/task-a1-1/subtask-a1-1-2',
                    },

                    {
                      title: 'Subtask A1.1.3',
                      url: '/projects/a/subproject-a1/task-a1-1/subtask-a1-1-2',
                    },
                  ],
                },
                {
                  title: 'Task A1.2',
                  url: '/projects/a/subproject-a1/task-a1-2',
                },
              ],
            },
            {
              title: 'Subproject A2',
            },
          ],
        },
        {
          title: 'Project B',
          url: '/projects/b',
        },
      ],
    },
  ];
  return (
    <Sidebar className='min-w-72'>
      <SidebarHeader>
        <SubsystemSelect subsystems={subsystems} />
      </SidebarHeader>

      <SidebarContent>
        {data.length === 0 ? (
          <SidebarGroup>
            <SidebarGroupLabel>Sin opciones</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu />
            </SidebarGroupContent>
          </SidebarGroup>
        ) : (
          // Object.values(data).map((it) => renderMenuItem(it))
          items.map((it, i) => renderMenuItem(it, i))
        )}
      </SidebarContent>
    </Sidebar>
  );
}
