'use client';

import * as React from 'react';
import { Area, Bar, CartesianGrid, ComposedChart, XAxis } from 'recharts';

import { fetchPolymarketData, generateHistoricalDataFromPolymarket } from '@/lib/polymarket-data';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export const description = 'Fund equity curve and daily PnL visualization';

const chartConfig = {
  nav: {
    label: 'NAV',
    color: 'hsl(var(--chart-1))',
  },
  pnlDaily: {
    label: 'Daily PnL',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

export function ChartAreaInteractive() {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState('90d');
  const [viewType, setViewType] = React.useState('all');
  const [historicalData, setHistoricalData] = React.useState<Array<{
    date: string;
    nav: number;
    pnlDaily: number;
    positions: number;
    drawdown: number;
    pnlPositive?: number;
    pnlNegative?: number;
  }>>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange('30d');
    }
  }, [isMobile]);

  React.useEffect(() => {
    async function loadData() {
      try {
        const polymarketData = await fetchPolymarketData();
        const historical = generateHistoricalDataFromPolymarket(polymarketData);
        setHistoricalData(historical);
      } catch (error) {
        console.error('Error loading Polymarket data:', error);
        // Fallback to empty array if data loading fails
        setHistoricalData([]);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, []);

  const filteredData = React.useMemo(() => {
    if (loading || historicalData.length === 0) {
      return [];
    }

    let daysToSubtract = 90;
    if (timeRange === '30d') {
      daysToSubtract = 30;
    } else if (timeRange === '7d') {
      daysToSubtract = 7;
    }

    return historicalData.slice(-daysToSubtract).map((item) => ({
      ...item,
      pnlPositive: item.pnlDaily > 0 ? item.pnlDaily : 0,
      pnlNegative: item.pnlDaily < 0 ? item.pnlDaily : 0,
    }));
  }, [timeRange, historicalData, loading]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Fund Performance</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Net Asset Value (NAV) and daily profit/loss
          </span>
          <span className="@[540px]/card:hidden">NAV & Daily PnL</span>
        </CardDescription>
        <CardAction className="flex gap-2">
          <ToggleGroup
            type="single"
            value={viewType}
            onValueChange={setViewType}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-3 @[900px]/card:flex"
          >
            <ToggleGroupItem value="all">All</ToggleGroupItem>
            <ToggleGroupItem value="agent">By Agent</ToggleGroupItem>
            <ToggleGroupItem value="topic">By Topic</ToggleGroupItem>
            <ToggleGroupItem value="venue">By Venue</ToggleGroupItem>
          </ToggleGroup>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">90d</ToggleGroupItem>
            <ToggleGroupItem value="30d">30d</ToggleGroupItem>
            <ToggleGroupItem value="7d">7d</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-32 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select time range"
            >
              <SelectValue placeholder="90 days" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                90 days
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {loading ? (
          <div className="flex items-center justify-center h-[300px]">
            <div className="text-muted-foreground">Loading market data...</div>
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[300px] w-full"
          >
            <ComposedChart data={filteredData}>
            <defs>
              <linearGradient id="fillNav" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-nav)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-nav)"
                  stopOpacity={0.05}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    });
                  }}
                  formatter={(value, name) => {
                    if (name === 'nav') {
                      return [formatCurrency(Number(value)), 'NAV'];
                    }
                    if (name === 'pnlDaily') {
                      return [formatCurrency(Number(value)), 'Daily P&L'];
                    }
                    return [value, name];
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="nav"
              type="monotone"
              fill="url(#fillNav)"
              stroke="var(--color-nav)"
              strokeWidth={2}
              yAxisId="nav"
            />
            <Bar
              dataKey="pnlPositive"
              fill="hsl(var(--chart-3))"
              opacity={0.7}
              yAxisId="pnl"
            />
            <Bar
              dataKey="pnlNegative"
              fill="hsl(var(--chart-4))"
              opacity={0.7}
              yAxisId="pnl"
            />
          </ComposedChart>
        </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
