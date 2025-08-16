import { tool } from '@langchain/core/tools';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Tusky } from '@tusky-io/ts-sdk';
import NewsAPI from 'newsapi';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

@Injectable()
export class ToolsService {
  private readonly tusky: Tusky;
  private readonly NewsAPI: NewsAPI;
  private readonly logger = new Logger(ToolsService.name);

  constructor(private readonly configService: ConfigService) {
    this.NewsAPI = new NewsAPI(
      this.configService.getOrThrow<string>('NEWS_API_KEY'),
    );
    this.tusky = new Tusky({
      apiKey: this.configService.getOrThrow<string>('TUSKY_API_KEY'),
    });
  }

  uploadResearch() {
    return tool(
      async (args) => {
        const uuid = uuidv4();
        return await this.tusky.file.upload(
          this.configService.getOrThrow<string>('TUSKY_VAULT_ID'),
          new Blob([args.research] as BlobPart[]),
          {
            name: `${uuid}.md`,
            mimeType: 'text/markdown',
          },
        );
      },
      {
        name: 'upload_research',
        description: 'Upload research to the database.',
        schema: z.object({
          research: z.string(),
        }),
      },
    );
  }

  searchNews() {
    return tool(
      async (args) => {
        return this.NewsAPI.v2.everything({
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
