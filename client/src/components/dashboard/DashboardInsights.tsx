import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  FileText, 
  Clock, 
  TrendingUp,
  Plus,
  Eye,
  Download,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

export function DashboardInsights() {
  // Mock data - in a real app this would come from API
  const stats = [
    {
      title: 'Total Revenue',
      value: '$24,532.00',
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: DollarSign,
      description: 'From 127 invoices this month'
    },
    {
      title: 'Total Invoices',
      value: '127',
      change: '+8',
      changeType: 'positive' as const,
      icon: FileText,
      description: 'New invoices this month'
    },
    {
      title: 'Pending Payments',
      value: '$4,230.00',
      change: '-5.2%',
      changeType: 'negative' as const,
      icon: Clock,
      description: 'From 12 outstanding invoices'
    },
    {
      title: 'Growth Rate',
      value: '23.5%',
      change: '+2.1%',
      changeType: 'positive' as const,
      icon: TrendingUp,
      description: 'Revenue growth this quarter'
    }
  ];

  const recentInvoices = [
    {
      id: 'INV-001',
      client: 'Acme Corporation',
      amount: '$2,450.00',
      status: 'paid',
      date: '2024-01-15',
      dueDate: '2024-02-15'
    },
    {
      id: 'INV-002',
      client: 'Tech Solutions Ltd',
      amount: '$1,850.00',
      status: 'pending',
      date: '2024-01-14',
      dueDate: '2024-02-14'
    },
    {
      id: 'INV-003',
      client: 'Digital Agency',
      amount: '$3,200.00',
      status: 'overdue',
      date: '2024-01-10',
      dueDate: '2024-02-10'
    },
    {
      id: 'INV-004',
      client: 'Startup Inc',
      amount: '$890.00',
      status: 'draft',
      date: '2024-01-16',
      dueDate: '2024-02-16'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  {stat.changeType === 'positive' ? (
                    <ArrowUpRight className="h-3 w-3 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-red-500" />
                  )}
                  <span className={`font-medium ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {stat.description}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button className="h-20 flex-col space-y-2" size="lg">
              <Plus className="h-6 w-6" />
              <span>Create Invoice</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2" size="lg">
              <FileText className="h-6 w-6" />
              <span>View All Invoices</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2" size="lg">
              <Download className="h-6 w-6" />
              <span>Export Reports</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Invoices */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">Recent Invoices</CardTitle>
          <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            View All
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentInvoices.map((invoice) => (
              <div 
                key={invoice.id}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {invoice.id}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {invoice.client}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {invoice.amount}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Due: {new Date(invoice.dueDate).toLocaleDateString()}
                    </div>
                  </div>
                  <Badge className={getStatusColor(invoice.status)}>
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}