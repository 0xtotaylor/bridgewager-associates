# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a Next.js 15 web application within a Turborepo monorepo. The web app is located at `/apps/web/` and uses:

- **Framework**: Next.js 15 with App Router (`src/app/` directory)
- **Styling**: Tailwind CSS v4 with custom CSS variables for theming
- **TypeScript**: Strict configuration extending shared configs from `@repo/typescript-config`
- **Fonts**: Geist Sans and Geist Mono from Google Fonts
- **Development**: Turbopack for fast development builds

## Development Commands

### Local Development

```bash
# Start development server (runs on port 3500 with Turbopack)
npm run dev
# or from monorepo root
yarn dev

# Build for production
npm run build
# or from monorepo root
yarn build
```

### Code Quality

```bash
# Lint with zero warnings tolerance
npm run lint

# Type checking only (no emit)
npm run check-types

# Format code (from monorepo root)
yarn format
```

### Monorepo Commands

From the repository root (`/Users/totaylor/Developer/bridgewager-associates/`):

- `yarn dev` - Start all apps in development mode
- `yarn build` - Build all apps and packages
- `yarn lint` - Lint all workspaces
- `yarn test` - Run tests across all workspaces
- `yarn format` - Format all TypeScript, TSX, and Markdown files

## Architecture Notes

### Styling System

- Uses Tailwind CSS v4 with CSS variables for theming
- Dark mode support via `prefers-color-scheme` media query
- Custom color variables defined in `globals.css`:
  - `--background` and `--foreground` for adaptive theming
  - Font variables from Geist font family

### Configuration

- **ESLint**: Uses shared config from `@repo/eslint-config/next-js`
- **TypeScript**: Extends `@repo/typescript-config/nextjs.json`
- **PostCSS**: Configured for Tailwind CSS v4 processing
- **Turborepo**: Orchestrates monorepo builds with dependency management

### File Structure

- `src/app/` - Next.js App Router pages and layouts
- `src/app/globals.css` - Global styles with Tailwind and theme variables
- `public/` - Static assets (SVG icons)
- Configuration files at root level for Next.js, TypeScript, ESLint, and PostCSS

### Development Environment

- Node.js 18+ required
- Yarn workspace package manager
- Development server runs on port 3500
- Turbopack enabled for faster builds in development
