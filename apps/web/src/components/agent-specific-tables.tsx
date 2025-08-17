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
}

const supabase = createClient();

async function fetchWagersData(): Promise<WagerData[]> {
  try {
    const { data, error } = await supabase
      .from('wagers')
      .select('name, allocation, weight, pnl, risk');

    if (error) {
      console.error('Error fetching wagers:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Error fetching wagers data:', err);
    return [];
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
    header: 'Wager',
    cell: ({ row }: TableCell) => {
      const name = row.getValue('name') as string;
      return <span className="max-w-xs truncate font-medium">{name}</span>;
    },
  },
  {
    accessorKey: 'allocation',
    header: 'Capital Allocated',
    cell: ({ row }: TableCell) => {
      const allocation = row.getValue('allocation') as number;
      return <span className="font-mono">${allocation.toLocaleString()}</span>;
    },
  },
  {
    accessorKey: 'weight',
    header: 'Portfolio Weight',
    cell: ({ row }: TableCell) => {
      const weight = row.getValue('weight') as number;
      return <span className="font-mono">{(weight * 100).toFixed(1)}%</span>;
    },
  },
  {
    accessorKey: 'pnl',
    header: 'Unrealized P&L',
    cell: ({ row }: TableCell) => {
      const pnl = row.getValue('pnl') as number;
      const isPositive = pnl >= 0;
      return (
        <span
          className={`font-mono font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}
        >
          {isPositive ? '+' : ''}${pnl.toLocaleString()}
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
  const [loading, setLoading] = useState(false);
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
