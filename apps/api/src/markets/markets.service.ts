import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MarketsService {
  private readonly logger = new Logger(MarketsService.name);

  async getMarkets(limit = 50) {
    try {
      const params = new URLSearchParams({
        active: 'true',
        closed: 'false',
        archived: 'false',
        enableOrderBook: 'true',
        limit: limit.toString(),
        end_date_min: new Date().toISOString(),
      });

      const url = `https://gamma-api.polymarket.com/markets?${params.toString()}`;
      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.text();
        this.logger.error(
          `Failed to fetch markets: ${response.status} - ${errorData}`,
        );
        throw new Error(
          `Failed to fetch markets: ${response.status} - ${errorData}`,
        );
      }

      const data = await response.json();
      return {
        data: data || [],
      };
    } catch (error) {
      this.logger.error('Error in getMarkets:', error);
      throw error;
    }
  }
}
