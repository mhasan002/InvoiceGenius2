# InvoiceGen - Invoice Generation Application

## Overview

InvoiceGen is a modern full-stack web application designed for creating professional invoices effortlessly. The application features a React-based frontend with a Node.js/Express backend, utilizing PostgreSQL for data persistence and Drizzle ORM for database operations.

## User Preferences

Preferred communication style: Simple, everyday language.
Database: Supabase (PostgreSQL) - User requested Supabase integration with connection string configuration.
Dashboard Layout: Mobile devices use collapsible sidebar, Desktop/laptop displays fixed left navigation without sidebar.
Navigation Issue Fix: User reported Payment Methods page losing left navigation - fixed by wrapping with DashboardLayout component.

## Recent Changes

### Team Management System Implementation Completed (July 30, 2025)
- Successfully implemented comprehensive team management functionality
- Added team_members database table with user info, role, and permissions tracking
- Created secure team management API routes with authentication and data validation
- Built complete team management page with member CRUD operations
- Implemented custom permissions system (create/delete invoices, manage services, etc.)
- Added team member activity tracking with invoice creation monitoring
- Fixed API request structure and Dialog accessibility issues
- Team page includes add/edit member forms, permissions management, and activity filtering
- All team management features working correctly with Supabase database integration

### Insights Page Enhancement and Full Functionality Implementation Completed (July 30, 2025)
- Fixed all statistical calculations to use correct `total` field from invoices instead of basic `amount`
- Implemented dynamic percentage change calculations comparing current period vs previous period
- Added full button functionality: Create Invoice, View All Invoices, and Export Reports
- Create Invoice button navigates to /dashboard/create-invoice page
- View All Invoices button navigates to /dashboard/invoices page
- Export Reports button downloads CSV file with complete invoice data and statistics for selected date range
- Enhanced chart visualization to show accurate daily invoice amounts from real database data
- Updated recent invoices table to display real invoice data with proper formatting
- All statistics cards now show accurate data: Total Invoices, Total Worth, Average Value, Pending Payments
- Date range filtering works correctly with Today, Week, Month quick filters and custom date selection
- Export functionality includes summary statistics and detailed invoice breakdown in CSV format

### Home Page Enhancement and Button Functionality Fix Completed (July 30, 2025)
- Fixed non-functional "Get Started Free" and "Login" buttons on home page
- Both buttons now properly navigate to auth/signup and auth/login pages respectively
- Completely redesigned right side of hero section with modern, engaging visual design
- Replaced generic placeholder with professional feature showcase grid
- Added animated feature cards highlighting: Fast Setup, Analytics, Security, Templates
- Enhanced visual hierarchy with proper icons, colors, and gradual animations
- Improved floating notification badges with better colors and positioning
- Updated CTA section buttons to have same navigation functionality
- All home page call-to-action buttons now work correctly across the entire page
- Created cohesive design language that better represents InvoiceGen's professional capabilities

### Team Management Soft Delete Implementation Completed (July 30, 2025)
- Implemented comprehensive soft delete system for team members as requested by user
- Team members are now deactivated instead of permanently deleted to preserve data integrity
- Updated database schema with "onDelete: set null" for invoice foreign key relationships
- Added reactivate functionality allowing admins to restore deactivated team member access
- Team member data, invoice history, and audit trails are now fully preserved
- UI shows visual indicators for active/inactive status with green/red badges
- Active members show "Revoke Access" option, inactive members show "Activate" option
- All historical data remains intact when team members are deactivated
- Enhanced user experience with clear messaging about data preservation
- Fixed database foreign key constraint issues that previously prevented team member removal

### Final Migration from Replit Agent to Standard Replit Environment Completed (July 30, 2025)
- Successfully completed final migration from Replit Agent to standard Replit environment on July 30, 2025
- Connected to user's Supabase database with provided DATABASE_URL secret
- Verified database schema is properly synchronized with all required tables: users, invoices, services, packages, company_profiles, payment_methods, templates, team_members
- Application running successfully on port 5000 with full database connectivity
- All dependencies resolved and workflow functioning correctly
- Secure client/server separation maintained with authenticated API endpoints
- Project ready for active development and use

### Previous Final Migration from Replit Agent to Standard Replit Environment Completed (July 30, 2025)
- Successfully completed final migration from Replit Agent to standard Replit environment
- Connected to user's Supabase database with provided DATABASE_URL secret
- Verified database schema is properly synchronized with all required tables
- Application running successfully on port 5000 with full database connectivity
- All dependencies resolved and workflow functioning correctly
- Secure client/server separation maintained with authenticated API endpoints
- Fixed invoice preview and download functionality to show exact same template and information from create invoice page
- Invoice preview now dynamically uses the correct template, company profile, and payment method data for each invoice
- Preview and PDF download now match exactly what was shown during invoice creation
- Project ready for active development and use

### Migration from Replit Agent to Standard Replit Environment Completed (July 30, 2025)
- Successfully migrated InvoiceGen application from Replit Agent to standard Replit environment
- Connected to user's Supabase database with provided DATABASE_URL connection string
- Resolved database constraint issues by cleaning up orphaned invoice data
- Successfully pushed complete schema to Supabase database
- Verified all database tables are present: users, invoices, services, packages, company_profiles, payment_methods, templates
- All dependencies installed and workflow running successfully on port 5000
- Application fully functional with proper client/server separation and secure database connectivity
- Project now follows robust security practices with authenticated API endpoints
- User authentication system working correctly with session management
- API endpoints responding properly with authenticated requests
- Database operations functioning smoothly after constraint fixes
- Fixed red template header design to use single red color instead of black and red geometric combination
- Updated both templates page and invoice preview/PDF to consistently use single color header design
- Migration completed successfully - application ready for production use

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