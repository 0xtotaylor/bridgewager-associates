import { Agent, Market, Position, FundMetrics, HistoricalData, AgentPerformance, RiskMetrics, ComplianceAlert } from './types';

export const mockFundMetrics: FundMetrics = {
  nav: 2450000,
  pnlDaily: 15750,
  capitalAtRiskPct: 68.5,
  evTotal: 85600,
  maxDrawdown30d: -12.3,
};

export const mockAgents: Agent[] = [
  {
    id: 'agent-1',
    name: 'Alpha-Research',
    brier: 0.147,
    hitRate: 0.724,
    avgEdgeBp: 180,
    evPerBet: 2850,
    edgeVol: 0.085,
    capitalPct: 28.5,
    status: 'Active',
    calibration: [
      { bin: 0.1, predicted: 0.12, actual: 0.09 },
      { bin: 0.3, predicted: 0.31, actual: 0.29 },
      { bin: 0.5, predicted: 0.52, actual: 0.48 },
      { bin: 0.7, predicted: 0.69, actual: 0.71 },
      { bin: 0.9, predicted: 0.88, actual: 0.92 },
    ],
    correlations: { 'agent-2': 0.23, 'agent-3': -0.15, 'agent-4': 0.08 },
  },
  {
    id: 'agent-2',
    name: 'Beta-Politics',
    brier: 0.156,
    hitRate: 0.689,
    avgEdgeBp: 145,
    evPerBet: 1950,
    edgeVol: 0.092,
    capitalPct: 22.1,
    status: 'Active',
    calibration: [
      { bin: 0.1, predicted: 0.11, actual: 0.10 },
      { bin: 0.3, predicted: 0.28, actual: 0.32 },
      { bin: 0.5, predicted: 0.49, actual: 0.51 },
      { bin: 0.7, predicted: 0.72, actual: 0.68 },
      { bin: 0.9, predicted: 0.91, actual: 0.89 },
    ],
    correlations: { 'agent-1': 0.23, 'agent-3': 0.05, 'agent-4': -0.12 },
  },
  {
    id: 'agent-3',
    name: 'Gamma-Sports',
    brier: 0.162,
    hitRate: 0.658,
    avgEdgeBp: 125,
    evPerBet: 1650,
    edgeVol: 0.110,
    capitalPct: 18.7,
    status: 'Active',
    calibration: [
      { bin: 0.1, predicted: 0.13, actual: 0.08 },
      { bin: 0.3, predicted: 0.32, actual: 0.31 },
      { bin: 0.5, predicted: 0.48, actual: 0.52 },
      { bin: 0.7, predicted: 0.68, actual: 0.69 },
      { bin: 0.9, predicted: 0.87, actual: 0.91 },
    ],
    correlations: { 'agent-1': -0.15, 'agent-2': 0.05, 'agent-4': 0.18 },
  },
  {
    id: 'agent-4',
    name: 'Delta-Crypto',
    brier: 0.189,
    hitRate: 0.612,
    avgEdgeBp: 95,
    evPerBet: 1200,
    edgeVol: 0.135,
    capitalPct: 12.8,
    status: 'Training',
    calibration: [
      { bin: 0.1, predicted: 0.15, actual: 0.07 },
      { bin: 0.3, predicted: 0.35, actual: 0.28 },
      { bin: 0.5, predicted: 0.53, actual: 0.49 },
      { bin: 0.7, predicted: 0.65, actual: 0.72 },
      { bin: 0.9, predicted: 0.85, actual: 0.93 },
    ],
    correlations: { 'agent-1': 0.08, 'agent-2': -0.12, 'agent-3': 0.18 },
  },
];

