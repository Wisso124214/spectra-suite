import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/ui/app-sidebar';

export function Layout({
  children,
  defaultOpen = true,
}: {
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <SidebarTrigger
        className='fixed z-12 top-3 left-3 hover:cursor-pointer'
        onClick={() => console.log('Clickedd')}
      />
      {children}
    </SidebarProvider>
  );
}
