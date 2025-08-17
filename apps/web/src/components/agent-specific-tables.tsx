'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  IconAlertTriangle,
  IconChartPie,
  IconListDetails,
  IconLoader,
  IconLock,
  IconLockOpen,
  IconShield,
} from '@tabler/icons-react';

import { fetchResearchReports } from '@/lib/polymarket-data';
import { createClient } from '@/lib/supabase';
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
import { ReportViewer } from '@/components/report-viewer';

// Research reports will come from API only

interface WagerData {
  name: string;
  allocation: number;
  weight: number;
  pnl: number;
  risk: string;
  currentPrice?: number;
  avgPrice?: number;
  size?: number;
  percentPnl?: number;
  endDate?: string;
  outcome?: string;
  realizedPnl?: number;
}

interface TradeData {
  title: string;
  side: 'BUY' | 'SELL';
  size: number;
  price: number;
  timestamp: number;
  outcome: string;
  transactionHash: string;
  slug: string;
  icon?: string;
}

const supabase = createClient();

async function fetchAllWagersData(): Promise<TradeData[]> {
  try {
    // Dynamically import the Polymarket portfolio functions
    const { getUserTrades } = await import('@/lib/polymarket-portfolio');
    
    // Using a known address for demo purposes - replace with actual user address
    const userAddress = '0x4bA01fF1DEfA6948a801d3711892b9c00F170447';
    
    // Fetch all trades from Polymarket
    const trades = await getUserTrades(userAddress, {
      limit: 100,
      offset: 0,
    });

    // Transform to TradeData format
    const transformedData: TradeData[] = trades.map((trade: any) => ({
      title: trade.title,
      side: trade.side,
      size: trade.size,
      price: trade.price,
      timestamp: trade.timestamp,
      outcome: trade.outcome,
      transactionHash: trade.transactionHash,
      slug: trade.slug,
      icon: trade.icon,
    }));

    return transformedData;
  } catch (err) {
    console.error('Error fetching Polymarket trades:', err);
    return [];
  }
}

async function fetchWagersData(): Promise<WagerData[]> {
  try {
    // Dynamically import the Polymarket portfolio functions
    const { getUserPositions } = await import('@/lib/polymarket-portfolio');
    
    // Using a known address for demo purposes - replace with actual user address
    const userAddress = '0x4bA01fF1DEfA6948a801d3711892b9c00F170447';
    
    // Fetch positions from Polymarket
    const positions = await getUserPositions(userAddress, {
      limit: 50,
      sortBy: 'CURRENT',
      sortDirection: 'DESC',
      sizeThreshold: 0.01 // Only show positions with meaningful size
    });

    // Transform Polymarket positions to WagerData format
    const transformedData: WagerData[] = positions.map((position: any) => {
      // Calculate risk level based on position metrics
      let riskLevel = 'Low';
      if (Math.abs(position.percentPnl) > 30) riskLevel = 'High';
      else if (Math.abs(position.percentPnl) > 15) riskLevel = 'Medium';

      return {
        name: position.title,
        allocation: position.currentValue,
        weight: 0, // Will be calculated below
        pnl: position.cashPnl,
        risk: riskLevel,
        currentPrice: position.curPrice,
        avgPrice: position.avgPrice,
        size: position.size,
        percentPnl: position.percentPnl,
        endDate: position.endDate,
        outcome: position.outcome,
        realizedPnl: position.realizedPnl,
      };
    });

    // Calculate portfolio weights
    const totalValue = transformedData.reduce((sum, item) => sum + item.allocation, 0);
    transformedData.forEach(item => {
      item.weight = totalValue > 0 ? item.allocation / totalValue : 0;
    });

    return transformedData;
  } catch (err) {
    console.error('Error fetching Polymarket positions:', err);
    
    // Fallback to Supabase data if Polymarket fails
    try {
      const { data, error } = await supabase
        .from('wagers')
        .select('name, allocation, weight, pnl, risk');

      if (error) {
        console.error('Error fetching wagers:', error);
        return [];
      }

      return data || [];
    } catch (fallbackErr) {
      console.error('Error fetching fallback wagers data:', fallbackErr);
      return [];
    }
  }
}

