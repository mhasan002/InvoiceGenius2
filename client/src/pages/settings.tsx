import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Database, Save, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import Navigation from "@/components/navigation";

export default function Settings() {
  const [databaseUrl, setDatabaseUrl] = useState("");
  const [showUrl, setShowUrl] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Fetch current database status
  const { data: dbStatus } = useQuery({
    queryKey: ["/api/config/database/status"],
    queryFn: () => fetch("/api/config/database/status").then(res => res.json()),
  });

  // Save database configuration mutation
  const saveDatabaseMutation = useMutation({
    mutationFn: (connectionString: string) => 
      apiRequest('/api/config/database', {
        method: 'POST',
        body: { connectionString }
      }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Database connection saved successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save database connection",
        variant: "destructive",
      });
    }
  });

  const handleSave = async () => {
    if (!databaseUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter your Supabase connection string",
        variant: "destructive",
      });
      return;
    }

    saveDatabaseMutation.mutate(databaseUrl);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="pt-20 pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" data-testid="button-back-home">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600 mt-2">Configure your invoice generator settings</p>
            </div>
          </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="mr-2 h-5 w-5" />
              Database Configuration
            </CardTitle>
            <CardDescription>
              Connect your Supabase database to store invoices and user data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">How to get your Supabase connection string:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                <li>Go to the <a href="https://supabase.com/dashboard/projects" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">Supabase dashboard</a></li>
                <li>Create a new project if you haven't already</li>
                <li>Once in the project page, click the "Connect" button on the top toolbar</li>
                <li>Copy URI value under "Connection string" → "Transaction pooler"</li>
                <li>Replace [YOUR-PASSWORD] with the database password you set for the project</li>
              </ol>
              {dbStatus && (
                <div className="mt-4 p-3 bg-white rounded border">
                  <p className="text-sm">
                    <strong>Status:</strong> {" "}
                    <span className={dbStatus.connected ? "text-green-600" : "text-red-600"}>
                      {dbStatus.connected ? "Connected" : "Not Connected"}
                    </span>
                  </p>
                  {dbStatus.hasUrl && (
                    <p className="text-sm text-gray-600 mt-1">Database URL is configured</p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="database-url">Supabase Connection String</Label>
              <div className="relative">
                <Input
                  id="database-url"
                  type={showUrl ? "text" : "password"}
                  placeholder="postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
                  value={databaseUrl}
                  onChange={(e) => setDatabaseUrl(e.target.value)}
                  className="pr-10"
                  data-testid="input-database-url"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowUrl(!showUrl)}
                  data-testid="button-toggle-url-visibility"
                >
                  {showUrl ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                Your connection string will be securely stored and used to connect to your Supabase database
              </p>
            </div>

            <Button
              onClick={handleSave}
              disabled={saveDatabaseMutation.isPending}
              className="w-full sm:w-auto"
              data-testid="button-save-settings"
            >
              <Save className="mr-2 h-4 w-4" />
              {saveDatabaseMutation.isPending ? "Saving..." : "Save Configuration"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Database Schema</CardTitle>
            <CardDescription>
              The following tables will be created in your Supabase database
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              readOnly
              value={`-- Users table for authentication
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invoices table for storing invoice data
CREATE TABLE invoices (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  invoice_number VARCHAR(100) UNIQUE NOT NULL,
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255),
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`}
              className="h-64 font-mono text-sm"
              data-testid="textarea-database-schema"
            />
            <p className="text-sm text-gray-500 mt-2">
              These tables will be automatically created when you first connect to your database
            </p>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}