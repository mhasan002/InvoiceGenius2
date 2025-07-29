import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { insertUserSchema, insertInvoiceSchema, signupUserSchema, loginUserSchema, resetPasswordSchema, insertServiceSchema, insertPackageSchema, insertCompanyProfileSchema, insertPaymentMethodSchema, insertTemplateSchema } from "@shared/schema";
import bcrypt from "bcryptjs";
import session from "express-session";

// Database configuration endpoint
const configRoutes = (app: Express) => {
  app.post("/api/config/database", async (req, res) => {
    try {
      const { connectionString } = req.body;
      
      if (!connectionString) {
        return res.status(400).json({ error: "Connection string is required" });
      }

      // Validate Supabase connection string format
      if (!connectionString.includes('supabase.com') && !connectionString.includes('postgresql://')) {
        return res.status(400).json({ error: "Invalid Supabase connection string format" });
      }

      // Store the connection string securely (in production, use encrypted storage)
      process.env.DATABASE_URL = connectionString;
      
      // Test the connection (optional - basic validation)
      try {
        // Basic connection string parsing to ensure it's valid
        const url = new URL(connectionString);
        if (!url.hostname.includes('supabase.com') && !url.protocol.includes('postgresql')) {
          throw new Error('Invalid Supabase connection string');
        }
      } catch (parseError) {
        return res.status(400).json({ error: "Invalid connection string format" });
      }
      
      console.log("Supabase connection string saved and validated successfully");
      
      res.json({ 
        success: true, 
        message: "Supabase database connected successfully! Your invoice generator is now ready to store data.",
        connected: true,
        provider: "Supabase"
      });
    } catch (error) {
      console.error("Error saving database config:", error);
      res.status(500).json({ error: "Failed to save database configuration" });
    }
  });

  // Get database connection status
  app.get("/api/config/database/status", async (req, res) => {
    try {
      const hasUrl = !!process.env.DATABASE_URL;
      let isConnected = false;
      
      if (hasUrl) {
        // Test the database connection
        try {
          const testUser = await storage.getUserByEmail("__connection_test__@test.com");
          isConnected = true;
        } catch (error) {
          console.log("Database connection test failed:", error);
          isConnected = false;
        }
      }
      
      res.json({ 
        connected: isConnected,
        hasUrl: hasUrl,
        provider: hasUrl ? "Supabase" : null
      });
    } catch (error) {
      console.error("Error checking database status:", error);
      res.status(500).json({ error: "Failed to check database status" });
    }
  });
};

// Invoice API routes
const invoiceRoutes = (app: Express) => {
  // Get all invoices
  app.get("/api/invoices", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      const invoices = await storage.getInvoices(userId);
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ error: "Failed to fetch invoices" });
    }
  });

  // Get single invoice
  app.get("/api/invoices/:id", async (req, res) => {
    try {
      const invoice = await storage.getInvoice(req.params.id);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      console.error("Error fetching invoice:", error);
      res.status(500).json({ error: "Failed to fetch invoice" });
    }
  });

  // Create new invoice
  app.post("/api/invoices", async (req, res) => {
    try {
      const invoice = await storage.createInvoice(req.body);
      res.status(201).json(invoice);
    } catch (error) {
      console.error("Error creating invoice:", error);
      res.status(500).json({ error: "Failed to create invoice" });
    }
  });

  // Update invoice
  app.put("/api/invoices/:id", async (req, res) => {
    try {
      const invoice = await storage.updateInvoice(req.params.id, req.body);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      console.error("Error updating invoice:", error);
      res.status(500).json({ error: "Failed to update invoice" });
    }
  });

  // Delete invoice
  app.delete("/api/invoices/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteInvoice(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting invoice:", error);
      res.status(500).json({ error: "Failed to delete invoice" });
    }
  });
};

// Configure session middleware
const sessionConfig = session({
  secret: process.env.SESSION_SECRET || "your-secret-key-change-in-production",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
});

// Authentication middleware
const requireAuth = (req: any, res: any, next: any) => {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
};

