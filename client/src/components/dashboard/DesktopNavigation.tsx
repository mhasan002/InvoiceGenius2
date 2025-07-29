import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
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
  Settings
} from 'lucide-react';

interface NavigationItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navigationItems: NavigationItem[] = [
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

export function DesktopNavigation() {
  const [location] = useLocation();

  return (
    <div className="hidden lg:block w-64 bg-gray-900 text-white min-h-screen">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-gray-700">
        <Link href="/">
          <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity">
            <FileText className="h-8 w-8 text-primary mr-3" />
            <h1 className="text-xl font-bold text-white">
              InvoiceGen
            </h1>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="mt-8 px-4">
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href || 
              (item.href !== '/dashboard' && location.startsWith(item.href));
            
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start px-4 py-3 h-auto font-medium text-sm transition-all duration-200 rounded-lg",
                    isActive
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  )}
                >
                  <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  <span className="truncate">{item.title}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}