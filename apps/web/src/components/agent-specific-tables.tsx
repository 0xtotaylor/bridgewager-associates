'use client';

import { useEffect } from 'react';
import {
  IconAlertTriangle,
  IconChartBar,
  IconShield,
  IconTarget,
  IconTrendingUp,
} from '@tabler/icons-react';

import { TableCell } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { HedgeFundTable } from '@/components/hedge-fund-table';

const researchAnalystData = [
  {
    metric: 'Forecast Accuracy',
    value: '74.2%',
    change: '+3.1%',
    status: 'improving',
  },
  {
    metric: 'Brier Score',
    value: '0.142',
    change: '-0.008',
    status: 'improving',
  },
  {
    metric: 'Calibration Error',
    value: '2.3%',
    change: '-0.5%',
    status: 'improving',
  },
  {
    metric: 'Market Coverage',
    value: '127 markets',
    change: '+12',
    status: 'stable',
  },
];

const portfolioManagerData = [
  {
    position: 'US Election 2024',
    allocation: '$125,000',
    weight: '8.3%',
    pnl: '+$12,450',
    risk: 'Medium',
  },
  {
    position: 'Fed Rate Decision',
    allocation: '$89,000',
    weight: '5.9%',
    pnl: '+$3,200',
    risk: 'Low',
  },
  {
    position: 'Tech Stock Volatility',
    allocation: '$67,500',
    weight: '4.5%',
    pnl: '-$1,800',
    risk: 'High',
  },
  {
    position: 'Crypto Regulation',
    allocation: '$45,000',
    weight: '3.0%',
    pnl: '+$5,600',
    risk: 'Medium',
  },
];

const traderData = [
  {
    market: 'Trump Wins 2024 Election',
    venue: 'Polymarket',
    position: 'YES $25k',
    entry: '0.42',
    current: '0.46',
    pnl: '+$2,380',
    status: 'Open',
  },
  {
    market: 'Fed Cuts Rates in March',
    venue: 'Kalshi',
    position: 'NO $15k',
    entry: '0.67',
    current: '0.59',
    pnl: '+$1,920',
    status: 'Open',
  },
  {
    market: 'Tesla $300 by EOY',
    venue: 'Polymarket',
    position: 'YES $10k',
    entry: '0.28',
    current: '0.31',
    pnl: '+$1,070',
    status: 'Open',
  },
  {
    market: 'AI Regulation Bill Passes',
    venue: 'Kalshi',
    position: 'NO $20k',
    entry: '0.75',
    current: '0.72',
    pnl: '+$800',
    status: 'Pending',
  },
];

const complianceOfficerData = [
  {
    check: 'Position Size Limits',
    status: 'Compliant',
    lastReview: '2024-01-15',
    nextReview: '2024-01-16',
    risk: 'Low',
  },
  {
    check: 'Market Concentration',
    status: 'Warning',
    lastReview: '2024-01-15',
    nextReview: '2024-01-16',
    risk: 'Medium',
  },
  {
    check: 'Liquidity Requirements',
    status: 'Compliant',
    lastReview: '2024-01-15',
    nextReview: '2024-01-17',
    risk: 'Low',
  },
  {
    check: 'Correlation Exposure',
    status: 'Compliant',
    lastReview: '2024-01-15',
    nextReview: '2024-01-18',
    risk: 'Low',
  },
];