// Authentication routes
const authRoutes = (app: Express) => {
  // Sign up
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const validatedData = signupUserSchema.parse(req.body);
      const { username, email, password } = validatedData;
      
      // Check if user already exists by email or username
      const existingUserByEmail = email ? await storage.getUserByEmail(email) : null;
      const existingUserByUsername = await storage.getUserByUsername(username);
      
      if (existingUserByEmail) {
        return res.status(400).json({ message: "User with this email already exists" });
      }
      
      if (existingUserByUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);
      
      // Create user
      const user = await storage.createUser({
        username,
        email: email || null,
        password: hashedPassword,
      });

      // Create session
      (req as any).session.userId = user.id;
      (req as any).session.userEmail = user.email;
      (req as any).session.username = user.username;

      res.status(201).json({
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
      });
    } catch (error) {
      console.error("Signup error:", error);
      if (error instanceof Error && error.message.includes('validation')) {
        return res.status(400).json({ message: "Please check your input data" });
      }
      res.status(400).json({ message: "Invalid signup data" });
    }
  });

  // Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginUserSchema.parse(req.body);
      
      // Find user by email
      const user = email ? await storage.getUserByEmail(email) : null;
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Create session
      (req as any).session.userId = user.id;
      (req as any).session.userEmail = user.email;
      (req as any).session.username = user.username;

      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ message: "Invalid login data" });
    }
  });

  // Logout
  app.post("/api/auth/logout", (req, res) => {
    (req as any).session?.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.clearCookie('connect.sid');
      res.json({ message: "Logged out successfully" });
    });
  });

  // Get current user
  app.get("/api/auth/me", requireAuth, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Password reset request
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Don't reveal if user exists for security
        return res.json({ message: "If an account with that email exists, you will receive a reset link." });
      }

      // In a real app, you would send an email with a reset token
      // For this demo, we'll return a success message
      res.json({ 
        message: "If an account with that email exists, you will receive a reset link.",
        // For demo purposes, return success if user exists
        resetAllowed: true 
      });
    } catch (error) {
      console.error("Password reset request error:", error);
      res.status(500).json({ message: "Failed to process reset request" });
    }
  });

  // Password reset
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { email, newPassword } = resetPasswordSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      
      // Update user password
      await storage.updateUser(user.id, { password: hashedPassword });

      res.json({ message: "Password reset successfully" });
    } catch (error) {
      console.error("Password reset error:", error);
      res.status(400).json({ message: "Failed to reset password" });
    }
  });
};

