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
    mutationFn: async (connectionString: string) => {
      const response = await fetch('/api/config/database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ connectionString }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save database configuration');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Supabase database connected successfully!",
      });
      // Refetch the status to show updated connection
      window.location.reload();
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
              <h3 className="font-semibold text-blue-900 mb-2">🚀 Connect Your Supabase Database</h3>
              <div className="text-sm text-blue-800 space-y-2">
                <p><strong>Step-by-step guide:</strong></p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Go to the <a href="https://supabase.com/dashboard/projects" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600 font-medium">Supabase dashboard</a></li>
                  <li>Create a new project (choose a region close to you)</li>
                  <li>Wait for your project to be ready (2-3 minutes)</li>
                  <li>Click the <code className="bg-blue-200 px-1 py-0.5 rounded text-xs">Connect</code> button in the top toolbar</li>
                  <li>Under "Connection string" → "Transaction pooler", copy the URI</li>
                  <li>Replace <code className="bg-blue-200 px-1 py-0.5 rounded text-xs">[YOUR-PASSWORD]</code> with your database password</li>
                </ol>
                <div className="mt-3 p-2 bg-blue-100 rounded text-xs">
                  <strong>Example:</strong> <code>postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres</code>
                </div>
              </div>
              {dbStatus && (
                <div className="mt-4 p-3 bg-white rounded border">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${dbStatus.connected ? "bg-green-500" : "bg-red-500"}`}></div>
                    <p className="text-sm">
                      <strong>Status:</strong> {" "}
                      <span className={dbStatus.connected ? "text-green-600" : "text-red-600"}>
                        {dbStatus.connected ? "✅ Connected to Supabase" : "❌ Not Connected"}
                      </span>
                    </p>
                  </div>
                  {dbStatus.hasUrl && (
                    <p className="text-sm text-gray-600 mt-1">Database URL is configured and ready to use</p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="database-url" className="text-base font-medium">
                Supabase Connection String *
              </Label>
              <div className="relative">
                <Input
                  id="database-url"
                  type={showUrl ? "text" : "password"}
                  placeholder="postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
                  value={databaseUrl}
                  onChange={(e) => setDatabaseUrl(e.target.value)}
                  className="pr-10 text-sm"
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
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <div className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                <p>
                  Your connection string is securely stored and used to connect to your Supabase database. 
                  This enables invoice storage, user authentication, and data persistence.
                </p>
              </div>
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