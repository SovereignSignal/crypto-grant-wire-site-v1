import { serial, text, timestamp, varchar, index, pgTable, pgEnum } from "drizzle-orm/pg-core";

// Define role enum for PostgreSQL
export const roleEnum = pgEnum("role", ["user", "admin"]);

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = pgTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: serial("id").primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Grant Wire entries - can be populated from Notion sync or direct database entry
 * Used for search, filtering, and display
 */
export const grantEntries = pgTable("grant_entries", {
  id: serial("id").primaryKey(),
  /** External ID for syncing (e.g., Notion page ID). Nullable for direct DB entries. */
  externalId: varchar("externalId", { length: 128 }).unique(),
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
  /** Tags (comma-separated) */
  tags: text("tags"),
  /** Date the entry was published */
  publishedAt: timestamp("publishedAt"),
  /** When this entry was created */
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  /** When this entry was last updated */
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => [
  index("slug_idx").on(table.slug),
  index("category_idx").on(table.category),
  index("published_at_idx").on(table.publishedAt),
]);

export type GrantEntry = typeof grantEntries.$inferSelect;
export type InsertGrantEntry = typeof grantEntries.$inferInsert;
