import { Controller, Get } from '@nestjs/common';

import { AgentsService } from './services/agents.service';

@Controller()
export class AgentController {
  constructor(private readonly agentsService: AgentsService) {}

  @Get('agents')
  async agents() {
    return await this.agentsService.initiate();
  }
}
