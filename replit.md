# InvoiceGen - Invoice Generation Application

## Overview

InvoiceGen is a modern full-stack web application designed for creating professional invoices effortlessly. The application features a React-based frontend with a Node.js/Express backend, utilizing PostgreSQL for data persistence and Drizzle ORM for database operations.

## User Preferences

Preferred communication style: Simple, everyday language.
Database: Supabase (PostgreSQL) - User requested Supabase integration with connection string configuration.
Dashboard Layout: Mobile devices use collapsible sidebar, Desktop/laptop displays fixed left navigation without sidebar.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Animations**: Framer Motion for smooth UI animations

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: PostgreSQL session store with connect-pg-simple

### Component Library
The application uses shadcn/ui components built on top of Radix UI primitives, providing:
- Consistent design system with CSS variables for theming
- Accessible components following WAI-ARIA standards
- Customizable components through Tailwind CSS classes

## Key Components

### Database Schema
Located in `shared/schema.ts`, currently defines:
- **Users table**: Basic user authentication with username/password and timestamps
- **Invoices table**: Invoice data including client info, amounts, and status tracking
- Drizzle schema with Zod validation for type safety
- Support for Supabase PostgreSQL connection

### Storage Layer
The application implements a storage interface pattern:
- **IStorage interface**: Defines CRUD operations for data access
- **MemStorage**: In-memory implementation for development
- Designed to be easily swapped with database-backed storage

### Frontend Pages
- **Home Page**: Marketing landing page with hero section, features, and call-to-action
- **Settings Page**: Database configuration page for Supabase connection string setup
- **404 Page**: Not found page with developer-friendly messaging

### UI Components
- **Navigation**: Fixed header with responsive mobile menu
- **Hero Section**: Main landing area with primary call-to-action
- **Features Section**: Showcases key application features
- **How It Works**: Step-by-step process explanation
- **CTA Section**: Secondary conversion area
- **Footer**: Links and company information

## Data Flow

### Client-Server Communication
- RESTful API endpoints prefixed with `/api`
- Request/response logging middleware for development
- JSON-based data exchange with proper error handling
- Credential-based authentication using cookies

### Development Workflow
- Hot module replacement via Vite dev server
- TypeScript compilation without emit for type checking
- Automatic database schema migrations with Drizzle Kit

## External Dependencies

### Core Technologies
- **Database**: PostgreSQL via Supabase serverless platform (user configurable)
- **Authentication**: Cookie-based sessions with PostgreSQL storage
- **UI Components**: Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with PostCSS processing

### Development Tools
- **Replit Integration**: Development banner and error overlay plugins
- **Build Process**: ESBuild for server bundling, Vite for client bundling

## Deployment Strategy

### Build Process
- **Client**: Vite builds static assets to `dist/public`
- **Server**: ESBuild bundles server code to `dist/index.js`
- **Database**: Drizzle migrations stored in `migrations/` directory

### Environment Configuration
- **Development**: Uses tsx for TypeScript execution with hot reload
- **Production**: Compiled JavaScript execution with NODE_ENV=production
- **Database**: Requires DATABASE_URL environment variable

### File Structure
```
├── client/          # Frontend React application
├── server/          # Backend Express application  
├── shared/          # Shared types and schemas
├── migrations/      # Database migration files
└── dist/           # Built application files
```

The application follows a monorepo structure with clear separation between client, server, and shared code, making it easy to maintain and scale.