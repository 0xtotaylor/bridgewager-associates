import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AgentController } from './agents/agent.controller';
import { AgentsModule } from './agents/agents.module';
import { AgentsService } from './agents/services/agents.service';
import { SupabaseConfig } from './config/supabase.config';
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
  controllers: [AgentController],
  providers: [AgentsService, MarketsService, SupabaseConfig],
})
export class AppModule {}
