import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { fetchNotionEntries, generateSlug } from "../notion";
import { upsertGrantEntry, getDb } from "../db";
import { sql } from "drizzle-orm";
import { generateSitemap } from "../sitemap-generator";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

/**
 * Run database migrations to create tables if they don't exist
 */
async function runMigrations() {
  const db = await getDb();
  if (!db) {
    console.log("[Startup] No database configured, skipping migrations");
    return;
  }

  console.log("[Startup] Running database migrations...");

  try {
    // Create role enum type (PostgreSQL)
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE role AS ENUM ('user', 'admin');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create users table (PostgreSQL)
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        "openId" VARCHAR(64) NOT NULL UNIQUE,
        name TEXT,
        email VARCHAR(320),
        "loginMethod" VARCHAR(64),
        role role DEFAULT 'user' NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "lastSignedIn" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);

    // Create grant_entries table (PostgreSQL)
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS grant_entries (
        id SERIAL PRIMARY KEY,
        "externalId" VARCHAR(128) UNIQUE,
        title TEXT NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        category VARCHAR(128),
        content TEXT,
        "sourceUrl" TEXT,
        tags TEXT,
        "publishedAt" TIMESTAMP,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);

    // Create indexes
    await db.execute(sql`CREATE INDEX IF NOT EXISTS slug_idx ON grant_entries (slug)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS category_idx ON grant_entries (category)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS published_at_idx ON grant_entries ("publishedAt")`);

    console.log("[Startup] Database migrations completed");
  } catch (error) {
    console.error("[Startup] Migration error:", error);
  }
}

/**
 * Check if Notion sync is enabled via environment variables
 */
function isNotionSyncEnabled(): boolean {
  return !!(process.env.NOTION_API_KEY && process.env.NOTION_DATABASE_ID);
}

/**
 * Sync data from Notion to database (only if Notion is configured)
 */
async function syncNotionData() {
  if (!isNotionSyncEnabled()) {
    console.log("[Sync] Notion sync disabled (NOTION_API_KEY or NOTION_DATABASE_ID not set)");
    return;
  }

  console.log("[Sync] Starting Notion sync...");

  try {
    const entries = await fetchNotionEntries();

    if (entries.length === 0) {
      console.log("[Sync] No entries fetched from Notion");
      return;
    }

    let synced = 0;
    for (const entry of entries) {
      try {
        await upsertGrantEntry({
          externalId: entry.id,
          title: entry.title,
          slug: generateSlug(entry.title),
          category: entry.category ?? null,
          content: entry.content ?? null,
          sourceUrl: entry.sourceUrl ?? null,
          tags: entry.tags ?? null,
          publishedAt: entry.publishedAt ?? null,
        });
        synced++;
      } catch (error) {
        console.error(`[Sync] Failed to sync entry "${entry.title}":`, error);
      }
    }

    console.log(`[Sync] Completed: ${synced}/${entries.length} entries synced`);
  } catch (error) {
    console.error("[Sync] Failed:", error);
  }
}

/**
 * Schedule recurring Notion sync (only if Notion is configured)
 */
function scheduleNotionSync(intervalMinutes: number) {
  if (!isNotionSyncEnabled()) {
    console.log("[Startup] Notion sync scheduling skipped (not configured)");
    return;
  }

  const intervalMs = intervalMinutes * 60 * 1000;

  setInterval(async () => {
    try {
      await syncNotionData();
    } catch (error) {
      console.error("[Sync] Scheduled sync failed:", error);
    }
  }, intervalMs);

  console.log(`[Startup] Notion sync scheduled every ${intervalMinutes} minutes`);
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Run database migrations (creates tables if they don't exist)
  await runMigrations();

  // Initial sync from Notion (populate data on startup)
  await syncNotionData();

  // Generate sitemap after data is synced
  await generateSitemap();

  // Schedule hourly sync to keep data fresh
  scheduleNotionSync(60);

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
