import { tool } from '@langchain/core/tools';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClobClient, Side } from '@polymarket/clob-client';
import { Tusky } from '@tusky-io/ts-sdk';
import { Wallet } from 'ethers';
import NewsAPI from 'ts-newsapi';
import { z } from 'zod';

@Injectable()
export class ToolsService {
  private readonly tusky: Tusky;
  private readonly signer: Wallet;
  private readonly newsAPI: NewsAPI;
  private readonly creds: ClobClient;

  constructor(private readonly configService: ConfigService) {
    this.newsAPI = new NewsAPI(
      this.configService.getOrThrow<string>('NEWS_API_KEY'),
    );
    this.tusky = new Tusky({
      apiKey: this.configService.getOrThrow<string>('TUSKY_API_KEY'),
    });
    this.signer = new Wallet(
      this.configService.getOrThrow<string>('POLYMARKET_PRIVATE_KEY'),
    );
    this.creds = new ClobClient(
      'https://clob.polymarket.com',
      137,
      this.signer,
    );
  }

  uploadResearch() {
    return tool(
      async (args) => {
        return await this.tusky.file.upload(
          this.configService.getOrThrow<string>('TUSKY_VAULT_ID'),
          new Blob([args.research] as BlobPart[]),
          {
            name: `${args.title.toLowerCase().replace(/\s+/g, '_')}.md`,
            mimeType: 'text/markdown',
          },
        );
      },
      {
        name: 'upload_research',
        description: 'Upload research to the database.',
        schema: z.object({
          title: z.string(),
          research: z.string(),
        }),
      },
    );
  }

  async makeWager() {
    const clobClient = new ClobClient(
      'https://clob.polymarket.com',
      137,
      this.signer,
      await this.creds.createOrDeriveApiKey(),
      2,
      this.configService.getOrThrow<string>('POLYMARKET_FUNDER_ADDRESS'),
    );
    return tool(
      async (args) => {
        return await clobClient.createAndPostOrder({
          tokenID:
            '60487116984468020978247225474488676749601001829886755968952521846780452448915',
          price: 0.01,
          side: Side.BUY,
          size: 100,
        });
      },
      {
        name: 'make_wager',
        description: 'Make a wager on a token.',
        schema: z.object({
          side: z.string(),
          tokenID: z.string(),
          price: z.string(),
          size: z.number(),
        }),
      },
    );
  }

  searchNews() {
    return tool(
      async (args) => {
        return this.newsAPI.getEverything({
          q: args.query,
          language: 'en',
          sortBy: 'relevancy',
        });
      },
      {
        name: 'search_news',
        description: 'Search the web for news.',
        schema: z.object({
          query: z.string(),
        }),
      },
    );
  }
}
