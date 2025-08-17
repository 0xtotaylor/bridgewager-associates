import { InMemoryStore, MemorySaver } from '@langchain/langgraph';
import { createSupervisor } from '@langchain/langgraph-supervisor';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { AzureChatOpenAI } from '@langchain/openai';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { pull } from 'langchain/hub';

import { SupabaseConfig } from '../../config/supabase.config';
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
    private readonly supabase: SupabaseConfig,
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
      // await this.initiate();
    } catch (error) {
      this.logger.error('Error testing agents on init:', error);
    }
  }

  private async initiate() {
    try {
      this.logger.log('Starting market identification process...');

      const markets = await this.marketsService.getMarkets();

      if (!markets || !markets.data) {
        this.logger.warn('No markets data received from API');
        return;
      }

      this.logger.log(`Received ${markets.data.length} markets from API`);

      const filteredMarkets = markets.data
        .filter((market) => market.outcomes === '["Yes", "No"]')
        .map((market) => ({
          id: market.id,
          question: market.question,
          description: market.description,
          conditionId: market.conditionId,
          clobTokenIds: market.clobTokenIds,
        }));

      this.logger.log(`Filtered to ${filteredMarkets.length} binary markets`);

      const prompt = await pull('bridgewager-identify-markets');

      const chain = prompt.pipe(this.reasoningModel);

      const response = await chain.invoke({
        market_data: filteredMarkets,
      });

      const topBets = (response as any).top_bets || [];

      const marketData = markets.data.filter((market) =>
        topBets.map((bet) => bet.market_id).includes(market.id),
      );

      const recordsToInsert = marketData.map((market) => {
        const correspondingAnalysis = topBets.find(
          (bet) => bet.market_id === market.id,
        );
        return {
          market,
          analysis: correspondingAnalysis || null,
        };
      });

      const { error } = await this.supabase
        .from('polymarket')
        .insert(recordsToInsert);

      if (error) {
        this.logger.error('Error inserting markets into Supabase:', error);
      }

      await this.run(marketData);
    } catch (error) {
      this.logger.error('Failed to fetch or process markets:', error);
    }
  }

  private async run(marketData) {
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
        '\n\nYour role in the trading workflow: ' +
        '1. Conduct thorough market research and analysis ' +
        '2. Generate trading recommendations with specific entry points, position sizes, and risk parameters ' +
        '3. Prepare detailed research reports for the execution trader ' +
        '4. Hand off actionable trading instructions to the trader for execution ' +
        '\n\nIMPORTANT: For every market analysis, you MUST: ' +
        '1. Search for the latest news using the search_news tool to gather current information ' +
        '2. Compile your research findings into a comprehensive report with specific trading recommendations ' +
        '3. Upload your completed research using the upload_research tool for documentation ' +
        '4. Conclude with clear, actionable trading instructions for the execution trader including: ' +
        '   - Recommended position (BUY/SELL) ' +
        '   - Suggested position size and price levels ' +
        '   - Risk assessment and stop-loss levels ' +
        '   - Market timing considerations ' +
        '\n\nAlways end your analysis by clearly stating: "RESEARCH COMPLETE - HANDOFF TO TRADER" followed by your specific trading recommendations.',
    });

    const executiontrader = createReactAgent({
      llm: this.chatModel,
      tools: [await this.toolsService.makeWager()],
      name: 'trader',
      prompt:
        'You are an experienced execution trader at a hedge fund focused on prediction markets. ' +
        'Your primary role is to receive trading recommendations from the research analyst and execute them efficiently. ' +
        'You manage position sizing, monitor market liquidity, optimize trade execution timing, and implement trading strategies. ' +
        'You understand market microstructure, slippage, and optimal execution for prediction market platforms. ' +
        '\n\nYour workflow: ' +
        '1. Receive detailed trading recommendations from the research analyst ' +
        '2. Review the research findings and trading parameters ' +
        '3. Assess current market conditions and liquidity ' +
        '4. Execute trades using the make_wager tool with optimal timing and sizing ' +
        '5. Report execution results back to the portfolio manager ' +
        '\n\nWhen you receive a handoff from the research analyst: ' +
        '- Look for their "RESEARCH COMPLETE - HANDOFF TO TRADER" signal ' +
        '- Extract their specific trading recommendations (position, size, price, risk parameters) ' +
        '- Validate the recommendations against current market conditions ' +
        '- Execute the trades using the make_wager tool ' +
        '- Provide execution confirmation with order details ' +
        '\n\nAlways confirm trade execution by stating: "TRADE EXECUTED" followed by order details and any execution notes.',
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
      agents: [researchAnalyst, executiontrader],
      llm: this.chatModel,
      prompt:
        'You are the portfolio manager at a hedge fund specializing in prediction markets. ' +
        'You oversee portfolio allocation, risk management, and strategic positioning across ' +
        'different market categories. You manage a structured trading workflow with clear handoffs between team members. ' +
        '\n\nYour team structure: ' +
        '- research_analyst: Conducts market analysis and generates trading recommendations ' +
        '- trader: Executes trades based on research recommendations ' +
        '\n\nSTRICT WORKFLOW PROCESS: ' +
        '1. ALWAYS start by directing research_analyst to analyze the markets and generate trading recommendations ' +
        '2. Wait for research_analyst to complete analysis and signal "RESEARCH COMPLETE - HANDOFF TO TRADER" ' +
        '3. Then direct trader to execute the recommended trades ' +
        '4. Wait for trader to confirm "TRADE EXECUTED" with execution details ' +
        '5. Review overall portfolio impact and provide final assessment ' +
        '\n\nNEVER allow trader to act without research_analyst recommendations first. ' +
        'NEVER allow research_analyst to execute trades - only trader can use trading tools. ' +
        'Ensure clear handoffs occur at each stage before proceeding to the next agent. ' +
        '\n\nMonitor the conversation for handoff signals and orchestrate the proper sequence of operations.',
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
