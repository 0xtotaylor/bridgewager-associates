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

export type PolymarketData = {
  id: string;
  question: string;
  conditionId: string;
  slug: string;
  resolutionSource: string;
  endDate: string;
  liquidity: string;
  startDate: string;
  image: string;
  icon: string;
  description: string;
  outcomes: string;
  outcomePrices: string;
  volume: string;
  active: boolean;
  closed: boolean;
  marketMakerAddress: string;
  createdAt: string;
  updatedAt: string;
  new: boolean;
  featured: boolean;
  submitted_by: string;
  archived: boolean;
  resolvedBy: string;
  restricted: boolean;
  groupItemTitle: string;
  groupItemThreshold: string;
  questionID: string;
  enableOrderBook: boolean;
  orderPriceMinTickSize: number;
  orderMinSize: number;
  volumeNum: number;
  liquidityNum: number;
  endDateIso: string;
  startDateIso: string;
  hasReviewedDates: boolean;
  volume1wk: number;
  volume1mo: number;
  volume1yr: number;
  clobTokenIds: string;
  umaBond: string;
  umaReward: string;
  volume1wkClob: number;
  volume1moClob: number;
  volume1yrClob: number;
  volumeClob: number;
  liquidityClob: number;
  acceptingOrders: boolean;
  negRisk: boolean;
  events: unknown[];
  ready: boolean;
  funded: boolean;
  acceptingOrdersTimestamp: string;
  cyom: boolean;
  competitive: number;
  pagerDutyNotificationEnabled: boolean;
  approved: boolean;
  clobRewards: unknown[];
  rewardsMinSize: number;
  rewardsMaxSpread: number;
  spread: number;
  oneDayPriceChange: number;
  oneWeekPriceChange: number;
  oneMonthPriceChange: number;
  lastTradePrice: number;
  bestBid: number;
  bestAsk: number;
  automaticallyActive: boolean;
  clearBookOnStart: boolean;
  seriesColor: string;
  showGmpSeries: boolean;
  showGmpOutcome: boolean;
  manualActivation: boolean;
  negRiskOther: boolean;
  umaResolutionStatuses: string;
  pendingDeployment: boolean;
  deploying: boolean;
  rfqEnabled: boolean;
  holdingRewardsEnabled: boolean;
};

export type ResearchReport = {
  id: string;
  title: string;
  author: string;
  publishedDate: string;
  marketCategory: string;
  confidence: number;
  recommendation: 'BUY' | 'SELL' | 'HOLD' | 'MONITOR';
  targetPrice?: number;
  currentPrice?: number;
  summary: string;
  keyFindings: string[];
  riskLevel: 'Low' | 'Medium' | 'High';
  status: 'Draft' | 'Published' | 'Archived';
  tags: string[];
  attachments?: string[];
  lastUpdated: string;
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
