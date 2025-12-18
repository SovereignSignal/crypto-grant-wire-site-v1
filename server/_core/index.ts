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
    // Create users table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        openId VARCHAR(64) NOT NULL UNIQUE,
        name TEXT,
        email VARCHAR(320),
        loginMethod VARCHAR(64),
        role ENUM('user', 'admin') DEFAULT 'user' NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
        lastSignedIn TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);

    // Create grant_entries table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS grant_entries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        notionId VARCHAR(128) NOT NULL UNIQUE,
        title TEXT NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        category VARCHAR(128),
        content TEXT,
        sourceUrl TEXT,
        tags TEXT,
        publishedAt TIMESTAMP NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
        INDEX slug_idx (slug),
        INDEX category_idx (category),
        INDEX published_at_idx (publishedAt)
      )
    `);

    console.log("[Startup] Database migrations completed");
  } catch (error) {
    console.error("[Startup] Migration error:", error);
  }
}

/**
 * Sync data from Notion to database
 */
async function syncNotionData() {
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
          notionId: entry.id,
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
 * Schedule recurring Notion sync
 */
function scheduleNotionSync(intervalMinutes: number) {
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
