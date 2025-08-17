import { ethers } from 'ethers';

/**
 * Configuration for API endpoints and contracts
 */
const API_CONFIG = {
  dataApiUrl: 'https://data-api.polymarket.com',
  gammaApiUrl: 'https://gamma-api.polymarket.com'
} as const;

const POLYGON_CONFIG = {
  rpcUrl: 'https://polygon-rpc.com',
  usdcAddress: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // USDC on Polygon
} as const;

// Type definitions
export interface Trade {
  proxyWallet: string;
  side: 'BUY' | 'SELL';
  asset: string;
  conditionId: string;
  size: number;
  price: number;
  timestamp: number;
  title: string;
  slug: string;
  icon: string;
  eventSlug: string;
  outcome: string;
  outcomeIndex: number;
  name: string;
  pseudonym: string;
  bio: string;
  profileImage: string;
  profileImageOptimized: string;
  transactionHash: string;
}

export interface Holding {
  user: string;
  value: number;
}

export interface Position {
  proxyWallet: string;
  asset: string;
  conditionId: string;
  size: number;
  avgPrice: number;
  initialValue: number;
  currentValue: number;
  cashPnl: number;
  percentPnl: number;
  totalBought: number;
  realizedPnl: number;
  percentRealizedPnl: number;
  curPrice: number;
  redeemable: boolean;
  mergeable: boolean;
  title: string;
  slug: string;
  icon: string;
  eventSlug: string;
  outcome: string;
  outcomeIndex: number;
  oppositeOutcome: string;
  oppositeAsset: string;
  endDate: string;
  negativeRisk: boolean;
}

export interface USDCBalance {
  raw: string;
  formatted: string;
  display: string;
  decimals: number;
}

export interface UserPortfolio {
  userAddress: string;
  trades: Trade[];
  holdings: Holding[];
  positions: Position[];
  usdcBalance: USDCBalance;
  timestamp: string;
}

export interface GetTradesOptions {
  limit?: number;
  offset?: number;
  takerOnly?: boolean;
  filterType?: string;
  filterAmount?: number;
  market?: string;
  side?: 'BUY' | 'SELL';
}

export interface GetPositionsOptions {
  market?: string;
  eventId?: string;
  sizeThreshold?: number;
  redeemable?: boolean;
  mergeable?: boolean;
  title?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'TOKENS' | 'CURRENT' | 'INITIAL' | 'CASHPNL' | 'PERCENTPNL' | 'TITLE' | 'RESOLVING' | 'PRICE';
  sortDirection?: 'ASC' | 'DESC';
}

export interface GetPortfolioOptions {
  trades?: GetTradesOptions;
  positions?: GetPositionsOptions;
  market?: string;
}

/**
 * Get user trades from Polymarket
 */
export async function getUserTrades(
  userAddress: string,
  options: GetTradesOptions = {}
): Promise<Trade[]> {
  try {
    const queryParams = new URLSearchParams({ user: userAddress });

    if (options.limit) queryParams.append('limit', Math.min(options.limit, 500).toString());
    if (options.offset) queryParams.append('offset', options.offset.toString());
    if (options.takerOnly !== undefined) queryParams.append('takerOnly', options.takerOnly.toString());
    if (options.filterType) queryParams.append('filterType', options.filterType);
    if (options.filterAmount) queryParams.append('filterAmount', options.filterAmount.toString());
    if (options.market) queryParams.append('market', options.market);
    if (options.side) queryParams.append('side', options.side.toUpperCase());

    const url = `${API_CONFIG.dataApiUrl}/trades?${queryParams}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data as Trade[];
  } catch (error) {
    console.error('Error fetching user trades:', error);
    throw error;
  }
}

/**
 * Get the total USD value of a user's holdings
 */
export async function getUserHoldings(
  userAddress: string,
  market?: string | null
): Promise<Holding[]> {
  try {
    const params = new URLSearchParams({ user: userAddress });

    if (market) {
      params.append('market', market);
    }

    const url = `${API_CONFIG.dataApiUrl}/value?${params}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data as Holding[];
  } catch (error) {
    console.error('Error fetching user holdings:', error);
    throw error;
  }
}

