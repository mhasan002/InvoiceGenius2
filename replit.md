# InvoiceGen - Invoice Generation Application

## Overview

InvoiceGen is a modern full-stack web application designed for creating professional invoices effortlessly. The application features a React-based frontend with a Node.js/Express backend, utilizing PostgreSQL for data persistence and Drizzle ORM for database operations.

## User Preferences

Preferred communication style: Simple, everyday language.
Database: Supabase (PostgreSQL) - User requested Supabase integration with connection string configuration.
Dashboard Layout: Mobile devices use collapsible sidebar, Desktop/laptop displays fixed left navigation without sidebar.
Navigation Issue Fix: User reported Payment Methods page losing left navigation - fixed by wrapping with DashboardLayout component.

## Recent Changes

### Migration from Replit Agent to Standard Replit Environment Completed (July 29, 2025)
- Successfully migrated InvoiceGen application from Replit Agent to standard Replit environment
- Connected to user's Supabase database with provided DATABASE_URL connection string
- Verified all database tables are present: users, invoices, services, packages, company_profiles, payment_methods, templates
- Fixed existing user data constraint issues for smooth database operation
- All dependencies installed and workflow running successfully on port 5000
- Application fully functional with proper client/server separation and secure database connectivity
- Project now follows robust security practices with authenticated API endpoints
- Fixed Minimalist Red template: company logo now displays properly (increased size from 8x8 to 12x12 pixels)
- Removed duplicate "Thank you for your business!" and "Authorized Signed" text from footer
- Corrected geometric footer design to match original template with proper angular cuts and white diagonal separation

### Previous Migration to Replit Environment Completed (July 29, 2025)
- Successfully migrated project from Replit Agent to standard Replit environment
- Connected to user's Supabase database with provided DATABASE_URL connection string
- Pushed complete database schema to Supabase including all required tables
- Added missing tagline column to company_profiles table to match schema requirements
- Fixed React Query error handling in create-invoice page to prevent "find is not a function" errors
- Updated API fetch functions to handle error responses and ensure array data types
- Verified all database tables: users, invoices, services, packages, company_profiles, payment_methods, templates
- Fixed database schema validation issues with numeric fields (decimal to string conversion)
- Updated schema with missing columns (client_phone, client_address, items, pricing fields)
- Fixed invoice creation validation errors by updating Zod schemas to handle number/string conversion
- Added PDF download button handler (placeholder for future implementation)
- All dependencies installed and workflow running successfully on port 5000
- Application fully functional with proper client/server separation and database connectivity

### Total Insights Page Enhancement (January 28, 2025)
- Implemented comprehensive Total Insights page with date range filtering
- Added interactive chart visualization using Recharts library
- Created summary cards showing: Total Invoices, Total Worth, Average Value, Pending Payments
- Integrated real-time data from API with fallback to sample data
- Added quick filter buttons for Today, Week, Month views
- Implemented responsive design for mobile and desktop layouts
- Added Recent Invoices snapshot table with proper data handling

### List Services Page Implementation (January 28, 2025)
- Built comprehensive service and package management system with tab-based interface
- Created independent Services and Packages sections with no data linkage
- Implemented full CRUD operations for both services and packages
- Added form validation and error handling with toast notifications
- Services feature: name and unit price management with table view
- Packages feature: custom service bundles with optional quantities and fixed pricing
- Used dialogs for add/edit forms and alert dialogs for delete confirmations
- Responsive design with mobile-friendly modals and layouts

### Replit Migration Completion (January 28, 2025)
- Successfully migrated project from Replit Agent to standard Replit environment
- Configured Supabase database connection with user-provided connection string
- Pushed complete database schema including users, invoices, services, packages, and company profiles tables
- Verified all dependencies and workflows are functioning correctly
- Application running successfully on port 5000 with proper client/server separation

### Templates Page Implementation (January 28, 2025)
- Built comprehensive template system with two professional invoice designs
- Created Professional Grey template based on clean, minimal design with structured layout
- Implemented Minimalist Red template with geometric elements and modern styling
- Added full template customization with field visibility toggles, color pickers, and font selection
- Real-time preview system showing desktop and mobile views
- Template editor with tabs for Fields, Colors, and Settings customization
- Custom fields functionality allowing users to add personalized invoice elements

### Database Integration Implementation (January 28, 2025)
- Connected Total Insights, List Services, and Company Profile pages to Supabase database
- Added comprehensive database schema with services, packages, and company profiles tables
- Implemented complete API routes with authentication and data validation
- Updated storage interface with full CRUD operations for all entities
- Migrated from in-memory storage to persistent database storage
- Enhanced data types with proper decimal handling and JSON fields for complex data

### Replit Migration Completion (January 28, 2025)
- Successfully migrated project from Replit Agent to standard Replit environment
- Configured Supabase database connection with user-provided connection string
- Pushed complete database schema including users, invoices, services, packages, and company profiles tables
- Verified all dependencies and workflows are functioning correctly
- Application running successfully on port 5000 with proper client/server separation

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