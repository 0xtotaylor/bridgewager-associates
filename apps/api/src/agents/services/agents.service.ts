import { InMemoryStore, MemorySaver } from '@langchain/langgraph';
import { createSupervisor } from '@langchain/langgraph-supervisor';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { AzureChatOpenAI } from '@langchain/openai';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { pull } from 'langchain/hub';

import { MarketsService } from './../../markets/markets.service';
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
    private readonly marketsService: MarketsService,
  ) {
    this.chatModel = new AzureChatOpenAI({
      model: 'gpt-5-mini',
      azureOpenAIApiDeploymentName: 'gpt-5-mini',
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
      // await this.identifyMarkets();
      this.logger.log('Agents tested successfully on init.');
    } catch (error) {
      this.logger.error('Error testing agents on init:', error);
    }
  }

  private async identifyMarkets() {
    try {
      const markets = await this.marketsService.getMarkets();

      if (!markets || !markets.data) {
        this.logger.warn('No markets data received from API');
        return;
      }

      const filteredMarkets = markets.data
        .filter((market) => market.outcomes === '["Yes", "No"]')
        .map((market) => ({
          id: market.id,
          question: market.question,
          description: market.description,
          conditionId: market.conditionId,
          clobTokenIds: market.clobTokenIds,
        }));

      const prompt = await pull('bridgewager-identify-markets');

      const chain = prompt.pipe(this.reasoningModel);

      const response = await chain.invoke({
        market_data: filteredMarkets,
      });

      const topBets = (response as any).top_bets || [];

      const marketData = markets.data.filter((market) =>
        topBets.map((bet) => bet.market_id).includes(market.id),
      );

      await this.run(marketData);
    } catch (error) {
      this.logger.error('Failed to fetch or process markets:', error);
    }
  }

  async run(marketData) {
    const researchAnalyst = createReactAgent({
      llm: this.chatModel,
      tools: [
        this.toolsService.searchNews(),
        this.toolsService.uploadResearch(),
      ],
      name: 'research_analyst',
      prompt:
        'You are a senior research analyst at a hedge fund specializing in prediction markets. ' +
        'Your expertise includes fundamental analysis, market sentiment analysis, and identifying ' +
        'arbitrage opportunities in prediction markets. You analyze political events, economic indicators, ' +
        'sports outcomes, and other predictable events. Focus on probability assessment and risk evaluation. ' +
        '\n\nIMPORTANT: For every market analysis, you MUST: ' +
        '1. Search for the latest news using the search_news tool to gather current information ' +
        '2. Compile your research findings into a comprehensive report ' +
        '3. Upload your completed research using the upload_research tool for documentation and future reference. ' +
        'Always start by searching for relevant news before making any investment recommendations.',
    });

    const trader = createReactAgent({
      llm: this.chatModel,
      tools: [],
      name: 'trader',
      prompt:
        'You are an experienced trader at a hedge fund focused on prediction markets. ' +
        'You execute trades based on research recommendations, manage position sizing, ' +
        'monitor market liquidity, and implement trading strategies. You understand market ' +
        'microstructure, slippage, and optimal execution timing for prediction market platforms.',
    });

    const complianceOfficer = createReactAgent({
      llm: this.chatModel,
      tools: [],
      name: 'compliance_officer',
      prompt:
        'You are a compliance officer at a hedge fund operating in prediction markets. ' +
        'You ensure all trading activities comply with relevant regulations, monitor ' +
        'position limits, review potential conflicts of interest, and assess legal risks ' +
        'associated with prediction market participation. You stay updated on regulatory ' +
        'changes affecting prediction markets and gambling laws.',
    });

    const portfolioManager = createSupervisor({
      agents: [researchAnalyst],
      llm: this.chatModel,
      prompt:
        'You are the portfolio manager at a hedge fund specializing in prediction markets. ' +
        'You oversee portfolio allocation, risk management, and strategic positioning across ' +
        'different market categories. You manage a team of specialists: ' +
        'research_analyst (conducts market analysis and probability assessments), ' +
        'trader (executes trades and manages positions), and ' +
        'compliance_officer (ensures regulatory compliance). ' +
        '\n\nFor investment decisions: Start with research_analyst for market analysis, ' +
        'then make strategic allocation decisions, direct trader for execution, ' +
        'and have compliance_officer review for regulatory compliance. ' +
        '\n\nFor risk assessment: Analyze portfolio risk and consult compliance_officer for regulatory risks. ' +
        '\n\nFor regulatory questions: Route to compliance_officer. ' +
        '\n\nFor market research: Direct research_analyst. ' +
        '\n\nYou make final portfolio decisions while ensuring proper risk management and compliance oversight.',
    });

    // const app = portfolioManager.compile({
    //   checkpointer: this.memorySaver,
    //   store: this.memoryStore,
    // });

    const app = portfolioManager.compile();

    const result = await app.invoke({
      messages: [
        {
          role: 'user',
          content: `Analyze this prediction market data and leverage your team to provide investment recommendations: ${JSON.stringify(marketData, null, 2)}`,
        },
      ],
    });
    this.logger.log(result);
    return result;
  }
}
