import type { PropsWithChildren } from 'react';
import { cookies } from 'next/headers';
import { AppProviders } from './app-providers';
import { Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { Header } from '@/components/layout/header';

export default function AppLayout({ children }: PropsWithChildren) {
  const layout = cookies().get('sidebar_state');
  const defaultOpen = layout ? layout.value === 'true' : true;

  return (
    <AppProviders defaultOpen={defaultOpen}>
      <Sidebar>
        <SidebarNav />
      </Sidebar>
      <SidebarInset>
        <Header />
        <main className="min-h-[calc(100vh-4rem-1px)] p-4 md:p-6 lg:p-8">
            {children}
        </main>
      </SidebarInset>
    </AppProviders>
  );
}
