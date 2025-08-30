# 🎯 Bridgewager Associates

> **An AI-Powered Multi-Agent Hedge Fund for Prediction Markets**

Bridgewager Associates demonstrates the future of quantitative finance through AI-driven prediction market trading. Built with modern web technologies and powered by LangChain's multi-agent framework, it showcases autonomous trading agents working together to analyze markets, execute trades, and manage risk in real-time.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)

## 🚀 Innovation Overview

This project represents an innovative fusion of:
- **AI/ML**: Multi-agent orchestration with LangChain
- **DeFi/Web3**: Blockchain integration via Coinbase CDP
- **FinTech**: Real-time prediction market analysis and trading
- **Full-Stack Development**: Modern React/Next.js frontend with NestJS API

## ✨ Features

### 🤖 AI-Powered Multi-Agent System
- **Research Analyst Agent**: Conducts market research and generates trading recommendations
- **Execution Trader Agent**: Executes trades with optimal timing and sizing
- **Portfolio Manager Agent**: Orchestrates team workflow and manages overall strategy
- **Compliance Officer Agent**: Ensures regulatory compliance and risk management

### 📊 Real-Time Market Analytics
- Interactive prediction market data visualization with Recharts
- Real-time market odds tracking and analysis
- Advanced risk metrics (VaR, Expected Shortfall, Correlation Analysis)
- Agent performance calibration and accuracy tracking

### 🔗 Blockchain Integration
- Coinbase CDP SDK integration for Web3 functionality
- Decentralized prediction market access
- Secure wallet management and transaction handling

### 💹 Professional Trading Interface
- Role-based dashboard for different hedge fund positions
- Live market positions and P&L tracking
- Risk management tools and compliance monitoring
- Document management and research report generation

### 🎨 Modern UI/UX
- Built with Next.js 15 and React 19
- Tailwind CSS with shadcn/ui component system
- Dark/light theme support
- Responsive design for desktop and mobile

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: NestJS, LangChain, TypeScript
- **AI/ML**: LangChain LangGraph, OpenAI GPT models
- **Blockchain**: Coinbase CDP SDK, Wagmi, Ethers.js
- **Database**: Supabase
- **UI Components**: shadcn/ui, Radix UI
- **Charts**: Recharts
- **Monorepo**: Turborepo with Yarn Workspaces

### System Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Web Frontend  │    │   NestJS API     │    │  AI Agents      │
│   (Next.js)     │◄──►│   (LangChain)    │◄──►│  (Multi-Agent)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Coinbase CDP   │    │    Supabase      │    │   Polymarket    │
│  (Blockchain)   │    │   (Database)     │    │   (Markets)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Yarn 1.22.22
- Git

### Environment Setup
Create a `.env.local` file in the project root with the required environment variables as specified in the turbo.json configuration:

```bash
# Coinbase CDP Configuration
NEXT_PUBLIC_CDP_PROJECT_ID=
CDP_API_KEY_NAME=
CDP_API_KEY_PRIVATE_KEY=

# AI/LangChain Configuration
AZURE_API_KEY=
AZURE_RESOURCE_NAME=

# Market Data APIs
TUSKY_API_KEY=
TUSKY_VAULT_ID=
POLYMARKET_PRIVATE_KEY=
POLYMARKET_FUNDER_ADDRESS=

# Database
SUPABASE_URL=
SUPABASE_ANON_KEY=

# Server Configuration
PORT=3000
```

### Installation & Development

```bash
# Clone the repository
git clone https://github.com/username/bridgewager-associates.git
cd bridgewager-associates

# Install dependencies
yarn install

# Start development servers (runs both web and API)
yarn dev

# Or run individually:
# Web app (http://localhost:3500)
cd apps/web && yarn dev

# API server (http://localhost:3000)
cd apps/api && yarn dev
```

### Building for Production

```bash
# Build all applications
yarn build

# Run production build
yarn start
```

## 📱 Demo & Screenshots

### Multi-Agent Dashboard
The main dashboard shows real-time performance metrics for each AI agent, with role-based navigation for different hedge fund positions.

### Live Market Analysis
Interactive charts display prediction market data, with real-time odds tracking and AI-generated trading recommendations.

### Risk Management Interface
Comprehensive risk analytics including VaR calculations, correlation heatmaps, and portfolio exposure analysis.

## 🤖 AI Agents in Action

### Research Analyst Workflow
1. **Market Scanning**: Automatically identifies profitable prediction markets
2. **News Analysis**: Searches and analyzes relevant news using Tusky API
3. **Probability Assessment**: Generates fair value estimates and edge calculations
4. **Research Documentation**: Creates detailed research reports with trading recommendations

