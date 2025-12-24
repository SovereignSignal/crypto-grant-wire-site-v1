import { eq, like, ilike, and, gte, lte, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { InsertUser, users, grantEntries, InsertGrantEntry, GrantEntry } from "../drizzle/schema";
import { ENV } from './_core/env';
import pg from "pg";

let _db: ReturnType<typeof drizzle> | null = null;
let _pool: pg.Pool | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _pool = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
      });
      _db = drizzle(_pool);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    // PostgreSQL upsert using ON CONFLICT
    updateSet.updatedAt = new Date();
    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Upsert a grant entry (insert or update based on externalId)
 */
export async function upsertGrantEntry(entry: InsertGrantEntry): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert grant entry: database not available");
    return;
  }

  try {
    // If there's an externalId, use upsert; otherwise just insert
    if (entry.externalId) {
      await db.insert(grantEntries).values(entry).onConflictDoUpdate({
        target: grantEntries.externalId,
        set: {
          title: entry.title,
          slug: entry.slug,
          category: entry.category,
          content: entry.content,
          sourceUrl: entry.sourceUrl,
          tags: entry.tags,
          publishedAt: entry.publishedAt,
          updatedAt: new Date(),
        },
      });
    } else {
      await db.insert(grantEntries).values(entry);
    }
  } catch (error) {
    console.error("[Database] Failed to upsert grant entry:", error);
    throw error;
  }
}

/**
 * Get all grant entries with optional filters
 */
export async function getGrantEntries(params?: {
  search?: string;
  category?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}): Promise<GrantEntry[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get grant entries: database not available");
    return [];
  }

  const conditions = [];

  if (params?.search) {
    // Use ilike for case-insensitive search in PostgreSQL
    conditions.push(ilike(grantEntries.title, `%${params.search}%`));
  }

  if (params?.category) {
    conditions.push(eq(grantEntries.category, params.category));
  }

  if (params?.startDate) {
    conditions.push(gte(grantEntries.publishedAt, params.startDate));
  }

  if (params?.endDate) {
    conditions.push(lte(grantEntries.publishedAt, params.endDate));
  }

  let query = db
    .select()
    .from(grantEntries)
    .orderBy(desc(grantEntries.publishedAt));

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  if (params?.limit) {
    query = query.limit(params.limit) as any;
  }

  if (params?.offset) {
    query = query.offset(params.offset) as any;
  }

  return await query;
}

/**
 * Get a single grant entry by slug
 */
export async function getGrantEntryBySlug(slug: string): Promise<GrantEntry | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get grant entry: database not available");
    return undefined;
  }

  const result = await db.select().from(grantEntries).where(eq(grantEntries.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Count total grant entries with optional filters
 */
export async function countGrantEntries(params?: {
  search?: string;
  category?: string;
  startDate?: Date;
  endDate?: Date;
}): Promise<number> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot count grant entries: database not available");
    return 0;
  }

  const conditions = [];

  if (params?.search) {
    // Use ilike for case-insensitive search in PostgreSQL
    conditions.push(ilike(grantEntries.title, `%${params.search}%`));
  }

  if (params?.category) {
    conditions.push(eq(grantEntries.category, params.category));
  }

  if (params?.startDate) {
    conditions.push(gte(grantEntries.publishedAt, params.startDate));
  }

  if (params?.endDate) {
    conditions.push(lte(grantEntries.publishedAt, params.endDate));
  }

  let query = db.select().from(grantEntries);

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  const result = await query;
  return result.length;
}
