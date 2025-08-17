'use client';

import { useEffect, useState } from 'react';
import {
  IconAlertTriangle,
  IconChartDots3,
  IconChartLine,
  IconCurrencyDollar,
  IconPercentage,
  IconShield,
  IconTarget,
  IconTrendingDown,
  IconTrendingUp,
  IconWallet,
} from '@tabler/icons-react';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface PortfolioMetrics {
  totalValue: number;
  totalPnL: number;
  totalPnLPercent: number;
  positionCount: number;
  winRate: number;
  usdcBalance: number;
}

export function SectionCards({ agentType }: { agentType?: string }) {
  const [portfolioMetrics, setPortfolioMetrics] = useState<PortfolioMetrics>({
    totalValue: 0,
    totalPnL: 0,
    totalPnLPercent: 0,
    positionCount: 0,
    winRate: 0,
    usdcBalance: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch portfolio metrics for all agent types
    const fetchPortfolioMetrics = async () => {
      try {
        const { getUserPositions, getUserHoldings, getUserUSDCBalance } = await import(
          '@/lib/polymarket-portfolio'
        );

        const userAddress = '0x4bA01fF1DEfA6948a801d3711892b9c00F170447';
        
        // Get holdings value and USDC balance in parallel
        const [holdings, positions, usdcData] = await Promise.all([
          getUserHoldings(userAddress),
          getUserPositions(userAddress, {
            limit: 100,
            sortBy: 'CURRENT',
          }),
          getUserUSDCBalance(userAddress)
        ]);
        
        const totalValue = holdings[0]?.value || 0;
        const usdcBalance = parseFloat(usdcData.display);
        
        // Calculate metrics
        const totalPnL = positions.reduce((sum: number, pos: any) => sum + pos.cashPnl, 0);
        const totalInitial = positions.reduce((sum: number, pos: any) => sum + pos.initialValue, 0);
        const totalPnLPercent = totalInitial > 0 ? (totalPnL / totalInitial) * 100 : 0;
        const winningPositions = positions.filter((pos: any) => pos.cashPnl > 0).length;
        const winRate = positions.length > 0 ? (winningPositions / positions.length) * 100 : 0;
        
        setPortfolioMetrics({
          totalValue,
          totalPnL,
          totalPnLPercent,
          positionCount: positions.length,
          winRate,
          usdcBalance,
        });
      } catch (error) {
        console.error('Error fetching portfolio metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioMetrics();
  }, [agentType]);
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  // Show skeleton loaders while loading
  if (loading) {
    return (
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-6">
        {[...Array(6)].map((_, index) => (
          <Card key={index} className="@container/card metric-card hedge-fund-card">
            <CardHeader>
              <CardDescription className="flex items-center gap-2 hedge-fund-subtitle">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-24" />
              </CardDescription>
              <CardTitle className="hedge-fund-metric @[250px]/card:text-3xl">
                <Skeleton className="h-8 w-32" />
              </CardTitle>
              <CardAction>
                <Skeleton className="h-6 w-20 rounded-full" />
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4 rounded" />
              </div>
              <div className="text-muted-foreground hedge-fund-subtitle">
                <Skeleton className="h-4 w-48" />
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  // Shared portfolio metrics cards for all agent types with real data and polished styling
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-6">
      <Card className="@container/card metric-card hedge-fund-card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2 hedge-fund-subtitle">
            <IconCurrencyDollar className="size-4" />
            USDC Balance
          </CardDescription>
          <CardTitle className="hedge-fund-metric @[250px]/card:text-3xl">
            ${portfolioMetrics.usdcBalance.toFixed(2)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="hedge-fund-change">
              Available Funds
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Liquid cash <IconCurrencyDollar className="size-4" />
          </div>
          <div className="text-muted-foreground hedge-fund-subtitle">
            Ready for immediate deployment
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card metric-card hedge-fund-card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2 hedge-fund-subtitle">
            <IconWallet className="size-4" />
            Portfolio Value
          </CardDescription>
          <CardTitle className="hedge-fund-metric @[250px]/card:text-3xl">
            ${portfolioMetrics.totalValue.toFixed(2)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="hedge-fund-change">
              In Positions
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Active capital <IconWallet className="size-4" />
          </div>
          <div className="text-muted-foreground hedge-fund-subtitle">
            Total value of current market positions
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card metric-card hedge-fund-card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2 hedge-fund-subtitle">
            <IconChartLine className="size-4" />
            Total P&L
          </CardDescription>
          <CardTitle className={`hedge-fund-metric @[250px]/card:text-3xl ${portfolioMetrics.totalPnL >= 0 ? 'pnl-positive' : 'pnl-negative'}`}>
            {portfolioMetrics.totalPnL >= 0 ? '+' : ''}${portfolioMetrics.totalPnL.toFixed(2)}
          </CardTitle>
          <CardAction>
            <Badge 
              variant="outline" 
              className={`hedge-fund-change ${portfolioMetrics.totalPnL >= 0 ? 'pnl-positive' : 'pnl-negative'}`}
            >
              {portfolioMetrics.totalPnL >= 0 ? <IconTrendingUp /> : <IconTrendingDown />}
              {formatPercent(portfolioMetrics.totalPnLPercent)}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Realized + unrealized {portfolioMetrics.totalPnL >= 0 ? <IconTrendingUp className="size-4" /> : <IconTrendingDown className="size-4" />}
          </div>
          <div className="text-muted-foreground hedge-fund-subtitle">
            Total profit/loss across all positions
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card metric-card hedge-fund-card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2 hedge-fund-subtitle">
            <IconChartDots3 className="size-4" />
            Active Positions
          </CardDescription>
          <CardTitle className="hedge-fund-metric @[250px]/card:text-3xl">
            {portfolioMetrics.positionCount}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="hedge-fund-change">
              Markets
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Open positions <IconChartDots3 className="size-4" />
          </div>
          <div className="text-muted-foreground hedge-fund-subtitle">
            Number of active prediction market positions
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card metric-card hedge-fund-card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2 hedge-fund-subtitle">
            <IconPercentage className="size-4" />
            Win Rate
          </CardDescription>
          <CardTitle className={`hedge-fund-metric @[250px]/card:text-3xl ${portfolioMetrics.winRate >= 50 ? 'pnl-positive' : 'pnl-negative'}`}>
            {portfolioMetrics.winRate.toFixed(1)}%
          </CardTitle>
          <CardAction>
            <Badge 
              variant="outline" 
              className={`hedge-fund-change ${portfolioMetrics.winRate >= 50 ? 'pnl-positive' : 'pnl-negative'}`}
            >
              {portfolioMetrics.winRate >= 50 ? 'Profitable' : 'Underwater'}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Portfolio accuracy <IconPercentage className="size-4" />
          </div>
          <div className="text-muted-foreground hedge-fund-subtitle">
            Percentage of winning positions
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card metric-card hedge-fund-card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2 hedge-fund-subtitle">
            <IconAlertTriangle className="size-4" />
            Risk Score
          </CardDescription>
          <CardTitle className="hedge-fund-metric @[250px]/card:text-3xl">
            {Math.abs(portfolioMetrics.totalPnLPercent) > 20 ? 'High' : Math.abs(portfolioMetrics.totalPnLPercent) > 10 ? 'Medium' : 'Low'}
          </CardTitle>
          <CardAction>
            <Badge 
              variant="outline" 
              className="hedge-fund-change"
            >
              <IconShield />
              Monitored
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Risk assessment <IconAlertTriangle className="size-4" />
          </div>
          <div className="text-muted-foreground hedge-fund-subtitle">
            Portfolio volatility risk level
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