/**
 * Get detailed positions for a user with P&L information
 */
export async function getUserPositions(
  userAddress: string,
  options: GetPositionsOptions = {}
): Promise<Position[]> {
  try {
    const params = new URLSearchParams({ user: userAddress });

    if (options.market) params.append('market', options.market);
    if (options.eventId) params.append('eventId', options.eventId);
    if (options.sizeThreshold !== undefined) params.append('sizeThreshold', options.sizeThreshold.toString());
    if (options.redeemable !== undefined) params.append('redeemable', options.redeemable.toString());
    if (options.mergeable !== undefined) params.append('mergeable', options.mergeable.toString());
    if (options.title) params.append('title', options.title);
    if (options.limit !== undefined) params.append('limit', options.limit.toString());
    if (options.offset !== undefined) params.append('offset', options.offset.toString());
    if (options.sortBy) params.append('sortBy', options.sortBy);
    if (options.sortDirection) params.append('sortDirection', options.sortDirection);

    const url = `${API_CONFIG.dataApiUrl}/positions?${params}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data as Position[];
  } catch (error) {
    console.error('Error fetching user positions:', error);
    throw error;
  }
}

/**
 * Get USDC balance for a user on Polygon
 */
export async function getUserUSDCBalance(userAddress: string): Promise<USDCBalance> {
  try {
    // Create provider
    const provider = new ethers.providers.JsonRpcProvider(POLYGON_CONFIG.rpcUrl);

    // USDC contract ABI (minimal - just need balanceOf)
    const usdcABI = [
      'function balanceOf(address account) external view returns (uint256)',
      'function decimals() external view returns (uint8)'
    ];

    // Create contract instance
    const usdcContract = new ethers.Contract(
      POLYGON_CONFIG.usdcAddress,
      usdcABI,
      provider
    );

    // Get balance and decimals
    const [balance, decimals] = await Promise.all([
      usdcContract.balanceOf(userAddress),
      usdcContract.decimals()
    ]);

    // Convert to human-readable format (USDC has 6 decimals)
    const formattedBalance = ethers.utils.formatUnits(balance, decimals);

    return {
      raw: balance.toString(),
      formatted: formattedBalance,
      display: parseFloat(formattedBalance).toFixed(2),
      decimals: decimals
    };
  } catch (error) {
    console.error('Error fetching USDC balance:', error);
    // Return zero balance on error
    return {
      raw: '0',
      formatted: '0',
      display: '0.00',
      decimals: 6
    };
  }
}

/**
 * Get complete portfolio data for a user
 */
export async function getUserPortfolio(
  userAddress: string,
  options: GetPortfolioOptions = {}
): Promise<UserPortfolio> {
  try {
    const [trades, holdings, positions, usdcBalance] = await Promise.all([
      getUserTrades(userAddress, options.trades || {}),
      getUserHoldings(userAddress, options.market),
      getUserPositions(userAddress, options.positions || {}),
      getUserUSDCBalance(userAddress)
    ]);

    return {
      userAddress,
      trades,
      holdings,
      positions,
      usdcBalance,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching user portfolio:', error);
    throw error;
  }
}


// Example usage (commented out)
/*
async function example() {
  const userAddress = "0x4bA01fF1DEfA6948a801d3711892b9c00F170447";
  
  // Get trades
  const trades = await getUserTrades(userAddress, { limit: 10 });
  console.log('User trades:', trades);
  
  // Get holdings value
  const holdings = await getUserHoldings(userAddress);
  console.log('User holdings:', holdings);
  
  // Get positions
  const positions = await getUserPositions(userAddress, { 
    limit: 20, 
    sortBy: 'CURRENT' 
  });
  console.log('User positions:', positions);
  
  // Get complete portfolio
  const portfolio = await getUserPortfolio(userAddress, {
    trades: { limit: 10 },
    positions: { limit: 20, sortBy: 'CURRENT' }
  });
  console.log('Complete portfolio:', portfolio);
}

// Run example if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  example().catch(console.error);
}
*/