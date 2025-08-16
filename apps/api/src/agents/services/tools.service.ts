import { tool } from '@langchain/core/tools';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Tusky } from '@tusky-io/ts-sdk';
import { z } from 'zod';

@Injectable()
export class ToolsService {
  private readonly tusky = new Tusky();
  private readonly logger = new Logger(ToolsService.name);

  constructor(private readonly configService: ConfigService) {
    this.tusky = new Tusky({
      apiKey: this.configService.getOrThrow<string>('TUSKY_API_KEY'),
    });
  }

  uploadResearch() {
    return tool(
      async (args) => {
        return await this.tusky.file.upload(
          this.configService.getOrThrow<string>('TUSKY_VAULT_ID'),
          new Blob([args.research]),
          {
            name: args.research,
            mimeType: 'text/plain',
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

  webSearch() {
    return tool(
      async () => {
        return (
          'Here are the headcounts for each of the FAANG companies in 2024:\n' +
          '1. **Facebook (Meta)**: 67,317 employees.\n' +
          '2. **Apple**: 164,000 employees.\n' +
          '3. **Amazon**: 1,551,000 employees.\n' +
          '4. **Netflix**: 14,000 employees.\n' +
          '5. **Google (Alphabet)**: 181,269 employees.'
        );
      },
      {
        name: 'web_search',
        description: 'Search the web for information.',
        schema: z.object({
          query: z.string(),
        }),
      },
    );
  }
}
