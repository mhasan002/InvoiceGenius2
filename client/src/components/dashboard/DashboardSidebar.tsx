import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { 
  FileText, 
  BarChart3, 
  List, 
  Building2, 
  CreditCard, 
  Layout, 
  Plus, 
  FileSpreadsheet, 
  Users, 
  Settings,
  Menu,
  X
} from 'lucide-react';

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const sidebarItems: SidebarItem[] = [
  {
    title: 'Total Insights',
    href: '/dashboard',
    icon: BarChart3,
  },
  {
    title: 'List Services',
    href: '/dashboard/services',
    icon: List,
  },
  {
    title: 'Company Profile',
    href: '/dashboard/company',
    icon: Building2,
  },
  {
    title: 'Payment Methods',
    href: '/dashboard/payment-methods',
    icon: CreditCard,
  },
  {
    title: 'Templates',
    href: '/dashboard/templates',
    icon: Layout,
  },
  {
    title: 'Create Invoice',
    href: '/dashboard/create-invoice',
    icon: Plus,
  },
  {
    title: 'Invoices',
    href: '/dashboard/invoices',
    icon: FileSpreadsheet,
  },
  {
    title: 'Team',
    href: '/dashboard/team',
    icon: Users,
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
];

interface SidebarProps {
  className?: string;
}

export function DashboardSidebar({ className }: SidebarProps) {
  const [location] = useLocation();

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-gray-200 dark:border-gray-700">
        <Link href="/">
          <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity">
            <FileText className="h-8 w-8 text-primary mr-3" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              InvoiceGen
            </h1>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href || 
              (item.href !== '/dashboard' && location.startsWith(item.href));
            
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start px-3 py-2.5 h-auto font-medium text-sm transition-all duration-200",
                    isActive
                      ? "bg-primary/10 text-primary border-r-2 border-primary hover:bg-primary/15"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  <span className="truncate">{item.title}</span>
                </Button>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
    </div>
  );

  return (
    <>
      {/* Desktop - No Sidebar, Content Fixed Left */}
      <div className="hidden lg:block">
        {/* Navigation will be integrated into the main layout */}
      </div>

      {/* Mobile Sidebar */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="fixed top-4 left-4 z-50 bg-white dark:bg-gray-900 shadow-md border border-gray-200 dark:border-gray-700"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 bg-white dark:bg-gray-900">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}