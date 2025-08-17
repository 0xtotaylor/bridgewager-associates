'use client';

import { useEffect, useState } from 'react';
import {
  IconChartDots3,
  IconChartLine,
  IconCurrencyDollar,
  IconShield,
  IconTarget,
  IconTrendingDown,
  IconTrendingUp,
  IconWallet,
  IconPercentage,
  IconAlertTriangle,
} from '@tabler/icons-react';

import { mockFundMetrics } from '@/lib/mock-data';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface PortfolioMetrics {
  totalValue: number;
  totalPnL: number;
  totalPnLPercent: number;
  positionCount: number;
  winRate: number;
}

export function SectionCards({ agentType }: { agentType?: string }) {
  const [portfolioMetrics, setPortfolioMetrics] = useState<PortfolioMetrics>({
    totalValue: 0,
    totalPnL: 0,
    totalPnLPercent: 0,
    positionCount: 0,
    winRate: 0,
  });

  useEffect(() => {
    if (agentType === 'portfolio-manager') {
      // Fetch portfolio metrics
      const fetchPortfolioMetrics = async () => {
        try {
          const { getUserPositions, getUserHoldings } = await import(
            '@/lib/polymarket-portfolio.js'
          );

          const userAddress = '0x4bA01fF1DEfA6948a801d3711892b9c00F170447';
          
          // Get holdings value
          const holdings = await getUserHoldings(userAddress);
          const totalValue = holdings[0]?.value || 0;
          
          // Get positions for detailed metrics
          const positions = await getUserPositions(userAddress, {
            limit: 100,
            sortBy: 'CURRENT',
          });
          
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
          });
        } catch (error) {
          console.error('Error fetching portfolio metrics:', error);
        }
      };

      fetchPortfolioMetrics();
    }
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

  // Show portfolio-specific metrics for portfolio manager
  if (agentType === 'portfolio-manager') {
    return (
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-5">
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
                Live Balance
              </Badge>
            </CardAction>
          </CardHeader>
        </Card>

        <Card className="@container/card metric-card hedge-fund-card">
          <CardHeader>
            <CardDescription className="flex items-center gap-2 hedge-fund-subtitle">
              <IconCurrencyDollar className="size-4" />
              Total P&L
            </CardDescription>
            <CardTitle className="hedge-fund-metric @[250px]/card:text-3xl">
              <span className={portfolioMetrics.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}>
                {portfolioMetrics.totalPnL >= 0 ? '+' : ''}${portfolioMetrics.totalPnL.toFixed(2)}
              </span>
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
        </Card>

        <Card className="@container/card metric-card hedge-fund-card">
          <CardHeader>
            <CardDescription className="flex items-center gap-2 hedge-fund-subtitle">
              <IconPercentage className="size-4" />
              Win Rate
            </CardDescription>
            <CardTitle className="hedge-fund-metric @[250px]/card:text-3xl">
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
        </Card>
      </div>
    );
  }

  // Default metrics for other agents
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-5">
      <Card className="@container/card metric-card hedge-fund-card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2 hedge-fund-subtitle">
            <IconCurrencyDollar className="size-4" />
            Net Asset Value
          </CardDescription>
          <CardTitle className="hedge-fund-metric @[250px]/card:text-3xl">
            {formatCurrency(mockFundMetrics.nav)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="hedge-fund-change pnl-positive">
              <IconTrendingUp />
              +2.8%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Fund bankroll <IconCurrencyDollar className="size-4" />
          </div>
          <div className="text-muted-foreground hedge-fund-subtitle">
            Total capital available for deployment
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card metric-card hedge-fund-card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2 hedge-fund-subtitle">
            <IconChartLine className="size-4" />
            Daily PnL
          </CardDescription>
          <CardTitle className="hedge-fund-metric @[250px]/card:text-3xl pnl-positive">
            {formatCurrency(mockFundMetrics.pnlDaily)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="hedge-fund-change pnl-positive">
              <IconTrendingUp />
              +6.4%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Realized + unrealized <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground hedge-fund-subtitle">
            Today&apos;s profit/loss performance
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card metric-card hedge-fund-card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2 hedge-fund-subtitle">
            <IconShield className="size-4" />
            Capital at Risk
          </CardDescription>
          <CardTitle className="hedge-fund-metric @[250px]/card:text-3xl financial-number">
            {formatPercent(mockFundMetrics.capitalAtRiskPct)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="hedge-fund-change risk-medium">
              <IconTrendingUp />
              +5.2%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Bankroll deployed <IconShield className="size-4" />
          </div>
          <div className="text-muted-foreground hedge-fund-subtitle">
            Percentage of NAV in active wagers
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card metric-card hedge-fund-card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2 hedge-fund-subtitle">
            <IconTarget className="size-4" />
            Expected Value
          </CardDescription>
          <CardTitle className="hedge-fund-metric @[250px]/card:text-3xl pnl-positive">
            {formatCurrency(mockFundMetrics.evTotal)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="hedge-fund-change pnl-positive">
              <IconTrendingUp />
              +12.1%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Sum across active bets <IconTarget className="size-4" />
          </div>
          <div className="text-muted-foreground hedge-fund-subtitle">
            Forecasted profit from current positions
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card metric-card hedge-fund-card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2 hedge-fund-subtitle">
            <IconChartDots3 className="size-4" />
            Max Drawdown (30d)
          </CardDescription>
          <CardTitle className="hedge-fund-metric @[250px]/card:text-3xl pnl-negative">
            {formatPercent(mockFundMetrics.maxDrawdown30d)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="hedge-fund-change risk-high">
              <IconTrendingDown />
              Risk indicator
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Rolling worst decline <IconChartDots3 className="size-4" />
          </div>
          <div className="text-muted-foreground hedge-fund-subtitle">
            Maximum portfolio decline in last 30 days
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
