'use client';

import * as React from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useIsInitialized, useIsSignedIn } from '@coinbase/cdp-hooks';
import { Loader2Icon } from 'lucide-react';

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { ChartAreaInteractive } from '@/components/chart-area-interactive';
import { SectionCards } from '@/components/section-cards';
import { SiteHeader } from '@/components/site-header';
import { AgentSpecificTable } from '@/components/agent-specific-tables';

export default function Agent({
  params,
}: {
  params: Promise<{ agent: string }>;
}) {
  const router = useRouter();
  const { isSignedIn } = useIsSignedIn();
  const { isInitialized } = useIsInitialized();
  const [agent, setAgent] = React.useState<string>('');

  useEffect(() => {
    if (isInitialized && !isSignedIn) {
      router.push('/login');
    }
  }, [isInitialized, isSignedIn, router]);

  React.useEffect(() => {
    params.then(({ agent }) => setAgent(agent));
  }, [params]);

  if (!isInitialized || !agent) {
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
              <SectionCards agentType={agent} />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
              <div className="px-4 lg:px-6">
                <AgentSpecificTable agentType={agent} />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
