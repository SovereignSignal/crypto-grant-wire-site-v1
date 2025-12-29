/**
 * @fileoverview Database Access Layer
 *
 * Provides functions for interacting with the PostgreSQL database:
 * - Connection pooling with lazy initialization
 * - User management (upsert, get by ID)
 * - Grant entries (CRUD operations)
 * - Message search with summaries (for Archive page)
 * - Category management
 *
 * Uses Drizzle ORM for type-safe queries and raw pg.Pool for complex JOINs.
 *
 * @module server/db
 */

import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { InsertUser, users, grantEntries, InsertGrantEntry, GrantEntry } from "../drizzle/schema";
import { ENV } from './_core/env';
import pg from "pg";

/** Singleton Drizzle ORM instance */
let _db: ReturnType<typeof drizzle> | null = null;

/** Singleton PostgreSQL connection pool */
let _pool: pg.Pool | null = null;

/**
 * Gets the Drizzle ORM instance, creating it lazily if needed.
 *
 * Allows local tooling (like type generation) to run without
 * a database connection by returning null when DATABASE_URL is not set.
 *
 * @returns Drizzle instance or null if database unavailable
 *
 * @example
 * const db = await getDb();
 * if (db) {
 *   const users = await db.select().from(usersTable);
 * }
 */
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

/**
 * Gets the raw PostgreSQL connection pool for direct SQL queries.
 *
 * Use this for complex queries that can't be expressed with Drizzle ORM,
 * such as multi-table JOINs with dynamic conditions.
 *
 * @returns PostgreSQL Pool or null if database unavailable
 *
 * @example
 * const pool = await getPool();
 * if (pool) {
 *   const result = await pool.query('SELECT * FROM messages WHERE id = $1', [id]);
 * }
 */
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

/**
 * Creates or updates a user in the database.
 *
 * Uses PostgreSQL ON CONFLICT DO UPDATE to handle both insert and update
 * in a single operation. Automatically assigns admin role to the owner.
 *
 * @param user - User data to upsert (openId is required)
 * @throws Error if openId is not provided
 *
 * @example
 * await upsertUser({
 *   openId: 'oauth-user-id-123',
 *   name: 'John Doe',
 *   email: 'john@example.com'
 * });
 */
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

/**
 * Retrieves a user by their OAuth Open ID.
 *
 * @param openId - The user's OAuth identifier
 * @returns The user record or undefined if not found
 *
 * @example
 * const user = await getUserByOpenId('oauth-user-id-123');
 * if (user) {
 *   console.log(`Welcome, ${user.name}`);
 * }
 */
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
 * Creates or updates a grant entry in the database.
 *
 * Uses externalId for conflict detection. If an entry with the same
 * externalId exists, it will be updated; otherwise, a new entry is created.
 *
 * @param entry - Grant entry data to upsert
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

/** Cached flag for whether FTS is available */
let _ftsAvailable: boolean | null = null;

/**
 * Check if full-text search is available (search_vector column exists)
 */
