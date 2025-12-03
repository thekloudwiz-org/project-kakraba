# Kakraba Frontend Monorepo

This is the frontend monorepo for the Kakraba platform, containing three web applications and shared components.

## Structure

```
frontend/
├── packages/
│   └── shared/          # Shared components, hooks, and utilities
├── landing-page/        # Landing page (kakraba.thekloudwiz.com)
├── creator-portal/      # Creator portal (create-kakraba.thekloudwiz.com)
└── fan-portal/          # Fan portal (fan-kakraba.thekloudwiz.com)
```

## Prerequisites

- Node.js 20+
- pnpm 8+

## Installation

```bash
# Install pnpm if you haven't already
npm install -g pnpm

# Install all dependencies
pnpm install
```

## Development

```bash
# Run landing page in development mode
pnpm dev:landing

# Run creator portal in development mode
pnpm dev:creator

# Run fan portal in development mode
pnpm dev:fan
```

## Building

```bash
# Build landing page
pnpm build:landing

# Build creator portal
pnpm build:creator

# Build fan portal
pnpm build:fan

# Build all applications
pnpm build:all
```

## Testing

```bash
# Run all tests
pnpm test

# Run tests for a specific package
pnpm --filter creator-portal test
pnpm --filter fan-portal test
```

## Linting

```bash
# Lint all packages
pnpm lint

# Type check all packages
pnpm type-check
```

## Technology Stack

### Core
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **pnpm** - Package manager with workspace support

### State Management
- **TanStack Query** - Server state management
- **Zustand** - Client state management

### Routing
- **React Router v6** - Client-side routing

### Forms
- **React Hook Form** - Form management
- **Zod** - Schema validation

### UI Components
- **Tailwind CSS** - Utility-first CSS
- **Radix UI** - Accessible component primitives

### Authentication
- **AWS Amplify** - Cognito integration

### Payment (Fan Portal)
- **Stripe.js** - Payment processing

### Testing
- **Vitest** - Unit testing
- **React Testing Library** - Component testing
- **fast-check** - Property-based testing

## Shared Package

The `@kakraba/shared` package contains:
- Reusable UI components
- Custom hooks
- Utility functions
- Shared types

All applications can import from the shared package:

```typescript
import { Button, useAuth } from '@kakraba/shared';
```

## Deployment

Each application is deployed to its own S3 bucket with CloudFront distribution:

- **Landing Page**: `kakraba.thekloudwiz.com`
- **Creator Portal**: `create-kakraba.thekloudwiz.com`
- **Fan Portal**: `fan-kakraba.thekloudwiz.com`

See individual application READMEs for deployment instructions.

## Environment Variables

Each application requires environment variables for API endpoints and AWS configuration. See `.env.example` files in each application directory.

## Contributing

1. Make changes in the appropriate package
2. Run tests: `pnpm test`
3. Run type checking: `pnpm type-check`
4. Run linting: `pnpm lint`
5. Build to verify: `pnpm build:all`
