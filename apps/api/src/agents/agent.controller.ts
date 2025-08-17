import { Controller, Get } from '@nestjs/common';

import { AgentsService } from './services/agents.service';

@Controller('agents')
export class AgentController {
  constructor(private readonly agentsService: AgentsService) {}

  @Get('/run')
  async agents() {
    return await this.agentsService.initiate();
  }
}
