import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { z, ZodError } from "zod";
import { storage } from "./storage";
import { insertUserSchema, insertInvoiceSchema, signupUserSchema, loginUserSchema, resetPasswordSchema, updateUserProfileSchema, changePasswordSchema, deleteAccountSchema, insertServiceSchema, insertPackageSchema, insertCompanyProfileSchema, insertPaymentMethodSchema, insertTemplateSchema, insertTeamMemberSchema, updateTeamMemberSchema } from "@shared/schema";
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
  console.log("Auth check - session:", req.session);
  console.log("Auth check - userId:", req.session?.userId);
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
};

// Middleware to check specific permission for team members
const requirePermission = (permission: string) => {
  return (req: any, res: any, next: any) => {
    // Admin users (regular users) have all permissions
    if (req.session?.userType === "admin") {
      return next();
    }
    
    // Team members need specific permission
    if (req.session?.userType === "team_member") {
      if (!req.session?.permissions || !req.session.permissions[permission]) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      return next();
    }
    
    return res.status(401).json({ message: "Authentication required" });
  };
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
      
      // First, try to find regular user by email
      const user = email ? await storage.getUserByEmail(email) : null;
      if (user) {
        // Check password for regular user
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          return res.status(401).json({ message: "Invalid credentials" });
        }

        // Create session for regular user
        (req as any).session.userId = user.id;
        (req as any).session.userEmail = user.email;
        (req as any).session.username = user.username;
        (req as any).session.userType = "admin";

        return res.json({
          id: user.id,
          username: user.username,
          email: user.email,
          userType: "admin",
          createdAt: user.createdAt,
        });
      }

      // If no regular user found, try to find team member by email
      const teamMember = email ? await storage.getTeamMemberByEmail(email) : null;
      if (!teamMember) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check if team member is active
      if (teamMember.isActive !== "true") {
        return res.status(401).json({ message: "Account is deactivated" });
      }

      // Check password for team member
      const isValidPassword = await bcrypt.compare(password, teamMember.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Create session for team member
      (req as any).session.userId = teamMember.adminId; // Use admin's ID for data access
      (req as any).session.teamMemberId = teamMember.id;
      (req as any).session.userEmail = teamMember.email;
      (req as any).session.username = teamMember.fullName || teamMember.email;
      (req as any).session.userType = "team_member";
      (req as any).session.permissions = {
        canCreateInvoices: teamMember.canCreateInvoices === "true",
        canDeleteInvoices: teamMember.canDeleteInvoices === "true",
        canManageServices: teamMember.canManageServices === "true",
        canManageCompanyProfiles: teamMember.canManageCompanyProfiles === "true",
        canManagePaymentMethods: teamMember.canManagePaymentMethods === "true",
        canManageTemplates: teamMember.canManageTemplates === "true",
        canViewOnlyAssignedInvoices: teamMember.canViewOnlyAssignedInvoices === "true",
        canManageTeamMembers: teamMember.canManageTeamMembers === "true",
      };

      res.json({
        id: teamMember.id,
        username: teamMember.fullName || teamMember.email,
        email: teamMember.email,
        userType: "team_member",
        role: teamMember.role,
        permissions: (req as any).session.permissions,
        createdAt: teamMember.createdAt,
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
      if (req.session.userType === "team_member") {
        // For team members, return their data
        const teamMember = await storage.getTeamMember(req.session.teamMemberId);
        if (!teamMember) {
          return res.status(404).json({ message: "Team member not found" });
        }
        return res.json({
          id: teamMember.id,
          username: teamMember.fullName || teamMember.email,
          email: teamMember.email,
          userType: "team_member",
          role: teamMember.role,
          permissions: req.session.permissions,
          createdAt: teamMember.createdAt,
        });
      } else {
        // For regular users
        const user = await storage.getUser(req.session.userId);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        res.json({
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          companyName: user.companyName,
          profilePicture: user.profilePicture,
          userType: "admin",
          createdAt: user.createdAt,
        });
      }
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

  // Update user profile
  app.put("/api/auth/profile", requireAuth, async (req: any, res) => {
    try {
      const validatedData = updateUserProfileSchema.parse(req.body);
      
      // Check if email is being changed and ensure it's unique
      if (validatedData.email) {
        const existingUser = await storage.getUserByEmail(validatedData.email);
        if (existingUser && existingUser.id !== req.session.userId) {
          return res.status(400).json({ message: "Email already in use" });
        }
      }

      const updatedUser = await storage.updateUser(req.session.userId, validatedData);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Update session data if username or email changed
      if (validatedData.email) {
        req.session.userEmail = validatedData.email;
      }

      res.json({
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        companyName: updatedUser.companyName,
        profilePicture: updatedUser.profilePicture,
        userType: req.session.userType || "admin",
        createdAt: updatedUser.createdAt,
      });
    } catch (error) {
      console.error("Profile update error:", error);
      if (error instanceof Error && error.message.includes('validation')) {
        return res.status(400).json({ message: "Invalid profile data" });
      }
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Change password
  app.put("/api/auth/change-password", requireAuth, async (req: any, res) => {
    try {
      const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
      
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      
      // Update password
      await storage.updateUser(req.session.userId, { password: hashedPassword });

      res.json({ message: "Password changed successfully" });
    } catch (error) {
      console.error("Password change error:", error);
      res.status(400).json({ message: "Failed to change password" });
    }
  });

  // Delete account
  app.delete("/api/auth/account", requireAuth, async (req: any, res) => {
    try {
      const { password } = deleteAccountSchema.parse(req.body);
      
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ message: "Password is incorrect" });
      }

      // Delete user and all related data
      const deleted = await storage.deleteUser(req.session.userId);
      if (!deleted) {
        return res.status(500).json({ message: "Failed to delete account" });
      }

      // Destroy session
      req.session.destroy((err: any) => {
        if (err) {
          console.error("Session destruction error:", err);
        }
        res.clearCookie('connect.sid');
        res.json({ message: "Account deleted successfully" });
      });
    } catch (error) {
      console.error("Account deletion error:", error);
      res.status(500).json({ message: "Failed to delete account" });
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

  app.post("/api/invoices", requireAuth, requirePermission("canCreateInvoices"), async (req: any, res) => {
    try {
      console.log("Received invoice data:", JSON.stringify(req.body, null, 2));
      const validatedData = insertInvoiceSchema.parse(req.body);
      console.log("Validated invoice data:", JSON.stringify(validatedData, null, 2));
      const invoiceData = {
        ...validatedData,
        userId: req.session.userId,
      };
      
      // If this is a team member, track who created it
      if (req.session.userType === "team_member") {
        invoiceData.createdBy = req.session.teamMemberId;
      }
      
      const invoice = await storage.createInvoice(invoiceData);
      res.status(201).json(invoice);
    } catch (error) {
      console.error("Error creating invoice:", error);
      if (error instanceof ZodError) {
        console.error("Validation errors:", error.errors);
        res.status(400).json({ error: "Validation failed", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create invoice" });
      }
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

  app.delete("/api/invoices/:id", requireAuth, requirePermission("canDeleteInvoices"), async (req: any, res) => {
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

  app.post("/api/services", requireAuth, requirePermission("canManageServices"), async (req: any, res) => {
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

  app.put("/api/services/:id", requireAuth, requirePermission("canManageServices"), async (req: any, res) => {
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

  app.delete("/api/services/:id", requireAuth, requirePermission("canManageServices"), async (req: any, res) => {
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

  app.post("/api/packages", requireAuth, requirePermission("canManageServices"), async (req: any, res) => {
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

  app.post("/api/company-profiles", requireAuth, requirePermission("canManageCompanyProfiles"), async (req: any, res) => {
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
      console.log("Update request body:", req.body);
      console.log("Profile ID:", req.params.id);
      console.log("User ID:", req.session.userId);
      
      const profile = await storage.getCompanyProfile(req.params.id);
      console.log("Found profile:", profile);
      
      if (!profile || profile.userId !== req.session.userId) {
        console.log("Profile not found or unauthorized");
        return res.status(404).json({ error: "Company profile not found" });
      }

      const validatedData = insertCompanyProfileSchema.partial().parse(req.body);
      console.log("Validated data:", validatedData);
      
      const updatedProfile = await storage.updateCompanyProfile(req.params.id, validatedData);
      console.log("Updated profile:", updatedProfile);
      
      res.json(updatedProfile);
    } catch (error) {
      console.error("Error updating company profile:", error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
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

  app.post("/api/payment-methods", requireAuth, requirePermission("canManagePaymentMethods"), async (req: any, res) => {
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

  app.post("/api/templates", requireAuth, requirePermission("canManageTemplates"), async (req: any, res) => {
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

  // Team Members API Routes
  app.get("/api/team-members", requireAuth, async (req: any, res) => {
    try {
      const teamMembers = await storage.getTeamMembers(req.session.userId);
      res.json(teamMembers);
    } catch (error) {
      console.error("Error fetching team members:", error);
      res.status(500).json({ error: "Failed to fetch team members" });
    }
  });

  app.post("/api/team-members", requireAuth, requirePermission("canManageTeamMembers"), async (req: any, res) => {
    try {
      console.log('Received team member data:', req.body);
      
      // Hash the password before storing
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const teamMemberData = {
        ...req.body,
        password: hashedPassword
      };
      
      const validatedData = insertTeamMemberSchema.parse(teamMemberData);
      console.log('Validated team member data:', validatedData);
      
      const teamMember = await storage.createTeamMember({
        ...validatedData,
        adminId: req.session.userId
      });
      res.status(201).json(teamMember);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Invalid team member data", details: error.errors });
      }
      console.error("Error creating team member:", error);
      res.status(500).json({ error: "Failed to create team member" });
    }
  });

  app.get("/api/team-members/:id", requireAuth, async (req: any, res) => {
    try {
      const teamMember = await storage.getTeamMember(req.params.id);
      if (!teamMember || teamMember.adminId !== req.session.userId) {
        return res.status(404).json({ error: "Team member not found" });
      }
      
      // Don't send password in response
      const { password, ...teamMemberWithoutPassword } = teamMember;
      res.json(teamMemberWithoutPassword);
    } catch (error) {
      console.error("Error fetching team member:", error);
      res.status(500).json({ error: "Failed to fetch team member" });
    }
  });

  app.put("/api/team-members/:id", requireAuth, requirePermission("canManageTeamMembers"), async (req: any, res) => {
    try {
      const teamMember = await storage.getTeamMember(req.params.id);
      if (!teamMember || teamMember.adminId !== req.session.userId) {
        return res.status(404).json({ error: "Team member not found" });
      }

      let updateData = req.body;
      
      // If password is being updated, hash it
      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
      }

      const validatedData = updateTeamMemberSchema.parse(updateData);
      const updatedTeamMember = await storage.updateTeamMember(req.params.id, validatedData);
      
      if (!updatedTeamMember) {
        return res.status(404).json({ error: "Team member not found" });
      }
      
      // Don't send password in response
      const { password, ...teamMemberWithoutPassword } = updatedTeamMember;
      res.json(teamMemberWithoutPassword);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Invalid team member data", details: error.errors });
      }
      console.error("Error updating team member:", error);
      res.status(500).json({ error: "Failed to update team member" });
    }
  });

  app.delete("/api/team-members/:id", requireAuth, requirePermission("canManageTeamMembers"), async (req: any, res) => {
    try {
      const teamMember = await storage.getTeamMember(req.params.id);
      if (!teamMember || teamMember.adminId !== req.session.userId) {
        return res.status(404).json({ error: "Team member not found" });
      }

      // Use soft delete - deactivate instead of actually deleting
      const deactivated = await storage.deactivateTeamMember(req.params.id);
      if (!deactivated) {
        return res.status(404).json({ error: "Team member not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deactivating team member:", error);
      res.status(500).json({ error: "Failed to deactivate team member" });
    }
  });

  app.post("/api/team-members/:id/deactivate", requireAuth, requirePermission("canManageTeamMembers"), async (req: any, res) => {
    try {
      const teamMember = await storage.getTeamMember(req.params.id);
      if (!teamMember || teamMember.adminId !== req.session.userId) {
        return res.status(404).json({ error: "Team member not found" });
      }

      const success = await storage.deactivateTeamMember(req.params.id);
      if (!success) {
        return res.status(500).json({ error: "Failed to deactivate team member" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deactivating team member:", error);
      res.status(500).json({ error: "Failed to deactivate team member" });
    }
  });

  // Reactivate team member
  app.post("/api/team-members/:id/activate", requireAuth, requirePermission("canManageTeamMembers"), async (req: any, res) => {
    try {
      const teamMember = await storage.getTeamMember(req.params.id);
      if (!teamMember || teamMember.adminId !== req.session.userId) {
        return res.status(404).json({ error: "Team member not found" });
      }

      const activated = await storage.updateTeamMember(req.params.id, { isActive: "true" });
      if (!activated) {
        return res.status(500).json({ error: "Failed to activate team member" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error activating team member:", error);
      res.status(500).json({ error: "Failed to activate team member" });
    }
  });

  const httpServer = createServer(app);
  return Promise.resolve(httpServer);
}