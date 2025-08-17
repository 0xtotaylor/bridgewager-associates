import { Module } from '@nestjs/common';

import { SupabaseConfig } from '../config/supabase.config';
import { MarketsModule } from '../markets/markets.module';
import { AgentsService } from './services/agents.service';
import { ToolsService } from './services/tools.service';

@Module({
  imports: [MarketsModule],
  providers: [AgentsService, ToolsService, SupabaseConfig],
  exports: [AgentsService, ToolsService],
})
export class AgentsModule {}
