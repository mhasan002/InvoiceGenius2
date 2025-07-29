import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RefreshCw, Eye, Download, Plus, X, Trash2, FileText } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type Service, type Package, type CompanyProfile, type PaymentMethod, type Template } from "@shared/schema";

interface InvoiceItem {
  id: string;
  type: 'service' | 'package';
  name: string;
  unitPrice: number;
  quantity: number;
  timePeriod?: number;
  total: number;
  packageServices?: Array<{ name: string; quantity?: number }>;
}

interface ClientCustomField {
  name: string;
  value: string;
}

export default function CreateInvoice() {
  // Form state
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientCustomFields, setClientCustomFields] = useState<ClientCustomField[]>([]);
  
  // Items state
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [activeTab, setActiveTab] = useState('services');
  
  // Price modifiers
  const [taxPercentage, setTaxPercentage] = useState(0);
  const [discountType, setDiscountType] = useState<'flat' | 'percentage'>('flat');
  const [discountValue, setDiscountValue] = useState(0);
  const [platform, setPlatform] = useState('');
  
  // Company and payment
  const [selectedCompanyProfile, setSelectedCompanyProfile] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [paymentReceivedBy, setPaymentReceivedBy] = useState('');
  
  // Template and customization
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  
  // Preview state
  const [showPreview, setShowPreview] = useState(false);
  
  const { toast } = useToast();

  // Fetch data from all modules
  const { data: services = [] } = useQuery({
    queryKey: ['/api/services'],
    queryFn: () => fetch('/api/services', { credentials: 'include' }).then(res => res.json()),
  });

  const { data: packages = [] } = useQuery({
    queryKey: ['/api/packages'],
    queryFn: () => fetch('/api/packages', { credentials: 'include' }).then(res => res.json()),
  });

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

  // Get selected company profile and payment method details
  const selectedCompany = companyProfiles.find((cp: CompanyProfile) => cp.id === selectedCompanyProfile);
  const selectedPayment = paymentMethods.find((pm: PaymentMethod) => pm.id === selectedPaymentMethod);
  const defaultTemplate = templates.find((t: Template) => t.isDefault === "true") || templates[0];

  // Generate invoice number on load
  useEffect(() => {
    const generateInvoiceNumber = () => {
      const date = new Date();
      const timestamp = date.getTime().toString().slice(-6);
      return `INV-${timestamp}`;
    };
    setInvoiceNumber(generateInvoiceNumber());
  }, []);

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = (subtotal * taxPercentage) / 100;
  const discountAmount = discountType === 'percentage' 
    ? (subtotal * discountValue) / 100 
    : discountValue;
  const total = subtotal + taxAmount - discountAmount;

  // Add service to invoice
  const addService = (serviceId: string) => {
    const service = services.find((s: Service) => s.id === serviceId);
    if (!service) return;

    const newItem: InvoiceItem = {
      id: `service_${Date.now()}`,
      type: 'service',
      name: service.name,
      unitPrice: parseFloat(service.unitPrice),
      quantity: 1,
      timePeriod: 1,
      total: parseFloat(service.unitPrice),
    };
    setItems([...items, newItem]);
  };

  // Add package to invoice
  const addPackage = (packageId: string) => {
    const pkg = packages.find((p: Package) => p.id === packageId);
    if (!pkg) return;

    const packageServices = Array.isArray(pkg.services) ? pkg.services : [];
    
    const newItem: InvoiceItem = {
      id: `package_${Date.now()}`,
      type: 'package',
      name: pkg.name,
      unitPrice: parseFloat(pkg.price),
      quantity: 1,
      timePeriod: 1,
      total: parseFloat(pkg.price),
      packageServices,
    };
    setItems([...items, newItem]);
  };

  // Update item quantity or time period
  const updateItem = (itemId: string, field: 'quantity' | 'timePeriod', value: number) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        const updated = { ...item, [field]: value };
        updated.total = updated.unitPrice * updated.quantity * (updated.timePeriod || 1);
        return updated;
      }
      return item;
    }));
  };

  // Remove item
  const removeItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId));
  };

  // Add custom field for client
  const addClientCustomField = () => {
    setClientCustomFields([...clientCustomFields, { name: '', value: '' }]);
  };

  // Update custom field
  const updateClientCustomField = (index: number, field: 'name' | 'value', value: string) => {
    const updated = [...clientCustomFields];
    updated[index][field] = value;
    setClientCustomFields(updated);
  };

  // Remove custom field
  const removeClientCustomField = (index: number) => {
    setClientCustomFields(clientCustomFields.filter((_, i) => i !== index));
  };

  // Reset form
  const resetForm = () => {
    setClientName('');
    setClientPhone('');
    setClientAddress('');
    setClientEmail('');
    setClientCustomFields([]);
    setItems([]);
    setTaxPercentage(0);
    setDiscountValue(0);
    setPlatform('');
    setNotes('');
    setTerms('');
    setPaymentReceivedBy('');
    const generateInvoiceNumber = () => {
      const date = new Date();
      const timestamp = date.getTime().toString().slice(-6);
      return `INV-${timestamp}`;
    };
    setInvoiceNumber(generateInvoiceNumber());
  };

  // Save invoice mutation
  const createInvoiceMutation = useMutation({
    mutationFn: (invoiceData: any) => apiRequest('POST', '/api/invoices', invoiceData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      toast({ title: "Invoice created successfully!" });
      resetForm();
    },
    onError: () => {
      toast({ title: "Failed to create invoice", variant: "destructive" });
    }
  });

  // Handle save invoice
  const handleSaveInvoice = () => {
    if (!clientName || items.length === 0) {
      toast({ title: "Please fill in client name and add at least one item", variant: "destructive" });
      return;
    }

    const invoiceData = {
      invoiceNumber,
      clientName,
      clientPhone,
      clientAddress,
      clientEmail,
      clientCustomFields,
      items,
      taxPercentage,
      discountType,
      discountValue,
      platform,
      companyProfileId: selectedCompanyProfile || null,
      paymentMethodId: selectedPaymentMethod || null,
      paymentReceivedBy,
      notes: showNotes ? notes : null,
      terms: showTerms ? terms : null,
      subtotal,
      taxAmount,
      discountAmount,
      total,
      status: 'draft'
    };

    createInvoiceMutation.mutate(invoiceData);
  };

  // Handle PDF download
  const handleDownloadPDF = async () => {
    if (!clientName || items.length === 0) {
      toast({ title: "Please fill in client name and add at least one item before generating PDF", variant: "destructive" });
      return;
    }

    try {
      // First show the preview to ensure it's rendered
      if (!showPreview) {
        setShowPreview(true);
        // Wait a moment for the preview to render
        await new Promise(resolve => setTimeout(resolve, 500));
      }

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
      const fileName = `invoice-${invoiceNumber || 'draft'}-${clientName.replace(/\s+/g, '-')}.pdf`;
      pdf.save(fileName);
      
      toast({ title: "PDF downloaded successfully!", description: `Invoice saved as ${fileName}` });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({ title: "Error generating PDF", description: "Failed to create PDF. Please try again.", variant: "destructive" });
    }
  };

  return (
    <DashboardLayout title="Create Invoice">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Invoice</h1>
            <p className="text-gray-600 dark:text-gray-400">Create a new invoice by combining all your data</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={resetForm}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset Form
            </Button>
            <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
              <Eye className="h-4 w-4 mr-2" />
              Preview Invoice
            </Button>
            <Button onClick={handleDownloadPDF}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>

        {/* Invoice Preview */}
        {showPreview && defaultTemplate && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Invoice Preview - {defaultTemplate.name}</span>
                <Button variant="outline" size="sm" onClick={() => setShowPreview(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Close Preview
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {defaultTemplate.name === "Minimalist Red" ? (
                // Minimalist Red Template
                <div data-invoice-preview className="bg-white shadow-lg rounded-lg max-w-4xl mx-auto relative overflow-hidden" 
                     style={{ color: defaultTemplate.config?.textColor || '#000', fontFamily: defaultTemplate.config?.fontFamily || 'inherit' }}>
                  {/* Geometric Header */}
                  <div className="relative">
                    <div 
                      className="absolute top-0 left-0 w-full h-24"
                      style={{ backgroundColor: defaultTemplate.config?.primaryColor || '#DC2626' }}
                    ></div>
                    <div className="p-8 pt-16 relative z-10">
                      {/* Logo and Company */}
                      <div className="mb-8">
                        <div className="flex items-center mb-2">
                          {defaultTemplate.config?.logoVisible && selectedCompany?.logoUrl ? (
                            <img src={selectedCompany.logoUrl} alt="Company Logo" className="w-8 h-8 mr-3 object-contain" />
                          ) : defaultTemplate.config?.logoVisible && (
                            <div className="w-8 h-8 mr-3" style={{ backgroundColor: defaultTemplate.config?.primaryColor }}>
                              <svg viewBox="0 0 32 32" className="w-full h-full p-1 text-white">
                                <path fill="currentColor" d="M16 8l8 8-8 8-8-8z"/>
                              </svg>
                            </div>
                          )}
                          <div>
                            <h1 className="text-2xl font-bold">
                              {selectedCompany?.name || 'Your Company Name'}
                            </h1>
                            {selectedCompany?.tagline && (
                              <p className="text-sm text-gray-600">
                                {selectedCompany.tagline}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Invoice Details */}
                      <div className="grid grid-cols-2 gap-8 mb-8">
                        <div>
                          <h3 className="font-semibold mb-2">ISSUED TO:</h3>
                          <div className="text-sm space-y-1">
                            <p>{clientName || 'Client Name'}</p>
                            {clientEmail && <p>{clientEmail}</p>}
                            {clientPhone && <p>{clientPhone}</p>}
                            {clientAddress && <p className="whitespace-pre-line">{clientAddress}</p>}
                          </div>
                          
                          <h3 className="font-semibold mb-2 mt-4">PAY TO:</h3>
                          <div className="text-sm space-y-1">
                            {selectedCompany ? (
                              <>
                                <p>{selectedCompany.name}</p>
                                <p>{selectedCompany.email}</p>
                                <p className="whitespace-pre-line">{selectedCompany.address}</p>
                                <p>Payment To: {paymentReceivedBy || 'Company Account'}</p>
                              </>
                            ) : (
                              <>
                                <p>No Company Profile Selected</p>
                                <p>Payment To: {paymentReceivedBy || 'Company Account'}</p>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm space-y-1">
                            <p><strong>INVOICE NO:</strong> {invoiceNumber || 'Not specified'}</p>
                            <p><strong>DATE:</strong> {new Date().toLocaleDateString()}</p>
                            {platform && <p><strong>PLATFORM:</strong> {platform}</p>}
                          </div>
                        </div>
                      </div>

                      {/* Items Table */}
                      <div className="mb-8">
                        <div className="grid gap-4 pb-2 border-b-2 font-semibold text-sm uppercase" 
                             style={{ 
                               borderColor: defaultTemplate.config?.primaryColor,
                               gridTemplateColumns: defaultTemplate.config?.customFields?.length > 0 ? `2fr 1fr 1fr 1fr 1fr` : `2fr 1fr 1fr 1fr`
                             }}>
                          <div>DESCRIPTION</div>
                          <div className="text-center">QTY</div>
                          <div className="text-right">RATE</div>
                          <div className="text-right">AMOUNT</div>
                          {defaultTemplate.config?.customFields?.map((field: any, idx: number) => (
                            <div key={idx} className="text-center">{field.name.toUpperCase()}</div>
                          ))}
                        </div>
                        
                        {items.length > 0 ? items.map((item) => (
                          <div key={item.id} className="grid gap-4 py-3 text-sm border-b" 
                               style={{ 
                                 borderColor: '#E5E7EB',
                                 gridTemplateColumns: defaultTemplate.config?.customFields?.length > 0 ? `2fr 1fr 1fr 1fr 1fr` : `2fr 1fr 1fr 1fr`
                               }}>
                            <div>
                              <p>{item.name}</p>
                              {item.type === 'package' && item.packageServices && (
                                <div className="text-xs text-gray-600 mt-1">
                                  <p>Package includes:</p>
                                  <ul className="list-disc list-inside ml-2">
                                    {item.packageServices.map((service, idx) => (
                                      <li key={idx}>{service.name} {service.quantity && `(${service.quantity})`}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {item.timePeriod && item.timePeriod > 1 && (
                                <p className="text-xs text-gray-600">Duration: {item.timePeriod} month{item.timePeriod > 1 ? 's' : ''}</p>
                              )}
                            </div>
                            <div className="text-center">{item.quantity}</div>
                            <div className="text-right">${item.unitPrice.toFixed(2)}</div>
                            <div className="text-right">${item.total.toFixed(2)}</div>
                            {defaultTemplate.config?.customFields?.map((field: any, idx: number) => {
                              // Get custom field value from clientCustomFields
                              const customFieldValue = clientCustomFields.find(cf => cf.name === field.name)?.value || field.value || '-';
                              return (
                                <div key={idx} className="text-center">{customFieldValue}</div>
                              );
                            })}
                          </div>
                        )) : (
                          <div className="py-8 text-center text-gray-500">
                            No items added to invoice
                          </div>
                        )}

                        {/* Totals */}
                        <div className="mt-6 ml-auto w-64">
                          <div className="flex justify-between py-2">
                            <span><strong>Subtotal:</strong></span>
                            <span>${subtotal.toFixed(2)}</span>
                          </div>
                          {taxPercentage > 0 && (
                            <div className="flex justify-between py-2">
                              <span><strong>Tax ({taxPercentage}%):</strong></span>
                              <span>${taxAmount.toFixed(2)}</span>
                            </div>
                          )}
                          {discountValue > 0 && (
                            <div className="flex justify-between py-2 text-red-600">
                              <span><strong>Discount ({discountType === 'percentage' ? `${discountValue}%` : `$${discountValue}`}):</strong></span>
                              <span>-${discountAmount.toFixed(2)}</span>
                            </div>
                          )}
                          <div className="flex justify-between py-2 font-bold px-3 py-2" 
                               style={{ backgroundColor: defaultTemplate.config?.primaryColor, color: 'white' }}>
                            <span>TOTAL:</span>
                            <span>${total.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Payment Information - Below table as per template design */}
                      {selectedPayment && (
                        <div className="mt-8 p-4 border rounded-lg mb-6" style={{ borderColor: defaultTemplate.config?.primaryColor }}>
                          <h4 className="font-semibold mb-3" style={{ color: defaultTemplate.config?.primaryColor }}>PAYMENT INFORMATION</h4>
                          <div className="grid grid-cols-2 gap-6 text-sm">
                            <div>
                              <p><strong>Payment Method:</strong> {selectedPayment.type}</p>
                              {selectedPayment.fields && Object.entries(selectedPayment.fields).map(([key, value]) => (
                                <p key={key}><strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {String(value)}</p>
                              ))}
                              {paymentReceivedBy && <p><strong>Payment To:</strong> {paymentReceivedBy}</p>}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Notes and Terms */}
                      {(defaultTemplate.config?.notes || (showNotes && notes)) && (
                        <div className="mb-6">
                          <h4 className="font-semibold mb-2">NOTES:</h4>
                          <p className="whitespace-pre-line text-sm">{defaultTemplate.config?.notes || notes}</p>
                        </div>
                      )}
                      
                      {(defaultTemplate.config?.terms || (showTerms && terms)) && (
                        <div className="mb-6">
                          <h4 className="font-semibold mb-2">TERMS & CONDITIONS:</h4>
                          <p className="whitespace-pre-line text-sm">{defaultTemplate.config?.terms || terms}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Geometric Footer Design - Red Angular Design matching template */}
                  <div className="relative mt-8">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm text-gray-600">
                        Thank you for your business!
                      </div>
                      <div className="text-sm font-medium">
                        Authorized Signed
                      </div>
                    </div>
                    {/* Exact angular red footer design matching template image */}
                    <div className="relative h-16 overflow-hidden bg-gray-100">
                      {/* Left diagonal section - covers about 60% of width */}
                      <div 
                        className="absolute bottom-0 left-0 h-full"
                        style={{ 
                          width: '62%',
                          backgroundColor: defaultTemplate.config?.primaryColor || '#B91C1C',
                          clipPath: 'polygon(0% 0%, 100% 0%, 88% 100%, 0% 100%)'
                        }}
                      ></div>
                      {/* Right diagonal section - smaller piece on the right */}
                      <div 
                        className="absolute bottom-0 right-0 h-full"
                        style={{ 
                          width: '45%',
                          backgroundColor: defaultTemplate.config?.primaryColor || '#B91C1C',
                          clipPath: 'polygon(35% 0%, 100% 0%, 100% 100%, 15% 100%)'
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ) : (
                // Professional Template (default)
                <div data-invoice-preview className="bg-white p-8 shadow-lg rounded-lg max-w-4xl mx-auto" 
                     style={{ color: defaultTemplate.config?.textColor || '#000', fontFamily: defaultTemplate.config?.fontFamily || 'inherit' }}>
                  
                  {/* Header */}
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-4">
                      {defaultTemplate.config?.logoVisible && selectedCompany?.logoUrl ? (
                        <img src={selectedCompany.logoUrl} alt="Company Logo" className="w-12 h-12 object-contain" />
                      ) : defaultTemplate.config?.logoVisible && (
                        <div className="w-12 h-12" style={{ backgroundColor: defaultTemplate.config?.primaryColor }}>
                          <svg viewBox="0 0 32 32" className="w-full h-full p-2 text-white">
                            <path fill="currentColor" d="M16 8l8 8-8 8-8-8z"/>
                          </svg>
                        </div>
                      )}
                      <div>
                        <h1 className="text-4xl font-light tracking-wider mb-2" 
                            style={{ color: defaultTemplate.config?.primaryColor }}>
                          INVOICE
                        </h1>
                        <p className="text-sm">
                          INVOICE NUMBER • {invoiceNumber || 'Not specified'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <p><strong>DATE:</strong> {new Date().toLocaleDateString()}</p>
                      {platform && <p><strong>PLATFORM:</strong> {platform}</p>}
                    </div>
                  </div>

                  {/* Company and Client Information */}
                  <div className="grid grid-cols-2 gap-8 mb-6">
                    <div>
                      <p><strong>FROM:</strong></p>
                      <div className="text-sm space-y-1">
                        {selectedCompany ? (
                          <>
                            <p>{selectedCompany.name}</p>
                            <p>{selectedCompany.email}</p>
                            <p className="whitespace-pre-line">{selectedCompany.address}</p>
                          </>
                        ) : (
                          <p className="text-gray-500">No company profile selected</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <p><strong>BILL TO:</strong></p>
                      <div className="text-sm space-y-1">
                        <p>{clientName || 'Client Name'}</p>
                        {clientEmail && <p>{clientEmail}</p>}
                        {clientPhone && <p>{clientPhone}</p>}
                        {clientAddress && <p className="whitespace-pre-line">{clientAddress}</p>}
                      </div>
                    </div>
                  </div>



                  {/* Items Table */}
                  <div className="mb-8">
                    <div className="grid gap-4 p-3 text-sm font-medium" 
                         style={{ 
                           backgroundColor: defaultTemplate.config?.secondaryColor || '#f3f4f6',
                           gridTemplateColumns: defaultTemplate.config?.customFields?.length > 0 ? `2fr 1fr 1fr 1fr 1fr` : `2fr 1fr 1fr 1fr`
                         }}>
                      <div className="uppercase">DESCRIPTION</div>
                      <div className="uppercase text-center">QTY</div>
                      <div className="uppercase text-right">RATE</div>
                      <div className="uppercase text-right">AMOUNT</div>
                      {defaultTemplate.config?.customFields?.map((field: any, idx: number) => (
                        <div key={idx} className="uppercase text-center">{field.name}</div>
                      ))}
                    </div>
                    
                    {items.length > 0 ? items.map((item) => (
                      <div key={item.id} className="grid gap-4 p-3 text-sm border-b" 
                           style={{ 
                             borderColor: defaultTemplate.config?.borderColor,
                             gridTemplateColumns: defaultTemplate.config?.customFields?.length > 0 ? `2fr 1fr 1fr 1fr 1fr` : `2fr 1fr 1fr 1fr`
                           }}>
                        <div>
                          <p>{item.name}</p>
                          {item.type === 'package' && item.packageServices && (
                            <div className="text-xs text-gray-600 mt-1">
                              <p>Package includes:</p>
                              <ul className="list-disc list-inside ml-2">
                                {item.packageServices.map((service, idx) => (
                                  <li key={idx}>{service.name} {service.quantity && `(${service.quantity})`}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {item.timePeriod && item.timePeriod > 1 && (
                            <p className="text-xs text-gray-600">Duration: {item.timePeriod} month{item.timePeriod > 1 ? 's' : ''}</p>
                          )}
                        </div>
                        <div className="text-center">{item.quantity}</div>
                        <div className="text-right">${item.unitPrice.toFixed(2)}</div>
                        <div className="text-right">${item.total.toFixed(2)}</div>
                        {defaultTemplate.config?.customFields?.map((field: any, idx: number) => {
                          // Get custom field value from clientCustomFields
                          const customFieldValue = clientCustomFields.find(cf => cf.name === field.name)?.value || field.value || '-';
                          return (
                            <div key={idx} className="text-center">{customFieldValue}</div>
                          );
                        })}
                      </div>
                    )) : (
                      <div className="p-8 text-center text-gray-500">
                        No items added to invoice
                      </div>
                    )}

                    {/* Totals */}
                    <div className="mt-6 ml-auto w-64">
                      <div className="flex justify-between py-2">
                        <span><strong>SUB-TOTAL:</strong></span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      {taxPercentage > 0 && (
                        <div className="flex justify-between py-2">
                          <span><strong>TAX ({taxPercentage}%):</strong></span>
                          <span>${taxAmount.toFixed(2)}</span>
                        </div>
                      )}
                      {discountValue > 0 && (
                        <div className="flex justify-between py-2">
                          <span><strong>DISCOUNT ({discountType === 'percentage' ? `${discountValue}%` : `$${discountValue}`}):</strong></span>
                          <span>${discountAmount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between py-2 font-bold px-3 py-2" 
                           style={{ backgroundColor: defaultTemplate.config?.borderColor }}>
                        <span>TOTAL DUE</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Information - Below table as per template design */}
                  {selectedPayment && (
                    <div className="mt-8 p-4 border rounded-lg mb-6" style={{ borderColor: defaultTemplate.config?.borderColor }}>
                      <h4 className="font-semibold mb-3" style={{ color: defaultTemplate.config?.primaryColor }}>PAYMENT INFORMATION</h4>
                      <div className="grid grid-cols-2 gap-6 text-sm">
                        <div>
                          <p><strong>Payment Method:</strong> {selectedPayment.type}</p>
                          {selectedPayment.fields && Object.entries(selectedPayment.fields).map(([key, value]) => (
                            <p key={key}><strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {String(value)}</p>
                          ))}
                          {paymentReceivedBy && <p><strong>Payment To:</strong> {paymentReceivedBy}</p>}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="grid grid-cols-2 gap-8 mt-8">
                    <div>
                      {(defaultTemplate.config?.notes || (showNotes && notes)) && (
                        <div className="text-sm">
                          <h4 className="font-semibold mb-2">NOTES:</h4>
                          <div className="whitespace-pre-line">{defaultTemplate.config?.notes || notes}</div>
                        </div>
                      )}
                      {(defaultTemplate.config?.terms || (showTerms && terms)) && (
                        <div className="text-sm mt-4">
                          <h4 className="font-semibold mb-2">TERMS & CONDITIONS:</h4>
                          <div className="whitespace-pre-line">{defaultTemplate.config?.terms || terms}</div>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <h2 className="text-4xl font-light tracking-wider" style={{ color: defaultTemplate.config?.primaryColor }}>
                        THANK<br />YOU
                      </h2>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Form Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Invoice Number */}
            <Card>
              <CardHeader>
                <CardTitle>Invoice Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="invoiceNumber">Invoice Number</Label>
                    <Input
                      id="invoiceNumber"
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="platform">Platform (Optional)</Label>
                    <Input
                      id="platform"
                      placeholder="e.g., Upwork, Fiverr"
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Client Details */}
            <Card>
              <CardHeader>
                <CardTitle>Client Details (Bill To)</CardTitle>
                <CardDescription>Information about who you're billing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="clientName">Client Name *</Label>
                    <Input
                      id="clientName"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="clientPhone">Phone Number</Label>
                    <Input
                      id="clientPhone"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="clientEmail">Email Address</Label>
                    <Input
                      id="clientEmail"
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="clientAddress">Address</Label>
                    <Textarea
                      id="clientAddress"
                      rows={2}
                      value={clientAddress}
                      onChange={(e) => setClientAddress(e.target.value)}
                    />
                  </div>
                </div>

                {/* Custom Fields */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Custom Fields</Label>
                    <Button size="sm" variant="outline" onClick={addClientCustomField}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Custom Field
                    </Button>
                  </div>
                  {clientCustomFields.map((field, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <Input
                        placeholder="Field name (e.g., TIN No)"
                        value={field.name}
                        onChange={(e) => updateClientCustomField(index, 'name', e.target.value)}
                      />
                      <Input
                        placeholder="Field value"
                        value={field.value}
                        onChange={(e) => updateClientCustomField(index, 'value', e.target.value)}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeClientCustomField(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Add Services & Packages */}
            <Card>
              <CardHeader>
                <CardTitle>Add Services & Packages</CardTitle>
                <CardDescription>Select services and packages to include in this invoice</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="services">Services</TabsTrigger>
                    <TabsTrigger value="packages">Packages</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="services" className="space-y-4">
                    <Select onValueChange={addService}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a service to add" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((service: Service) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name} - ${service.unitPrice}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TabsContent>
                  
                  <TabsContent value="packages" className="space-y-4">
                    <Select onValueChange={addPackage}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a package to add" />
                      </SelectTrigger>
                      <SelectContent>
                        {packages.map((pkg: Package) => (
                          <SelectItem key={pkg.id} value={pkg.id}>
                            {pkg.name} - ${pkg.price}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TabsContent>
                </Tabs>

                {/* Items List */}
                {items.length > 0 && (
                  <div className="mt-6 space-y-3">
                    <Label>Selected Items</Label>
                    {items.map((item) => (
                      <div key={item.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant={item.type === 'service' ? 'default' : 'secondary'}>
                                {item.type}
                              </Badge>
                              <h4 className="font-medium">{item.name}</h4>
                            </div>
                            
                            {item.packageServices && (
                              <div className="text-sm text-gray-600 mb-2">
                                <span className="font-medium">Includes:</span>
                                {item.packageServices.map((service, idx) => (
                                  <span key={idx} className="ml-2">
                                    {service.name}
                                    {service.quantity && ` (${service.quantity})`}
                                    {idx < item.packageServices!.length - 1 && ','}
                                  </span>
                                ))}
                              </div>
                            )}
                            
                            <div className="grid grid-cols-4 gap-2">
                              <div>
                                <Label className="text-xs">Unit Price</Label>
                                <p className="text-sm font-medium">${item.unitPrice}</p>
                              </div>
                              <div>
                                <Label className="text-xs">Quantity</Label>
                                <Input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                                  className="h-8"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Time Period</Label>
                                <Input
                                  type="number"
                                  min="1"
                                  value={item.timePeriod || 1}
                                  onChange={(e) => updateItem(item.id, 'timePeriod', parseInt(e.target.value) || 1)}
                                  className="h-8"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Total</Label>
                                <p className="text-sm font-bold">${item.total.toFixed(2)}</p>
                              </div>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Price Modifiers */}
            <Card>
              <CardHeader>
                <CardTitle>Price Modifiers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="tax">Tax (%)</Label>
                    <Input
                      id="tax"
                      type="number"
                      min="0"
                      max="100"
                      value={taxPercentage}
                      onChange={(e) => setTaxPercentage(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="discountType">Discount Type</Label>
                    <Select value={discountType} onValueChange={(value: 'flat' | 'percentage') => setDiscountType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="flat">Flat Amount ($)</SelectItem>
                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="discount">
                      Discount {discountType === 'percentage' ? '(%)' : '($)'}
                    </Label>
                    <Input
                      id="discount"
                      type="number"
                      min="0"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Company Profile & Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>Company & Payment Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="paymentReceivedBy">Payment Received By *</Label>
                  <Input
                    id="paymentReceivedBy"
                    placeholder="Your name or company name"
                    value={paymentReceivedBy}
                    onChange={(e) => setPaymentReceivedBy(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Company Profile</Label>
                    <Select value={selectedCompanyProfile} onValueChange={setSelectedCompanyProfile}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select company profile" />
                      </SelectTrigger>
                      <SelectContent>
                        {companyProfiles.map((profile: CompanyProfile) => (
                          <SelectItem key={profile.id} value={profile.id}>
                            {profile.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Payment Method</Label>
                    <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentMethods.map((method: PaymentMethod) => (
                          <SelectItem key={method.id} value={method.id}>
                            {method.name} ({method.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes and Terms */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="showNotes"
                    checked={showNotes}
                    onCheckedChange={setShowNotes}
                  />
                  <Label htmlFor="showNotes">Add Notes</Label>
                </div>
                {showNotes && (
                  <Textarea
                    placeholder="Add any notes for the client..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                )}
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="showTerms"
                    checked={showTerms}
                    onCheckedChange={setShowTerms}
                  />
                  <Label htmlFor="showTerms">Add Terms & Conditions</Label>
                </div>
                {showTerms && (
                  <Textarea
                    placeholder="Add terms and conditions..."
                    value={terms}
                    onChange={(e) => setTerms(e.target.value)}
                    rows={4}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Invoice Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {taxPercentage > 0 && (
                  <div className="flex justify-between">
                    <span>Tax ({taxPercentage}%):</span>
                    <span>${taxAmount.toFixed(2)}</span>
                  </div>
                )}
                {discountValue > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>
                      Discount ({discountType === 'percentage' ? `${discountValue}%` : `$${discountValue}`}):
                    </span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-3">
              <Button 
                className="w-full" 
                onClick={handleSaveInvoice}
                disabled={createInvoiceMutation.isPending}
              >
                <FileText className="h-4 w-4 mr-2" />
                {createInvoiceMutation.isPending ? 'Creating...' : 'Create Invoice'}
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setShowPreview(!showPreview)}>
                <Eye className="h-4 w-4 mr-2" />
                Preview Invoice
              </Button>
              <Button variant="outline" className="w-full" onClick={handleDownloadPDF}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}