// Column definitions for each agent type
const researchAnalystColumns = [
  {
    accessorKey: 'metric',
    header: 'Performance Metric',
  },
  {
    accessorKey: 'value',
    header: 'Current Value',
    cell: ({ row }: TableCell) => {
      const value = row.getValue('value') as string;
      return <span className="font-mono font-medium">{value}</span>;
    },
  },
  {
    accessorKey: 'change',
    header: '30d Change',
    cell: ({ row }: TableCell) => {
      const change = row.getValue('change') as string;
      const isPositive = change.startsWith('+');
      return (
        <span
          className={`font-mono ${isPositive ? 'text-green-600' : 'text-red-600'}`}
        >
          {change}
        </span>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Trend',
    cell: ({ row }: TableCell) => {
      const status = row.getValue('status') as string;
      const variant =
        status === 'improving'
          ? 'default'
          : status === 'stable'
            ? 'secondary'
            : 'destructive';
      return <Badge variant={variant}>{status}</Badge>;
    },
  },
];

const portfolioManagerColumns = [
  {
    accessorKey: 'position',
    header: 'Position',
    cell: ({ row }: TableCell) => {
      const position = row.getValue('position') as string;
      return <span className="max-w-xs truncate font-medium">{position}</span>;
    },
  },
  {
    accessorKey: 'allocation',
    header: 'Capital Allocated',
    cell: ({ row }: TableCell) => {
      const allocation = row.getValue('allocation') as string;
      return <span className="font-mono">{allocation}</span>;
    },
  },
  {
    accessorKey: 'weight',
    header: 'Portfolio Weight',
    cell: ({ row }: TableCell) => {
      const weight = row.getValue('weight') as string;
      return <span className="font-mono">{weight}</span>;
    },
  },
  {
    accessorKey: 'pnl',
    header: 'Unrealized P&L',
    cell: ({ row }: TableCell) => {
      const pnl = row.getValue('pnl') as string;
      const isPositive = pnl.startsWith('+');
      return (
        <span
          className={`font-mono font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}
        >
          {pnl}
        </span>
      );
    },
  },
  {
    accessorKey: 'risk',
    header: 'Risk Level',
    cell: ({ row }: TableCell) => {
      const risk = row.getValue('risk') as string;
      const variant =
        risk === 'Low'
          ? 'default'
          : risk === 'Medium'
            ? 'secondary'
            : 'destructive';
      return <Badge variant={variant}>{risk}</Badge>;
    },
  },
];

const traderColumns = [
  {
    accessorKey: 'market',
    header: 'Market',
    cell: ({ row }: TableCell) => {
      const market = row.getValue('market') as string;
      return <span className="max-w-xs truncate">{market}</span>;
    },
  },
  {
    accessorKey: 'venue',
    header: 'Venue',
    cell: ({ row }: TableCell) => {
      const venue = row.getValue('venue') as string;
      return <Badge variant="outline">{venue}</Badge>;
    },
  },
  {
    accessorKey: 'position',
    header: 'Position',
    cell: ({ row }: TableCell) => {
      const position = row.getValue('position') as string;
      return <span className="font-mono">{position}</span>;
    },
  },
  {
    accessorKey: 'entry',
    header: 'Entry Price',
    cell: ({ row }: TableCell) => {
      const entry = row.getValue('entry') as string;
      return <span className="font-mono">{entry}</span>;
    },
  },
  {
    accessorKey: 'current',
    header: 'Current Price',
    cell: ({ row }: TableCell) => {
      const current = row.getValue('current') as string;
      return <span className="font-mono">{current}</span>;
    },
  },
  {
    accessorKey: 'pnl',
    header: 'Unrealized P&L',
    cell: ({ row }: TableCell) => {
      const pnl = row.getValue('pnl') as string;
      const isPositive = pnl.startsWith('+');
      return (
        <span
          className={`font-mono font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}
        >
          {pnl}
        </span>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }: TableCell) => {
      const status = row.getValue('status') as string;
      const variant = status === 'Open' ? 'default' : 'secondary';
      return <Badge variant={variant}>{status}</Badge>;
    },
  },
];

const complianceOfficerColumns = [
  {
    accessorKey: 'check',
    header: 'Compliance Check',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }: TableCell) => {
      const status = row.getValue('status') as string;
      const variant =
        status === 'Compliant'
          ? 'default'
          : status === 'Warning'
            ? 'destructive'
            : 'secondary';
      return <Badge variant={variant}>{status}</Badge>;
    },
  },
  {
    accessorKey: 'lastReview',
    header: 'Last Review',
    cell: ({ row }: TableCell) => {
      const date = row.getValue('lastReview') as string;
      return <span className="font-mono text-sm">{date}</span>;
    },
  },
  {
    accessorKey: 'nextReview',
    header: 'Next Review',
    cell: ({ row }: TableCell) => {
      const date = row.getValue('nextReview') as string;
      return <span className="font-mono text-sm">{date}</span>;
    },
  },
  {
    accessorKey: 'risk',
    header: 'Risk Level',
    cell: ({ row }: TableCell) => {
      const risk = row.getValue('risk') as string;
      const variant =
        risk === 'Low'
          ? 'default'
          : risk === 'Medium'
            ? 'secondary'
            : 'destructive';
      return <Badge variant={variant}>{risk}</Badge>;
    },
  },
];

interface AgentSpecificTableProps {
  agentType: string;
}

export function AgentSpecificTable({ agentType }: AgentSpecificTableProps) {
  // Fetch research data for research analyst
  useEffect(() => {
    if (agentType === 'research-analyst') {
      const fetchResearchData = async () => {
        try {
          const response = await fetch('/api/research');
          const data = await response.json();
          console.log('Research data:', data);
        } catch (error) {
          console.error('Error fetching research data:', error);
        }
      };

      fetchResearchData();
    }
  }, [agentType]);
  const getTableConfig = () => {
    switch (agentType) {
      case 'research-analyst':
        return {
          title: 'Research Performance Metrics',
          description:
            'Key performance indicators for forecasting accuracy and market analysis',
          data: researchAnalystData,
          columns: researchAnalystColumns,
          icon: IconTarget,
        };
      case 'portfolio-manager':
        return {
          title: 'Active Positions',
          description:
            'Current portfolio allocations and performance by position',
          data: portfolioManagerData,
          columns: portfolioManagerColumns,
          icon: IconChartBar,
        };
      case 'trader':
        return {
          title: 'Open Trading Positions',
          description: 'Live trading positions across prediction market venues',
          data: traderData,
          columns: traderColumns,
          icon: IconTrendingUp,
        };
      case 'compliance-officer':
        return {
          title: 'Risk & Compliance Monitoring',
          description: 'Current compliance status and risk management checks',
          data: complianceOfficerData,
          columns: complianceOfficerColumns,
          icon: IconShield,
        };
      default:
        return {
          title: 'Agent Overview',
          description: 'No specific data available for this agent type',
          data: [],
          columns: [],
          icon: IconAlertTriangle,
        };
    }
  };

  const config = getTableConfig();
  const IconComponent = config.icon;

  if (config.data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconComponent className="h-5 w-5" />
            {config.title}
          </CardTitle>
          <CardDescription>{config.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No data available for this agent type
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconComponent className="h-5 w-5" />
          {config.title}
        </CardTitle>
        <CardDescription>{config.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <HedgeFundTable
          data={config.data as Record<string, unknown>[]}
          columns={config.columns}
        />
      </CardContent>
    </Card>
  );
}
