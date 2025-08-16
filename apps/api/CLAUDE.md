# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Development
- `npm run dev` - Start development server with watch mode
- `npm run start` - Start the application
- `npm run start:debug` - Start with debug mode and watch
- `npm run start:prod` - Start production build

### Building and Testing
- `npm run build` - Build the application using NestJS CLI
- `npm run test` - Run unit tests with Jest
- `npm run test:watch` - Run tests in watch mode
- `npm run test:debug` - Run tests with debugger
- `npm run test:e2e` - Run end-to-end tests
- `npm run lint` - Run ESLint on TypeScript files

### Running Single Tests
- `npm run test -- --testNamePattern="test name"` - Run specific test by name
- `npm run test -- path/to/test.spec.ts` - Run specific test file

## Architecture Overview

This is a NestJS API application structured as part of a monorepo. Key architectural elements:

### Framework and Structure
- **NestJS Framework**: Uses decorators, modules, controllers, and services
- **Monorepo Setup**: Uses shared configs from `@repo/*` packages for ESLint, Jest, and TypeScript
- **Global API Prefix**: All endpoints are prefixed with `/api/v1/core`
- **Validation**: Global ValidationPipe enabled with class-transformer and class-validator
- **CORS**: Enabled globally

### Key Dependencies
- **LangChain Integration**: Includes `@langchain/core`, `@langchain/langgraph`, and `@langchain/langgraph-supervisor` for AI/LLM functionality
- **Configuration**: Uses `@nestjs/config` with global configuration module
- **Validation**: `class-transformer` and `class-validator` for request validation

### Module Structure
- **AppModule**: Root module with global configuration and imports AgentsModule
- **AgentsModule**: Currently empty but likely intended for AI agent functionality
- Main application files in `src/` with standard NestJS structure

### Configuration Files
- **Jest Config**: Extends shared `@repo/jest-config` with `nestConfig`
- **ESLint Config**: Uses shared `@repo/eslint-config/nest-js` configuration
- **TypeScript**: Uses shared `@repo/typescript-config`
- **NestJS CLI**: Standard configuration with `src` as source root

### Testing Setup
- Unit tests configured with Jest and `ts-jest`
- E2E tests using `supertest` for HTTP testing
- Separate Jest configuration for E2E tests in `test/jest-e2e.json`

### Port Configuration
- Default port: 3000 (configurable via `PORT` environment variable)