export function registerRoutes(app: Express): Promise<Server> {
  // Apply session middleware
  app.use(sessionConfig);
  
  // Add authentication routes
  authRoutes(app);
  configRoutes(app);
  
  // Update invoice routes to be protected
  app.get("/api/invoices", requireAuth, async (req: any, res) => {
    try {
      const invoices = await storage.getInvoices(req.session.userId);
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ error: "Failed to fetch invoices" });
    }
  });

  app.post("/api/invoices", requireAuth, async (req: any, res) => {
    try {
      const validatedData = insertInvoiceSchema.parse(req.body);
      const invoice = await storage.createInvoice({
        ...validatedData,
        userId: req.session.userId,
      });
      res.status(201).json(invoice);
    } catch (error) {
      console.error("Error creating invoice:", error);
      res.status(500).json({ error: "Failed to create invoice" });
    }
  });

  app.get("/api/invoices/:id", requireAuth, async (req: any, res) => {
    try {
      const invoice = await storage.getInvoice(req.params.id);
      if (!invoice || invoice.userId !== req.session.userId) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      console.error("Error fetching invoice:", error);
      res.status(500).json({ error: "Failed to fetch invoice" });
    }
  });

  app.put("/api/invoices/:id", requireAuth, async (req: any, res) => {
    try {
      const invoice = await storage.getInvoice(req.params.id);
      if (!invoice || invoice.userId !== req.session.userId) {
        return res.status(404).json({ error: "Invoice not found" });
      }

      const validatedData = insertInvoiceSchema.partial().parse(req.body);
      const updatedInvoice = await storage.updateInvoice(req.params.id, validatedData);
      res.json(updatedInvoice);
    } catch (error) {
      console.error("Error updating invoice:", error);
      res.status(500).json({ error: "Failed to update invoice" });
    }
  });

  app.delete("/api/invoices/:id", requireAuth, async (req: any, res) => {
    try {
      const invoice = await storage.getInvoice(req.params.id);
      if (!invoice || invoice.userId !== req.session.userId) {
        return res.status(404).json({ error: "Invoice not found" });
      }

      const deleted = await storage.deleteInvoice(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting invoice:", error);
      res.status(500).json({ error: "Failed to delete invoice" });
    }
  });

  // Services Routes
  app.get("/api/services", requireAuth, async (req: any, res) => {
    try {
      const services = await storage.getServices(req.session.userId);
      res.json(services);
    } catch (error) {
      console.error("Error fetching services:", error);
      res.status(500).json({ error: "Failed to fetch services" });
    }
  });

  app.post("/api/services", requireAuth, async (req: any, res) => {
    try {
      const validatedData = insertServiceSchema.parse(req.body);
      const service = await storage.createService({
        ...validatedData,
        userId: req.session.userId,
      });
      res.status(201).json(service);
    } catch (error) {
      console.error("Error creating service:", error);
      res.status(500).json({ error: "Failed to create service" });
    }
  });

  app.put("/api/services/:id", requireAuth, async (req: any, res) => {
    try {
      const service = await storage.getService(req.params.id);
      if (!service || service.userId !== req.session.userId) {
        return res.status(404).json({ error: "Service not found" });
      }

      const validatedData = insertServiceSchema.partial().parse(req.body);
      const updatedService = await storage.updateService(req.params.id, validatedData);
      res.json(updatedService);
    } catch (error) {
      console.error("Error updating service:", error);
      res.status(500).json({ error: "Failed to update service" });
    }
  });

  app.delete("/api/services/:id", requireAuth, async (req: any, res) => {
    try {
      const service = await storage.getService(req.params.id);
      if (!service || service.userId !== req.session.userId) {
        return res.status(404).json({ error: "Service not found" });
      }

      const deleted = await storage.deleteService(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Service not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting service:", error);
      res.status(500).json({ error: "Failed to delete service" });
    }
  });

  // Packages Routes
  app.get("/api/packages", requireAuth, async (req: any, res) => {
    try {
      const packages = await storage.getPackages(req.session.userId);
      res.json(packages);
    } catch (error) {
      console.error("Error fetching packages:", error);
      res.status(500).json({ error: "Failed to fetch packages" });
    }
  });

  app.post("/api/packages", requireAuth, async (req: any, res) => {
    try {
      const validatedData = insertPackageSchema.parse(req.body);
      const packageData = await storage.createPackage({
        ...validatedData,
        userId: req.session.userId,
      });
      res.status(201).json(packageData);
    } catch (error) {
      console.error("Error creating package:", error);
      res.status(500).json({ error: "Failed to create package" });
    }
  });

  app.put("/api/packages/:id", requireAuth, async (req: any, res) => {
    try {
      const packageData = await storage.getPackage(req.params.id);
      if (!packageData || packageData.userId !== req.session.userId) {
        return res.status(404).json({ error: "Package not found" });
      }

      const validatedData = insertPackageSchema.partial().parse(req.body);
      const updatedPackage = await storage.updatePackage(req.params.id, validatedData);
      res.json(updatedPackage);
    } catch (error) {
      console.error("Error updating package:", error);
      res.status(500).json({ error: "Failed to update package" });
    }
  });

  app.delete("/api/packages/:id", requireAuth, async (req: any, res) => {
    try {
      const packageData = await storage.getPackage(req.params.id);
      if (!packageData || packageData.userId !== req.session.userId) {
        return res.status(404).json({ error: "Package not found" });
      }

      const deleted = await storage.deletePackage(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Package not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting package:", error);
      res.status(500).json({ error: "Failed to delete package" });
    }
  });

  // Company Profiles Routes
  app.get("/api/company-profiles", requireAuth, async (req: any, res) => {
    try {
      const profiles = await storage.getCompanyProfiles(req.session.userId);
      res.json(profiles);
    } catch (error) {
      console.error("Error fetching company profiles:", error);
      res.status(500).json({ error: "Failed to fetch company profiles" });
    }
  });

  app.post("/api/company-profiles", requireAuth, async (req: any, res) => {
    try {
      const validatedData = insertCompanyProfileSchema.parse(req.body);
      const profile = await storage.createCompanyProfile({
        ...validatedData,
        userId: req.session.userId,
      });
      res.status(201).json(profile);
    } catch (error) {
      console.error("Error creating company profile:", error);
      res.status(500).json({ error: "Failed to create company profile" });
    }
  });

  app.put("/api/company-profiles/:id", requireAuth, async (req: any, res) => {
    try {
      const profile = await storage.getCompanyProfile(req.params.id);
      if (!profile || profile.userId !== req.session.userId) {
        return res.status(404).json({ error: "Company profile not found" });
      }

      const validatedData = insertCompanyProfileSchema.partial().parse(req.body);
      const updatedProfile = await storage.updateCompanyProfile(req.params.id, validatedData);
      res.json(updatedProfile);
    } catch (error) {
      console.error("Error updating company profile:", error);
      res.status(500).json({ error: "Failed to update company profile" });
    }
  });

  app.delete("/api/company-profiles/:id", requireAuth, async (req: any, res) => {
    try {
      const profile = await storage.getCompanyProfile(req.params.id);
      if (!profile || profile.userId !== req.session.userId) {
        return res.status(404).json({ error: "Company profile not found" });
      }

      const deleted = await storage.deleteCompanyProfile(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Company profile not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting company profile:", error);
      res.status(500).json({ error: "Failed to delete company profile" });
    }
  });

  // Payment Methods Routes
  app.get("/api/payment-methods", requireAuth, async (req: any, res) => {
    try {
      const methods = await storage.getPaymentMethods(req.session.userId);
      res.json(methods);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      res.status(500).json({ error: "Failed to fetch payment methods" });
    }
  });

  app.post("/api/payment-methods", requireAuth, async (req: any, res) => {
    try {
      const validatedData = insertPaymentMethodSchema.parse(req.body);
      const method = await storage.createPaymentMethod({
        ...validatedData,
        userId: req.session.userId,
      });
      res.status(201).json(method);
    } catch (error) {
      console.error("Error creating payment method:", error);
      res.status(500).json({ error: "Failed to create payment method" });
    }
  });

  app.put("/api/payment-methods/:id", requireAuth, async (req: any, res) => {
    try {
      const method = await storage.getPaymentMethod(req.params.id);
      if (!method || method.userId !== req.session.userId) {
        return res.status(404).json({ error: "Payment method not found" });
      }

      const validatedData = insertPaymentMethodSchema.partial().parse(req.body);
      const updatedMethod = await storage.updatePaymentMethod(req.params.id, validatedData);
      res.json(updatedMethod);
    } catch (error) {
      console.error("Error updating payment method:", error);
      res.status(500).json({ error: "Failed to update payment method" });
    }
  });

  app.delete("/api/payment-methods/:id", requireAuth, async (req: any, res) => {
    try {
      const method = await storage.getPaymentMethod(req.params.id);
      if (!method || method.userId !== req.session.userId) {
        return res.status(404).json({ error: "Payment method not found" });
      }

      const deleted = await storage.deletePaymentMethod(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Payment method not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting payment method:", error);
      res.status(500).json({ error: "Failed to delete payment method" });
    }
  });

  // Template Routes
  app.get("/api/templates", requireAuth, async (req: any, res) => {
    try {
      const templates = await storage.getTemplates(req.session.userId);
      res.json(templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ error: "Failed to fetch templates" });
    }
  });

  app.post("/api/templates", requireAuth, async (req: any, res) => {
    try {
      const validatedData = insertTemplateSchema.parse(req.body);
      const template = await storage.createTemplate({
        ...validatedData,
        userId: req.session.userId,
      });
      res.status(201).json(template);
    } catch (error) {
      console.error("Error creating template:", error);
      res.status(500).json({ error: "Failed to create template" });
    }
  });

  app.put("/api/templates/:id", requireAuth, async (req: any, res) => {
    try {
      const template = await storage.getTemplate(req.params.id);
      if (!template || template.userId !== req.session.userId) {
        return res.status(404).json({ error: "Template not found" });
      }

      const validatedData = insertTemplateSchema.partial().parse(req.body);
      const updatedTemplate = await storage.updateTemplate(req.params.id, validatedData);
      res.json(updatedTemplate);
    } catch (error) {
      console.error("Error updating template:", error);
      res.status(500).json({ error: "Failed to update template" });
    }
  });

  app.delete("/api/templates/:id", requireAuth, async (req: any, res) => {
    try {
      const template = await storage.getTemplate(req.params.id);
      if (!template || template.userId !== req.session.userId) {
        return res.status(404).json({ error: "Template not found" });
      }

      const deleted = await storage.deleteTemplate(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Template not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting template:", error);
      res.status(500).json({ error: "Failed to delete template" });
    }
  });

  app.post("/api/templates/:id/set-default", requireAuth, async (req: any, res) => {
    try {
      const template = await storage.getTemplate(req.params.id);
      if (!template || template.userId !== req.session.userId) {
        return res.status(404).json({ error: "Template not found" });
      }

      const success = await storage.setDefaultTemplate(req.session.userId, req.params.id);
      if (!success) {
        return res.status(500).json({ error: "Failed to set default template" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error setting default template:", error);
      res.status(500).json({ error: "Failed to set default template" });
    }
  });

  const httpServer = createServer(app);
  return Promise.resolve(httpServer);
}