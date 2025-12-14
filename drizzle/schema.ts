import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, index } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Grant Wire entries cached from Notion database
 * Used for search, filtering, and display
 */
export const grantEntries = mysqlTable("grant_entries", {
  id: int("id").autoincrement().primaryKey(),
  /** Notion page ID for syncing */
  notionId: varchar("notionId", { length: 128 }).notNull().unique(),
  /** Entry title */
  title: text("title").notNull(),
  /** URL-friendly slug for entry pages */
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  /** Category: Governance & Treasury, Grant Programs, etc. */
  category: varchar("category", { length: 128 }),
  /** Entry content/excerpt */
  content: text("content"),
  /** Source URL */
  sourceUrl: text("sourceUrl"),
  /** Tags from Notion (comma-separated) */
  tags: text("tags"),
  /** Date the entry was published */
  publishedAt: timestamp("publishedAt"),
  /** When this cache entry was created */
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  /** When this cache entry was last updated */
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  slugIdx: index("slug_idx").on(table.slug),
  categoryIdx: index("category_idx").on(table.category),
  publishedAtIdx: index("published_at_idx").on(table.publishedAt),
}));

export type GrantEntry = typeof grantEntries.$inferSelect;
export type InsertGrantEntry = typeof grantEntries.$inferInsert;
