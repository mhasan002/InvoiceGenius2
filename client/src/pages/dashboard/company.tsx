import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Building2, Mail, Phone, MapPin, Globe, Save } from 'lucide-react';

export default function Company() {
  return (
    <DashboardLayout 
      title="Company Profile" 
      description="Manage your company information and branding"
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="company-name">Company Name</Label>
                <Input 
                  id="company-name" 
                  placeholder="Your Company Name"
                  defaultValue="InvoiceGen Solutions"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-type">Business Type</Label>
                <Input 
                  id="company-type" 
                  placeholder="e.g., LLC, Corporation, Partnership"
                  defaultValue="LLC"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company-description">Company Description</Label>
              <Textarea 
                id="company-description"
                placeholder="Brief description of your company..."
                rows={4}
                defaultValue="Professional invoice generation and business management solutions for modern enterprises."
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tax-id">Tax ID / EIN</Label>
                <Input 
                  id="tax-id" 
                  placeholder="12-3456789"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="registration">Registration Number</Label>
                <Input 
                  id="registration" 
                  placeholder="Registration number"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Address Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Street Address</Label>
              <Input 
                id="address" 
                placeholder="123 Business Street"
                defaultValue="123 Tech Boulevard"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input 
                  id="city" 
                  placeholder="City"
                  defaultValue="San Francisco"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State/Province</Label>
                <Input 
                  id="state" 
                  placeholder="State"
                  defaultValue="CA"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip">ZIP/Postal Code</Label>
                <Input 
                  id="zip" 
                  placeholder="12345"
                  defaultValue="94102"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input 
                id="country" 
                placeholder="Country"
                defaultValue="United States"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Phone className="h-5 w-5 mr-2" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex">
                  <Phone className="h-4 w-4 mt-3 mr-2 text-gray-400" />
                  <Input 
                    id="phone" 
                    placeholder="+1 (555) 123-4567"
                    defaultValue="+1 (555) 987-6543"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Business Email</Label>
                <div className="flex">
                  <Mail className="h-4 w-4 mt-3 mr-2 text-gray-400" />
                  <Input 
                    id="email" 
                    type="email"
                    placeholder="contact@company.com"
                    defaultValue="contact@invoicegen.com"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <div className="flex">
                <Globe className="h-4 w-4 mt-3 mr-2 text-gray-400" />
                <Input 
                  id="website" 
                  placeholder="https://www.company.com"
                  defaultValue="https://www.invoicegen.com"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button className="flex items-center">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}