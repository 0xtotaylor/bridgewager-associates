'use client';

import * as React from 'react';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  const searchParams = useSearchParams();
  const { isSignedIn } = useIsSignedIn();
  const { isInitialized } = useIsInitialized();
  const [agent, setAgent] = React.useState<string>('');
  const marketId = searchParams.get('marketId');
  const [orderData, setOrderData] = React.useState<any>(null);
  const [orderLoading, setOrderLoading] = React.useState(false);
  const [orderError, setOrderError] = React.useState<string | null>(null);

  useEffect(() => {
    if (isInitialized && !isSignedIn) {
      router.push('/login');
    }
  }, [isInitialized, isSignedIn, router]);

  React.useEffect(() => {
    params.then(({ agent }) => setAgent(agent));
  }, [params]);

  React.useEffect(() => {
    if (!marketId || agent !== 'portfolio-manager') return;

    const fetchOrder = async () => {
      setOrderLoading(true);
      setOrderError(null);
      
      try {
        const response = await fetch(`/api/polymarket-get-order?orderId=${marketId}`);
        const data = await response.json();
        
        if (data.success) {
          setOrderData(data.order);
          console.log('Order data:', data.order);
        } else {
          setOrderError(data.message || 'Failed to fetch order');
          console.error('Error fetching order:', data);
        }
      } catch (err) {
        setOrderError('Failed to fetch order data');
        console.error('Error:', err);
      } finally {
        setOrderLoading(false);
      }
    };

    fetchOrder();
  }, [marketId, agent]);

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
              {marketId && agent === 'portfolio-manager' && (
                <div className="px-4 lg:px-6">
                  <div className="rounded-lg border bg-card p-6">
                    <h2 className="text-xl font-semibold mb-4">Market Order Details</h2>
                    
                    {orderLoading && (
                      <div className="flex items-center justify-center p-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      </div>
                    )}
                    
                    {orderError && (
                      <div className="p-3 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg">
                        {orderError}
                      </div>
                    )}
                    
                    {!orderLoading && !orderError && (
                      <>
                        <div className="mb-3 p-3 bg-muted rounded-lg">
                          <p className="text-sm text-muted-foreground">Market ID:</p>
                          <p className="font-mono text-sm break-all">{marketId}</p>
                        </div>
                        
                        {orderData && (
                          <div className="mt-4">
                            <h3 className="text-sm font-semibold mb-2 text-muted-foreground">Full Order Data:</h3>
                            <pre className="bg-muted p-4 rounded-lg overflow-auto text-xs max-h-96">
                              {JSON.stringify(orderData, null, 2)}
                            </pre>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
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