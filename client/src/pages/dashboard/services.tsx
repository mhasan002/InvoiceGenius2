import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Plus, Edit, Trash2, DollarSign, Wrench, Package, X } from 'lucide-react';
import type { Service, Package as ServicePackage } from '@shared/schema';

interface PackageService {
  name: string;
  quantity?: number;
}

export default function Services() {
  const [activeTab, setActiveTab] = useState('services');
  const queryClient = useQueryClient();
  
  // Service form states
  const [serviceName, setServiceName] = useState('');
  const [servicePrice, setServicePrice] = useState('');
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  
  // Package form states
  const [packageName, setPackageName] = useState('');
  const [packagePrice, setPackagePrice] = useState('');
  const [packageServices, setPackageServices] = useState<PackageService[]>([{ name: '', quantity: undefined }]);
  const [editingPackage, setEditingPackage] = useState<ServicePackage | null>(null);
  const [packageDialogOpen, setPackageDialogOpen] = useState(false);
  
  const { toast } = useToast();

  // Fetch services
  const { data: services = [], isLoading: servicesLoading } = useQuery({
    queryKey: ['/api/services'],
    queryFn: () => fetch('/api/services', { credentials: 'include' }).then(res => res.json()),
  });

  // Fetch packages
  const { data: packages = [], isLoading: packagesLoading } = useQuery({
    queryKey: ['/api/packages'],
    queryFn: () => fetch('/api/packages', { credentials: 'include' }).then(res => res.json()),
  });

  // Service mutations
  const createServiceMutation = useMutation({
    mutationFn: (data: { name: string; unitPrice: string }) =>
      apiRequest('/api/services', 'POST', { name: data.name, unitPrice: data.unitPrice }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/services'] });
      resetServiceForm();
      setServiceDialogOpen(false);
      toast({ title: "Success", description: "Service added successfully." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add service.", variant: "destructive" });
    },
  });

  const updateServiceMutation = useMutation({
    mutationFn: (data: { id: string; name: string; unitPrice: string }) =>
      apiRequest(`/api/services/${data.id}`, 'PUT', { name: data.name, unitPrice: data.unitPrice }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/services'] });
      resetServiceForm();
      setServiceDialogOpen(false);
      toast({ title: "Success", description: "Service updated successfully." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update service.", variant: "destructive" });
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/services/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/services'] });
      toast({ title: "Success", description: "Service deleted successfully." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete service.", variant: "destructive" });
    },
  });

  // Package mutations
  const createPackageMutation = useMutation({
    mutationFn: (data: { name: string; price: string; services: PackageService[] }) =>
      apiRequest('/api/packages', 'POST', { name: data.name, price: data.price, services: data.services }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/packages'] });
      resetPackageForm();
      setPackageDialogOpen(false);
      toast({ title: "Success", description: "Package created successfully." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create package.", variant: "destructive" });
    },
  });

  const updatePackageMutation = useMutation({
    mutationFn: (data: { id: string; name: string; price: string; services: PackageService[] }) =>
      apiRequest(`/api/packages/${data.id}`, 'PUT', { name: data.name, price: data.price, services: data.services }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/packages'] });
      resetPackageForm();
      setPackageDialogOpen(false);
      toast({ title: "Success", description: "Package updated successfully." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update package.", variant: "destructive" });
    },
  });

  const deletePackageMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/packages/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/packages'] });
      toast({ title: "Success", description: "Package deleted successfully." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete package.", variant: "destructive" });
    },
  });

  // Service management functions
  const handleAddService = () => {
    if (!serviceName.trim() || !servicePrice || parseFloat(servicePrice) <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid service name and positive price.",
        variant: "destructive"
      });
      return;
    }

    createServiceMutation.mutate({
      name: serviceName.trim(),
      unitPrice: servicePrice
    });
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setServiceName(service.name);
    setServicePrice(service.unitPrice.toString());
    setServiceDialogOpen(true);
  };

  const handleUpdateService = () => {
    if (!serviceName.trim() || !servicePrice || parseFloat(servicePrice) <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid service name and positive price.",
        variant: "destructive"
      });
      return;
    }

    if (editingService) {
      updateServiceMutation.mutate({
        id: editingService.id,
        name: serviceName.trim(),
        unitPrice: servicePrice
      });
    }
  };

  const handleDeleteService = (id: string) => {
    deleteServiceMutation.mutate(id);
  };

  const resetServiceForm = () => {
    setServiceName('');
    setServicePrice('');
    setEditingService(null);
  };

  // Package management functions
  const handleAddPackage = () => {
    if (!packageName.trim() || !packagePrice || parseFloat(packagePrice) <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid package name and positive price.",
        variant: "destructive"
      });
      return;
    }

    const validServices = packageServices.filter(s => s.name.trim());
    if (validServices.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one service to the package.",
        variant: "destructive"
      });
      return;
    }

    createPackageMutation.mutate({
      name: packageName.trim(),
      price: packagePrice,
      services: validServices.map(s => ({
        name: s.name.trim(),
        quantity: s.quantity && s.quantity > 0 ? s.quantity : undefined
      }))
    });
  };

  const handleEditPackage = (pkg: ServicePackage) => {
    setEditingPackage(pkg);
    setPackageName(pkg.name);
    setPackagePrice(pkg.price.toString());
    setPackageServices([...(pkg.services as PackageService[]), { name: '', quantity: undefined }]);
    setPackageDialogOpen(true);
  };

  const handleUpdatePackage = () => {
    if (!packageName.trim() || !packagePrice || parseFloat(packagePrice) <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid package name and positive price.",
        variant: "destructive"
      });
      return;
    }

    const validServices = packageServices.filter(s => s.name.trim());
    if (validServices.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one service to the package.",
        variant: "destructive"
      });
      return;
    }

    if (editingPackage) {
      updatePackageMutation.mutate({
        id: editingPackage.id,
        name: packageName.trim(),
        price: packagePrice,
        services: validServices.map(s => ({
          name: s.name.trim(),
          quantity: s.quantity && s.quantity > 0 ? s.quantity : undefined
        }))
      });
    }
  };

  const handleDeletePackage = (id: string) => {
    deletePackageMutation.mutate(id);
  };

  const resetPackageForm = () => {
    setPackageName('');
    setPackagePrice('');
    setPackageServices([{ name: '', quantity: undefined }]);
    setEditingPackage(null);
  };

  const addPackageService = () => {
    setPackageServices(prev => [...prev, { name: '', quantity: undefined }]);
  };

  const removePackageService = (index: number) => {
    setPackageServices(prev => prev.filter((_, i) => i !== index));
  };

  const updatePackageService = (index: number, field: 'name' | 'quantity', value: string | number) => {
    setPackageServices(prev => prev.map((service, i) => 
      i === index 
        ? { ...service, [field]: field === 'quantity' ? (value as number || undefined) : value }
        : service
    ));
  };

  return (
    <DashboardLayout 
      title="List Services" 
      description="Add services or create custom packages for invoicing"
    >
      <div className="space-y-6">
        {/* Tabs */}
        <Tabs defaultValue="services" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="services" className="flex items-center">
              <Wrench className="h-4 w-4 mr-2" />
              Services
            </TabsTrigger>
            <TabsTrigger value="packages" className="flex items-center">
              <Package className="h-4 w-4 mr-2" />
              Packages
            </TabsTrigger>
          </TabsList>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Your Services
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Manage individual services with unit pricing
                </p>
              </div>
              <Dialog open={serviceDialogOpen} onOpenChange={setServiceDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => resetServiceForm()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Service
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingService ? 'Edit Service' : 'Add New Service'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="service-name">Service Name</Label>
                      <Input
                        id="service-name"
                        placeholder="e.g., Facebook Ads"
                        value={serviceName}
                        onChange={(e) => setServiceName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="service-price">Unit Price ($)</Label>
                      <Input
                        id="service-price"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="e.g., 500"
                        value={servicePrice}
                        onChange={(e) => setServicePrice(e.target.value)}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setServiceDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={editingService ? handleUpdateService : handleAddService}>
                        {editingService ? 'Update' : 'Add'} Service
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Services Table */}
            {servicesLoading ? (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="text-gray-400 mb-4">Loading services...</div>
                </CardContent>
              </Card>
            ) : services.length > 0 ? (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-4 px-6 font-medium text-gray-700 dark:text-gray-300">
                            Service Name
                          </th>
                          <th className="text-left py-4 px-6 font-medium text-gray-700 dark:text-gray-300">
                            Unit Price
                          </th>
                          <th className="text-left py-4 px-6 font-medium text-gray-700 dark:text-gray-300">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {services.map((service: Service) => (
                          <tr key={service.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">
                              {service.name}
                            </td>
                            <td className="py-4 px-6 text-gray-700 dark:text-gray-300">
                              ${parseFloat(service.unitPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex space-x-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleEditService(service)}
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
                                      <AlertDialogTitle>Delete Service</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete "{service.name}"? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction 
                                        onClick={() => handleDeleteService(service.id)}
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Wrench className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Services Added
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Start by adding services you offer to your clients
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Packages Tab */}
          <TabsContent value="packages" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Your Packages
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Create custom service bundles with fixed pricing
                </p>
              </div>
              <Dialog open={packageDialogOpen} onOpenChange={setPackageDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => resetPackageForm()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Package
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingPackage ? 'Edit Package' : 'Create New Package'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="package-name">Package Name</Label>
                      <Input
                        id="package-name"
                        placeholder="e.g., FB Ads & Graphics"
                        value={packageName}
                        onChange={(e) => setPackageName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="package-price">Package Price ($)</Label>
                      <Input
                        id="package-price"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="e.g., 300"
                        value={packagePrice}
                        onChange={(e) => setPackagePrice(e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label>Package Services</Label>
                      <div className="space-y-2 mt-2">
                        {packageServices.map((service, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <Input
                              placeholder="Service name"
                              value={service.name}
                              onChange={(e) => updatePackageService(index, 'name', e.target.value)}
                              className="flex-1"
                            />
                            <Input
                              type="number"
                              placeholder="Qty (optional)"
                              value={service.quantity || ''}
                              onChange={(e) => updatePackageService(index, 'quantity', parseInt(e.target.value))}
                              className="w-32"
                            />
                            {packageServices.length > 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removePackageService(index)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={addPackageService}
                          className="w-full"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Another Service
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setPackageDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={editingPackage ? handleUpdatePackage : handleAddPackage}>
                        {editingPackage ? 'Update' : 'Create'} Package
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Packages Grid */}
            {packagesLoading ? (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="text-gray-400 mb-4">Loading packages...</div>
                </CardContent>
              </Card>
            ) : packages.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {packages.map((pkg: ServicePackage) => (
                  <Card key={pkg.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{pkg.name}</CardTitle>
                          <p className="text-lg font-semibold text-primary mt-1">
                            ${parseFloat(pkg.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                        <div className="flex space-x-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditPackage(pkg)}
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
                                <AlertDialogTitle>Delete Package</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{pkg.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeletePackage(pkg.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">
                          Included Services:
                        </h4>
                        <div className="space-y-1">
                          {(pkg.services as PackageService[]).map((service, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">
                                {service.name}
                              </span>
                              {service.quantity && (
                                <Badge variant="secondary" className="text-xs">
                                  Qty: {service.quantity}
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Packages Created
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Create custom service bundles with fixed pricing
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}