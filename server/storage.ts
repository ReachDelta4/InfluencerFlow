import { users, type User, type InsertUser, leadLists, leads, campaigns, type LeadList, type Lead, type InsertLeadList, type InsertLead, type Campaign, type InsertCampaign } from "@shared/schema";
import { db, supabase } from "./db";
import { eq, and, sql } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Lead list methods
  getLeadLists(userId: number): Promise<LeadList[]>;
  getLeadList(id: number): Promise<LeadList | undefined>;
  createLeadList(leadList: InsertLeadList): Promise<LeadList>;
  
  // Lead methods
  getLeads(leadListId: number): Promise<Lead[]>;
  getLead(id: number): Promise<Lead | undefined>;
  createLeads(leads: InsertLead[]): Promise<Lead[]>;
  updateLeadCount(leadListId: number): Promise<void>;
  getLeadsByUserId(userId: number): Promise<Lead[]>;
  createLead(lead: InsertLead): Promise<Lead>;
  
  // Campaign methods
  getCampaignsByUserId(userId: number): Promise<Campaign[]>;
  getCampaign(id: number): Promise<Campaign | undefined>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: number, campaign: Partial<InsertCampaign>): Promise<Campaign | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  // Lead list methods
  async getLeadLists(userId: number): Promise<LeadList[]> {
    return db
      .select()
      .from(leadLists)
      .where(eq(leadLists.userId, userId));
  }
  
  async getLeadList(id: number): Promise<LeadList | undefined> {
    const [leadList] = await db
      .select()
      .from(leadLists)
      .where(eq(leadLists.id, id));
    return leadList;
  }
  
  async createLeadList(insertLeadList: InsertLeadList): Promise<LeadList> {
    const [leadList] = await db
      .insert(leadLists)
      .values(insertLeadList)
      .returning();
    return leadList;
  }
  
  // Lead methods
  async getLeads(leadListId: number): Promise<Lead[]> {
    return db
      .select()
      .from(leads)
      .where(eq(leads.leadListId, leadListId));
  }
  
  async getLead(id: number): Promise<Lead | undefined> {
    const [lead] = await db
      .select()
      .from(leads)
      .where(eq(leads.id, id));
    return lead;
  }
  
  async createLeads(leadsToInsert: InsertLead[]): Promise<Lead[]> {
    if (leadsToInsert.length === 0) return [];
    
    return db
      .insert(leads)
      .values(leadsToInsert)
      .returning();
  }
  
  async updateLeadCount(leadListId: number): Promise<void> {
    // Count the leads for this list
    const result = await db
      .select({ count: sql`count(*)` })
      .from(leads)
      .where(eq(leads.leadListId, leadListId));
    
    const count = Number(result[0]?.count || 0);
    
    // Update the lead list count
    await db
      .update(leadLists)
      .set({ count, updatedAt: new Date() })
      .where(eq(leadLists.id, leadListId));
  }
  
  async getLeadsByUserId(userId: number): Promise<Lead[]> {
    // Join lead_lists and leads to get all leads for a user
    const userLeadLists = await this.getLeadLists(userId);
    const leadListIds = userLeadLists.map(list => list.id);
    
    if (leadListIds.length === 0) return [];
    
    // Query all leads for these lead lists
    return db
      .select()
      .from(leads)
      .where(
        // Check if leadListId is in the array of user's lead list IDs
        sql`${leads.leadListId} IN (${leadListIds.join(',')})`
      );
  }
  
  async createLead(lead: InsertLead): Promise<Lead> {
    const [createdLead] = await db
      .insert(leads)
      .values(lead)
      .returning();
    
    // Update the count for the lead list
    await this.updateLeadCount(lead.leadListId);
    
    return createdLead;
  }
  
  // Campaign methods
  async getCampaignsByUserId(userId: number): Promise<Campaign[]> {
    return db
      .select()
      .from(campaigns)
      .where(eq(campaigns.userId, userId));
  }
  
  async getCampaign(id: number): Promise<Campaign | undefined> {
    const [campaign] = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.id, id));
    return campaign;
  }
  
  async createCampaign(insertCampaign: InsertCampaign): Promise<Campaign> {
    const [campaign] = await db
      .insert(campaigns)
      .values(insertCampaign)
      .returning();
    return campaign;
  }
  
  async updateCampaign(id: number, campaignData: Partial<InsertCampaign>): Promise<Campaign | undefined> {
    const [campaign] = await db
      .update(campaigns)
      .set({
        ...campaignData,
        updatedAt: new Date()
      })
      .where(eq(campaigns.id, id))
      .returning();
    return campaign;
  }
}

