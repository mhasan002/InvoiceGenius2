# InvoiceGen - Invoice Generation Application

## Overview
InvoiceGen is a full-stack web application designed for creating professional invoices. It features a React frontend, a Node.js/Express backend, PostgreSQL for data persistence, and Drizzle ORM. The project's vision is to provide an intuitive and efficient tool for invoice generation, offering robust features like team management, comprehensive analytics, and customizable templates to cater to diverse business needs and streamline financial operations.

## User Preferences
Preferred communication style: Simple, everyday language.
Database: Supabase (PostgreSQL) - User requested Supabase integration with connection string configuration.
Dashboard Layout: Mobile devices use collapsible sidebar, Desktop/laptop displays fixed left navigation without sidebar.
Navigation Issue Fix: User reported Payment Methods page losing left navigation - fixed by wrapping with DashboardLayout component.

## System Architecture
### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Framework**: Tailwind CSS with shadcn/ui component library (built on Radix UI for accessibility)
- **State Management**: TanStack Query (React Query)
- **Routing**: Wouter
- **Animations**: Framer Motion
- **UI/UX Decisions**: Responsive design for mobile and desktop, consistent design system with CSS variables for theming, professional and modern visual design with engaging elements (e.g., animated feature cards, proper icons, colors, and gradual animations). Templates offer customizable fields, colors, and font selection with real-time previews.

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Session Management**: PostgreSQL session store with connect-pg-simple
- **API Design**: RESTful API endpoints prefixed with `/api`, JSON-based data exchange, secure client/server separation with authenticated API endpoints.

### Key Features & Technical Implementations
- **Database Schema**: Centralized in `shared/schema.ts`, defining tables like Users, Invoices, Services, Packages, Company Profiles, Payment Methods, and Templates. Supports Drizzle schema with Zod validation.
- **Storage Layer**: Implements an `IStorage` interface for CRUD operations, allowing easy swapping between in-memory and database-backed storage.
- **Invoice Functionality**: Dynamic invoice preview and PDF download that mirrors the exact template and information from the creation page, using correct company profile and payment method data.
- **Team Management**: Comprehensive team management system with `team_members` table, secure API routes, CRUD operations, custom permissions system (e.g., create/delete invoices), and activity tracking. Includes a soft-delete system for team members to preserve data integrity, with options to deactivate/reactivate.
- **Insights Page**: Comprehensive analytics with date range filtering, interactive charts (Recharts), summary cards (Total Invoices, Total Worth, Average Value, Pending Payments), dynamic percentage change calculations, and an export function for CSV reports.
- **Service Management**: Tab-based interface for managing services and packages independently with full CRUD operations, form validation, and toast notifications.
- **Templates**: Two professional invoice designs (Professional Grey, Minimalist Red) with customization options for field visibility, color pickers, and font selection, including real-time previews.
- **Authentication**: Cookie-based sessions with PostgreSQL storage for secure user authentication and session management. Fixed critical permission issue where new users couldn't create resources due to missing userType in signup sessions (August 4, 2025).

## External Dependencies
- **Database**: PostgreSQL (specifically Supabase for user configuration, Neon Database also supported)
- **Authentication**: Cookie-based sessions
- **UI Components**: Radix UI primitives, shadcn/ui
- **Styling**: Tailwind CSS
- **Charting**: Recharts
- **Animation**: Framer Motion
- **Database ORM**: Drizzle ORM