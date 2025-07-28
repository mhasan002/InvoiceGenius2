import { useState } from "react";
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
import { FileText, Palette, Settings, Eye, Save, Download } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

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
    showTerms: false,
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

  const handleSelectTemplate = (template: TemplateConfig) => {
    const clonedTemplate = { ...template, id: `${template.id}_${Date.now()}` };
    setSelectedTemplate(clonedTemplate);
    setEditingTemplate(clonedTemplate);
  };

  const updateTemplate = (updates: Partial<TemplateConfig>) => {
    if (editingTemplate) {
      setEditingTemplate({ ...editingTemplate, ...updates });
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

  const ProfessionalPreview = ({ template }: { template: TemplateConfig }) => (
    <div className="bg-white p-8 shadow-lg rounded-lg max-w-2xl mx-auto" style={{ color: template.textColor, fontFamily: template.fontFamily }}>
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-4xl font-light tracking-wider mb-2" style={{ color: template.primaryColor }}>
            INVOICE
          </h1>
          <p className="text-sm" style={{ color: template.textColor }}>
            INVOICE NUMBER • 01234511
          </p>
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
          <h3 className="font-semibold mb-2">Your Company Name:</h3>
          <div className="text-sm space-y-1">
            <p>YOUR NAME</p>
            <p>123 ANYWHERE ST., ANY CITY</p>
            <p>HELLO@REALLYGREATSITE.COM</p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <p><strong>DATE:</strong> 02/02/2024</p>
        <hr className="mt-2" style={{ borderColor: template.borderColor }} />
      </div>

      {/* Items Table */}
      <div className="mb-8">
        <div className="grid grid-cols-4 gap-4 p-3 text-sm font-medium" style={{ backgroundColor: '#f3f4f6' }}>
          {template.fields.filter(f => f.visible).map(field => (
            <div key={field.id} className="uppercase">
              {field.customLabel || field.label}
            </div>
          ))}
        </div>
        
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="grid grid-cols-4 gap-4 p-3 text-sm border-b" style={{ borderColor: template.borderColor }}>
            <div>YOUR DESCRIPTION</div>
            <div>$ 25.00</div>
            <div>2</div>
            <div>$ 50.00</div>
          </div>
        ))}

        {/* Totals */}
        <div className="mt-6 ml-auto w-64">
          <div className="flex justify-between py-2">
            <span><strong>SUB-TOTAL:</strong></span>
            <span>$ 200.00</span>
          </div>
          <div className="flex justify-between py-2">
            <span><strong>PACKAGE DISCOUNT (0%):</strong></span>
            <span>$ 0.00</span>
          </div>
          <div className="flex justify-between py-2 font-bold" style={{ backgroundColor: template.borderColor }}>
            <span>TOTAL DUE</span>
            <span>$ 200.00</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="grid grid-cols-2 gap-8 mt-8">
        <div>
          {template.showNotes && (
            <>
              <h4 className="font-semibold mb-2">PLEASE SEND REMITTANCE TO:</h4>
              <p className="text-sm">HELLO@REALLYGREATSITE.COM</p>
              <br />
              <p className="text-sm">
                <strong>PAYMENT IS REQUIRED WITHIN 10</strong><br />
                BUSINESS DAYS OF INVOICE DATE.
              </p>
            </>
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
              <div className="w-8 h-8 mr-3" style={{ backgroundColor: template.primaryColor }}>
                <svg viewBox="0 0 32 32" className="w-full h-full p-1 text-white">
                  <path fill="currentColor" d="M16 8l8 8-8 8-8-8z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold">Borcelle</h1>
                <p className="text-sm text-gray-600">Meet All Your Needs</p>
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
                <p>Borcelle Bank</p>
                <p>Account Name: Adeline Palmerston</p>
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
            <div className="grid grid-cols-4 gap-4 pb-2 border-b-2" style={{ borderColor: template.primaryColor }}>
              {template.fields.filter(f => f.visible).map(field => (
                <div key={field.id} className="font-semibold text-sm uppercase">
                  {field.customLabel || field.label}
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
              <div key={idx} className="grid grid-cols-4 gap-4 py-2 text-sm border-b" style={{ borderColor: template.borderColor }}>
                <div>{item.desc}</div>
                <div>{item.price}</div>
                <div>{item.qty}</div>
                <div>${item.price * item.qty}</div>
              </div>
            ))}

            {/* Totals */}
            <div className="mt-6 ml-auto w-64">
              <hr className="mb-2" style={{ borderColor: template.primaryColor }} />
              <div className="text-right space-y-1">
                <div className="flex justify-between">
                  <span><strong>SUBTOTAL</strong></span>
                  <span>$400</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax 10%</span>
                  <span></span>
                </div>
                <div className="flex justify-between font-bold">
                  <span><strong>TOTAL</strong></span>
                  <span>$440</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="grid grid-cols-2 gap-8 mt-8">
            <div>
              {template.showNotes && (
                <p className="text-lg font-medium">
                  Thank you for your<br />business!
                </p>
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
                    Select Template
                  </Button>
                </CardContent>
              </Card>
            ))}
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
                          <div key={index} className="flex gap-2 mb-2">
                            <Input
                              value={field.name}
                              onChange={(e) => {
                                const updated = [...editingTemplate.customFields];
                                updated[index] = { ...updated[index], name: e.target.value };
                                updateTemplate({ customFields: updated });
                              }}
                              placeholder="Field name"
                            />
                            <Input
                              value={field.value}
                              onChange={(e) => {
                                const updated = [...editingTemplate.customFields];
                                updated[index] = { ...updated[index], value: e.target.value };
                                updateTemplate({ customFields: updated });
                              }}
                              placeholder="Field value"
                            />
                            <Button 
                              onClick={() => removeCustomField(index)}
                              size="sm" 
                              variant="outline"
                            >
                              Remove
                            </Button>
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
                            checked={editingTemplate?.logoVisible}
                            onCheckedChange={(checked) => updateTemplate({ logoVisible: checked })}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Label>Show Notes Section</Label>
                          <Switch
                            checked={editingTemplate?.showNotes}
                            onCheckedChange={(checked) => updateTemplate({ showNotes: checked })}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Label>Show Terms & Conditions</Label>
                          <Switch
                            checked={editingTemplate?.showTerms}
                            onCheckedChange={(checked) => updateTemplate({ showTerms: checked })}
                          />
                        </div>
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
                    <Button className="flex-1">
                      <Save className="h-4 w-4 mr-2" />
                      Save Template
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