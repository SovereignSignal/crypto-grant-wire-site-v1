import { eq } from "drizzle-orm";
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

// Get raw pool for direct SQL queries
// Ensures pool is initialized before returning
export async function getPool(): Promise<pg.Pool | null> {
  if (!_pool && process.env.DATABASE_URL) {
    try {
      _pool = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
      });
      _db = drizzle(_pool);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _pool = null;
    }
  }
  return _pool;
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
 * Joins with summaries table to get AI-generated summaries
 */
export async function getGrantEntries(params?: {
  search?: string;
  category?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}): Promise<GrantEntry[]> {
  const pool = await getPool();
  if (!pool) {
    console.warn("[Database] Cannot get grant entries: database not available");
    return [];
  }

  // Build WHERE conditions
  const conditions: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (params?.search) {
    conditions.push(`ge.title ILIKE $${paramIndex}`);
    values.push(`%${params.search}%`);
    paramIndex++;
  }

  if (params?.category) {
    conditions.push(`ge.category = $${paramIndex}`);
    values.push(params.category);
    paramIndex++;
  }

  if (params?.startDate) {
    conditions.push(`ge."publishedAt" >= $${paramIndex}`);
    values.push(params.startDate);
    paramIndex++;
  }

  if (params?.endDate) {
    conditions.push(`ge."publishedAt" <= $${paramIndex}`);
    values.push(params.endDate);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const limitClause = params?.limit ? `LIMIT ${params.limit}` : '';
  const offsetClause = params?.offset ? `OFFSET ${params.offset}` : '';

  // Query with LEFT JOIN to summaries table via messages
  // This reads summaries directly from the source, so they won't be overwritten
  const query = `
    SELECT DISTINCT ON (ge.id)
      ge.id,
      ge."externalId",
      ge.title,
      ge.slug,
      ge.category,
      COALESCE(s.summary, ge.content) as content,
      ge."sourceUrl",
      ge.tags,
      ge."publishedAt",
      ge."createdAt",
      ge."updatedAt"
    FROM grant_entries ge
    LEFT JOIN messages m ON m.extracted_urls::text LIKE '%' || ge."sourceUrl" || '%'
    LEFT JOIN summaries s ON s.message_id = m.id
    ${whereClause}
    ORDER BY ge.id, s.id DESC
  `;

  // Wrap in a subquery to apply ordering by publishedAt, limit, and offset
  const finalQuery = `
    SELECT * FROM (${query}) AS entries
    ORDER BY "publishedAt" DESC NULLS LAST
    ${limitClause}
    ${offsetClause}
  `;

  try {
    const result = await pool.query(finalQuery, values);
    return result.rows as GrantEntry[];
  } catch (error) {
    console.error("[Database] Failed to get grant entries:", error);
    return [];
  }
}

/**
 * Get a single grant entry by slug
 * Joins with summaries table to get AI-generated summary
 */
export async function getGrantEntryBySlug(slug: string): Promise<GrantEntry | undefined> {
  const pool = await getPool();
  if (!pool) {
    console.warn("[Database] Cannot get grant entry: database not available");
    return undefined;
  }

  const query = `
    SELECT DISTINCT ON (ge.id)
      ge.id,
      ge."externalId",
      ge.title,
      ge.slug,
      ge.category,
      COALESCE(s.summary, ge.content) as content,
      ge."sourceUrl",
      ge.tags,
      ge."publishedAt",
      ge."createdAt",
      ge."updatedAt"
    FROM grant_entries ge
    LEFT JOIN messages m ON m.extracted_urls::text LIKE '%' || ge."sourceUrl" || '%'
    LEFT JOIN summaries s ON s.message_id = m.id
    WHERE ge.slug = $1
    ORDER BY ge.id, s.id DESC
    LIMIT 1
  `;

  try {
    const result = await pool.query(query, [slug]);
    return result.rows.length > 0 ? result.rows[0] as GrantEntry : undefined;
  } catch (error) {
    console.error("[Database] Failed to get grant entry by slug:", error);
    return undefined;
  }
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
  const pool = await getPool();
  if (!pool) {
    console.warn("[Database] Cannot count grant entries: database not available");
    return 0;
  }

  // Build WHERE conditions
  const conditions: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (params?.search) {
    conditions.push(`title ILIKE $${paramIndex}`);
    values.push(`%${params.search}%`);
    paramIndex++;
  }

  if (params?.category) {
    conditions.push(`category = $${paramIndex}`);
    values.push(params.category);
    paramIndex++;
  }

  if (params?.startDate) {
    conditions.push(`"publishedAt" >= $${paramIndex}`);
    values.push(params.startDate);
    paramIndex++;
  }

  if (params?.endDate) {
    conditions.push(`"publishedAt" <= $${paramIndex}`);
    values.push(params.endDate);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const query = `SELECT COUNT(*) as count FROM grant_entries ${whereClause}`;

  try {
    const result = await pool.query(query, values);
    return parseInt(result.rows[0].count, 10);
  } catch (error) {
    console.error("[Database] Failed to count grant entries:", error);
    return 0;
  }
}

// =============================================================================
// Messages & Summaries (for Archive page)
// =============================================================================

export interface MessageWithSummary {
  id: number;
  timestamp: Date;
  rawContent: string;
  extractedUrls: string[] | null;
  title: string | null;
  summary: string | null;
  entities: {
    protocols?: string[];
    key_terms?: string[];
    amounts?: string[];
    deadlines?: string[];
    source?: { name?: string; url?: string | null };
  } | null;
  categoryId: number | null;
  categoryName: string | null;
}

export interface CategoryWithCount {
  id: number;
  name: string;
  count: number;
}

/**
 * Search messages with summaries
 * Supports cursor-based pagination for efficient "Load More"
 */
export async function searchMessages(params: {
  query?: string;
  category?: string;
  cursor?: number;
  limit?: number;
}): Promise<{ messages: MessageWithSummary[]; nextCursor: number | null; total: number }> {
  const pool = await getPool();
  if (!pool) {
    console.warn("[Database] Cannot search messages: database not available");
    return { messages: [], nextCursor: null, total: 0 };
  }

  const limit = params.limit || 20;
  const conditions: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  // Cursor-based pagination (fetch messages older than cursor)
  if (params.cursor) {
    conditions.push(`m.id < $${paramIndex}`);
    values.push(params.cursor);
    paramIndex++;
  }

  // Search query across summary and raw_content
  if (params.query) {
    conditions.push(`(s.summary ILIKE $${paramIndex} OR m.raw_content ILIKE $${paramIndex})`);
    values.push(`%${params.query}%`);
    paramIndex++;
  }

  // Category filter
  if (params.category) {
    conditions.push(`c.name = $${paramIndex}`);
    values.push(params.category);
    paramIndex++;
  }

  // Always exclude entries in review_queue with pending status
  conditions.push(`NOT EXISTS (
    SELECT 1 FROM review_queue rq
    WHERE rq.summary_id = s.id AND rq.status = 'pending'
  )`);

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Main query - join messages with summaries and categories
  // Uses s.title from summaries table (AI-generated titles)
  const query = `
    SELECT
      m.id,
      m.timestamp,
      m.raw_content as "rawContent",
      m.extracted_urls as "extractedUrls",
      s.title,
      s.summary,
      s.entities,
      s.category_id as "categoryId",
      c.name as "categoryName"
    FROM messages m
    LEFT JOIN summaries s ON s.message_id = m.id
    LEFT JOIN categories c ON s.category_id = c.id
    ${whereClause}
    ORDER BY m.timestamp DESC, m.id DESC
    LIMIT $${paramIndex}
  `;
  values.push(limit + 1); // Fetch one extra to determine if there are more

  // Count query (without cursor, but with search/category filters)
  const countConditions: string[] = [];
  const countValues: any[] = [];
  let countParamIndex = 1;

  if (params.query) {
    countConditions.push(`(s.summary ILIKE $${countParamIndex} OR m.raw_content ILIKE $${countParamIndex})`);
    countValues.push(`%${params.query}%`);
    countParamIndex++;
  }

  if (params.category) {
    countConditions.push(`c.name = $${countParamIndex}`);
    countValues.push(params.category);
    countParamIndex++;
  }

  // Also exclude review_queue pending entries from count
  countConditions.push(`NOT EXISTS (
    SELECT 1 FROM review_queue rq
    WHERE rq.summary_id = s.id AND rq.status = 'pending'
  )`);

  const countWhereClause = countConditions.length > 0 ? `WHERE ${countConditions.join(' AND ')}` : '';
  const countQuery = `
    SELECT COUNT(*) as count
    FROM messages m
    LEFT JOIN summaries s ON s.message_id = m.id
    LEFT JOIN categories c ON s.category_id = c.id
    ${countWhereClause}
  `;

  try {
    const [result, countResult] = await Promise.all([
      pool.query(query, values),
      pool.query(countQuery, countValues),
    ]);

    const messages = result.rows.slice(0, limit) as MessageWithSummary[];
    const hasMore = result.rows.length > limit;
    const nextCursor = hasMore && messages.length > 0 ? messages[messages.length - 1].id : null;
    const total = parseInt(countResult.rows[0].count, 10);

    return { messages, nextCursor, total };
  } catch (error) {
    console.error("[Database] Failed to search messages:", error);
    return { messages: [], nextCursor: null, total: 0 };
  }
}

/**
 * Get all categories with message counts
 * Excludes entries in review_queue with pending status
 */
export async function getCategories(): Promise<CategoryWithCount[]> {
  const pool = await getPool();
  if (!pool) {
    console.warn("[Database] Cannot get categories: database not available");
    return [];
  }

  const query = `
    SELECT
      c.id,
      c.name,
      COUNT(s.id) as count
    FROM categories c
    LEFT JOIN summaries s ON s.category_id = c.id
      AND NOT EXISTS (
        SELECT 1 FROM review_queue rq
        WHERE rq.summary_id = s.id AND rq.status = 'pending'
      )
    GROUP BY c.id, c.name
    ORDER BY count DESC
  `;

  try {
    const result = await pool.query(query);
    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      count: parseInt(row.count, 10),
    }));
  } catch (error) {
    console.error("[Database] Failed to get categories:", error);
    return [];
  }
}

/**
 * Get total message count
 * Excludes entries in review_queue with pending status
 */
export async function getTotalMessageCount(): Promise<number> {
  const pool = await getPool();
  if (!pool) {
    return 0;
  }

  try {
    const result = await pool.query(`
      SELECT COUNT(*) as count
      FROM messages m
      LEFT JOIN summaries s ON s.message_id = m.id
      WHERE NOT EXISTS (
        SELECT 1 FROM review_queue rq
        WHERE rq.summary_id = s.id AND rq.status = 'pending'
      )
    `);
    return parseInt(result.rows[0].count, 10);
  } catch (error) {
    console.error("[Database] Failed to count messages:", error);
    return 0;
  }
}
