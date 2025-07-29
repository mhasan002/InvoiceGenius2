import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Plus, Building, MapPin, Mail, Upload, Edit, Trash2, X } from 'lucide-react';
import type { CompanyProfile } from '@shared/schema';

interface CustomField {
  name: string;
  value: string;
}

export default function Company() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [companyName, setCompanyName] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [tagline, setTagline] = useState('');
  const [customFields, setCustomFields] = useState<CustomField[]>([{ name: '', value: '' }]);
  const [editingProfile, setEditingProfile] = useState<CompanyProfile | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch company profiles
  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['/api/company-profiles'],
    queryFn: () => fetch('/api/company-profiles', { credentials: 'include' }).then(res => res.json()),
  });

  // Profile mutations
  const createProfileMutation = useMutation({
    mutationFn: async (data: { name: string; email: string; address?: string; logoUrl?: string; tagline?: string; customFields: CustomField[] }) => {
      const response = await fetch('/api/company-profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create profile');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/company-profiles'] });
      resetForm();
      setDialogOpen(false);
      toast({ title: "Success", description: "Company profile created successfully." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create company profile.", variant: "destructive" });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { id: string; name: string; email: string; address?: string; logoUrl?: string; tagline?: string; customFields: CustomField[] }) => {
      const response = await fetch(`/api/company-profiles/${data.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          name: data.name, 
          email: data.email, 
          address: data.address, 
          logoUrl: data.logoUrl, 
          tagline: data.tagline,
          customFields: data.customFields 
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/company-profiles'] });
      resetForm();
      setDialogOpen(false);
      toast({ title: "Success", description: "Company profile updated successfully." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update company profile.", variant: "destructive" });
    },
  });

  const deleteProfileMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/company-profiles/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete profile');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/company-profiles'] });
      toast({ title: "Success", description: "Company profile deleted successfully." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete company profile.", variant: "destructive" });
    },
  });

  // Form management functions
  const handleSubmit = () => {
    if (!companyName.trim() || !companyEmail.trim()) {
      toast({
        title: "Validation Error",
        description: "Company name and email are required.",
        variant: "destructive"
      });
      return;
    }

    const validCustomFields = customFields.filter(field => field.name.trim() && field.value.trim());

    const profileData = {
      name: companyName.trim(),
      email: companyEmail.trim(),
      address: companyAddress.trim() || undefined,
      logoUrl: logoUrl.trim() || undefined,
      tagline: tagline.trim() || undefined,
      customFields: validCustomFields
    };

    if (editingProfile) {
      updateProfileMutation.mutate({ id: editingProfile.id, ...profileData });
    } else {
      createProfileMutation.mutate(profileData);
    }
  };

  const handleEdit = (profile: CompanyProfile) => {
    setEditingProfile(profile);
    setCompanyName(profile.name);
    setCompanyEmail(profile.email);
    setCompanyAddress(profile.address || '');
    setLogoUrl(profile.logoUrl || '');
    setTagline(profile.tagline || '');
    setCustomFields([...(profile.customFields as CustomField[] || []), { name: '', value: '' }]);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteProfileMutation.mutate(id);
  };

  const resetForm = () => {
    setCompanyName('');
    setCompanyEmail('');
    setCompanyAddress('');
    setLogoUrl('');
    setTagline('');
    setCustomFields([{ name: '', value: '' }]);
    setEditingProfile(null);
  };

  // Custom fields management
  const addCustomField = () => {
    setCustomFields(prev => [...prev, { name: '', value: '' }]);
  };

  const removeCustomField = (index: number) => {
    setCustomFields(prev => prev.filter((_, i) => i !== index));
  };

  const updateCustomField = (index: number, field: 'name' | 'value', value: string) => {
    setCustomFields(prev => prev.map((customField, i) => 
      i === index ? { ...customField, [field]: value } : customField
    ));
  };

  // Logo upload with base64 encoding for persistence
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (limit to 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({ 
          title: "File too large", 
          description: "Please select an image smaller than 2MB.", 
          variant: "destructive" 
        });
        return;
      }

      // Convert to base64 for persistent storage
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Result = e.target?.result as string;
        setLogoUrl(base64Result);
        toast({ title: "Logo Uploaded", description: "Logo has been uploaded successfully." });
      };
      reader.onerror = () => {
        toast({ 
          title: "Upload failed", 
          description: "Failed to process the image. Please try again.", 
          variant: "destructive" 
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <DashboardLayout 
      title="Company Profile" 
      description="Create and manage multiple company profiles with customizable fields"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Company Profiles
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Manage your company information and branding
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Profile
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProfile ? 'Edit Company Profile' : 'Add New Company Profile'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* Logo Upload Section */}
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={logoUrl} />
                    <AvatarFallback className="text-xl bg-primary/10">
                      {companyName.charAt(0) || 'C'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="mb-2"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Logo
                    </Button>
                    <p className="text-xs text-gray-500">
                      Recommended: 150x150px or larger
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Basic Information */}
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="company-name">Company Name *</Label>
                      <Input
                        id="company-name"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="e.g., Acme Corporation"
                      />
                    </div>
                    <div>
                      <Label htmlFor="company-email">Email *</Label>
                      <Input
                        id="company-email"
                        type="email"
                        value={companyEmail}
                        onChange={(e) => setCompanyEmail(e.target.value)}
                        placeholder="contact@company.com"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="company-tagline">Company Tagline</Label>
                    <Input
                      id="company-tagline"
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      placeholder="e.g., Innovation at its finest"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="company-address">Address</Label>
                    <Textarea
                      id="company-address"
                      value={companyAddress}
                      onChange={(e) => setCompanyAddress(e.target.value)}
                      placeholder="123 Business St, City, State 12345"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Custom Fields Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Custom Fields</Label>
                    <Button variant="outline" size="sm" onClick={addCustomField}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Field
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {customFields.map((field, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          placeholder="Field name (e.g., Phone Number)"
                          value={field.name}
                          onChange={(e) => updateCustomField(index, 'name', e.target.value)}
                          className="flex-1"
                        />
                        <Input
                          placeholder="Field value (e.g., +1 555-123-4567)"
                          value={field.value}
                          onChange={(e) => updateCustomField(index, 'value', e.target.value)}
                          className="flex-1"
                        />
                        {customFields.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCustomField(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} disabled={createProfileMutation.isPending || updateProfileMutation.isPending}>
                    {editingProfile ? 'Update' : 'Create'} Profile
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Company Profiles List */}
        {isLoading ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-gray-400 mb-4">Loading company profiles...</div>
            </CardContent>
          </Card>
        ) : profiles.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {profiles.map((profile: CompanyProfile) => (
              <Card key={profile.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={profile.logoUrl || undefined} />
                        <AvatarFallback className="bg-primary/10">
                          {profile.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{profile.name}</CardTitle>
                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {profile.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEdit(profile)}
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
                            <AlertDialogTitle>Delete Company Profile</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{profile.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDelete(profile.id)}
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
                  {profile.address && (
                    <div className="flex items-start mb-3">
                      <MapPin className="h-4 w-4 mr-2 mt-0.5 text-gray-400" />
                      <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">
                        {profile.address}
                      </p>
                    </div>
                  )}
                  
                  {profile.customFields && Array.isArray(profile.customFields) && profile.customFields.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">
                        Additional Information:
                      </h4>
                      <div className="space-y-1">
                        {(profile.customFields as CustomField[]).map((field: CustomField, index: number) => (
                          <div key={index} className="text-sm">
                            <span className="font-medium text-gray-600 dark:text-gray-400">
                              {field.name}:
                            </span>
                            <span className="ml-2 text-gray-800 dark:text-gray-200">
                              {field.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Building className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Company Profiles
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Create your first company profile to get started
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}