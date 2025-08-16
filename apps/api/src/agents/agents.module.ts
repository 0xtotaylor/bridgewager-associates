import { Module } from '@nestjs/common';

import { MarketsModule } from '../markets/markets.module';
import { AgentsService } from './services/agents.service';
import { ToolsService } from './services/tools.service';

@Module({
  imports: [MarketsModule],
  providers: [AgentsService, ToolsService],
  exports: [AgentsService, ToolsService],
})
export class AgentsModule {}
