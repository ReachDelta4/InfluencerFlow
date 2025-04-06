import { 
  users, type User, type InsertUser, 
  campaigns, type Campaign, type InsertCampaign,
  leads, type Lead, type InsertLead
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Campaign methods
  getCampaign(id: number): Promise<Campaign | undefined>;
  getCampaignsByUserId(userId: number): Promise<Campaign[]>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: number, campaign: Partial<InsertCampaign>): Promise<Campaign | undefined>;
  deleteCampaign(id: number): Promise<boolean>;
  
  // Lead methods
  getLead(id: number): Promise<Lead | undefined>;
  getLeadsByUserId(userId: number): Promise<Lead[]>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: number, lead: Partial<InsertLead>): Promise<Lead | undefined>;
  deleteLead(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private campaigns: Map<number, Campaign>;
  private leads: Map<number, Lead>;
  private userIdCounter: number;
  private campaignIdCounter: number;
  private leadIdCounter: number;

  constructor() {
    this.users = new Map();
    this.campaigns = new Map();
    this.leads = new Map();
    this.userIdCounter = 1;
    this.campaignIdCounter = 1;
    this.leadIdCounter = 1;
    
    // Add a test campaign
    const testDate = new Date();
    this.campaigns.set(1, {
      id: 1,
      userId: 1,
      name: "LinkedIn Outreach Campaign",
      status: "draft",
      workflow: {
        nodes: [
          {
            id: "1",
            type: "linkedin",
            label: "LinkedIn",
            position: { x: 100, y: 100 },
            data: { 
              label: 'LinkedIn',
              type: 'linkedin',
              nodeColor: '#0A66C2',
              icon: 'linkedin',
              fields: {
                query: 'Marketing Directors',
                filters: ['Location: United States', 'Industry: Technology']
              }
            }
          }
        ],
        edges: []
      },
      createdAt: testDate,
      updatedAt: testDate
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Campaign methods
  async getCampaign(id: number): Promise<Campaign | undefined> {
    return this.campaigns.get(id);
  }
  
  async getCampaignsByUserId(userId: number): Promise<Campaign[]> {
    return Array.from(this.campaigns.values()).filter(
      (campaign) => campaign.userId === userId
    );
  }
  
  async createCampaign(campaign: InsertCampaign): Promise<Campaign> {
    const id = this.campaignIdCounter++;
    const now = new Date();
    const newCampaign: Campaign = {
      ...campaign,
      id,
      createdAt: now,
      updatedAt: now,
      status: campaign.status || 'draft'
    };
    this.campaigns.set(id, newCampaign);
    return newCampaign;
  }
  
  async updateCampaign(id: number, campaignData: Partial<InsertCampaign>): Promise<Campaign | undefined> {
    const campaign = this.campaigns.get(id);
    if (!campaign) {
      return undefined;
    }
    
    const updatedCampaign: Campaign = {
      ...campaign,
      ...campaignData,
      id,
      updatedAt: new Date(),
    };
    
    this.campaigns.set(id, updatedCampaign);
    return updatedCampaign;
  }
  
  async deleteCampaign(id: number): Promise<boolean> {
    return this.campaigns.delete(id);
  }
  
  // Lead methods
  async getLead(id: number): Promise<Lead | undefined> {
    return this.leads.get(id);
  }
  
  async getLeadsByUserId(userId: number): Promise<Lead[]> {
    return Array.from(this.leads.values()).filter(
      (lead) => lead.userId === userId
    );
  }
  
  async createLead(lead: InsertLead): Promise<Lead> {
    const id = this.leadIdCounter++;
    const now = new Date();
    
    // Handle optional fields with proper null values for the database
    const newLead: Lead = {
      id,
      userId: lead.userId,
      firstName: lead.firstName,
      lastName: lead.lastName,
      company: lead.company ?? null,
      jobTitle: lead.jobTitle ?? null,
      email: lead.email ?? null,
      linkedinUrl: lead.linkedinUrl ?? null,
      instagramUrl: lead.instagramUrl ?? null,
      xUsername: lead.xUsername ?? null,
      notes: lead.notes ?? null,
      status: lead.status || 'new',
      source: lead.source || 'manual',
      createdAt: now,
      updatedAt: now
    };
    
    this.leads.set(id, newLead);
    return newLead;
  }
  
  async updateLead(id: number, leadData: Partial<InsertLead>): Promise<Lead | undefined> {
    const lead = this.leads.get(id);
    if (!lead) {
      return undefined;
    }
    
    // Create updated lead with proper handling of null values
    const updatedLead: Lead = {
      ...lead,
      firstName: leadData.firstName || lead.firstName,
      lastName: leadData.lastName || lead.lastName,
      company: leadData.company !== undefined ? (leadData.company ?? null) : lead.company,
      jobTitle: leadData.jobTitle !== undefined ? (leadData.jobTitle ?? null) : lead.jobTitle,
      email: leadData.email !== undefined ? (leadData.email ?? null) : lead.email,
      linkedinUrl: leadData.linkedinUrl !== undefined ? (leadData.linkedinUrl ?? null) : lead.linkedinUrl,
      instagramUrl: leadData.instagramUrl !== undefined ? (leadData.instagramUrl ?? null) : lead.instagramUrl,
      xUsername: leadData.xUsername !== undefined ? (leadData.xUsername ?? null) : lead.xUsername,
      notes: leadData.notes !== undefined ? (leadData.notes ?? null) : lead.notes,
      status: leadData.status || lead.status,
      source: leadData.source || lead.source,
      updatedAt: new Date()
    };
    
    this.leads.set(id, updatedLead);
    return updatedLead;
  }
  
  async deleteLead(id: number): Promise<boolean> {
    return this.leads.delete(id);
  }
}

export const storage = new MemStorage();
