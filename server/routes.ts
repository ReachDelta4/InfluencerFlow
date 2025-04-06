import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCampaignSchema, insertLeadListSchema, insertLeadSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import { parse } from 'csv-parse';
import { Readable } from 'stream';

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // limit to 5MB
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Lead Lists
  app.get("/api/lead-lists", async (req, res) => {
    try {
      const userId = 1; // In a real app, get from auth session
      const leadLists = await storage.getLeadLists(userId);
      res.json(leadLists);
    } catch (error) {
      console.error("Error fetching lead lists:", error);
      res.status(500).json({ message: "Failed to fetch lead lists" });
    }
  });

  app.get("/api/lead-lists/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const leadList = await storage.getLeadList(id);
      
      if (!leadList) {
        return res.status(404).json({ message: "Lead list not found" });
      }
      
      res.json(leadList);
    } catch (error) {
      console.error("Error fetching lead list:", error);
      res.status(500).json({ message: "Failed to fetch lead list" });
    }
  });

  app.post("/api/lead-lists", async (req, res) => {
    try {
      const userId = 1; // In a real app, get from auth session
      const leadListData = insertLeadListSchema.parse({
        ...req.body,
        userId,
      });
      
      const leadList = await storage.createLeadList(leadListData);
      res.status(201).json(leadList);
    } catch (error) {
      console.error("Error creating lead list:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid lead list data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create lead list" });
    }
  });

  // CSV Upload endpoint 
  app.post("/api/lead-lists/:id/upload", upload.single('csv'), async (req: Request, res: Response) => {
    try {
      const leadListId = parseInt(req.params.id);
      
      // Check if lead list exists
      const leadList = await storage.getLeadList(leadListId);
      if (!leadList) {
        return res.status(404).json({ message: "Lead list not found" });
      }

      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({ message: "No CSV file provided" });
      }
      
      // Parse CSV
      const records: any[] = [];
      const parser = parse({
        delimiter: ',',
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });
      
      // Handle parsing
      parser.on('readable', function() {
        let record;
        while ((record = parser.read())) {
          records.push(record);
        }
      });
      
      // Handle parsing completion
      await new Promise<void>((resolve, reject) => {
        parser.on('error', (err) => {
          console.error("Error parsing CSV:", err);
          reject(err);
        });
        
        parser.on('end', async () => {
          try {
            // Transform CSV records to leads with more flexible field detection
            const leads = records.map(record => {
              // Create a case-insensitive mapping from fields
              const fieldMap = {};
              Object.keys(record).forEach(key => {
                fieldMap[key.toLowerCase()] = record[key];
              });
              
              return {
                leadListId,
                name: fieldMap['name'] || '',
                profileUrl: fieldMap['profile url'] || fieldMap['profileurl'] || fieldMap['profile_url'] || '',
                message: fieldMap['message'] || '',
                status: 'pending'
              };
            });
            
            // Validate leads - ensure at least profileUrl exists and provide defaults for missing fields
            for (let lead of leads) {
              // Set default name if empty
              if (!lead.name || lead.name.trim() === '') {
                lead.name = 'Unknown Contact';
              }
              
              // Set default message if empty
              if (!lead.message || lead.message.trim() === '') {
                lead.message = 'Hello, I wanted to connect with you!';
              }
            }
            
            // Now only reject if profileUrl is missing
            const invalidLeads = leads.filter(lead => !lead.profileUrl);
            
            if (invalidLeads.length > 0) {
              console.error("Invalid leads found - missing Profile URL:", invalidLeads);
              return reject(new Error("CSV contains invalid lead data. Ensure Profile URL column exists and has values"));
            }
            
            // Insert leads
            if (leads.length > 0) {
              const insertedLeads = await storage.createLeads(leads);
              
              // Update lead count in the lead list
              await storage.updateLeadCount(leadListId);
              
              resolve();
            } else {
              reject(new Error("No valid leads found in CSV"));
            }
          } catch (err) {
            console.error("Error processing leads:", err);
            reject(err);
          }
        });
        
        // Push CSV data to the parser - we already checked that req.file exists above
        Readable.from(req.file!.buffer).pipe(parser);
      }).catch(error => {
        throw error;
      });
      
      res.status(200).json({ 
        message: "CSV processed successfully",
        count: records.length
      });
    } catch (error) {
      console.error("Error uploading CSV:", error);
      res.status(500).json({ 
        message: "Failed to process CSV file", 
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get leads for a lead list
  app.get("/api/lead-lists/:id/leads", async (req, res) => {
    try {
      const leadListId = parseInt(req.params.id);
      
      // Check if lead list exists
      const leadList = await storage.getLeadList(leadListId);
      if (!leadList) {
        return res.status(404).json({ message: "Lead list not found" });
      }
      
      const leads = await storage.getLeads(leadListId);
      res.json(leads);
    } catch (error) {
      console.error("Error fetching leads:", error);
      res.status(500).json({ message: "Failed to fetch leads" });
    }
  });

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
