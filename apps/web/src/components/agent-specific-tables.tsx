'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useIsInitialized, useIsSignedIn } from '@coinbase/cdp-hooks';
import { Loader2Icon } from 'lucide-react';
import {
  IconAlertTriangle,
  IconChartBar,
  IconShield,
  IconTarget,
  IconTrendingUp,
} from '@tabler/icons-react';

import { mockResearchReports } from '@/lib/mock-data';
import { fetchResearchReports } from '@/lib/polymarket-data';
import { ResearchReport, TableCell } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { HedgeFundTable } from '@/components/hedge-fund-table';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { ChartAreaInteractive } from '@/components/chart-area-interactive';
import { SectionCards } from '@/components/section-cards';
import { SiteHeader } from '@/components/site-header';
import { PortfolioManagerDashboard } from '@/components/portfolio-manager-dashboard';

// Use research reports data instead of performance metrics
const researchAnalystData = mockResearchReports;

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
    accessorKey: 'title',
    header: 'Report Title',
    cell: ({ row }: TableCell) => {
      const title = row.getValue('title') as string;
      return <span className="max-w-xs truncate font-medium">{title}</span>;
    },
  },
  {
    accessorKey: 'author',
    header: 'Author',
    cell: ({ row }: TableCell) => {
      const author = row.getValue('author') as string;
      return <span className="font-medium">{author}</span>;
    },
  },
  {
    accessorKey: 'marketCategory',
    header: 'Category',
    cell: ({ row }: TableCell) => {
      const category = row.getValue('marketCategory') as string;
      return <Badge variant="outline">{category}</Badge>;
    },
  },
  {
    accessorKey: 'recommendation',
    header: 'Recommendation',
    cell: ({ row }: TableCell) => {
      const rec = row.getValue('recommendation') as string;
      const variant =
        rec === 'BUY'
          ? 'default'
          : rec === 'SELL'
            ? 'destructive'
            : rec === 'HOLD'
              ? 'secondary'
              : 'outline';
      return <Badge variant={variant}>{rec}</Badge>;
    },
  },
  {
    accessorKey: 'confidence',
    header: 'Confidence',
    cell: ({ row }: TableCell) => {
      const confidence = row.getValue('confidence') as number;
      return (
        <span className="font-mono">{(confidence * 100).toFixed(0)}%</span>
      );
    },
  },
  {
    accessorKey: 'publishedDate',
    header: 'Published',
    cell: ({ row }: TableCell) => {
      const date = row.getValue('publishedDate') as string;
      return <span className="font-mono text-sm">{date}</span>;
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }: TableCell) => {
      const status = row.getValue('status') as string;
      const variant =
        status === 'Published'
          ? 'default'
          : status === 'Draft'
            ? 'secondary'
            : 'outline';
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
  agent: string;
}

export function AgentSpecificTable({ agent }: AgentSpecificTableProps) {
  const router = useRouter();
  const { isSignedIn } = useIsSignedIn();
  const { isInitialized } = useIsInitialized();
  const [researchReports, setResearchReports] = useState<ResearchReport[]>([]);
  const [loading, setLoading] = useState(false);

  // Handle authentication
  useEffect(() => {
    if (isInitialized && !isSignedIn) {
      router.push('/login');
    }
  }, [isInitialized, isSignedIn, router]);

  // Fetch research reports for research analyst
  useEffect(() => {
    if (agent === 'research-analyst') {
      const loadResearchReports = async () => {
        setLoading(true);
        try {
          const reports = await fetchResearchReports();
          if (reports.length > 0) {
            setResearchReports(reports);
          } else {
            // Fallback to mock data if no real data available
            setResearchReports(mockResearchReports);
          }
        } catch (error) {
          console.error('Error fetching research reports:', error);
          // Fallback to mock data on error
          setResearchReports(mockResearchReports);
        } finally {
          setLoading(false);
        }
      };

      loadResearchReports();
    }
  }, [agent]);
  const getTableConfig = () => {
    switch (agent) {
      case 'research-analyst':
        return {
          title: 'Research Reports',
          description:
            'Published research reports and market analysis documents',
          data:
            researchReports.length > 0 ? researchReports : researchAnalystData,
          columns: researchAnalystColumns,
          icon: IconTarget,
          loading: loading,
        };
      case 'portfolio-manager':
        return {
          title: 'Active Wagers',
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

  // Show loading spinner while initializing
  if (!isInitialized || !agent) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2Icon className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  const config = getTableConfig();
  const IconComponent = config.icon;

  // Render table card component
  const TableCard = () => {
    // Show loading state for research analyst
    if (
      agent === 'research-analyst' &&
      'loading' in config &&
      config.loading
    ) {
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
            Loading research reports...
          </div>
        </CardContent>
      </Card>
      );
    }

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
  };

  // Main layout with sidebar and conditional content
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
              {agent === 'portfolio-manager' ? (
                // Portfolio Manager: Only show the dashboard
                <div className="px-4 lg:px-6">
                  <PortfolioManagerDashboard />
                </div>
              ) : (
                // Other Agents: Show SectionCards + ChartAreaInteractive + AgentSpecificTable
                <>
                  <SectionCards />
                  <div className="px-4 lg:px-6">
                    <ChartAreaInteractive />
                  </div>
                  <div className="px-4 lg:px-6">
                    <TableCard />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
