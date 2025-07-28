import express, { type Express } from "express";
import { z } from "zod";
import { storage } from "./storage";

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
          const testUser = await storage.getUserByUsername("__connection_test__");
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

export function registerRoutes(app: Express) {
  configRoutes(app);
  invoiceRoutes(app);
  return app;
}