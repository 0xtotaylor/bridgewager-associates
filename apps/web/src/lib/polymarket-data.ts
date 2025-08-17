'use client';

import { createClient } from './supabase';
import type { HistoricalData, Market, PolymarketData, ResearchReport } from './types';

const supabase = createClient();

export async function fetchPolymarketData(): Promise<PolymarketData[]> {
  try {
    const { data, error } = await supabase
      .from('polymarket')
      .select('market')
      .order('market->volumeNum', { ascending: false });

    if (error) {
      console.error('Supabase error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return [];
    }

    const marketData = data?.map((row) => row.market as PolymarketData) || [];
    console.log(`Successfully fetched ${marketData.length} Polymarket records`);
    return marketData;
  } catch (err) {
    console.error('Network or connection error:', err);
    return [];
  }
}

export function transformPolymarketToMarket(
  polymarketData: PolymarketData[],
): Market[] {
  return polymarketData
    .filter((market) => market.active && !market.closed)
    .map((market) => {
      const outcomePrices = JSON.parse(
        market.outcomePrices || '["0.5", "0.5"]',
      ) as string[];

      const currentOdds = parseFloat(outcomePrices[0] || '0.5') || 0.5;
      const fair = currentOdds + (Math.random() - 0.5) * 0.1;
      const evAfterCost = ((fair - currentOdds) / currentOdds) * 100;

      return {
        id: market.id,
        title: market.question,
        topic: categorizeMarket(market.question),
        venue: 'Polymarket' as const,
        closeTs: new Date(market.endDate).getTime(),
        odds: currentOdds,
        fair: fair,
        feeBp: 200, // Standard Polymarket fee
        evAfterCost: evAfterCost,
        kellyFrac: Math.max(0, (evAfterCost / 100) * 0.1),
        sizeSuggested: Math.max(
          0,
          evAfterCost > 0 ? market.liquidityNum * 0.05 : 0,
        ),
        status: market.active && !market.closed ? 'Open' : 'Closed',
      };
    });
}

export function generateHistoricalDataFromPolymarket(
  polymarketData: PolymarketData[],
): HistoricalData[] {
  const data: HistoricalData[] = [];
  const baseNav = 2200000;

  for (let i = 0; i < 90; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (89 - i));

    const totalVolume = polymarketData.reduce(
      (sum, market) => sum + market.volumeNum,
      0,
    );
    const avgPriceChange =
      polymarketData.reduce(
        (sum, market) => sum + market.oneDayPriceChange,
        0,
      ) / polymarketData.length;

    const marketInfluence = avgPriceChange * totalVolume * 0.000001 || 0;
    const trend = i * 2800 + marketInfluence;
    const noise = (Math.random() - 0.5) * 30000;
    const nav = baseNav + trend + noise;

    const previousNav = i > 0 ? data[i - 1]!.nav : baseNav;

    data.push({
      date: date.toISOString().split('T')[0]!,
      nav,
      pnlDaily: nav - previousNav,
      positions: Math.floor(
        polymarketData.filter((m) => m.active).length * 0.8,
      ),
      drawdown: Math.min(
        0,
        ((nav - Math.max(...data.map((d) => d.nav), baseNav)) / baseNav) * 100,
      ),
    });
  }

  return data;
}

export function calculateMetricsFromPolymarket(
  polymarketData: PolymarketData[],
) {
  const activeMarkets = polymarketData.filter((m) => m.active && !m.closed);
  const totalVolume = activeMarkets.reduce(
    (sum, market) => sum + market.volumeNum,
    0,
  );
  const totalLiquidity = activeMarkets.reduce(
    (sum, market) => sum + market.liquidityNum,
    0,
  );

  const estimatedEV = activeMarkets.reduce((sum, market) => {
    const prices = JSON.parse(
      market.outcomePrices || '["0.5", "0.5"]',
    ) as string[];
    const currentPrice = parseFloat(prices[0] || '0.5') || 0.5;
    const estimatedFair = currentPrice + (Math.random() - 0.5) * 0.1;
    const edge = estimatedFair - currentPrice;
    return sum + edge * market.liquidityNum * 0.01;
  }, 0);

  return {
    totalEV: estimatedEV,
    activeMarkets: activeMarkets.length,
    totalVolume,
    totalLiquidity,
    avgSpread:
      activeMarkets.reduce((sum, m) => sum + m.spread, 0) /
      activeMarkets.length,
  };
}

function categorizeMarket(question: string): string {
  const lowerQuestion = question.toLowerCase();

  if (
    lowerQuestion.includes('election') ||
    lowerQuestion.includes('biden') ||
    lowerQuestion.includes('trump') ||
    lowerQuestion.includes('president')
  ) {
    return 'Politics';
  }
  if (
    lowerQuestion.includes('bitcoin') ||
    lowerQuestion.includes('crypto') ||
    lowerQuestion.includes('ethereum')
  ) {
    return 'Crypto';
  }
  if (
    lowerQuestion.includes('nfl') ||
    lowerQuestion.includes('nba') ||
    lowerQuestion.includes('sport') ||
    lowerQuestion.includes('game')
  ) {
    return 'Sports';
  }
  if (
    lowerQuestion.includes('economy') ||
    lowerQuestion.includes('recession') ||
    lowerQuestion.includes('gdp') ||
    lowerQuestion.includes('inflation')
  ) {
    return 'Economics';
  }
  if (
    lowerQuestion.includes('tech') ||
    lowerQuestion.includes('ai') ||
    lowerQuestion.includes('openai') ||
    lowerQuestion.includes('google') ||
    lowerQuestion.includes('apple')
  ) {
    return 'Technology';
  }

  return 'Other';
}

export async function fetchResearchReports(): Promise<ResearchReport[]> {
  try {
    const { data, error } = await supabase
      .from('research_reports')
      .select('*')
      .order('publishedDate', { ascending: false });

    if (error) {
      console.error('Supabase error fetching research reports:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return [];
    }

    console.log(`Successfully fetched ${data?.length || 0} research reports`);
    return data || [];
  } catch (err) {
    console.error('Network error fetching research reports:', err);
    return [];
  }
}