export const mockMarkets: Market[] = [
  {
    id: 'market-1',
    title: 'Will Biden win the 2024 election?',
    topic: 'Politics',
    venue: 'Polymarket',
    closeTs: Date.now() + 86400000 * 30,
    odds: 0.52,
    fair: 0.58,
    feeBp: 200,
    evAfterCost: 4.8,
    kellyFrac: 0.08,
    sizeSuggested: 25000,
    status: 'Open',
  },
  {
    id: 'market-2',
    title: 'Will Lakers make playoffs?',
    topic: 'Sports',
    venue: 'Kalshi',
    closeTs: Date.now() + 86400000 * 45,
    odds: 0.38,
    fair: 0.42,
    feeBp: 150,
    evAfterCost: 2.9,
    kellyFrac: 0.04,
    sizeSuggested: 12000,
    status: 'Open',
  },
  {
    id: 'market-3',
    title: 'Bitcoin above $100k by year end?',
    topic: 'Crypto',
    venue: 'Manifold',
    closeTs: Date.now() + 86400000 * 75,
    odds: 0.28,
    fair: 0.35,
    feeBp: 100,
    evAfterCost: 6.2,
    kellyFrac: 0.12,
    sizeSuggested: 18500,
    status: 'Pending',
  },
  {
    id: 'market-4',
    title: 'Will there be a recession in 2024?',
    topic: 'Economics',
    venue: 'PredictIt',
    closeTs: Date.now() + 86400000 * 90,
    odds: 0.65,
    fair: 0.60,
    feeBp: 250,
    evAfterCost: -3.1,
    kellyFrac: 0.0,
    sizeSuggested: 0,
    status: 'Open',
  },
];

export const mockPositions: Position[] = [
  {
    id: 'pos-1',
    marketId: 'market-1',
    side: 'Yes',
    qty: 15000,
    avgPrice: 0.55,
    mark: 0.52,
    evNow: -450,
    pnlRealized: 0,
    pnlUnrealized: -450,
    openDate: Date.now() - 86400000 * 5,
  },
  {
    id: 'pos-2',
    marketId: 'market-2',
    side: 'No',
    qty: 8000,
    avgPrice: 0.65,
    mark: 0.62,
    evNow: 240,
    pnlRealized: 0,
    pnlUnrealized: 240,
    openDate: Date.now() - 86400000 * 3,
  },
];

export const mockHistoricalData: HistoricalData[] = (() => {
  const data: HistoricalData[] = [];
  let previousNav = 2200000;
  
  for (let i = 0; i < 90; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (89 - i));
    const baseNav = 2200000;
    const trend = i * 2800;
    const noise = (Math.random() - 0.5) * 50000;
    const nav = baseNav + trend + noise;
    
    data.push({
      date: date.toISOString().split('T')[0]!,
      nav,
      pnlDaily: nav - previousNav,
      positions: Math.floor(15 + Math.random() * 10),
      drawdown: Math.min(0, (nav - Math.max(...data.map(d => d.nav), baseNav)) / baseNav * 100),
    });
    
    previousNav = nav;
  }
  
  return data;
})();

export const mockAgentPerformance: AgentPerformance[] = (() => {
  const performance: AgentPerformance[] = [];
  mockAgents.forEach(agent => {
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      performance.push({
        agentId: agent.id,
        date: date.toISOString().split('T')[0]!,
        pnl: (Math.random() - 0.4) * 5000,
        evRealized: Math.random() * 3000,
        betsPlaced: Math.floor(Math.random() * 5),
        accuracy: 0.5 + Math.random() * 0.4,
      });
    }
  });
  return performance;
})();

export const mockRiskMetrics: RiskMetrics = {
  var95: -45600,
  var99: -78200,
  expectedShortfall: -89500,
  leverage: 1.24,
  concentration: 0.285,
  correlationRisk: 0.156,
};

export const mockComplianceAlerts: ComplianceAlert[] = [
  {
    id: 'alert-1',
    type: 'RISK_LIMIT',
    severity: 'MEDIUM',
    message: 'Portfolio correlation exceeds 15% threshold',
    timestamp: Date.now() - 3600000,
    resolved: false,
  },
  {
    id: 'alert-2',
    type: 'POSITION_SIZE',
    severity: 'LOW',
    message: 'Single position exceeds 5% of NAV',
    timestamp: Date.now() - 7200000,
    resolved: true,
  },
];