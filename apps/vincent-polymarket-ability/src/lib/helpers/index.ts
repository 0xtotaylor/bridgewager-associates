/**
 * Helper functions for the polymarket-bet ability
 */

import { ClobClient, Side, OrderType } from '@polymarket/clob-client';
import { Wallet } from 'ethers';

// Default configuration values
const DEFAULTS = {
  baseUrl: 'https://clob.polymarket.com',
  dataApiUrl: 'https://data-api.polymarket.com',
  gammaApiUrl: 'https://gamma-api.polymarket.com',
  chainId: 137, // Polygon mainnet
};

// Cache for CLOB client instances
let cached: {
  clobClient?: ClobClient;
  signer?: Wallet;
  initialized: boolean;
  configKey: string;
} = {
  initialized: false,
  configKey: '',
};

/**
 * Build configuration object with defaults
 */
export function buildConfig(config: any = {}) {
  return {
    baseUrl: config.baseUrl || DEFAULTS.baseUrl,
    dataApiUrl: config.dataApiUrl || DEFAULTS.dataApiUrl,
    gammaApiUrl: config.gammaApiUrl || DEFAULTS.gammaApiUrl,
    chainId: config.chainId || DEFAULTS.chainId,
    privateKey: config.privateKey,
    funderAddress: config.funderAddress || '',
  };
}

/**
 * Generate a unique key for the configuration
 */
export function getConfigKey(cfg: any) {
  return `${cfg.baseUrl}|${cfg.chainId}|${cfg.privateKey}|${cfg.funderAddress}`;
}

/**
 * Ensure CLOB client is initialized with the given configuration
 */
export async function ensureClobClient(config: any = {}) {
  const cfg = buildConfig(config);
  if (!cfg.privateKey) {
    throw new Error('Private key is required');
  }

  const key = getConfigKey(cfg);
  if (cached.initialized && cached.configKey === key && cached.clobClient) {
    return cached.clobClient;
  }

  const signer = new Wallet(cfg.privateKey);
  const tempClient = new ClobClient(cfg.baseUrl, cfg.chainId, signer);
  const apiCreds = await tempClient.createOrDeriveApiKey();

  const clobClient = new ClobClient(
    cfg.baseUrl,
    cfg.chainId,
    signer,
    apiCreds,
    2, // SignatureType.POLY_GNOSIS_SAFE = 2
    cfg.funderAddress
  );

  cached = {
    clobClient,
    signer,
    initialized: true,
    configKey: key,
  };

  console.log('CLOB client initialized for address:', signer.address);
  return clobClient;
}

/**
 * Place an order on Polymarket
 */
export async function placeOrder(orderData: any, config: any = {}) {
  const requiredFields = ['tokenID', 'side', 'size', 'price'];
  for (const field of requiredFields) {
    if (orderData[field] === undefined || orderData[field] === null) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  const clobClient = await ensureClobClient(config);

  const side = String(orderData.side).toUpperCase() === 'BUY' ? Side.BUY : Side.SELL;
  console.log("ORDER INFO", orderData.size, orderData.price, orderData.nonce);

  const order = await clobClient.createOrder({
    tokenID: orderData.tokenID,
    price: parseFloat(String(orderData.price)),
    side,
    size: parseFloat(String(orderData.size)),
  });

  console.log('Created order:', order);

  const orderType = orderData.orderType || OrderType.GTC;
  const response = await clobClient.postOrder(order, orderType);
  console.log('Order response:', response);

  return {
    success: true,
    orderId: response.orderID || response.id,
    orderID: response.orderID || response.id,
    status: response.status,
    tokenID: orderData.tokenID,
    side: orderData.side,
    price: parseFloat(String(orderData.price)),
    size: parseFloat(String(orderData.size)),
    ...response,
  };
}

/**
 * Validate private key format
 */
export function isValidPrivateKey(privateKey: string): boolean {
  // Check if it's a valid hex string of appropriate length
  // Ethereum private keys are 32 bytes (64 hex characters) plus optional 0x prefix
  const cleanKey = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
  return /^[a-fA-F0-9]{64}$/.test(cleanKey);
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toISOString();
}
