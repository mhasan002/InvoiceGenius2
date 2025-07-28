import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useQuery } from '@tanstack/react-query';
import { 
  DollarSign, 
  FileText, 
  Clock, 
  TrendingUp,
  Plus,
  Eye,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  BarChart3
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function DashboardInsights() {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Fetch invoices data
  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['/api/invoices'],
  });

  // Filter invoices by date range
  const filteredInvoices = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include entire end date
    
    return invoices.filter(invoice => {
      const invoiceDate = new Date(invoice.createdAt);
      return invoiceDate >= start && invoiceDate <= end;
    });
  }, [invoices, startDate, endDate]);

  // Calculate statistics
  const stats = useMemo(() => [
    {
      title: 'Total Invoices',
      value: filteredInvoices.length.toString(),
      change: `${filteredInvoices.length > 0 ? '+' : ''}${filteredInvoices.length}`,
      changeType: 'positive' as const,
      icon: FileText,
      description: `In selected date range`
    },
    {
      title: 'Total Invoice Worth',
      value: `$${filteredInvoices.reduce((sum, inv) => sum + parseFloat(inv.amount || '0'), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: DollarSign,
      description: 'Total value of selected invoices'
    },
    {
      title: 'Average Invoice Value',
      value: filteredInvoices.length > 0 
        ? `$${(filteredInvoices.reduce((sum, inv) => sum + parseFloat(inv.amount || '0'), 0) / filteredInvoices.length).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : '$0.00',
      change: '+5.2%',
      changeType: 'positive' as const,
      icon: BarChart3,
      description: 'Average invoice amount'
    },
    {
      title: 'Pending Payments',
      value: `$${filteredInvoices.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + parseFloat(inv.amount || '0'), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: '-2.1%',
      changeType: 'negative' as const,
      icon: Clock,
      description: 'Outstanding payments'
    }
  ], [filteredInvoices]);

  // Generate chart data
  const chartData = useMemo(() => {
    if (filteredInvoices.length === 0) return [];
    
    const dailyData = {};
    filteredInvoices.forEach(invoice => {
      const date = new Date(invoice.createdAt).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
      if (!dailyData[date]) {
        dailyData[date] = 0;
      }
      dailyData[date] += parseFloat(invoice.amount || '0');
    });

    return Object.entries(dailyData).map(([date, amount]) => ({
      date,
      amount: Number(amount)
    }));
  }, [filteredInvoices]);

  // Set quick date filters
  const setQuickFilter = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  // Get recent invoices from filtered data
  const recentInvoices = useMemo(() => {
    return filteredInvoices
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [filteredInvoices]);

  const mockRecentInvoices = [
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

  const lastUpdated = new Date().toLocaleString();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-gray-600">Loading insights...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Total Insights</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Last updated: {lastUpdated}
          </p>
        </div>
        
        {/* Date Range Filter */}
        <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row items-start sm:items-end gap-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex flex-col">
              <Label htmlFor="start-date" className="text-xs text-gray-500 mb-1">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-40"
              />
            </div>
            <div className="flex flex-col">
              <Label htmlFor="end-date" className="text-xs text-gray-500 mb-1">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-40"
              />
            </div>
          </div>
          
          {/* Quick Filter Buttons */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setQuickFilter(0)}>
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={() => setQuickFilter(7)}>
              Week
            </Button>
            <Button variant="outline" size="sm" onClick={() => setQuickFilter(30)}>
              Month
            </Button>
          </div>
        </div>
      </div>

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

      {/* Chart Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Invoice Trend Overview
          </CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Daily invoice amounts for selected date range
          </p>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
              <BarChart3 className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">No data available for selected dates</p>
              <p className="text-sm">Try adjusting your date range or create some invoices</p>
            </div>
          ) : (
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#666"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#666"
                    fontSize={12}
                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                  />
                  <Tooltip 
                    formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Amount']}
                    labelStyle={{ color: '#333' }}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #ccc',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar 
                    dataKey="amount" 
                    fill="#3b82f6" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

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

      {/* Recent Invoices Snapshot */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">Recent Invoices Snapshot</CardTitle>
          <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            View All
          </Button>
        </CardHeader>
        <CardContent>
          {recentInvoices.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No invoices found in the selected date range</p>
              <p className="text-sm">Create some invoices or adjust your date filter</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 px-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Invoice ID
                    </th>
                    <th className="text-left py-2 px-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Client Name
                    </th>
                    <th className="text-left py-2 px-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Date
                    </th>
                    <th className="text-left py-2 px-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Amount
                    </th>
                    <th className="text-left py-2 px-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentInvoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-3 px-2 text-sm font-medium text-gray-900 dark:text-white">
                        {invoice.invoiceNumber || `INV-${invoice.id.slice(-6)}`}
                      </td>
                      <td className="py-3 px-2 text-sm text-gray-700 dark:text-gray-300">
                        {invoice.clientName || 'N/A'}
                      </td>
                      <td className="py-3 px-2 text-sm text-gray-700 dark:text-gray-300">
                        {new Date(invoice.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-2 text-sm font-medium text-gray-900 dark:text-white">
                        ${parseFloat(invoice.amount || '0').toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-2 text-sm">
                        <Badge className={getStatusColor(invoice.status || 'draft')}>
                          {(invoice.status || 'draft').charAt(0).toUpperCase() + (invoice.status || 'draft').slice(1)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Show mock data if no real data */}
          {recentInvoices.length === 0 && invoices.length === 0 && (
            <div className="space-y-4 mt-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Sample data preview:</p>
              {mockRecentInvoices.map((invoice) => (
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}