export class SupabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return undefined;
    return data as User;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error || !data) return undefined;
    return data as User;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert(insertUser)
      .select()
      .single();
    
    if (error) throw error;
    return data as User;
  }
  
  // Lead list methods
  async getLeadLists(userId: number): Promise<LeadList[]> {
    const { data, error } = await supabase
      .from('lead_lists')
      .select('*')
      .eq('userId', userId)
      .order('createdAt', { ascending: false });
    
    if (error) throw error;
    return data as LeadList[] || [];
  }
  
  async getLeadList(id: number): Promise<LeadList | undefined> {
    const { data, error } = await supabase
      .from('lead_lists')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return undefined;
    return data as LeadList;
  }
  
  async createLeadList(insertLeadList: InsertLeadList): Promise<LeadList> {
    const { data, error } = await supabase
      .from('lead_lists')
      .insert(insertLeadList)
      .select()
      .single();
    
    if (error) throw error;
    return data as LeadList;
  }
  
  // Lead methods
  async getLeads(leadListId: number): Promise<Lead[]> {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('leadListId', leadListId);
    
    if (error) throw error;
    return data as Lead[] || [];
  }
  
  async getLead(id: number): Promise<Lead | undefined> {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return undefined;
    return data as Lead;
  }
  
  async createLeads(leadsToInsert: InsertLead[]): Promise<Lead[]> {
    if (leadsToInsert.length === 0) return [];
    
    const { data, error } = await supabase
      .from('leads')
      .insert(leadsToInsert)
      .select();
    
    if (error) throw error;
    return data as Lead[] || [];
  }
  
  async updateLeadCount(leadListId: number): Promise<void> {
    // Count the leads for this list
    const { count, error: countError } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('leadListId', leadListId);
    
    if (countError) throw countError;
    
    // Update the lead list count
    const { error } = await supabase
      .from('lead_lists')
      .update({ 
        count: count || 0, 
        updatedAt: new Date().toISOString() 
      })
      .eq('id', leadListId);
    
    if (error) throw error;
  }
  
  async getLeadsByUserId(userId: number): Promise<Lead[]> {
    // Get all lead lists for user
    const { data: leadListsData, error: leadListsError } = await supabase
      .from('lead_lists')
      .select('id')
      .eq('userId', userId);
    
    if (leadListsError) throw leadListsError;
    if (!leadListsData || leadListsData.length === 0) return [];
    
    const leadListIds = leadListsData.map(list => list.id);
    
    // Get all leads from those lists
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .in('leadListId', leadListIds);
    
    if (error) throw error;
    return data as Lead[] || [];
  }
  
  async createLead(lead: InsertLead): Promise<Lead> {
    const { data, error } = await supabase
      .from('leads')
      .insert(lead)
      .select()
      .single();
    
    if (error) throw error;
    
    // Update the count for the lead list
    await this.updateLeadCount(lead.leadListId);
    
    return data as Lead;
  }
  
  // Campaign methods
  async getCampaignsByUserId(userId: number): Promise<Campaign[]> {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('userId', userId)
      .order('createdAt', { ascending: false });
    
    if (error) throw error;
    return data as Campaign[] || [];
  }
  
  async getCampaign(id: number): Promise<Campaign | undefined> {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return undefined;
    return data as Campaign;
  }
  
  async createCampaign(insertCampaign: InsertCampaign): Promise<Campaign> {
    const { data, error } = await supabase
      .from('campaigns')
      .insert(insertCampaign)
      .select()
      .single();
    
    if (error) throw error;
    return data as Campaign;
  }
  
  async updateCampaign(id: number, campaignData: Partial<InsertCampaign>): Promise<Campaign | undefined> {
    const { data, error } = await supabase
      .from('campaigns')
      .update({
        ...campaignData,
        updatedAt: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error || !data) return undefined;
    return data as Campaign;
  }
}

// Use the Supabase storage implementation instead of the Drizzle one
// For now, we'll use the DatabaseStorage directly since it's more stable while we're developing
export const storage = new DatabaseStorage();
