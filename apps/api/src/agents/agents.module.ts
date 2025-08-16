import { Module } from '@nestjs/common';

import { AgentsService } from './services/agents.service';
import { ToolsService } from './services/tools.service';

@Module({
  providers: [AgentsService, ToolsService],
  exports: [AgentsService, ToolsService],
})
export class AgentsModule {}
