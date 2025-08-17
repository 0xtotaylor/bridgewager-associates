'use client';

import * as React from 'react';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useIsInitialized, useIsSignedIn } from '@coinbase/cdp-hooks';
import { Loader2Icon } from 'lucide-react';
import { IconListDetails } from '@tabler/icons-react';

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { ChartAreaInteractive } from '@/components/chart-area-interactive';
import { SectionCards } from '@/components/section-cards';
import { SiteHeader } from '@/components/site-header';
import { AgentSpecificTable } from '@/components/agent-specific-tables';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

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
              <SectionCards agentType={agent} />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
              
              {/* Open Offers Table - shown above Active Wagers for portfolio-manager */}
              {marketId && agent === 'portfolio-manager' && orderData && (
                <div className="px-4 lg:px-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <IconListDetails className="h-5 w-5" />
                        Open Offers
                      </CardTitle>
                      <CardDescription>
                        Your pending market orders
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {orderLoading && (
                        <div className="flex items-center justify-center p-8">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        </div>
                      )}
                      
                      {orderError && (
                        <div className="p-3 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg">
                          {orderError}
                        </div>
                      )}
                      
                      {!orderLoading && !orderError && orderData && (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b">
                                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                  Market
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                  Side
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                  Outcome
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                  Price
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                  Size
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                  Filled
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                  Status
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                  Type
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              <tr className="hover:bg-muted/50 transition-colors">
                                <td className="px-4 py-3">
                                  <div className="max-w-xs">
                                    <p className="font-medium text-sm truncate">
                                      {orderData.marketInfo?.question || 'Unknown Market'}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Ends: {orderData.marketInfo?.endDateIso || 'N/A'}
                                    </p>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                                    orderData.side === 'BUY' 
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                  }`}>
                                    {orderData.side}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="text-sm font-medium">
                                    {orderData.outcome}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="text-sm font-mono">
                                    ${orderData.price}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="text-sm">
                                    {orderData.original_size}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="text-sm">
                                    {orderData.size_matched}/{orderData.original_size}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                                    orderData.status === 'LIVE'
                                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                                  }`}>
                                    {orderData.status}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="text-sm text-muted-foreground">
                                    {orderData.order_type}
                                  </span>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
              
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