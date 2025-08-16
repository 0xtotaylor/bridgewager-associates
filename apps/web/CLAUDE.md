# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Turborepo monorepo for Bridgewager Associates, a multi-agent hedge fund specializing in prediction markets. The project consists of:

- **Web App** (`apps/web`): Next.js 15 frontend with React 19, TypeScript, and Tailwind CSS
- **API** (`apps/api`): NestJS backend API
- **Shared Packages** (`packages/`): ESLint configs, TypeScript configs, and Jest configs

## Development Commands

### Root Level (from `/Users/totaylor/Developer/bridgewager-associates`)
- `yarn dev` - Start all services in development mode
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

## Architecture

### Web Application Structure
- **Framework**: Next.js 15 with App Router, React Server Components
- **Styling**: Tailwind CSS v4 with shadcn/ui components
- **UI Components**: Built with Radix UI primitives and shadcn/ui
- **Icons**: Tabler Icons and Lucide React
- **Blockchain**: Coinbase CDP SDK for Web3 functionality with OnchainKit
- **Theme**: Supports dark/light mode with next-themes
- **Data Tables**: TanStack React Table for complex data display
- **Charts**: Recharts for data visualization

### Key Dependencies
- **Coinbase CDP**: `@coinbase/cdp-react`, `@coinbase/cdp-hooks`, `@coinbase/onchainkit` for blockchain integration
- **UI Framework**: Radix UI components with class-variance-authority for styling variants
- **State Management**: React hooks and context (via CDP providers)
- **Forms**: Zod for schema validation
- **Animations**: Built-in CSS animations with tw-animate-css

### API Structure
- **Framework**: NestJS with TypeScript
- **Testing**: Jest with Supertest for e2e testing
- **Architecture**: Standard NestJS module structure

### Component Architecture
The web app follows a clear component hierarchy:
- `src/app/` - Next.js App Router pages and layouts
- `src/components/` - Reusable components
- `src/components/ui/` - shadcn/ui base components
- `src/lib/` - Utility functions and configurations
- `src/hooks/` - Custom React hooks

### Key Features
- Multi-agent hedge fund dashboard with role-based navigation (Research Analyst, Compliance Officer, Portfolio Manager, Trader)
- Blockchain integration for prediction markets
- Data visualization with interactive charts
- Document management system
- User authentication via Coinbase CDP

## Configuration Files
- `components.json` - shadcn/ui configuration with New York style
- `turbo.json` - Turborepo task configuration
- `tsconfig.json` - TypeScript configuration per package
- Shared configs in `packages/` for consistent tooling

## Environment Setup
The web app requires:
- `NEXT_PUBLIC_CDP_PROJECT_ID` - Coinbase CDP project ID
- `NEXT_PUBLIC_ONCHAINKIT_API_KEY` - OnchainKit API key for blockchain functionality

## Development Notes
- Uses Yarn as package manager
- All packages share consistent ESLint, TypeScript, and Jest configurations
- Turborepo handles build dependencies and caching
- Next.js runs on port 3500 in development
- TypeScript strict mode enabled across all packages