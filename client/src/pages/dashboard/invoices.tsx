import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Search, 
  Filter, 
  Eye, 
  Download, 
  Trash2, 
  Calendar,
  FileText,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  clientAddress?: string;
  platform?: string;
  total: number;
  paymentReceivedBy?: string;
  createdAt: string;
  updatedAt: string;
  items: any[];
  status?: string;
}

const dateRangePresets = [
  { label: 'Last 7 days', value: '7days' },
  { label: 'Last 30 days', value: '30days' },
  { label: 'This Month', value: 'month' },
  { label: 'Custom Range', value: 'custom' }
];

export default function InvoicesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [dateRange, setDateRange] = useState('30days');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate date range
  const getDateRange = () => {
    const now = new Date();
    switch (dateRange) {
      case '7days':
        return {
          start: format(subDays(now, 7), 'yyyy-MM-dd'),
          end: format(now, 'yyyy-MM-dd')
        };
      case '30days':
        return {
          start: format(subDays(now, 30), 'yyyy-MM-dd'),
          end: format(now, 'yyyy-MM-dd')
        };
      case 'month':
        return {
          start: format(startOfMonth(now), 'yyyy-MM-dd'),
          end: format(endOfMonth(now), 'yyyy-MM-dd')
        };
      case 'custom':
        return {
          start: customStartDate || format(subDays(now, 30), 'yyyy-MM-dd'),
          end: customEndDate || format(now, 'yyyy-MM-dd')
        };
      default:
        return {
          start: format(subDays(now, 30), 'yyyy-MM-dd'),
          end: format(now, 'yyyy-MM-dd')
        };
    }
  };

  // Fetch invoices with dependency tracking
  const { data: invoices = [], isLoading, error } = useQuery({
    queryKey: ['/api/invoices', dateRange, customStartDate, customEndDate, searchQuery],
    queryFn: async () => {
      const response = await fetch('/api/invoices', { credentials: 'include' });
      if (!response.ok) {
        throw new Error('Failed to fetch invoices');
      }
      return response.json();
    },
    select: (data: Invoice[]) => {
      const { start, end } = getDateRange();
      
      return data
        .filter(invoice => {
          // Date filtering
          const invoiceDate = new Date(invoice.createdAt);
          const startDate = new Date(start + 'T00:00:00');
          const endDate = new Date(end + 'T23:59:59');
          const isInDateRange = invoiceDate >= startDate && invoiceDate <= endDate;
          
          // Search filtering
          const searchLower = searchQuery.toLowerCase();
          const matchesSearch = !searchQuery || 
            invoice.clientName?.toLowerCase().includes(searchLower) ||
            invoice.invoiceNumber?.toLowerCase().includes(searchLower) ||
            invoice.platform?.toLowerCase().includes(searchLower);
          
          return isInDateRange && matchesSearch;
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  });

  // Pagination
  const paginatedInvoices = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return invoices.slice(startIndex, startIndex + itemsPerPage);
  }, [invoices, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(invoices.length / itemsPerPage);

  // Delete invoice mutation
  const deleteMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to delete invoice');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      toast({
        title: "Success",
        description: "Invoice deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete invoice",
        variant: "destructive",
      });
    }
  });

  const handleDeleteInvoice = (invoiceId: string) => {
    deleteMutation.mutate(invoiceId);
  };

  const handleDownloadPDF = async (invoice: Invoice) => {
    try {
      // First show the preview to render the invoice
      setPreviewInvoice(invoice);
      
      // Wait a moment for the preview to render
      await new Promise(resolve => setTimeout(resolve, 1000));

      const { default: html2canvas } = await import('html2canvas');
      const { default: jsPDF } = await import('jspdf');

      // Find the preview element
      const previewElement = document.querySelector('[data-invoice-preview]');
      if (!previewElement) {
        toast({ title: "Error generating PDF", description: "Preview not found. Please try again.", variant: "destructive" });
        return;
      }

      toast({ title: "Generating PDF...", description: "Please wait while we create your invoice PDF." });

      // Generate canvas from the preview
      const canvas = await html2canvas(previewElement as HTMLElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // Create PDF
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Save the PDF
      const fileName = `invoice-${invoice.invoiceNumber || 'draft'}-${invoice.clientName.replace(/\s+/g, '-')}.pdf`;
      pdf.save(fileName);

      toast({ 
        title: "PDF Downloaded!", 
        description: `Invoice ${invoice.invoiceNumber} has been downloaded successfully.`
      });

      // Close preview after download
      setPreviewInvoice(null);

    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({ 
        title: "Error generating PDF", 
        description: "Please try again.",
        variant: "destructive" 
      });
    }
  };

  const handlePreviewInvoice = (invoice: Invoice) => {
    setPreviewInvoice(invoice);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  if (error) {
    return (
      <DashboardLayout 
        title="Invoices" 
        description="View and filter all created invoices"
      >
        <div className="text-center py-12">
          <p className="text-red-600">Error loading invoices: {(error as any)?.message}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Invoices" 
      description="View and filter all created invoices"
    >
      <div className="space-y-6">

        {/* Filters Section */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Field */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by client name, invoice number, or platform..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Date Range Picker */}
              <div className="flex gap-2">
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-48">
                    <Calendar className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Select date range" />
                  </SelectTrigger>
                  <SelectContent>
                    {dateRangePresets.map((preset) => (
                      <SelectItem key={preset.value} value={preset.value}>
                        {preset.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Custom Date Range Inputs */}
            {dateRange === 'custom' && (
              <div className="flex gap-2 mt-4">
                <div className="flex-1">
                  <Input
                    type="date"
                    placeholder="Start date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <Input
                    type="date"
                    placeholder="End date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {paginatedInvoices.length} of {invoices.length} invoices
          </p>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total Value: {formatCurrency(invoices.reduce((sum, invoice) => sum + invoice.total, 0))}
          </div>
        </div>

        {/* Invoice Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading invoices...</p>
              </div>
            ) : paginatedInvoices.length === 0 ? (
              <div className="p-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No invoices found</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchQuery || dateRange !== '30days' 
                    ? 'Try adjusting your search or filter criteria.' 
                    : 'Create your first invoice to get started.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice No.</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Platform</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Received By</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">
                          {invoice.invoiceNumber || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{invoice.clientName}</div>
                            {invoice.clientEmail && (
                              <div className="text-sm text-gray-500">{invoice.clientEmail}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(invoice.createdAt)}</TableCell>
                        <TableCell>
                          {invoice.platform ? (
                            <Badge variant="outline">{invoice.platform}</Badge>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(invoice.total)}
                        </TableCell>
                        <TableCell>
                          {invoice.paymentReceivedBy || 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePreviewInvoice(invoice)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>


                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadPDF(invoice)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete invoice #{invoice.invoiceNumber}? 
                                    This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteInvoice(invoice.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                    disabled={deleteMutation.isPending}
                                  >
                                    {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Invoice Preview Dialog */}
      {previewInvoice && (
        <Dialog open={!!previewInvoice} onOpenChange={() => setPreviewInvoice(null)}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                Invoice Preview - #{previewInvoice.invoiceNumber}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDownloadPDF(previewInvoice)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </DialogTitle>
            </DialogHeader>
            
            {/* Invoice Template Preview */}
            <div data-invoice-preview className="bg-white p-8 min-h-[800px] text-black">
              {/* Header */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">INVOICE</h1>
                  <p className="text-gray-600 mt-2">#{previewInvoice.invoiceNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-semibold">{formatDate(previewInvoice.createdAt)}</p>
                </div>
              </div>

              {/* Bill To Section */}
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Bill To:</h3>
                  <div className="space-y-1">
                    <p className="font-semibold">{previewInvoice.clientName}</p>
                    {previewInvoice.clientEmail && (
                      <p className="text-gray-600 flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        {previewInvoice.clientEmail}
                      </p>
                    )}
                    {previewInvoice.clientPhone && (
                      <p className="text-gray-600 flex items-center">
                        <Phone className="h-4 w-4 mr-2" />
                        {previewInvoice.clientPhone}
                      </p>
                    )}
                    {previewInvoice.clientAddress && (
                      <p className="text-gray-600 flex items-start">
                        <MapPin className="h-4 w-4 mr-2 mt-1 flex-shrink-0" />
                        <span className="whitespace-pre-line">{previewInvoice.clientAddress}</span>
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment To:</h3>
                  <p className="font-semibold">{previewInvoice.paymentReceivedBy || 'N/A'}</p>
                  {previewInvoice.platform && (
                    <p className="text-gray-600 mt-2">Platform: {previewInvoice.platform}</p>
                  )}
                </div>
              </div>

              {/* Items Table */}
              <div className="mb-8">
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Qty</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Rate</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewInvoice.items?.map((item: any, index: number) => (
                        <tr key={index} className="border-t border-gray-200">
                          <td className="px-4 py-3 text-sm">
                            <div>
                              <p className="font-medium">{item.name}</p>
                              {item.type === 'package' && item.packageServices && (
                                <div className="mt-2 text-xs text-gray-600">
                                  <p className="font-medium">Package includes:</p>
                                  <ul className="list-disc list-inside mt-1">
                                    {item.packageServices.map((service: any, idx: number) => (
                                      <li key={idx}>{service.name} x{service.quantity}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center text-sm">{item.quantity || 1}</td>
                          <td className="px-4 py-3 text-right text-sm">{formatCurrency(item.unitPrice || 0)}</td>
                          <td className="px-4 py-3 text-right text-sm font-medium">{formatCurrency(item.total || 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals */}
              <div className="flex justify-end mb-8">
                <div className="w-64">
                  <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-center text-2xl font-bold text-gray-800">
                      <span>Total:</span>
                      <span>{formatCurrency(previewInvoice.total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center text-sm text-gray-600 border-t border-gray-200 pt-4">
                <p>Thank you for your business!</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </DashboardLayout>
  );
}