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
  clientCustomFields?: any[];
  platform?: string;
  total: number;
  subtotal: number;
  taxAmount?: number;
  discountAmount?: number;
  taxPercentage?: number;
  discountType?: string;
  discountValue?: number;
  paymentReceivedBy?: string;
  createdAt: string;
  updatedAt: string;
  items: any[];
  status?: string;
  notes?: string;
  terms?: string;
  templateId?: string;
  companyProfileId?: string;
  paymentMethodId?: string;
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

  // Fetch templates for proper preview styling
  const { data: templates = [] } = useQuery({
    queryKey: ['/api/templates'],
    queryFn: async () => {
      const res = await fetch('/api/templates', { credentials: 'include' });
      if (!res.ok) {
        console.error('Failed to fetch templates');
        return [];
      }
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });

  // Fetch company profiles for invoice preview
  const { data: companyProfiles = [] } = useQuery({
    queryKey: ['/api/company-profiles'],
    queryFn: async () => {
      const res = await fetch('/api/company-profiles', { credentials: 'include' });
      if (!res.ok) {
        console.error('Failed to fetch company profiles');
        return [];
      }
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });

  // Fetch payment methods for invoice preview
  const { data: paymentMethods = [] } = useQuery({
    queryKey: ['/api/payment-methods'],
    queryFn: async () => {
      const res = await fetch('/api/payment-methods', { credentials: 'include' });
      if (!res.ok) {
        console.error('Failed to fetch payment methods');
        return [];
      }
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });

  // Helper function to get template configuration for an invoice
  const getTemplateForInvoice = (invoice: Invoice) => {
    // Default template configurations
    const defaultTemplates = [
      {
        id: "professional",
        name: "Professional Grey",
        description: "Clean and professional design with grey accents",
        primaryColor: "#374151",
        secondaryColor: "#6b7280",
        textColor: "#1f2937",
        fontFamily: "Inter, sans-serif",
        logoVisible: true,
        showNotes: true,
        showTerms: true,
        showPayment: true,
        notes: "PLEASE SEND REMITTANCE TO:\nHELLO@REALLYGREATSITE.COM\n\nPAYMENT IS REQUIRED WITHIN 10\nBUSINESS DAYS OF INVOICE DATE.",
        terms: "Payment terms and conditions apply. Late payments may incur additional fees.",
        fields: [
          { id: "description", name: "description", label: "Description", visible: true },
          { id: "quantity", name: "quantity", label: "QTY", visible: true },
          { id: "unitPrice", name: "unitPrice", label: "Rate", visible: false },
          { id: "amount", name: "amount", label: "Amount", visible: false },
          { id: "total", name: "total", label: "Total", visible: true },
        ],
        customFields: []
      },
      {
        id: "minimalist",
        name: "Minimalist Red",
        description: "Modern minimalist design with red geometric elements",
        primaryColor: "#991b1b",
        secondaryColor: "#dc2626",
        textColor: "#1f2937",
        fontFamily: "Inter, sans-serif",
        logoVisible: true,
        showNotes: true,
        showTerms: true,
        showPayment: true,
        notes: "Thank you for your business!",
        terms: "Payment is due within 30 days of invoice date. Late payments may incur additional fees.",
        fields: [
          { id: "description", name: "description", label: "Description", visible: true },
          { id: "quantity", name: "quantity", label: "QTY", visible: true },
          { id: "unitPrice", name: "unitPrice", label: "Rate", visible: false },
          { id: "amount", name: "amount", label: "Amount", visible: false },
          { id: "total", name: "total", label: "Total", visible: true },
        ],
        customFields: []
      }
    ];

    // Find the template used for this invoice, or use the default template
    let invoiceTemplate = null;
    if (invoice.templateId) {
      invoiceTemplate = templates.find((t: any) => t.id === invoice.templateId);
    }
    if (!invoiceTemplate) {
      invoiceTemplate = templates.find((t: any) => t.isDefault === "true") || templates[0];
    }

    // Use fallback if no template found
    let template = defaultTemplates[0]; // fallback
    if (invoiceTemplate) {
      const baseTemplate = defaultTemplates.find(t => t.name === invoiceTemplate.name) || defaultTemplates[0];
      const dbConfig = invoiceTemplate.config as any;
      template = {
        ...baseTemplate,
        ...dbConfig,
        // Explicitly preserve boolean values from database
        showTerms: dbConfig?.showTerms !== undefined ? Boolean(dbConfig.showTerms) : baseTemplate.showTerms,
        showNotes: dbConfig?.showNotes !== undefined ? Boolean(dbConfig.showNotes) : baseTemplate.showNotes,
        logoVisible: dbConfig?.logoVisible !== undefined ? Boolean(dbConfig.logoVisible) : baseTemplate.logoVisible,
        showPayment: dbConfig?.showPayment !== undefined ? Boolean(dbConfig.showPayment) : baseTemplate.showPayment,
        // Ensure fields array is properly merged - always use base template fields as foundation
        fields: baseTemplate.fields.map((baseField: any) => {
          const dbField = dbConfig?.fields?.find((f: any) => f.id === baseField.id);
          return {
            ...baseField,
            visible: dbField?.visible !== undefined ? Boolean(dbField.visible) : baseField.visible
          };
        }),
      };
    }

    // Override with invoice-specific notes and terms if available
    if (invoice.notes) {
      template.notes = invoice.notes;
    }
    if (invoice.terms) {
      template.terms = invoice.terms;
    }

    return template;
  };

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
            
            {/* Invoice Template Preview with Actual Design */}
            <div data-invoice-preview className="bg-white text-black" style={{ fontFamily: getTemplateForInvoice(previewInvoice).fontFamily || 'Inter, sans-serif' }}>
              {getTemplateForInvoice(previewInvoice).name === "Minimalist Red" ? (
                // Minimalist Red Template
                <div className="min-h-[850px]">
                  {/* Header with Red Design */}
                  <div className="relative bg-white">
                    <div style={{ backgroundColor: getTemplateForInvoice(previewInvoice).primaryColor || '#991b1b' }} className="h-20 relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <h1 className="text-3xl font-bold text-white tracking-wider">INVOICE</h1>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-8">
                    {/* Invoice Details */}
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Invoice Number</p>
                        <p className="font-bold text-lg">{previewInvoice.invoiceNumber}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 mb-1">Date</p>
                        <p className="font-semibold">{formatDate(previewInvoice.createdAt)}</p>
                      </div>
                    </div>

                    {/* Client and Company Info */}
                    <div className="grid grid-cols-2 gap-8 mb-8">
                      <div>
                        <h3 className="text-lg font-bold mb-4" style={{ color: getTemplateForInvoice(previewInvoice).primaryColor }}>BILL TO</h3>
                        <div className="space-y-2">
                          <p className="font-semibold text-lg">{previewInvoice.clientName}</p>
                          {previewInvoice.clientEmail && <p className="text-gray-600">{previewInvoice.clientEmail}</p>}
                          {previewInvoice.clientPhone && <p className="text-gray-600">{previewInvoice.clientPhone}</p>}
                          {previewInvoice.clientAddress && (
                            <p className="text-gray-600 whitespace-pre-line">{previewInvoice.clientAddress}</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold mb-4" style={{ color: getTemplateForInvoice(previewInvoice).primaryColor }}>PAYMENT TO</h3>
                        {(() => {
                          const selectedCompanyProfile = companyProfiles.find((cp: any) => cp.id === previewInvoice.companyProfileId);
                          const selectedPaymentMethod = paymentMethods.find((pm: any) => pm.id === previewInvoice.paymentMethodId);
                          
                          return (
                            <div className="space-y-2">
                              {selectedCompanyProfile ? (
                                <>
                                  <p className="font-semibold text-lg">{selectedCompanyProfile.name}</p>
                                  {selectedCompanyProfile.email && <p className="text-gray-600">{selectedCompanyProfile.email}</p>}
                                  {selectedCompanyProfile.address && (
                                    <p className="text-gray-600 whitespace-pre-line">{selectedCompanyProfile.address}</p>
                                  )}
                                  {selectedCompanyProfile.tagline && (
                                    <p className="text-gray-500 italic text-sm">{selectedCompanyProfile.tagline}</p>
                                  )}
                                </>
                              ) : (
                                <p className="font-semibold text-lg">{previewInvoice.paymentReceivedBy || 'N/A'}</p>
                              )}
                              {previewInvoice.platform && (
                                <p className="text-gray-600 mt-2">Platform: {previewInvoice.platform}</p>
                              )}
                              {selectedPaymentMethod && (
                                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                  <p className="font-medium text-sm text-gray-700 mb-2">Payment Method: {selectedPaymentMethod.name}</p>
                                  {selectedPaymentMethod.fields && Object.entries(selectedPaymentMethod.fields).map(([key, value]) => (
                                    <p key={key} className="text-xs text-gray-600">
                                      {key.charAt(0).toUpperCase() + key.slice(1)}: {String(value)}
                                    </p>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Items Table */}
                    <div className="mb-8">
                      <table className="w-full">
                        <thead>
                          <tr style={{ backgroundColor: getTemplateForInvoice(previewInvoice).primaryColor || '#991b1b' }}>
                            {getTemplateForInvoice(previewInvoice).fields.filter((f: any) => f.visible).map((field: any) => (
                              <th key={field.id} className="px-4 py-3 text-left text-sm font-semibold text-white">
                                {field.label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {previewInvoice.items?.map((item: any, index: number) => (
                            <tr key={index} className="border-b border-gray-200">
                              {getTemplateForInvoice(previewInvoice).fields.filter((f: any) => f.visible).map((field: any) => (
                                <td key={field.id} className="px-4 py-3 text-sm">
                                  {field.id === 'description' && (
                                    <div>
                                      <p className="font-medium">{item.name}</p>
                                      {item.type === 'package' && item.packageServices && (
                                        <div className="mt-1 text-xs text-gray-600">
                                          <p>Package includes:</p>
                                          <ul className="list-disc list-inside">
                                            {item.packageServices.map((service: any, idx: number) => (
                                              <li key={idx}>{service.name} x{service.quantity}</li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  {field.id === 'quantity' && (item.quantity || 1)}
                                  {field.id === 'unitPrice' && formatCurrency(item.unitPrice || 0)}
                                  {field.id === 'amount' && formatCurrency(item.unitPrice * item.quantity || 0)}
                                  {field.id === 'total' && (
                                    <span className="font-semibold">{formatCurrency(item.total || 0)}</span>
                                  )}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Total */}
                    <div className="flex justify-end mb-8">
                      <div className="w-64">
                        <div className="border-2 rounded-lg p-4" style={{ borderColor: getTemplateForInvoice(previewInvoice).primaryColor }}>
                          <div className="flex justify-between items-center">
                            <span className="text-xl font-bold">TOTAL:</span>
                            <span className="text-2xl font-bold" style={{ color: getTemplateForInvoice(previewInvoice).primaryColor }}>
                              {formatCurrency(previewInvoice.total)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Notes and Terms */}
                    {getTemplateForInvoice(previewInvoice).showNotes && getTemplateForInvoice(previewInvoice).notes && (
                      <div className="mb-6">
                        <h4 className="font-semibold mb-2" style={{ color: getTemplateForInvoice(previewInvoice).primaryColor }}>NOTES</h4>
                        <p className="text-sm text-gray-700 whitespace-pre-line">{getTemplateForInvoice(previewInvoice).notes}</p>
                      </div>
                    )}

                    {getTemplateForInvoice(previewInvoice).showTerms && getTemplateForInvoice(previewInvoice).terms && (
                      <div className="mb-6">
                        <h4 className="font-semibold mb-2" style={{ color: getTemplateForInvoice(previewInvoice).primaryColor }}>TERMS & CONDITIONS</h4>
                        <p className="text-sm text-gray-700">{getTemplateForInvoice(previewInvoice).terms}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // Professional Grey Template
                <div className="min-h-[850px] p-8">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-8 pb-6 border-b-2" style={{ borderColor: getTemplateForInvoice(previewInvoice).primaryColor }}>
                    <div>
                      <h1 className="text-4xl font-bold" style={{ color: getTemplateForInvoice(previewInvoice).primaryColor }}>INVOICE</h1>
                      <p className="text-gray-600 mt-2 text-lg">#{previewInvoice.invoiceNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 mb-1">Date</p>
                      <p className="font-semibold text-lg">{formatDate(previewInvoice.createdAt)}</p>
                    </div>
                  </div>

                  {/* Client and Company Info */}
                  <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                      <h3 className="text-lg font-bold mb-4" style={{ color: getTemplateForInvoice(previewInvoice).primaryColor }}>BILL TO</h3>
                      <div className="space-y-2">
                        <p className="font-semibold text-lg">{previewInvoice.clientName}</p>
                        {previewInvoice.clientEmail && <p className="text-gray-600">{previewInvoice.clientEmail}</p>}
                        {previewInvoice.clientPhone && <p className="text-gray-600">{previewInvoice.clientPhone}</p>}
                        {previewInvoice.clientAddress && (
                          <p className="text-gray-600 whitespace-pre-line">{previewInvoice.clientAddress}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-4" style={{ color: getTemplateForInvoice(previewInvoice).primaryColor }}>PAYMENT TO</h3>
                      {(() => {
                        const selectedCompanyProfile = companyProfiles.find((cp: any) => cp.id === previewInvoice.companyProfileId);
                        const selectedPaymentMethod = paymentMethods.find((pm: any) => pm.id === previewInvoice.paymentMethodId);
                        
                        return (
                          <div className="space-y-2">
                            {selectedCompanyProfile ? (
                              <>
                                <p className="font-semibold text-lg">{selectedCompanyProfile.name}</p>
                                {selectedCompanyProfile.email && <p className="text-gray-600">{selectedCompanyProfile.email}</p>}
                                {selectedCompanyProfile.address && (
                                  <p className="text-gray-600 whitespace-pre-line">{selectedCompanyProfile.address}</p>
                                )}
                                {selectedCompanyProfile.tagline && (
                                  <p className="text-gray-500 italic text-sm">{selectedCompanyProfile.tagline}</p>
                                )}
                              </>
                            ) : (
                              <p className="font-semibold text-lg">{previewInvoice.paymentReceivedBy || 'N/A'}</p>
                            )}
                            {previewInvoice.platform && (
                              <p className="text-gray-600 mt-2">Platform: {previewInvoice.platform}</p>
                            )}
                            {selectedPaymentMethod && (
                              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                <p className="font-medium text-sm text-gray-700 mb-2">Payment Method: {selectedPaymentMethod.name}</p>
                                {selectedPaymentMethod.fields && Object.entries(selectedPaymentMethod.fields).map(([key, value]) => (
                                  <p key={key} className="text-xs text-gray-600">
                                    {key.charAt(0).toUpperCase() + key.slice(1)}: {String(value)}
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Items Table */}
                  <div className="mb-8">
                    <table className="w-full border border-gray-300">
                      <thead style={{ backgroundColor: getTemplateForInvoice(previewInvoice).primaryColor }}>
                        <tr>
                          {getTemplateForInvoice(previewInvoice).fields.filter((f: any) => f.visible).map((field: any) => (
                            <th key={field.id} className="px-4 py-3 text-left text-sm font-semibold text-white">
                              {field.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewInvoice.items?.map((item: any, index: number) => (
                          <tr key={index} className="border-b border-gray-200">
                            {getTemplateForInvoice(previewInvoice).fields.filter((f: any) => f.visible).map((field: any) => (
                              <td key={field.id} className="px-4 py-4 text-sm">
                                {field.id === 'description' && (
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
                                )}
                                {field.id === 'quantity' && (item.quantity || 1)}
                                {field.id === 'unitPrice' && formatCurrency(item.unitPrice || 0)}
                                {field.id === 'amount' && formatCurrency(item.unitPrice * item.quantity || 0)}
                                {field.id === 'total' && (
                                  <span className="font-semibold">{formatCurrency(item.total || 0)}</span>
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Total */}
                  <div className="flex justify-end mb-8">
                    <div className="w-64">
                      <div className="border-2 rounded-lg p-6" style={{ 
                        borderColor: getTemplateForInvoice(previewInvoice).primaryColor,
                        backgroundColor: `${getTemplateForInvoice(previewInvoice).primaryColor}10`
                      }}>
                        <div className="flex justify-between items-center">
                          <span className="text-xl font-bold">TOTAL:</span>
                          <span className="text-2xl font-bold" style={{ color: getTemplateForInvoice(previewInvoice).primaryColor }}>
                            {formatCurrency(previewInvoice.total)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notes and Terms */}
                  {getTemplateForInvoice(previewInvoice).showNotes && getTemplateForInvoice(previewInvoice).notes && (
                    <div className="mb-6">
                      <h4 className="font-semibold mb-2 text-lg" style={{ color: getTemplateForInvoice(previewInvoice).primaryColor }}>NOTES</h4>
                      <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{getTemplateForInvoice(previewInvoice).notes}</p>
                    </div>
                  )}

                  {getTemplateForInvoice(previewInvoice).showTerms && getTemplateForInvoice(previewInvoice).terms && (
                    <div className="mb-6">
                      <h4 className="font-semibold mb-2 text-lg" style={{ color: getTemplateForInvoice(previewInvoice).primaryColor }}>TERMS & CONDITIONS</h4>
                      <p className="text-sm text-gray-700 leading-relaxed">{getTemplateForInvoice(previewInvoice).terms}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </DashboardLayout>
  );
}