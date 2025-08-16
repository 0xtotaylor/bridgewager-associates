import { LucideIcon } from 'lucide-react';

export type TableRow = {
  getValue: (key: string) => string | number;
};

export type TableCell = {
  row: TableRow;
};

export type SessionTokenRequest = {
  addresses: Array<{
    address: string;
    blockchains: string[];
  }>;
  assets?: string[];
};

export type SessionTokenResponse = {
  token: string;
  channel_id?: string;
};

export type Agent = {
  id: string;
  name: string;
  brier: number;
  hitRate: number;
  avgEdgeBp: number;
  evPerBet: number;
  edgeVol: number;
  capitalPct: number;
  status: 'Active' | 'Inactive' | 'Training';
  calibration: { bin: number; predicted: number; actual: number }[];
  correlations: Record<string, number>;
};

export type Market = {
  id: string;
  title: string;
  topic: string;
  venue: 'Polymarket' | 'Manifold' | 'Kalshi' | 'PredictIt';
  closeTs: number;
  odds: number;
  fair: number;
  feeBp: number;
  evAfterCost: number;
  kellyFrac: number;
  sizeSuggested: number;
  status: 'Open' | 'Pending' | 'Closed' | 'Settled';
};

export type Position = {
  id: string;
  marketId: string;
  side: 'Yes' | 'No';
  qty: number;
  avgPrice: number;
  mark: number;
  evNow: number;
  pnlRealized: number;
  pnlUnrealized: number;
  openDate: number;
};

export type FundMetrics = {
  nav: number;
  pnlDaily: number;
  capitalAtRiskPct: number;
  evTotal: number;
  maxDrawdown30d: number;
};

export type HistoricalData = {
  date: string;
  nav: number;
  pnlDaily: number;
  positions: number;
  drawdown: number;
};

export type AgentPerformance = {
  agentId: string;
  date: string;
  pnl: number;
  evRealized: number;
  betsPlaced: number;
  accuracy: number;
};

export type RiskMetrics = {
  var95: number;
  var99: number;
  expectedShortfall: number;
  leverage: number;
  concentration: number;
  correlationRisk: number;
};

export type ComplianceAlert = {
  id: string;
  type: 'RISK_LIMIT' | 'POSITION_SIZE' | 'EXPOSURE_CAP' | 'VOLATILITY';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  timestamp: number;
  resolved: boolean;
};

export type Role =
  | 'Research Analyst'
  | 'Portfolio Manager'
  | 'Trader'
  | 'Compliance Officer';

export type NavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  role?: Role;
  items?: NavItem[];
};
