import React from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/ui/app-sidebar';
import useAppContext from '@/hooks/useAppContext';

export function Layout({
  children,
  defaultOpen = true,
}: {
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const { isSidebarOpen, setIsSidebarOpen } = useAppContext();

  React.useEffect(() => {
    setIsSidebarOpen(defaultOpen);
  }, [defaultOpen, setIsSidebarOpen]);

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <SidebarTrigger
        className='fixed z-12 top-3 left-3 hover:cursor-pointer'
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      {children}
    </SidebarProvider>
  );
}
