'use client';

import * as React from 'react';
import { IconTrendingUp, IconUsers, IconTarget, IconChartBar } from '@tabler/icons-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { mockAgents, mockMarkets, mockAgentPerformance } from '@/lib/mock-data';
import { HedgeFundTable } from '@/components/hedge-fund-table';

const agentColumns = [
  {
    accessorKey: 'name',
    header: 'Agent',
  },
  {
    accessorKey: 'brier',
    header: 'Brier Score',
    cell: ({ row }: any) => {
      const value = parseFloat(row.getValue('brier'));
      return (
        <span className={`font-mono ${value < 0.15 ? 'text-green-600' : value < 0.18 ? 'text-yellow-600' : 'text-red-600'}`}>
          {value.toFixed(3)}
        </span>
      );
    },
  },
  {
    accessorKey: 'hitRate',
    header: 'Hit Rate',
    cell: ({ row }: any) => {
      const value = parseFloat(row.getValue('hitRate'));
      return <span className="font-mono">{(value * 100).toFixed(1)}%</span>;
    },
  },
  {
    accessorKey: 'avgEdgeBp',
    header: 'Avg Edge (bp)',
    cell: ({ row }: any) => {
      const value = parseFloat(row.getValue('avgEdgeBp'));
      return <span className="font-mono">{value}bp</span>;
    },
  },
  {
    accessorKey: 'evPerBet',
    header: 'EV/Bet',
    cell: ({ row }: any) => {
      const value = parseFloat(row.getValue('evPerBet'));
      return <span className="font-mono">${value.toLocaleString()}</span>;
    },
  },
  {
    accessorKey: 'capitalPct',
    header: 'Capital Alloc %',
    cell: ({ row }: any) => {
      const value = parseFloat(row.getValue('capitalPct'));
      return <span className="font-mono">{value.toFixed(1)}%</span>;
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }: any) => {
      const status = row.getValue('status') as string;
      const variant = status === 'Active' ? 'default' : status === 'Training' ? 'secondary' : 'outline';
      return <Badge variant={variant}>{status}</Badge>;
    },
  },
];

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
        <span className={`font-mono ${value > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {value > 0 ? '+' : ''}{value.toFixed(1)}%
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
        'Open': { variant: 'default' as const, emoji: '🟢' },
        'Pending': { variant: 'secondary' as const, emoji: '🟡' },
        'Closed': { variant: 'outline' as const, emoji: '⚫' },
        'Settled': { variant: 'outline' as const, emoji: '✅' },
      };
      const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.Open;
      return (
        <Badge variant={config.variant}>
          {config.emoji} {status}
        </Badge>
      );
    },
  },
];

export function HedgeFundTabs() {
  const totalEV = mockMarkets.reduce((sum, market) => sum + (market.evAfterCost > 0 ? market.evAfterCost * market.sizeSuggested / 100 : 0), 0);
  const activeAgents = mockAgents.filter(agent => agent.status === 'Active').length;
  const openMarkets = mockMarkets.filter(market => market.status === 'Open').length;

  return (
    <div className="px-4 lg:px-6">
      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <IconTrendingUp className="size-4" />
            Past Performance
          </TabsTrigger>
          <TabsTrigger value="agents" className="flex items-center gap-2">
            <IconUsers className="size-4" />
            Key Personnel
          </TabsTrigger>
          <TabsTrigger value="markets" className="flex items-center gap-2">
            <IconTarget className="size-4" />
            Focus Markets
          </TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4 mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Realized EV</CardTitle>
                <IconChartBar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalEV.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+12.5% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Agent Accuracy</CardTitle>
                <IconUsers className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">68.2%</div>
                <p className="text-xs text-muted-foreground">Above industry avg</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Best Performing Topic</CardTitle>
                <IconTarget className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Politics</div>
                <p className="text-xs text-muted-foreground">+18.5% return</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sharpe Ratio</CardTitle>
                <IconTrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1.84</div>
                <p className="text-xs text-muted-foreground">Risk-adjusted returns</p>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Attribution Waterfall</CardTitle>
              <CardDescription>
                Performance breakdown by agent and market category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Attribution analysis shows Alpha-Research driving 45% of returns,
                primarily from political prediction markets. Beta-Politics contributed 28%
                with strong performance in election forecasting.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Agent Leaderboard</CardTitle>
              <CardDescription>
                Performance metrics for all active and training agents ({activeAgents} active)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HedgeFundTable data={mockAgents} columns={agentColumns} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="markets" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Market Opportunities</CardTitle>
              <CardDescription>
                Current prediction markets with positive expected value ({openMarkets} open positions)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HedgeFundTable data={mockMarkets} columns={marketColumns} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}