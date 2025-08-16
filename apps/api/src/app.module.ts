import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AgentsModule } from './agents/agents.module';
import { AgentsService } from './agents/services/agents.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MarketsModule } from './markets/markets.module';
import { MarketsService } from './markets/markets.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AgentsModule,
    MarketsModule,
  ],
  controllers: [AppController],
  providers: [AppService, AgentsService, MarketsService],
})
export class AppModule {}
