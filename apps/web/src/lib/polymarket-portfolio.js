import dotenv from 'dotenv';
dotenv.config();

/**
 * Configuration for API endpoints
 */
const API_CONFIG = {
  dataApiUrl: 'https://data-api.polymarket.com',
  gammaApiUrl: 'https://gamma-api.polymarket.com'
};

/**
 * Get user trades from Polymarket
 * @param {string} userAddress - The wallet address of the user
 * @param {Object} options - Optional parameters
 * @param {number} [options.limit=100] - Number of trades to return (max 500)
 * @param {number} [options.offset=0] - Pagination offset
 * @param {boolean} [options.takerOnly] - Filter for taker trades only
 * @param {string} [options.filterType] - Filter type for trades
 * @param {number} [options.filterAmount] - Filter amount for trades
 * @param {string} [options.market] - Filter by market condition ID
 * @param {string} [options.side] - Filter by side: 'BUY' or 'SELL'
 * @returns {Promise<UserTradesResponse>} Array of trade objects
 */
export async function getUserTrades(userAddress, options = {}) {
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
    return data;
  } catch (error) {
    console.error('Error fetching user trades:', error);
    throw error;
  }
}

/**
 * Get the total USD value of a user's holdings
 * @param {string} userAddress - The wallet address of the user
 * @param {string} [market] - Optional comma-separated list of market condition IDs
 * @returns {Promise<UserHoldingsResponse>} Array containing user holdings value
 */
export async function getUserHoldings(userAddress, market = null) {
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
    return data;
  } catch (error) {
    console.error('Error fetching user holdings:', error);
    throw error;
  }
}

/**
 * Get detailed positions for a user with P&L information
 * @param {string} userAddress - The wallet address of the user
 * @param {Object} options - Optional parameters
 * @param {string} [options.market] - Filter by market condition IDs (comma-separated)
 * @param {string} [options.eventId] - Filter by event ID
 * @param {number} [options.sizeThreshold=1] - Minimum position size
 * @param {boolean} [options.redeemable] - Filter redeemable positions
 * @param {boolean} [options.mergeable] - Filter mergeable positions
 * @param {string} [options.title] - Filter by market title
 * @param {number} [options.limit=50] - Number of positions to return (max 500)
 * @param {number} [options.offset=0] - Pagination offset
 * @param {string} [options.sortBy] - Sort field: TOKENS, CURRENT, INITIAL, CASHPNL, PERCENTPNL, TITLE, RESOLVING, PRICE
 * @param {string} [options.sortDirection='DESC'] - Sort direction: ASC or DESC
 * @returns {Promise<UserPositionsResponse>} Array of position objects
 */
export async function getUserPositions(userAddress, options = {}) {
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
    return data;
  } catch (error) {
    console.error('Error fetching user positions:', error);
    throw error;
  }
}

/**
 * Get complete portfolio data for a user
 * @param {string} userAddress - The wallet address of the user
 * @param {Object} options - Optional parameters for each data type
 * @returns {Promise<UserPortfolio>} Complete portfolio data
 */
export async function getUserPortfolio(userAddress, options = {}) {
  try {
    const [trades, holdings, positions] = await Promise.all([
      getUserTrades(userAddress, options.trades || {}),
      getUserHoldings(userAddress, options.market),
      getUserPositions(userAddress, options.positions || {})
    ]);

    return {
      userAddress,
      trades,
      holdings,
      positions,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching user portfolio:', error);
    throw error;
  }
}

// TypeScript type definitions
/**
 * @typedef {Object} Trade
 * @property {string} proxyWallet - User's proxy wallet address (lowercase)
 * @property {'BUY'|'SELL'} side - Trade side
 * @property {string} asset - Asset token ID
 * @property {string} conditionId - Market condition ID (hex format)
 * @property {number} size - Trade size in tokens
 * @property {number} price - Trade price (0-1 range)
 * @property {number} timestamp - Unix timestamp
 * @property {string} title - Market title
 * @property {string} slug - Market slug
 * @property {string} icon - Market icon URL
 * @property {string} eventSlug - Event slug
 * @property {string} outcome - Outcome name (e.g., 'Yes', 'No')
 * @property {number} outcomeIndex - Outcome index (0-based)
 * @property {string} name - User's display name
 * @property {string} pseudonym - User's pseudonym
 * @property {string} bio - User's bio
 * @property {string} profileImage - User's profile image URL
 * @property {string} profileImageOptimized - Optimized profile image URL
 * @property {string} transactionHash - Blockchain transaction hash
 */

/**
 * @typedef {Object} Holding
 * @property {string} user - User wallet address (lowercase)
 * @property {number} value - Total USD value of holdings
 */

/**
 * @typedef {Object} Position
 * @property {string} proxyWallet - User's proxy wallet address (lowercase)
 * @property {string} asset - Asset token ID
 * @property {string} conditionId - Market condition ID (hex format)
 * @property {number} size - Position size in tokens
 * @property {number} avgPrice - Average entry price (0-1 range)
 * @property {number} initialValue - Initial USD value of position
 * @property {number} currentValue - Current USD value of position
 * @property {number} cashPnl - Cash profit/loss in USD
 * @property {number} percentPnl - Percentage profit/loss
 * @property {number} totalBought - Total tokens bought
 * @property {number} realizedPnl - Realized profit/loss in USD
 * @property {number} percentRealizedPnl - Percentage of realized P&L
 * @property {number} curPrice - Current market price (0-1 range)
 * @property {boolean} redeemable - Whether position is redeemable
 * @property {boolean} mergeable - Whether position is mergeable
 * @property {string} title - Market title
 * @property {string} slug - Market slug
 * @property {string} icon - Market icon URL
 * @property {string} eventSlug - Event slug
 * @property {string} outcome - Outcome name (e.g., 'Yes', 'No')
 * @property {number} outcomeIndex - Outcome index (0-based)
 * @property {string} oppositeOutcome - Opposite outcome name
 * @property {string} oppositeAsset - Opposite outcome asset ID
 * @property {string} endDate - Market end date (YYYY-MM-DD format)
 * @property {boolean} negativeRisk - Whether position has negative risk
 */

/**
 * @typedef {Array<Trade>} UserTradesResponse
 * @typedef {Array<Holding>} UserHoldingsResponse
 * @typedef {Array<Position>} UserPositionsResponse
 */

/**
 * @typedef {Object} UserPortfolio
 * @property {string} userAddress - User's wallet address
 * @property {UserTradesResponse} trades - User's trades
 * @property {UserHoldingsResponse} holdings - User's holdings value
 * @property {UserPositionsResponse} positions - User's positions
 * @property {string} timestamp - Portfolio snapshot timestamp
 */

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