async function isFtsAvailable(): Promise<boolean> {
  if (_ftsAvailable !== null) return _ftsAvailable;

  const pool = await getPool();
  if (!pool) return false;

  try {
    const result = await pool.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'summaries' AND column_name = 'search_vector'
    `);
    _ftsAvailable = result.rows.length > 0;
    console.log(`[Database] Full-text search ${_ftsAvailable ? 'enabled' : 'disabled (run migration to enable)'}`);
    return _ftsAvailable;
  } catch {
    _ftsAvailable = false;
    return false;
  }
}

/**
 * Search messages with summaries
 * Supports cursor-based pagination for efficient "Load More"
 * Uses PostgreSQL full-text search when available, falls back to ILIKE
 */
export async function searchMessages(params: {
  query?: string;
  categories?: string[];
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

  // Check if FTS is available
  const useFts = params.query && (await isFtsAvailable());

  // Cursor-based pagination (fetch messages older than cursor)
  if (params.cursor) {
    conditions.push(`m.id < $${paramIndex}`);
    values.push(params.cursor);
    paramIndex++;
  }

  // Search query - use FTS when available, fall back to ILIKE
  if (params.query) {
    if (useFts) {
      // Full-text search with ranking
      conditions.push(`s.search_vector @@ plainto_tsquery('english', $${paramIndex})`);
      values.push(params.query);
      paramIndex++;
    } else {
      // Fallback to ILIKE pattern matching
      conditions.push(`(s.summary ILIKE $${paramIndex} OR m.raw_content ILIKE $${paramIndex})`);
      values.push(`%${params.query}%`);
      paramIndex++;
    }
  }

  // Category filter (supports multiple categories with OR logic)
  if (params.categories && params.categories.length > 0) {
    const placeholders = params.categories.map((_, i) => `$${paramIndex + i}`).join(', ');
    conditions.push(`c.name IN (${placeholders})`);
    values.push(...params.categories);
    paramIndex += params.categories.length;
  }

  // Always exclude entries in review_queue with pending status
  conditions.push(`NOT EXISTS (
    SELECT 1 FROM review_queue rq
    WHERE rq.summary_id = s.id AND rq.status = 'pending'
  )`);

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Build ORDER BY clause - use relevance ranking for FTS searches
  let orderByClause: string;
  if (useFts && params.query) {
    // Order by relevance score when searching, then by timestamp
    orderByClause = `ORDER BY ts_rank(s.search_vector, plainto_tsquery('english', $${paramIndex})) DESC, m.timestamp DESC, m.id DESC`;
    values.push(params.query);
    paramIndex++;
  } else {
    orderByClause = `ORDER BY m.timestamp DESC, m.id DESC`;
  }

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
    ${orderByClause}
    LIMIT $${paramIndex}
  `;
  values.push(limit + 1); // Fetch one extra to determine if there are more

  // Count query (without cursor, but with search/category filters)
  const countConditions: string[] = [];
  const countValues: any[] = [];
  let countParamIndex = 1;

  if (params.query) {
    if (useFts) {
      countConditions.push(`s.search_vector @@ plainto_tsquery('english', $${countParamIndex})`);
      countValues.push(params.query);
      countParamIndex++;
    } else {
      countConditions.push(`(s.summary ILIKE $${countParamIndex} OR m.raw_content ILIKE $${countParamIndex})`);
      countValues.push(`%${params.query}%`);
      countParamIndex++;
    }
  }

  if (params.categories && params.categories.length > 0) {
    const placeholders = params.categories.map((_, i) => `$${countParamIndex + i}`).join(', ');
    countConditions.push(`c.name IN (${placeholders})`);
    countValues.push(...params.categories);
    countParamIndex += params.categories.length;
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

export interface SearchSuggestion {
  term: string;
  frequency: number;
  type: "protocol" | "term" | "category";
}

/**
 * Get search suggestions based on prefix
 * Pulls from entities (protocols, key_terms) and categories
 */
export async function getSearchSuggestions(params: {
  prefix: string;
  limit?: number;
}): Promise<SearchSuggestion[]> {
  const pool = await getPool();
  if (!pool) {
    console.warn("[Database] Cannot get suggestions: database not available");
    return [];
  }

  const limit = params.limit || 8;
  const prefix = params.prefix.toLowerCase();

  // Query extracts terms from entities JSON (cast to jsonb for compatibility) and combines with category names
  const query = `
    WITH protocol_terms AS (
      SELECT
        jsonb_array_elements_text(entities::jsonb->'protocols') as term,
        'protocol' as type
      FROM summaries
      WHERE entities IS NOT NULL AND entities::jsonb->'protocols' IS NOT NULL
    ),
    key_terms AS (
      SELECT
        jsonb_array_elements_text(entities::jsonb->'key_terms') as term,
        'term' as type
      FROM summaries
      WHERE entities IS NOT NULL AND entities::jsonb->'key_terms' IS NOT NULL
    ),
    category_terms AS (
      SELECT name as term, 'category' as type
      FROM categories
    ),
    all_terms AS (
      SELECT term, type FROM protocol_terms
      UNION ALL
      SELECT term, type FROM key_terms
      UNION ALL
      SELECT term, type FROM category_terms
    )
    SELECT
      term,
      type,
      COUNT(*) as frequency
    FROM all_terms
    WHERE LOWER(term) LIKE $1 || '%'
      AND LENGTH(term) >= 2
    GROUP BY term, type
    ORDER BY frequency DESC, LENGTH(term) ASC
    LIMIT $2
  `;

  try {
    const result = await pool.query(query, [prefix, limit]);
    return result.rows.map((row) => ({
      term: row.term,
      frequency: parseInt(row.frequency, 10),
      type: row.type as SearchSuggestion["type"],
    }));
  } catch (error) {
    console.error("[Database] Failed to get search suggestions:", error);
    return [];
  }
}