const complianceOfficerData = [
  {
    check: 'Wager Size Limits',
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
const getResearchAnalystColumns = (hasUrlParams: boolean) => [
  {
    accessorKey: 'title',
    header: 'Report Title',
    cell: ({ row }: TableCell) => {
      const title = row.getValue('title') as string;
      return <span className="max-w-xs truncate font-medium">{title}</span>;
    },
  },
  {
    accessorKey: 'blobObjectId',
    header: 'Blob ID',
    cell: ({ row }: TableCell) => {
      const blobId = row.getValue('blobObjectId') as string;
      const truncatedId = blobId ? `${blobId.substring(0, 12)}...` : 'N/A';
      return <span className="font-mono text-xs">{truncatedId}</span>;
    },
  },
  {
    accessorKey: 'mimeType',
    header: 'MIME Type',
    cell: ({ row }: TableCell) => {
      const mimeType = row.getValue('mimeType') as string;
      return <Badge variant="outline">{mimeType || 'unknown'}</Badge>;
    },
  },
  {
    accessorKey: 'locked',
    header: 'Locked',
    cell: ({ row }: TableCell) => {
      const locked = Boolean(row.getValue('locked'));
      return (
        <div className="flex items-center justify-center">
          {!locked && hasUrlParams && <IconLockOpen className="h-4 w-4 text-green-600" />}
          {!locked && !hasUrlParams && <IconLock className="h-4 w-4 text-red-600" />}
        </div>
      );
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
    accessorKey: 'name',
    header: 'Market',
    cell: ({ row }: TableCell) => {
      const name = row.getValue('name') as string;
      const outcome = (row.original as any).outcome as string;
      const endDate = (row.original as any).endDate as string;
      return (
        <div className="flex flex-col">
          <span className="max-w-xs truncate font-medium">{name}</span>
          <span className="text-xs text-muted-foreground">
            {outcome} • Expires {endDate}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'size',
    header: 'Position Size',
    cell: ({ row }: TableCell) => {
      const size = row.getValue('size') as number;
      const avgPrice = (row.original as any).avgPrice as number;
      const currentPrice = (row.original as any).currentPrice as number;
      return (
        <div className="flex flex-col">
          <span className="font-mono">{size?.toFixed(2)} shares</span>
          <span className="text-xs text-muted-foreground">
            Avg: ${avgPrice?.toFixed(3)} | Now: ${currentPrice?.toFixed(3)}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'allocation',
    header: 'Current Value',
    cell: ({ row }: TableCell) => {
      const allocation = row.getValue('allocation') as number;
      const weight = (row.original as any).weight as number;
      return (
        <div className="flex flex-col">
          <span className="font-mono">${allocation?.toFixed(2)}</span>
          <span className="text-xs text-muted-foreground">
            {(weight * 100).toFixed(1)}% of portfolio
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'pnl',
    header: 'P&L',
    cell: ({ row }: TableCell) => {
      const pnl = row.getValue('pnl') as number;
      const percentPnl = (row.original as any).percentPnl as number;
      const realizedPnl = (row.original as any).realizedPnl as number;
      const isPositive = pnl >= 0;
      return (
        <div className="flex flex-col">
          <span
            className={`font-mono font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}
          >
            {isPositive ? '+' : ''}${pnl?.toFixed(2)} ({percentPnl?.toFixed(1)}%)
          </span>
          {realizedPnl && realizedPnl !== 0 && (
            <span className="text-xs text-muted-foreground">
              Realized: ${realizedPnl.toFixed(2)}
            </span>
          )}
        </div>
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

const allWagersColumns = [
  {
    accessorKey: 'title',
    header: 'Market',
    cell: ({ row }: TableCell) => {
      const title = row.getValue('title') as string;
      const outcome = (row.original as any).outcome as string;
      const slug = (row.original as any).slug as string;
      return (
        <div className="flex flex-col">
          <span className="max-w-xs truncate font-medium">{title}</span>
          <span className="text-xs text-muted-foreground">
            {outcome} • {slug}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'side',
    header: 'Side',
    cell: ({ row }: TableCell) => {
      const side = row.getValue('side') as string;
      return (
        <Badge variant={side === 'BUY' ? 'default' : 'secondary'}>
          {side}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'size',
    header: 'Size',
    cell: ({ row }: TableCell) => {
      const size = row.getValue('size') as number;
      const price = (row.original as any).price as number;
      const value = size * price;
      return (
        <div className="flex flex-col">
          <span className="font-mono">{size?.toFixed(2)} shares</span>
          <span className="text-xs text-muted-foreground">
            ${value?.toFixed(2)} value
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'price',
    header: 'Price',
    cell: ({ row }: TableCell) => {
      const price = row.getValue('price') as number;
      return <span className="font-mono">${price?.toFixed(4)}</span>;
    },
  },
  {
    accessorKey: 'timestamp',
    header: 'Date',
    cell: ({ row }: TableCell) => {
      const timestamp = row.getValue('timestamp') as number;
      const date = new Date(timestamp * 1000);
      return (
        <div className="flex flex-col">
          <span className="text-sm">{date.toLocaleDateString()}</span>
          <span className="text-xs text-muted-foreground">
            {date.toLocaleTimeString()}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'transactionHash',
    header: 'Transaction',
    cell: ({ row }: TableCell) => {
      const hash = row.getValue('transactionHash') as string;
      const shortHash = hash ? `${hash.slice(0, 6)}...${hash.slice(-4)}` : '';
      return (
        <span className="font-mono text-xs">
          {shortHash}
        </span>
      );
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
  const searchParams = useSearchParams();
  const hasUrlParams = searchParams.toString().length > 0;
  const [researchReports, setResearchReports] = useState<ResearchReport[]>([]);
  const [wagersData, setWagersData] = useState<WagerData[]>([]);
  const [allWagersData, setAllWagersData] = useState<TradeData[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingTrades, setLoadingTrades] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ResearchReport | null>(
    null,
  );
  const [isReportViewerOpen, setIsReportViewerOpen] = useState(false);

  // Fetch research reports for research analyst
  useEffect(() => {
    if (agentType === 'research-analyst') {
      const loadResearchReports = async () => {
        setLoading(true);
        try {
          const reports = await fetchResearchReports();
          setResearchReports(reports);
        } catch (error) {
          console.error('Error fetching research reports:', error);
          setResearchReports([]);
        } finally {
          setLoading(false);
        }
      };

      loadResearchReports();
    }
  }, [agentType]);

  // Fetch wagers data for portfolio manager
  useEffect(() => {
    if (agentType === 'portfolio-manager') {
      const loadWagersData = async () => {
        setLoading(true);
        try {
          const data = await fetchWagersData();
          setWagersData(data);
        } catch (error) {
          console.error('Error fetching wagers data:', error);
          setWagersData([]);
        } finally {
          setLoading(false);
        }
      };

      loadWagersData();
    }
  }, [agentType]);

  // Fetch all trades for portfolio manager
  useEffect(() => {
    if (agentType === 'portfolio-manager') {
      const loadAllWagersData = async () => {
        setLoadingTrades(true);
        try {
          const data = await fetchAllWagersData();
          setAllWagersData(data);
        } catch (error) {
          console.error('Error fetching all trades:', error);
          setAllWagersData([]);
        } finally {
          setLoadingTrades(false);
        }
      };

      loadAllWagersData();
    }
  }, [agentType]);

  const handleReportClick = (report: ResearchReport) => {
    // Only allow opening report viewer if there are URL params
    if (!hasUrlParams) {
      return;
    }
    setSelectedReport(report);
    setIsReportViewerOpen(true);
  };

  const handleCloseReportViewer = () => {
    setIsReportViewerOpen(false);
    setSelectedReport(null);
  };

  const loadReportFiles = async () => {
    try {
      const response = await fetch('/api/research');
      const data = await response.json();
      return data.files || [];
    } catch (error) {
      console.error('Error loading report files:', error);
      return [];
    }
  };
  const getTableConfig = () => {
    switch (agentType) {
      case 'research-analyst':
        return {
          title: 'Research Reports',
          description:
            'Published research reports and market analysis documents',
          data: researchReports,
          columns: getResearchAnalystColumns(hasUrlParams),
          icon: IconListDetails,
          loading: loading,
        };
      case 'portfolio-manager':
        return {
          title: 'Active Wagers',
          description:
            'Current portfolio allocations and performance by position',
          data: wagersData,
          columns: portfolioManagerColumns,
          icon: IconChartPie,
          loading: loading,
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

  // Show loading state for research analyst and portfolio manager
  if (
    (agentType === 'research-analyst' || agentType === 'portfolio-manager') &&
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
          <div className="flex justify-center py-8">
            <IconLoader className="animate-spin text-muted-foreground" size={24} />
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

  // Special handling for portfolio manager - show both Active and All Wagers tables
  if (agentType === 'portfolio-manager') {
    return (
      <>
        <div className="flex flex-col gap-4">
          {/* Active Wagers Table */}
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

          {/* All Wagers (Trade History) Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconListDetails className="h-5 w-5" />
                All Wagers (Trade History)
              </CardTitle>
              <CardDescription>
                Complete history of all trades and transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingTrades ? (
                <div className="flex justify-center py-8">
                  <IconLoader className="animate-spin text-muted-foreground" size={24} />
                </div>
              ) : (
                <HedgeFundTable
                  data={allWagersData as Record<string, unknown>[]}
                  columns={allWagersColumns}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  // Default rendering for other agent types
  return (
    <>
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
            onRowClick={
              agentType === 'research-analyst'
                ? (row) => handleReportClick(row as ResearchReport)
                : undefined
            }
          />
        </CardContent>
      </Card>

      <ReportViewer
        isOpen={isReportViewerOpen}
        onClose={handleCloseReportViewer}
        reportTitle={selectedReport?.title || ''}
        onLoadReport={loadReportFiles}
      />
    </>
  );
}
