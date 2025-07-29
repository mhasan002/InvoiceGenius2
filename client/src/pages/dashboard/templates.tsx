import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Palette, Settings, Eye, Save, Download, Plus, X } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type Template } from "@shared/schema";

interface TemplateField {
  id: string;
  name: string;
  label: string;
  visible: boolean;
  customLabel?: string;
}

interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  fontFamily: string;
  logoVisible: boolean;
  fields: TemplateField[];
  showNotes: boolean;
  showTerms: boolean;
  showPayment: boolean;
  notes: string;
  terms: string;
  customFields: Array<{ name: string; value: string }>;
}

const defaultTemplates: TemplateConfig[] = [
  {
    id: "professional",
    name: "Professional Grey",
    description: "Clean and professional design with grey accents",
    primaryColor: "#374151",
    backgroundColor: "#ffffff",
    textColor: "#111827",
    borderColor: "#d1d5db",
    fontFamily: "Inter",
    logoVisible: true,
    showNotes: true,
    showTerms: true,
    showPayment: true,
    notes: "PLEASE SEND REMITTANCE TO:\nHELLO@REALLYGREATSITE.COM\n\nPAYMENT IS REQUIRED WITHIN 10\nBUSINESS DAYS OF INVOICE DATE.",
    terms: "Payment terms and conditions apply. Late payments may incur additional fees.",
    fields: [
      { id: "itemDescription", name: "itemDescription", label: "Item Description", visible: true },
      { id: "price", name: "price", label: "Price", visible: true },
      { id: "quantity", name: "quantity", label: "Quantity", visible: true },
      { id: "total", name: "total", label: "Total", visible: true },
    ],
    customFields: [],
  },
  {
    id: "minimalist",
    name: "Minimalist Red",
    description: "Modern minimalist design with red geometric elements",
    primaryColor: "#991b1b",
    backgroundColor: "#ffffff",
    textColor: "#111827",
    borderColor: "#991b1b",
    fontFamily: "Inter",
    logoVisible: true,
    showNotes: true,
    showTerms: true,
    showPayment: true,
    notes: "Thank you for your business!",
    terms: "Payment is due within 30 days of invoice date. Late payments may incur additional fees.",
    fields: [
      { id: "description", name: "description", label: "Description", visible: true },
      { id: "unitPrice", name: "unitPrice", label: "Unit Price", visible: true },
      { id: "qty", name: "qty", label: "QTY", visible: true },
      { id: "total", name: "total", label: "Total", visible: true },
    ],
    customFields: [],
  },
];

