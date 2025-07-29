import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, CreditCard, Building2, Coins, Edit, Trash2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type PaymentMethod } from "@shared/schema";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

interface CustomField {
  name: string;
  value: string;
}

export default function PaymentMethods() {
  const [paymentType, setPaymentType] = useState<'bank' | 'card' | 'crypto' | 'custom'>('bank');
  const [methodName, setMethodName] = useState('');
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const { toast } = useToast();

  // Fetch payment methods
  const { data: paymentMethods = [], isLoading } = useQuery({
    queryKey: ['/api/payment-methods'],
    queryFn: () => fetch('/api/payment-methods', { credentials: 'include' }).then(res => res.json()),
  });

  // Payment method mutations
  const createMutation = useMutation({
    mutationFn: (data: { type: string; name: string; fields: Record<string, string> }) =>
      apiRequest('POST', '/api/payment-methods', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payment-methods'] });
      resetForm();
      setDialogOpen(false);
      toast({ title: "Success", description: "Payment method added successfully." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add payment method.", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; type: string; name: string; fields: Record<string, string> }) =>
      apiRequest('PUT', `/api/payment-methods/${data.id}`, { type: data.type, name: data.name, fields: data.fields }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payment-methods'] });
      resetForm();
      setDialogOpen(false);
      toast({ title: "Success", description: "Payment method updated successfully." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update payment method.", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/payment-methods/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payment-methods'] });
      toast({ title: "Success", description: "Payment method deleted successfully." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete payment method.", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setPaymentType('bank');
    setMethodName('');
    setCustomFields([]);
    setEditingMethod(null);
  };

  const addCustomField = () => {
    setCustomFields([...customFields, { name: '', value: '' }]);
  };

  const updateCustomField = (index: number, field: 'name' | 'value', value: string) => {
    const updated = [...customFields];
    updated[index][field] = value;
    setCustomFields(updated);
  };

  const removeCustomField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const handleEdit = (method: PaymentMethod) => {
    setEditingMethod(method);
    setPaymentType(method.type as any);
    setMethodName(method.name);
    
    // Convert fields object to custom fields array
    const fields = Object.entries(method.fields as Record<string, string>).map(([name, value]) => ({ name, value }));
    setCustomFields(fields);
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!methodName.trim()) {
      toast({ title: "Error", description: "Please enter a method name.", variant: "destructive" });
      return;
    }

    // Convert custom fields array to object
    const fieldsObject = customFields.reduce((acc, field) => {
      if (field.name && field.value) {
        acc[field.name] = field.value;
      }
      return acc;
    }, {} as Record<string, string>);

    const data = {
      type: paymentType,
      name: methodName,
      fields: fieldsObject,
    };

    if (editingMethod) {
      updateMutation.mutate({ ...data, id: editingMethod.id });
    } else {
      createMutation.mutate(data);
    }
  };

  const getPaymentTypeIcon = (type: string) => {
    switch (type) {
      case 'bank': return <Building2 className="h-5 w-5" />;
      case 'card': return <CreditCard className="h-5 w-5" />;
      case 'crypto': return <Coins className="h-5 w-5" />;
      default: return <Edit className="h-5 w-5" />;
    }
  };

  const getPresetFields = (type: string) => {
    switch (type) {
      case 'bank':
        return [
          { name: 'Bank Name', placeholder: 'e.g., Chase Bank' },
          { name: 'Account Name', placeholder: 'e.g., John Doe' },
          { name: 'Account Number', placeholder: 'e.g., 123456789' },
          { name: 'Routing Number', placeholder: 'e.g., 987654321' },
        ];
      case 'card':
        return [
          { name: 'Cardholder Name', placeholder: 'e.g., John Doe' },
          { name: 'Card Number', placeholder: 'e.g., **** **** **** 4242' },
          { name: 'Expiry Date', placeholder: 'e.g., 12/25' },
        ];
      case 'crypto':
        return [
          { name: 'Wallet Type', placeholder: 'e.g., USDT-TRC20' },
          { name: 'Wallet Address', placeholder: 'e.g., TVZ89x...' },
        ];
      default:
        return [];
    }
  };

  return (
    <DashboardLayout title="Payment Methods">
      <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payment Methods</h1>
          <p className="text-gray-600 dark:text-gray-400">Add or manage how clients can pay you</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Payment Method
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingMethod ? 'Edit Payment Method' : 'Add New Payment Method'}
              </DialogTitle>
              <DialogDescription>
                Create a new payment method for your invoices. You can add custom fields as needed.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Payment Type Selector */}
              <div className="space-y-2">
                <Label>Payment Type</Label>
                <Select value={paymentType} onValueChange={(value: any) => setPaymentType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank">🏦 Bank Transfer</SelectItem>
                    <SelectItem value="card">💳 Card Payment</SelectItem>
                    <SelectItem value="crypto">🪙 Cryptocurrency</SelectItem>
                    <SelectItem value="custom">✍️ Custom Method</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Method Name */}
              <div className="space-y-2">
                <Label>Method Name</Label>
                <Input
                  value={methodName}
                  onChange={(e) => setMethodName(e.target.value)}
                  placeholder="e.g., My Bank Account, Business Card, etc."
                />
              </div>

              {/* Preset Fields */}
              {paymentType !== 'custom' && getPresetFields(paymentType).map((field, index) => {
                const existingField = customFields.find(f => f.name === field.name);
                const fieldIndex = customFields.findIndex(f => f.name === field.name);
                
                return (
                  <div key={field.name} className="space-y-2">
                    <Label>{field.name}</Label>
                    <Input
                      value={existingField?.value || ''}
                      onChange={(e) => {
                        if (fieldIndex >= 0) {
                          updateCustomField(fieldIndex, 'value', e.target.value);
                        } else {
                          setCustomFields([...customFields, { name: field.name, value: e.target.value }]);
                        }
                      }}
                      placeholder={field.placeholder}
                    />
                  </div>
                );
              })}

              {/* Custom Fields */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Custom Fields</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addCustomField}>
                    <Plus className="h-3 w-3 mr-1" />
                    Add Field
                  </Button>
                </div>
                
                {customFields.filter(field => !getPresetFields(paymentType).some(preset => preset.name === field.name)).map((field, index) => (
                  <div key={index} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Label className="text-xs">Field Name</Label>
                      <Input
                        value={field.name}
                        onChange={(e) => updateCustomField(customFields.indexOf(field), 'name', e.target.value)}
                        placeholder="e.g., Bkash Number"
                      />
                    </div>
                    <div className="flex-1">
                      <Label className="text-xs">Value</Label>
                      <Input
                        value={field.value}
                        onChange={(e) => updateCustomField(customFields.indexOf(field), 'value', e.target.value)}
                        placeholder="e.g., 017..."
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCustomField(customFields.indexOf(field))}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingMethod ? 'Update Method' : 'Add Method'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Payment Methods List */}
      <div className="grid gap-6">
        {isLoading ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center">Loading payment methods...</div>
            </CardContent>
          </Card>
        ) : paymentMethods.length > 0 ? (
          paymentMethods.map((method: PaymentMethod) => (
            <Card key={method.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      {getPaymentTypeIcon(method.type)}
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {method.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                          {method.type} Payment
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Object.entries(method.fields as Record<string, string>).map(([key, value]) => (
                        <div key={key} className="text-sm">
                          <span className="font-medium text-gray-600 dark:text-gray-400">{key}:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(method)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Payment Method</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{method.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => deleteMutation.mutate(method.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Payment Methods Added
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Start by adding payment methods for your invoices
              </p>
            </CardContent>
          </Card>
        )}
      </div>
      </div>
    </DashboardLayout>
  );
}