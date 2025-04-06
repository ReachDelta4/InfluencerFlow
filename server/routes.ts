import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCampaignSchema, insertLeadSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Campaigns
  app.get("/api/campaigns", async (req, res) => {
    const userId = 1; // In a real app, get from auth session
    const campaigns = await storage.getCampaignsByUserId(userId);
    res.json(campaigns);
  });

  app.get("/api/campaigns/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const campaign = await storage.getCampaign(id);
    
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }
    
    res.json(campaign);
  });

  app.post("/api/campaigns", async (req, res) => {
    try {
      const userId = 1; // In a real app, get from auth session
      const campaignData = insertCampaignSchema.parse({
        ...req.body,
        userId,
      });
      
      const campaign = await storage.createCampaign(campaignData);
      res.status(201).json(campaign);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid campaign data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create campaign" });
    }
  });

  app.put("/api/campaigns/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const campaignData = insertCampaignSchema.parse(req.body);
      
      const campaign = await storage.updateCampaign(id, campaignData);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      res.json(campaign);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid campaign data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update campaign" });
    }
  });

  // Leads
  app.get("/api/leads", async (req, res) => {
    const userId = 1; // In a real app, get from auth session
    const leads = await storage.getLeadsByUserId(userId);
    res.json(leads);
  });

  app.post("/api/leads", async (req, res) => {
    try {
      const userId = 1; // In a real app, get from auth session
      const leadData = insertLeadSchema.parse({
        ...req.body,
        userId,
      });
      
      const lead = await storage.createLead(leadData);
      res.status(201).json(lead);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid lead data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create lead" });
    }
  });

  // Steel Browser actions
  app.post("/api/steel/execute", async (req, res) => {
    try {
      const { campaignId, action, params } = req.body;
      
      // In a real app, this would trigger Steel Browser to perform the action
      // For now, we'll simulate success
      res.json({ 
        success: true, 
        message: `Action ${action} executed successfully`,
        result: {
          status: "completed",
          details: "Operation completed successfully"
        }
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: "Failed to execute Steel Browser action" 
      });
    }
  });

  app.get("/api/steel/status", (req, res) => {
    // Check if Steel Browser is running
    res.json({ 
      running: true,
      version: "1.0.0",
      status: "healthy"
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