export default function Templates() {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateConfig | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<TemplateConfig | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const { toast } = useToast();

  // Fetch templates from database
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['/api/templates'],
    queryFn: () => fetch('/api/templates', { credentials: 'include' }).then(res => res.json()),
  });

  // Mutations for template operations
  const createMutation = useMutation({
    mutationFn: (template: any) => apiRequest('POST', '/api/templates', template),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      toast({ title: "Template saved successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to save template", variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...template }: any) => apiRequest('PUT', `/api/templates/${id}`, template),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      toast({ title: "Template updated successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to update template", variant: "destructive" });
    }
  });

  const setDefaultMutation = useMutation({
    mutationFn: (id: string) => apiRequest('POST', `/api/templates/${id}/set-default`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      toast({ title: "Template set as default!" });
      setSelectedTemplate(null);
    },
    onError: () => {
      toast({ title: "Failed to set default template", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/templates/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      toast({ title: "Template deleted successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to delete template", variant: "destructive" });
    }
  });

  const handleSelectTemplate = (template: TemplateConfig) => {
    // Ensure all boolean properties are properly maintained when cloning
    const clonedTemplate = { 
      ...template, 
      id: `${template.id}_${Date.now()}`,
      showTerms: template.showTerms ?? true, // Ensure showTerms is preserved
      showNotes: template.showNotes ?? true, // Ensure showNotes is preserved
      logoVisible: template.logoVisible ?? true // Ensure logoVisible is preserved
    };
    setSelectedTemplate(clonedTemplate);
    setEditingTemplate(clonedTemplate);
  };

  const updateTemplate = (updates: Partial<TemplateConfig>) => {
    if (editingTemplate) {
      console.log('updateTemplate called with:', updates);
      const updatedTemplate = { ...editingTemplate, ...updates };
      console.log('Updated template:', updatedTemplate);
      setEditingTemplate(updatedTemplate);
    }
  };

  const updateField = (fieldId: string, updates: Partial<TemplateField>) => {
    if (editingTemplate) {
      const updatedFields = editingTemplate.fields.map(field =>
        field.id === fieldId ? { ...field, ...updates } : field
      );
      setEditingTemplate({ ...editingTemplate, fields: updatedFields });
    }
  };

  const addCustomField = () => {
    if (editingTemplate) {
      const newField = { name: "Custom Field", value: "" };
      setEditingTemplate({
        ...editingTemplate,
        customFields: [...editingTemplate.customFields, newField]
      });
    }
  };

  const removeCustomField = (index: number) => {
    if (editingTemplate) {
      const updatedFields = editingTemplate.customFields.filter((_, i) => i !== index);
      setEditingTemplate({ ...editingTemplate, customFields: updatedFields });
    }
  };

  const updateCustomField = (index: number, key: 'name' | 'value', value: string) => {
    if (editingTemplate) {
      const updatedFields = editingTemplate.customFields.map((field, i) =>
        i === index ? { ...field, [key]: value } : field
      );
      setEditingTemplate({ ...editingTemplate, customFields: updatedFields });
    }
  };

  const handleSaveTemplate = () => {
    if (!editingTemplate) return;
    
    const templateData = {
      name: editingTemplate.name,
      description: editingTemplate.description,
      config: editingTemplate
    };

    if (editingTemplate.id.includes('_')) {
      // New template (has timestamp suffix)
      createMutation.mutate(templateData);
    } else {
      // Existing template
      updateMutation.mutate({ id: editingTemplate.id, ...templateData });
    }
  };

  const handleUseTemplate = async () => {
    if (!editingTemplate) return;
    
    // Check if it's a new template (has timestamp suffix) or existing template
    if (editingTemplate.id.includes('_')) {
      // For new/modified templates, save first then set as default
      const templateData = {
        name: editingTemplate.name,
        description: editingTemplate.description,
        config: editingTemplate
      };
      
      try {
        // Create the template first
        const response = await apiRequest('POST', '/api/templates', templateData);
        const newTemplate = await response.json();
        
        // Then set as default
        await apiRequest('POST', `/api/templates/${newTemplate.id}/set-default`, {});
        
        // Update queries and show success
        queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
        toast({ title: "Template saved and set as default!" });
        setSelectedTemplate(null);
      } catch (error) {
        toast({ title: "Failed to save and use template", variant: "destructive" });
      }
    } else {
      // For existing saved templates, just set as default
      setDefaultMutation.mutate(editingTemplate.id);
    }
  };

  const ProfessionalPreview = ({ template }: { template: TemplateConfig }) => (
    <div className="bg-white p-8 shadow-lg rounded-lg max-w-2xl mx-auto" style={{ color: template.textColor, fontFamily: template.fontFamily }}>
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center gap-4">
          {template.logoVisible && (
            <div className="w-12 h-12" style={{ backgroundColor: template.primaryColor }}>
              <svg viewBox="0 0 32 32" className="w-full h-full p-2 text-white">
                <path fill="currentColor" d="M16 8l8 8-8 8-8-8z"/>
              </svg>
            </div>
          )}
          <div>
            <h1 className="text-4xl font-light tracking-wider mb-2" style={{ color: template.primaryColor }}>
              INVOICE
            </h1>
            <p className="text-sm" style={{ color: template.textColor }}>
              INVOICE NUMBER • 01234511
            </p>
          </div>
        </div>
        <div className="text-right text-sm">
          <p><strong>DATE:</strong> 02/02/2024</p>
          <p><strong>INVOICE NUMBER</strong></p>
          <p>: 01234511</p>
        </div>
      </div>

      {/* Bill To & Company Info */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="font-semibold mb-2">Bill To:</h3>
          <div className="text-sm space-y-1">
            <p>YOUR CLIENT NAME</p>
            <p>123 ANYWHERE ST., ANY CITY</p>
            <p>HELLO@REALLYGREATSITE.COM</p>
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Your Company Name</h3>
          <div className="text-sm space-y-1">
            <p>Company Address Line 1</p>
            <p>Company Address Line 2</p>
            <p>company@email.com</p>
            <p>(123) 456-7890</p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <p><strong>DATE:</strong> 02/02/2024</p>
        <hr className="mt-2" style={{ borderColor: template.borderColor }} />
      </div>

      {/* Items Table */}
      <div className="mb-8">
        <div className={`grid gap-4 p-3 text-sm font-medium`} style={{ backgroundColor: '#f3f4f6', gridTemplateColumns: `repeat(${template.fields.filter(f => f.visible).length + template.customFields.length}, 1fr)` }}>
          {template.fields.filter(f => f.visible).map(field => (
            <div key={field.id} className="uppercase">
              {field.customLabel || field.label}
            </div>
          ))}
          {template.customFields.map((customField, index) => (
            <div key={`custom-header-${index}`} className="uppercase">
              {customField.name}
            </div>
          ))}
        </div>
        
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className={`grid gap-4 p-3 text-sm border-b`} style={{ borderColor: template.borderColor, gridTemplateColumns: `repeat(${template.fields.filter(f => f.visible).length + template.customFields.length}, 1fr)` }}>
            {template.fields.filter(f => f.visible).map((field, index) => (
              <div key={field.id}>
                {field.id === 'description' && 'YOUR DESCRIPTION'}
                {field.id === 'unitPrice' && '$ 25.00'}
                {field.id === 'quantity' && '2'}
                {field.id === 'total' && '$ 50.00'}
              </div>
            ))}
            {template.customFields.map((customField, index) => (
              <div key={`custom-data-${index}`}>
                {customField.value || '-'}
              </div>
            ))}
          </div>
        ))}



        {/* Totals */}
        <div className="mt-6 ml-auto w-64">
          <div className="flex justify-between py-2">
            <span><strong>SUB-TOTAL:</strong></span>
            <span>$ 200.00</span>
          </div>
          <div className="flex justify-between py-2">
            <span><strong>TAX (10%):</strong></span>
            <span>$ 20.00</span>
          </div>
          <div className="flex justify-between py-2">
            <span><strong>PACKAGE DISCOUNT (0%):</strong></span>
            <span>$ 0.00</span>
          </div>
          <div className="flex justify-between py-2 font-bold px-3 py-2" style={{ backgroundColor: template.borderColor }}>
            <span>TOTAL DUE</span>
            <span>$ 220.00</span>
          </div>
        </div>
      </div>

      {/* Payment Information Section */}
      {template.showPayment && (
        <div className="mt-8 p-4 border rounded-lg" style={{ borderColor: template.borderColor }}>
          <h4 className="font-semibold mb-3" style={{ color: template.primaryColor }}>PAYMENT INFORMATION</h4>
          <div className="grid grid-cols-2 gap-6 text-sm">
            <div>
              <p><strong>Payment Method:</strong> Bank Transfer</p>
              <p><strong>Bank Name:</strong> Sample Bank</p>
              <p><strong>Account Number:</strong> 1234567890</p>
              <p><strong>Routing Number:</strong> 123456789</p>
            </div>
            <div>
              <p><strong>Payment Due:</strong> 30 days</p>
              <p><strong>Late Fee:</strong> 1.5% per month</p>
              <p><strong>Discount:</strong> 2% if paid within 10 days</p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="grid grid-cols-2 gap-8 mt-8">
        <div>
          {template.showNotes && (
            <div className="text-sm">
              <h4 className="font-semibold mb-2">NOTES:</h4>
              <div className="whitespace-pre-line">
                {template.notes || "PLEASE SEND REMITTANCE TO:\nHELLO@REALLYGREATSITE.COM\n\nPAYMENT IS REQUIRED WITHIN 10\nBUSINESS DAYS OF INVOICE DATE."}
              </div>
            </div>
          )}
          {template.showTerms && template.terms && (
            <div className="text-sm mt-4">
              <h4 className="font-semibold mb-2">TERMS & CONDITIONS:</h4>
              <div className="whitespace-pre-line">
                {template.terms}
              </div>
            </div>
          )}
        </div>
        <div className="text-right">
          <h2 className="text-4xl font-light tracking-wider" style={{ color: template.primaryColor }}>
            THANK<br />YOU
          </h2>
        </div>
      </div>
    </div>
  );

  const MinimalistPreview = ({ template }: { template: TemplateConfig }) => (
    <div className="bg-white shadow-lg rounded-lg max-w-2xl mx-auto relative overflow-hidden" style={{ color: template.textColor, fontFamily: template.fontFamily }}>
      {/* Geometric Header */}
      <div className="relative">
        <div 
          className="absolute top-0 left-0 w-full h-24 clip-polygon"
          style={{ backgroundColor: template.primaryColor }}
        ></div>
        <div className="p-8 pt-16 relative z-10">
          {/* Logo and Company */}
          <div className="mb-8">
            <div className="flex items-center mb-2">
              {template.logoVisible && (
                <div className="w-8 h-8 mr-3" style={{ backgroundColor: template.primaryColor }}>
                  <svg viewBox="0 0 32 32" className="w-full h-full p-1 text-white">
                    <path fill="currentColor" d="M16 8l8 8-8 8-8-8z"/>
                  </svg>
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold">Your Company Name</h1>
                <p className="text-sm text-gray-600">Company Tagline</p>
              </div>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-2">ISSUED TO:</h3>
              <div className="text-sm space-y-1">
                <p>Richard Sanchez</p>
                <p>Thynk Unlimited</p>
                <p>123 Anywhere St., Any City</p>
              </div>
              
              <h3 className="font-semibold mb-2 mt-4">PAY TO:</h3>
              <div className="text-sm space-y-1">
                <p>Your Company Bank</p>
                <p>Account Name: Company Account</p>
                <p>Account No.: 0123 4567 8901</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm space-y-1">
                <p><strong>INVOICE NO:</strong> 01234</p>
                <p><strong>DATE:</strong> 11.02.2030</p>
                <p><strong>DUE DATE:</strong> 11.03.2030</p>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <div className={`grid gap-4 pb-2 border-b-2`} style={{ borderColor: template.primaryColor, gridTemplateColumns: `repeat(${template.fields.filter(f => f.visible).length + template.customFields.length}, 1fr)` }}>
              {template.fields.filter(f => f.visible).map(field => (
                <div key={field.id} className="font-semibold text-sm uppercase">
                  {field.customLabel || field.label}
                </div>
              ))}
              {template.customFields.map((customField, index) => (
                <div key={`custom-header-${index}`} className="font-semibold text-sm uppercase">
                  {customField.name}
                </div>
              ))}
            </div>
            
            {[
              { desc: "Brand consultation", price: 100, qty: 1 },
              { desc: "logo design", price: 100, qty: 1 },
              { desc: "Website design", price: 100, qty: 1 },
              { desc: "Social media templates", price: 100, qty: 1 },
              { desc: "Brand photography", price: 100, qty: 1 },
              { desc: "Brand guide", price: 100, qty: 1 },
            ].map((item, idx) => (
              <div key={idx} className={`grid gap-4 py-2 text-sm border-b`} style={{ borderColor: template.borderColor, gridTemplateColumns: `repeat(${template.fields.filter(f => f.visible).length + template.customFields.length}, 1fr)` }}>
                {template.fields.filter(f => f.visible).map((field, index) => (
                  <div key={field.id}>
                    {field.id === 'description' && item.desc}
                    {field.id === 'unitPrice' && item.price}
                    {field.id === 'quantity' && item.qty}
                    {field.id === 'total' && `$${item.price * item.qty}`}
                  </div>
                ))}
                {template.customFields.map((customField, index) => (
                  <div key={`custom-data-${index}`}>
                    {customField.value || '-'}
                  </div>
                ))}
              </div>
            ))}



            {/* Totals */}
            <div className="mt-6 ml-auto w-64">
              <hr className="mb-2" style={{ borderColor: template.primaryColor }} />
              <div className="text-right space-y-1">
                <div className="flex justify-between py-1">
                  <span><strong>SUBTOTAL</strong></span>
                  <span>$400</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Tax 10%</span>
                  <span>$40</span>
                </div>
                <div className="flex justify-between font-bold py-1">
                  <span><strong>TOTAL</strong></span>
                  <span>$440</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information Section */}
          {template.showPayment && (
            <div className="mt-8 p-4 border rounded-lg" style={{ borderColor: template.borderColor }}>
              <h4 className="font-semibold mb-3" style={{ color: template.primaryColor }}>Payment Information</h4>
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div>
                  <p><strong>Payment Method:</strong> Bank Transfer</p>
                  <p><strong>Bank Name:</strong> Sample Bank</p>
                  <p><strong>Account Number:</strong> 1234567890</p>
                  <p><strong>Routing Number:</strong> 123456789</p>
                </div>
                <div>
                  <p><strong>Payment Due:</strong> 30 days</p>
                  <p><strong>Late Fee:</strong> 1.5% per month</p>
                  <p><strong>Discount:</strong> 2% if paid within 10 days</p>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="grid grid-cols-2 gap-8 mt-8">
            <div>
              {template.showNotes && (
                <div className="text-sm">
                  <div className="whitespace-pre-line">
                    {template.notes || "Thank you for your business!"}
                  </div>
                </div>
              )}
              {template.showTerms && template.terms && (
                <div className="text-sm mt-4">
                  <h4 className="font-semibold mb-2">Terms & Conditions:</h4>
                  <div className="whitespace-pre-line">
                    {template.terms}
                  </div>
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="border-t pt-4" style={{ borderColor: template.primaryColor }}>
                <p className="text-sm">Authorized Signed</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom geometric element */}
      <div 
        className="absolute bottom-0 right-0 w-full h-16 clip-polygon-bottom"
        style={{ backgroundColor: template.primaryColor }}
      ></div>
    </div>
  );

  return (
    <DashboardLayout title="Templates">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Templates</h1>
            <p className="text-gray-600 dark:text-gray-400">Choose and customize how your invoices look</p>
          </div>
        </div>

        {!selectedTemplate ? (
          /* Template Gallery */
          <div className="space-y-6">
            {/* Default Templates */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Default Templates</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {defaultTemplates.map((template) => (
                  <Card key={template.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        {template.name}
                      </CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-[3/4] bg-gray-100 rounded-lg mb-4 overflow-hidden">
                        <div className="transform scale-[0.3] origin-top-left w-[333%] h-[333%]">
                          {template.id === "professional" ? (
                            <ProfessionalPreview template={template} />
                          ) : (
                            <MinimalistPreview template={template} />
                          )}
                        </div>
                      </div>
                      <Button 
                        onClick={() => handleSelectTemplate(template)}
                        className="w-full"
                      >
                        Customize Template
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Saved Templates */}
            {templates.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Your Saved Templates</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {templates.map((template: Template) => {
                    const config = template.config as TemplateConfig;
                    return (
                      <Card key={template.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            {template.name}
                            {template.isDefault === "true" && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Default</span>
                            )}
                          </CardTitle>
                          <CardDescription>{template.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="aspect-[3/4] bg-gray-100 rounded-lg mb-4 overflow-hidden">
                            <div className="transform scale-[0.3] origin-top-left w-[333%] h-[333%]">
                              {config.id?.includes("professional") ? (
                                <ProfessionalPreview template={config} />
                              ) : (
                                <MinimalistPreview template={config} />
                              )}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Button 
                              onClick={() => handleSelectTemplate(config)}
                              className="w-full"
                              variant="outline"
                            >
                              Edit Template
                            </Button>
                            <div className="flex gap-2">
                              {template.isDefault !== "true" && (
                                <Button 
                                  onClick={() => setDefaultMutation.mutate(template.id)}
                                  disabled={setDefaultMutation.isPending}
                                  className="flex-1"
                                  size="sm"
                                >
                                  {setDefaultMutation.isPending ? "Setting..." : "Set as Default"}
                                </Button>
                              )}
                              <Button 
                                onClick={() => deleteMutation.mutate(template.id)}
                                disabled={deleteMutation.isPending}
                                variant="destructive"
                                size="sm"
                                className={template.isDefault === "true" ? "w-full" : "flex-1"}
                              >
                                {deleteMutation.isPending ? "Deleting..." : "Delete"}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Template Editor */
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Editor Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Customize Template
                </CardTitle>
                <CardDescription>
                  Personalize your {selectedTemplate.name} template
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  <Tabs defaultValue="fields" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="fields">Fields</TabsTrigger>
                      <TabsTrigger value="colors">Colors</TabsTrigger>
                      <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="fields" className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-3">Table Fields</h4>
                        {editingTemplate?.fields.map((field) => (
                          <div key={field.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex-1">
                              <Input
                                value={field.customLabel || field.label}
                                onChange={(e) => updateField(field.id, { customLabel: e.target.value })}
                                className="font-medium"
                              />
                            </div>
                            <Switch
                              checked={field.visible}
                              onCheckedChange={(checked) => updateField(field.id, { visible: checked })}
                            />
                          </div>
                        ))}
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-semibold">Custom Fields</h4>
                          <Button onClick={addCustomField} size="sm" variant="outline">
                            Add Field
                          </Button>
                        </div>
                        {editingTemplate?.customFields.map((field, index) => (
                          <div key={index} className="space-y-2 p-3 border rounded-lg mb-3">
                            <div className="flex justify-between items-center">
                              <Label className="font-medium">Custom Field {index + 1}</Label>
                              <Button 
                                onClick={() => removeCustomField(index)}
                                size="sm" 
                                variant="outline"
                                className="h-8 px-2"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="space-y-2">
                              <div>
                                <Label className="text-xs text-gray-500">Field Name</Label>
                                <Input
                                  value={field.name}
                                  onChange={(e) => {
                                    const updated = [...editingTemplate.customFields];
                                    updated[index] = { ...updated[index], name: e.target.value };
                                    updateTemplate({ customFields: updated });
                                  }}
                                  placeholder="Enter field name"
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label className="text-xs text-gray-500">Field Value</Label>
                                <Input
                                  value={field.value}
                                  onChange={(e) => {
                                    const updated = [...editingTemplate.customFields];
                                    updated[index] = { ...updated[index], value: e.target.value };
                                    updateTemplate({ customFields: updated });
                                  }}
                                  placeholder="Enter field value"
                                  className="mt-1"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="colors" className="space-y-4">
                      <div className="space-y-4">
                        <div>
                          <Label>Primary Color</Label>
                          <div className="flex gap-2 items-center">
                            <input
                              type="color"
                              value={editingTemplate?.primaryColor}
                              onChange={(e) => updateTemplate({ primaryColor: e.target.value })}
                              className="w-12 h-8 rounded border"
                            />
                            <Input
                              value={editingTemplate?.primaryColor}
                              onChange={(e) => updateTemplate({ primaryColor: e.target.value })}
                              className="flex-1"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label>Text Color</Label>
                          <div className="flex gap-2 items-center">
                            <input
                              type="color"
                              value={editingTemplate?.textColor}
                              onChange={(e) => updateTemplate({ textColor: e.target.value })}
                              className="w-12 h-8 rounded border"
                            />
                            <Input
                              value={editingTemplate?.textColor}
                              onChange={(e) => updateTemplate({ textColor: e.target.value })}
                              className="flex-1"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label>Border Color</Label>
                          <div className="flex gap-2 items-center">
                            <input
                              type="color"
                              value={editingTemplate?.borderColor}
                              onChange={(e) => updateTemplate({ borderColor: e.target.value })}
                              className="w-12 h-8 rounded border"
                            />
                            <Input
                              value={editingTemplate?.borderColor}
                              onChange={(e) => updateTemplate({ borderColor: e.target.value })}
                              className="flex-1"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label>Font Family</Label>
                          <Select
                            value={editingTemplate?.fontFamily}
                            onValueChange={(value) => updateTemplate({ fontFamily: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Inter">Inter (Sans-serif)</SelectItem>
                              <SelectItem value="serif">Serif</SelectItem>
                              <SelectItem value="monospace">Monospace</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="settings" className="space-y-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label>Show Company Logo</Label>
                          <Switch
                            checked={Boolean(editingTemplate?.logoVisible)}
                            onCheckedChange={(checked) => updateTemplate({ logoVisible: checked })}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Label>Show Notes Section</Label>
                          <Switch
                            checked={Boolean(editingTemplate?.showNotes)}
                            onCheckedChange={(checked) => updateTemplate({ showNotes: checked })}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Label>Show Terms & Conditions</Label>
                          <Switch
                            checked={Boolean(editingTemplate?.showTerms)}
                            onCheckedChange={(checked) => {
                              console.log('showTerms toggle:', checked);
                              updateTemplate({ showTerms: checked });
                            }}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Label>Show Payment Information</Label>
                          <Switch
                            checked={Boolean(editingTemplate?.showPayment)}
                            onCheckedChange={(checked) => updateTemplate({ showPayment: checked })}
                          />
                        </div>

                        {editingTemplate?.showNotes && (
                          <div>
                            <Label>Notes Content</Label>
                            <Textarea
                              value={editingTemplate?.notes || ""}
                              onChange={(e) => updateTemplate({ notes: e.target.value })}
                              placeholder="Enter notes content..."
                              rows={4}
                            />
                          </div>
                        )}

                        {editingTemplate?.showTerms && (
                          <div>
                            <Label>Terms & Conditions</Label>
                            <Textarea
                              value={editingTemplate?.terms || ""}
                              onChange={(e) => updateTemplate({ terms: e.target.value })}
                              placeholder="Enter terms and conditions..."
                              rows={4}
                            />
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                  
                  <div className="flex gap-3 mt-6">
                    <Button 
                      onClick={() => setSelectedTemplate(null)}
                      variant="outline"
                      className="flex-1"
                    >
                      Back to Templates
                    </Button>
                    <Button 
                      onClick={handleSaveTemplate}
                      disabled={createMutation.isPending || updateMutation.isPending}
                      className="flex-1"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Template"}
                    </Button>
                    <Button 
                      onClick={handleUseTemplate}
                      disabled={setDefaultMutation.isPending}
                      variant="default"
                      className="flex-1"
                    >
                      {setDefaultMutation.isPending ? "Setting..." : "Use This Template"}
                    </Button>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
            
            {/* Live Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Live Preview
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={!previewMode ? "default" : "outline"}
                    onClick={() => setPreviewMode(false)}
                  >
                    Desktop
                  </Button>
                  <Button
                    size="sm"
                    variant={previewMode ? "default" : "outline"}
                    onClick={() => setPreviewMode(true)}
                  >
                    Mobile
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className={previewMode ? "max-w-sm mx-auto" : ""}>
                    <div className="transform scale-75 origin-top">
                      {editingTemplate && selectedTemplate.id.includes("professional") ? (
                        <ProfessionalPreview template={editingTemplate} />
                      ) : editingTemplate ? (
                        <MinimalistPreview template={editingTemplate} />
                      ) : null}
                    </div>
                  </div>
                </ScrollArea>
                
                <div className="mt-4">
                  <Button className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Use This Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      
      <style>{`
        .clip-polygon {
          clip-path: polygon(0 0, 100% 0, 85% 100%, 0% 100%);
        }
        .clip-polygon-bottom {
          clip-path: polygon(15% 0, 100% 0, 100% 100%, 0% 100%);
        }
      `}</style>
    </DashboardLayout>
  );
}