'use client';

import type { PropsWithChildren } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { FirebaseClientProvider } from '@/firebase/client-provider';

interface AppProvidersProps extends PropsWithChildren {
    defaultOpen: boolean;
}

export function AppProviders({ children, defaultOpen }: AppProvidersProps) {
    return (
        <FirebaseClientProvider>
            <SidebarProvider defaultOpen={defaultOpen}>
                {children}
            </SidebarProvider>
        </FirebaseClientProvider>
    );
}
