import { InMemoryStore, MemorySaver } from '@langchain/langgraph';
import { createSupervisor } from '@langchain/langgraph-supervisor';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { AzureChatOpenAI } from '@langchain/openai';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ToolsService } from './tools.service';

@Injectable()
export class AgentsService implements OnModuleInit {
  private readonly chatModel: AzureChatOpenAI;
  private readonly reasoningModel: AzureChatOpenAI;

  private readonly memorySaver = new MemorySaver();
  private readonly memoryStore = new InMemoryStore();
  private readonly logger = new Logger(AgentsService.name);

  constructor(
    private readonly toolsService: ToolsService,
    private readonly configService: ConfigService,
  ) {
    this.chatModel = new AzureChatOpenAI({
      model: 'gpt-4.1',
      azureOpenAIApiDeploymentName: 'gpt-4.1',
      azureOpenAIApiVersion: '2024-12-01-preview',
      azureOpenAIApiKey: this.configService.getOrThrow<string>('AZURE_API_KEY'),
      azureOpenAIApiInstanceName: this.configService.getOrThrow<string>(
        'AZURE_RESOURCE_NAME',
      ),
    });
    this.reasoningModel = new AzureChatOpenAI({
      model: 'o4-mini',
      azureOpenAIApiDeploymentName: 'o4-mini',
      azureOpenAIApiVersion: '2024-12-01-preview',
      azureOpenAIApiKey: this.configService.getOrThrow<string>('AZURE_API_KEY'),
      azureOpenAIApiInstanceName: this.configService.getOrThrow<string>(
        'AZURE_RESOURCE_NAME',
      ),
    });
  }

  async onModuleInit() {
    try {
      // await this.run();
      this.logger.log('Agents tested successfully on init.');
    } catch (error) {
      this.logger.error('Error testing agents on init:', error);
    }
  }

  async run() {
    const researchAgent = createReactAgent({
      llm: this.reasoningModel,
      tools: [
        this.toolsService.webSearch(),
        this.toolsService.uploadResearch(),
      ],
      name: 'research_expert',
      prompt:
        'You are a world class researcher with access to web search. Do not do any math.',
    });

    const workflow = createSupervisor({
      agents: [researchAgent],
      llm: this.chatModel,
      prompt:
        'You are a team supervisor managing a research expert and a math expert. ' +
        'For current events, use research_agent. ' +
        'For math problems, use math_agent.',
    });

    // const app = workflow.compile({
    //   checkpointer: this.memorySaver,
    //   store: this.memoryStore,
    // });

    const app = workflow.compile();

    const result = await app.invoke({
      messages: [
        {
          role: 'user',
          content: 'Upload some random research to walrus',
        },
      ],
    });
    this.logger.log(result.messages[0].content);
    return result;
  }
}
