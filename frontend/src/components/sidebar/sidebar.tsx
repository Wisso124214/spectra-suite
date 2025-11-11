import React from "react";
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
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";
import { Home as HomeIcon, List, GitBranch } from "lucide-react";

// --- Tipos ---
export type MenuItem = {
  title: string;
  url?: string;
  icon?: string;
  children?: MenuItem[];
  defaultOpen?: boolean;
};

// --- Icon map ---
const iconMap: Record<string, React.ElementType> = {
  Home: HomeIcon,
  List,
  GitBranch,
};

// --- Sidebar component ---
export default function CustomSidebar({ items }: { items: MenuItem[] }) {
  const renderItem = (item: MenuItem) => {
    if (item.children && item.children.length > 0) {
      return (
        <SidebarGroup key={item.title}>
          <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {item.children.map((child) =>
                child.children && child.children.length > 0 ? (
                  <SidebarGroup key={child.title}>
                    <SidebarGroupLabel>{child.title}</SidebarGroupLabel>
                    <SidebarGroupContent>
                      <SidebarMenu>
                        {child.children.map((grand) => (
                          <SidebarMenuItem key={grand.title}>
                            <SidebarMenuButton asChild>
                              <a
                                href={grand.url ?? "#"}
                                className="flex items-center gap-2"
                              >
                                {grand.icon &&
                                  React.createElement(
                                    iconMap[grand.icon] ?? HomeIcon,
                                    { className: "w-4 h-4" }
                                  )}
                                <span>{grand.title}</span>
                              </a>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </SidebarGroup>
                ) : (
                  <SidebarMenuItem key={child.title}>
                    <SidebarMenuButton asChild>
                      <a
                        href={child.url ?? "#"}
                        className="flex items-center gap-2"
                      >
                        {child.icon &&
                          React.createElement(iconMap[child.icon] ?? HomeIcon, {
                            className: "w-4 h-4",
                          })}
                        <span>{child.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      );
    }

    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton asChild>
          <a href={item.url ?? "#"} className="flex items-center gap-2">
            {item.icon &&
              React.createElement(iconMap[item.icon] ?? HomeIcon, {
                className: "w-4 h-4",
              })}
            <span>{item.title}</span>
          </a>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Layout>
      <Sidebar>
        <SidebarHeader>Menu</SidebarHeader>
        <SidebarContent>
          {items.map((it) => (
            <React.Fragment key={it.title}>{renderItem(it)}</React.Fragment>
          ))}
        </SidebarContent>
        <SidebarFooter>© 2025 </SidebarFooter>
      </Sidebar>
    </Layout>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const defaultOpen = true;

  return (
    <SidebarProvider defaultOpen={defaultOpen} className="z-100">
      <AppSidebar />
      <main>
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  );
}
