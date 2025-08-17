# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Bridgewager Associates is a Turborepo monorepo for an agentic multi-agent hedge fund specializing in prediction markets. The project consists of:

- **Web App** (`apps/web`): Next.js 15 frontend with React 19, TypeScript, and Tailwind CSS
- **API** (`apps/api`): NestJS backend API with LangChain integration for AI agents
- **Shared Packages** (`packages/`): Shared ESLint, TypeScript, and Jest configurations

## Common Commands

### Root Level Development
- `yarn dev` - Start all services in development mode (uses Turbo for parallel execution)
- `yarn build` - Build all applications 
- `yarn test` - Run tests across all packages
- `yarn test:e2e` - Run end-to-end tests
- `yarn lint` - Lint all packages
- `yarn format` - Format code with Prettier

### Web App (`apps/web`)
- `yarn dev` - Start Next.js development server on port 3500 with Turbopack
- `yarn build` - Build Next.js production bundle
- `yarn start` - Start production server
- `yarn lint` - Run ESLint with zero warnings policy
- `yarn check-types` - Run TypeScript type checking without emitting

### API (`apps/api`)
- `yarn dev` - Start NestJS in watch mode
- `yarn build` - Build NestJS application
- `yarn start` - Start production server
- `yarn start:debug` - Start with debug mode and watch
- `yarn start:prod` - Start production build
- `yarn test` - Run Jest unit tests
- `yarn test:watch` - Run tests in watch mode
- `yarn test:debug` - Run tests with debugger
- `yarn test:e2e` - Run end-to-end tests
- `yarn lint` - Lint TypeScript files

### Running Single Tests
- `yarn test -- --testNamePattern="test name"` - Run specific test by name
- `yarn test -- path/to/test.spec.ts` - Run specific test file

## Architecture Overview

### Monorepo Structure
- **Turborepo**: Manages build dependencies, caching, and parallel task execution
- **Yarn Workspaces**: Package management with shared dependencies
- **Shared Configs**: Consistent ESLint, TypeScript, and Jest configurations across packages

### Web Application (Next.js 15)
- **Framework**: Next.js 15 with App Router and React Server Components
- **Styling**: Tailwind CSS v4 with shadcn/ui component library
- **UI Components**: Built with Radix UI primitives for accessibility
- **Icons**: Tabler Icons and Lucide React
- **Blockchain**: Coinbase CDP SDK integration for Web3 functionality
- **Data Visualization**: Recharts for interactive charts and graphs
- **State Management**: React hooks and context with CDP providers
- **Theme System**: Dark/light mode support with next-themes

### API Application (NestJS)
- **Framework**: NestJS with TypeScript, decorators, and dependency injection
- **AI Integration**: LangChain ecosystem (`@langchain/core`, `@langchain/langgraph`, `@langchain/langgraph-supervisor`)
- **Database**: Supabase integration with `@supabase/supabase-js`
- **Markets Integration**: Polymarket CLOB client for prediction market trading
- **News Integration**: Tusky SDK and ts-newsapi for market research
- **Validation**: Global ValidationPipe with class-transformer and class-validator
- **CORS**: Enabled globally for cross-origin requests

### Key Dependencies

#### Web App
- **Coinbase CDP**: Blockchain integration with `@coinbase/cdp-sdk`, `@coinbase/cdp-hooks`, `@coinbase/cdp-wagmi`
- **UI Framework**: Radix UI components with class-variance-authority for styling variants
- **Data Tables**: TanStack React Table for complex data displays
- **Forms**: Zod for schema validation
- **DnD**: @dnd-kit for drag and drop functionality

#### API
- **AI/ML**: LangChain for agent orchestration and AI workflows
- **Markets**: Polymarket CLOB client for prediction market access
- **Database**: Supabase for data persistence
- **News**: Tusky SDK and News API for market research
- **Validation**: class-transformer and class-validator for request validation

### Module Architecture

#### API Modules
- **AppModule**: Root module with global configuration, imports AgentsModule and MarketsModule
- **AgentsModule**: AI agent functionality with AgentController, AgentsService, and ToolsService
- **MarketsModule**: Market data and trading functionality

#### Web App Structure
- `src/app/` - Next.js App Router pages with role-based navigation
- `src/components/` - Reusable React components
- `src/components/ui/` - shadcn/ui base components
- `src/lib/` - Utility functions and configurations
- `src/hooks/` - Custom React hooks
- `src/contexts/` - React context providers

### Key Features
- Multi-agent hedge fund dashboard with role-based access (Research Analyst, Compliance Officer, Portfolio Manager, Trader)
- AI-powered prediction market analysis and trading
- Real-time market data visualization
- Document management and reporting system
- Blockchain integration for decentralized prediction markets
- User authentication via Coinbase CDP

## Environment Variables

### Required for Development
- `NEXT_PUBLIC_CDP_PROJECT_ID` - Coinbase CDP project ID
- `CDP_API_KEY_NAME` - CDP API key name
- `CDP_API_KEY_PRIVATE_KEY` - CDP API private key
- `TUSKY_API_KEY` - Tusky service API key
- `TUSKY_VAULT_ID` - Tusky vault identifier
- `POLYMARKET_PRIVATE_KEY` - Polymarket trading private key
- `POLYMARKET_FUNDER_ADDRESS` - Polymarket funding address
- `PORT` - API server port (defaults to 3000)

## Development Notes
- Package manager: Yarn (v1.22.22)
- Node.js requirement: >=18
- TypeScript strict mode enabled across all packages
- Next.js development server runs on port 3500
- NestJS API uses global prefix `/api/v1/core`
- All packages use shared configurations for consistency
- Turborepo handles build optimization and caching