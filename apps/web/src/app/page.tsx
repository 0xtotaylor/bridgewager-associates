'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useIsInitialized, useIsSignedIn } from '@coinbase/cdp-hooks';
import { Loader2Icon } from 'lucide-react';

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { ChartAreaInteractive } from '@/components/chart-area-interactive';
import { HedgeFundTabs } from '@/components/hedge-fund-tabs';
import { SectionCards } from '@/components/section-cards';
import { SiteHeader } from '@/components/site-header';

export default function Page() {
  const router = useRouter();
  const { isSignedIn } = useIsSignedIn();
  const { isInitialized } = useIsInitialized();

  useEffect(() => {
    if (isInitialized && !isSignedIn) {
      router.push('/login');
    }
  }, [isInitialized, isSignedIn, router]);

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2Icon className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
              <HedgeFundTabs />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
