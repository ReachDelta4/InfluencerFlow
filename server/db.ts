import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../shared/schema";
import { createClient } from '@supabase/supabase-js';

// Supabase client
const supabaseUrl = 'https://qxjfzziqxhmracjnckij.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4amZ6emlxeGhtcmFjam5ja2lqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzMzE5NzIsImV4cCI6MjA1NjkwNzk3Mn0.wwNQxBx3pyptaLf_vXjrHSJO_m24iENkhF4bavF8lvI';
export const supabase = createClient(supabaseUrl, supabaseKey);

// We'll still keep drizzle as an option for local development
// Using environment variables for database connection
const connectionString = process.env.DATABASE_URL as string;

// Create postgres client (for use with drizzle if needed)
export const client = postgres(connectionString);

// Create drizzle client (for use if needed)
export const db = drizzle(client, { schema });