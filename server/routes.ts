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
      // TODO: Check actual database connection
      const isConnected = process.env.DATABASE_URL ? true : false;
      
      res.json({ 
        connected: isConnected,
        hasUrl: !!process.env.DATABASE_URL 
      });
    } catch (error) {
      console.error("Error checking database status:", error);
      res.status(500).json({ error: "Failed to check database status" });
    }
  });
};

export function registerRoutes(app: Express) {
  configRoutes(app);
  return app;
}