'use client';

import * as React from 'react';
import { IconLoader } from '@tabler/icons-react';

import type { Market } from '@/lib/types';
import { fetchPolymarketData, transformPolymarketToMarket, calculateMetricsFromPolymarket } from '@/lib/polymarket-data';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { HedgeFundTable } from '@/components/hedge-fund-table';


const marketColumns = [
  {
    accessorKey: 'title',
    header: 'Market',
    cell: ({ row }: any) => {
      const title = row.getValue('title') as string;
      return <span className="max-w-xs truncate">{title}</span>;
    },
  },
  {
    accessorKey: 'venue',
    header: 'Venue',
    cell: ({ row }: any) => {
      const venue = row.getValue('venue') as string;
      return <Badge variant="outline">{venue}</Badge>;
    },
  },
  {
    accessorKey: 'odds',
    header: 'Current Odds',
    cell: ({ row }: any) => {
      const value = parseFloat(row.getValue('odds'));
      return <span className="font-mono">{(value * 100).toFixed(0)}%</span>;
    },
  },
  {
    accessorKey: 'fair',
    header: 'Our Fair',
    cell: ({ row }: any) => {
      const value = parseFloat(row.getValue('fair'));
      return <span className="font-mono">{(value * 100).toFixed(0)}%</span>;
    },
  },
  {
    accessorKey: 'evAfterCost',
    header: 'EV/$',
    cell: ({ row }: any) => {
      const value = parseFloat(row.getValue('evAfterCost'));
      return (
        <span
          className={`font-mono ${value > 0 ? 'text-green-600' : 'text-red-600'}`}
        >
          {value > 0 ? '+' : ''}
          {value.toFixed(1)}%
        </span>
      );
    },
  },
  {
    accessorKey: 'sizeSuggested',
    header: 'Kelly Size',
    cell: ({ row }: any) => {
      const value = parseFloat(row.getValue('sizeSuggested'));
      return <span className="font-mono">${value.toLocaleString()}</span>;
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }: any) => {
      const status = row.getValue('status') as string;
      const statusConfig = {
        Open: { variant: 'default' as const, emoji: '🟢' },
        Pending: { variant: 'secondary' as const, emoji: '🟡' },
        Closed: { variant: 'outline' as const, emoji: '⚫' },
        Settled: { variant: 'outline' as const, emoji: '✅' },
      };
      const config =
        statusConfig[status as keyof typeof statusConfig] || statusConfig.Open;
      return (
        <Badge variant={config.variant}>
          {config.emoji} {status}
        </Badge>
      );
    },
  },
];

export function HedgeFundTabs() {
  const [markets, setMarkets] = React.useState<Market[]>([]);
  const [metrics, setMetrics] = React.useState<{
    totalEV?: number;
    activeMarkets?: number;
    totalVolume?: number;
    totalLiquidity?: number;
    avgSpread?: number;
  }>({});
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadData() {
      try {
        const polymarketData = await fetchPolymarketData();
        const transformedMarkets = transformPolymarketToMarket(polymarketData);
        const calculatedMetrics = calculateMetricsFromPolymarket(polymarketData);
        
        setMarkets(transformedMarkets);
        setMetrics(calculatedMetrics);
      } catch (error) {
        console.error('Error loading market data:', error);
        setMarkets([]);
        setMetrics({});
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, []);

  const openMarkets = loading ? 0 : (metrics.activeMarkets || 0);

  return (
    <div className="px-4 lg:px-6 space-y-4 mt-6">
      <Card>
        <CardHeader>
          <CardTitle>Active Market Opportunities</CardTitle>
          <CardDescription>
            Current prediction markets with positive expected value (
            {openMarkets} open positions)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <IconLoader className="animate-spin text-muted-foreground" size={24} />
            </div>
          ) : (
            <HedgeFundTable data={markets} columns={marketColumns} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
