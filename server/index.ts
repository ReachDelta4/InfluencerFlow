import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { storage } from "./storage";

// Initialize the database - create tables and add default user if needed
async function initializeDatabase() {
  try {
    // First, create tables if they don't exist
    const { client, db } = await import("./db");
    
    try {
      // Create tables directly using SQL
      log("Creating database tables if they don't exist...", "init");
      await db.execute(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username TEXT NOT NULL UNIQUE,
          email TEXT NOT NULL,
          password TEXT NOT NULL,
          full_name TEXT NOT NULL
        );
        
        CREATE TABLE IF NOT EXISTS campaigns (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'draft',
          workflow JSONB NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
        
        CREATE TABLE IF NOT EXISTS lead_lists (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          count INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
        
        CREATE TABLE IF NOT EXISTS leads (
          id SERIAL PRIMARY KEY,
          lead_list_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          profile_url TEXT NOT NULL,
          message TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          last_activity TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW()
        );
        
        CREATE TABLE IF NOT EXISTS campaign_history (
          id SERIAL PRIMARY KEY,
          campaign_id INTEGER NOT NULL,
          lead_id INTEGER NOT NULL,
          action TEXT NOT NULL,
          status TEXT NOT NULL,
          result TEXT,
          timestamp TIMESTAMP DEFAULT NOW()
        );
      `);
      log("Database tables created successfully!", "init");
    } catch (dbError) {
      console.error("Error creating database tables:", dbError);
    }
    
    // Now check if the default user exists and create if needed
    try {
      const defaultUser = await storage.getUserByUsername("demo");
      
      if (!defaultUser) {
        // Create a default user
        await storage.createUser({
          username: "demo",
          email: "demo@example.com", 
          password: "demo123", // In a real app, this would be hashed
          fullName: "Demo User"
        });
        log("Default user created successfully", "init");
      }
    } catch (userError) {
      console.error("Error creating default user:", userError);
    }
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Initialize the database with default data
  await initializeDatabase();
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
