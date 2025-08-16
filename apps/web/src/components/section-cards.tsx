import { IconTrendingDown, IconTrendingUp, IconCurrencyDollar, IconChartLine, IconShield, IconTarget, IconChartDots3 } from '@tabler/icons-react';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { mockFundMetrics } from '@/lib/mock-data';

export function SectionCards() {
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
            Today's profit/loss performance
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
            Percentage of NAV in active positions
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
