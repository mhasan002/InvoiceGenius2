import { DashboardSidebar } from './DashboardSidebar';
import { DesktopNavigation } from './DesktopNavigation';
import { DashboardHeader } from './DashboardHeader';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

export function DashboardLayout({ children, title, description }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Mobile Sidebar */}
      <DashboardSidebar />
      
      <div className="lg:flex">
        {/* Desktop Navigation - Fixed Left */}
        <DesktopNavigation />
        
        {/* Main Content */}
        <div className="flex-1 lg:flex lg:flex-col">
          {/* Header */}
          <DashboardHeader title={title} description={description} />
          
          {/* Page Content */}
          <main className="flex-1 p-6">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}