### Execution Trader Workflow  
1. **Order Management**: Receives recommendations from Research Analyst
2. **Market Timing**: Analyzes liquidity and optimal execution timing
3. **Trade Execution**: Places orders through Polymarket CLOB client
4. **Confirmation**: Reports execution results back to Portfolio Manager

### Portfolio Manager Orchestration
1. **Team Coordination**: Manages workflow between Research and Trading agents
2. **Risk Oversight**: Monitors overall portfolio exposure and compliance
3. **Strategic Decisions**: Makes high-level allocation and strategy decisions

## 🌐 Application Features

The application provides a comprehensive trading interface with:

- **Role-Based Access**: Portfolio Manager, Research Analyst, Trader, and Compliance Officer views
- **Real-Time Data**: Live market data from Polymarket API
- **AI Agent Dashboard**: Monitor autonomous trading agents and their performance
- **Risk Management**: Advanced analytics and compliance monitoring

## 📖 API Documentation

### Core Endpoints

```typescript
// Start AI agent analysis
POST /api/v1/core/agents/initiate
Body: { markets: Market[] }

// Execute trade
POST /api/v1/core/agents/trade
Body: { marketId: string, side: 'BUY' | 'SELL', amount: number }

// Get agent performance
GET /api/v1/core/agents/performance
Query: { agentId?: string, timeframe?: string }

// Market data
GET /api/v1/core/markets
Query: { active: boolean, limit: number }
```

### Market Integration
- **Polymarket**: Real-time market data and order execution
- **Tusky**: News and sentiment analysis
- **Supabase**: Research report storage and agent memory

## 🛠️ Development

### Project Structure
```
bridgewager-associates/
├── apps/
│   ├── web/              # Next.js frontend
│   │   ├── src/app/      # App router pages
│   │   ├── src/components/ # React components
│   │   └── src/lib/      # Utilities and types
│   └── api/              # NestJS backend
│       ├── src/agents/   # AI agent implementation
│       ├── src/markets/  # Market data services
│       └── src/config/   # Configuration
├── packages/             # Shared configurations
└── turbo.json           # Turborepo config
```

### Key Commands
```bash
# Development
yarn dev                 # Start all services
yarn build              # Build all apps
yarn test               # Run tests
yarn lint               # Lint all packages

# Single app development
yarn workspace web dev          # Web app only
yarn workspace api dev          # API only

# Testing
yarn test --testNamePattern="agent"  # Run specific tests
yarn test:e2e                       # End-to-end tests
```

## 🎯 Project Highlights

This project showcases excellence in multiple technical areas:

- **🤖 Advanced AI Integration**: Multi-agent system with LangChain orchestration
- **💰 FinTech Innovation**: Real prediction market trading with comprehensive risk management
- **🔗 Blockchain Integration**: Coinbase CDP and Web3 functionality for decentralized trading
- **🎨 Modern UI/UX**: Responsive design with shadcn/ui components and accessibility features
- **📊 Data Visualization**: Interactive charts and real-time market analytics
- **⚡ Performance**: Optimized with Turborepo, Next.js 15, and modern React patterns

## 🚀 Future Roadmap

### Phase 1: Enhanced AI Capabilities
- [ ] Advanced market sentiment analysis
- [ ] Machine learning model training for better predictions
- [ ] Integration with additional news sources and data providers

### Phase 2: Expanded Market Coverage
- [ ] Support for more prediction market platforms (Kalshi, Manifold, etc.)
- [ ] Traditional financial markets integration
- [ ] Cryptocurrency derivatives trading

### Phase 3: Advanced Risk Management
- [ ] Real-time risk monitoring and automatic position adjustments
- [ ] Advanced portfolio optimization algorithms
- [ ] Regulatory compliance automation

### Phase 4: Scaling & Performance
- [ ] Microservices architecture
- [ ] Real-time streaming data processing
- [ ] Multi-tenant platform for multiple hedge funds

## 🤝 Contributing

We welcome contributions from the community! This is an open-source project designed to push the boundaries of AI-driven finance.

### Getting Started
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Add tests for new functionality
- Update documentation for API changes
- Ensure all CI checks pass

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **LangChain Team**: For the incredible multi-agent framework
- **Coinbase**: For the CDP SDK and blockchain infrastructure
- **Polymarket**: For prediction market data and trading APIs
- **Vercel**: For seamless deployment and hosting
- **Open Source Community**: For the amazing tools and libraries

## 📞 Contact & Support

- **GitHub**: [Bridgewager Associates](https://github.com/username/bridgewager-associates)
- **Issues**: [Report a Bug](https://github.com/username/bridgewager-associates/issues)
- **Discussions**: [Community Discussions](https://github.com/username/bridgewager-associates/discussions)

---

<div align="center">

**Built with ❤️ for the future of AI-driven finance**

*Bridgewager Associates - Where Artificial Intelligence Meets Quantitative Finance*

</div>