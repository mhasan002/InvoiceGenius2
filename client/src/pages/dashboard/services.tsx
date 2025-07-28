import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, DollarSign } from 'lucide-react';

export default function Services() {
  // Mock data - would come from API in real app
  const services = [
    {
      id: '1',
      name: 'Web Development',
      description: 'Custom website development and maintenance',
      rate: 75,
      unit: 'hour',
      category: 'Development'
    },
    {
      id: '2',
      name: 'UI/UX Design',
      description: 'User interface and experience design services',
      rate: 65,
      unit: 'hour',
      category: 'Design'
    },
    {
      id: '3',
      name: 'SEO Optimization',
      description: 'Search engine optimization and marketing',
      rate: 100,
      unit: 'project',
      category: 'Marketing'
    },
    {
      id: '4',
      name: 'Content Writing',
      description: 'Blog posts, articles, and web content creation',
      rate: 50,
      unit: 'hour',
      category: 'Content'
    }
  ];

  return (
    <DashboardLayout 
      title="List Services" 
      description="Manage your service offerings and pricing"
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Your Services
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Add and manage services you offer to clients
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Service
          </Button>
        </div>

        {/* Services Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Card key={service.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {service.category}
                    </p>
                  </div>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  {service.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-primary">
                    <DollarSign className="h-4 w-4 mr-1" />
                    <span className="font-semibold">${service.rate}</span>
                    <span className="text-sm text-gray-500 ml-1">
                      /{service.unit}
                    </span>
                  </div>
                  <Button variant="outline" size="sm">
                    Use in Invoice
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {services.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Plus className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Services Added
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Start by adding services you offer to your clients
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Service
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}