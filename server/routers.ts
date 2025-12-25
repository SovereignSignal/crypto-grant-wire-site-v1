import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  getGrantEntries,
  getGrantEntryBySlug,
  countGrantEntries,
  upsertGrantEntry,
  searchMessages,
  getCategories,
  getTotalMessageCount,
} from "./db";
import { fetchNotionEntries, generateSlug } from "./notion";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  grants: router({
    /**
     * Sync entries from Notion to local database
     * This should be called periodically or on-demand
     * Only works if Notion is configured via environment variables
     */
    sync: publicProcedure.mutation(async () => {
      // Check if Notion is configured
      if (!process.env.NOTION_API_KEY || !process.env.NOTION_DATABASE_ID) {
        return {
          success: false,
          synced: 0,
          error: "Notion sync is not configured (missing NOTION_API_KEY or NOTION_DATABASE_ID)",
        };
      }

      try {
        const notionEntries = await fetchNotionEntries();

        for (const entry of notionEntries) {
          const slug = generateSlug(entry.title);
          await upsertGrantEntry({
            externalId: entry.id,
            title: entry.title,
            slug,
            category: entry.category,
            content: entry.content,
            sourceUrl: entry.sourceUrl,
            publishedAt: entry.publishedAt,
          });
        }

        return {
          success: true,
          synced: notionEntries.length,
        };
      } catch (error) {
        console.error("[Sync] Failed to sync entries:", error);
        return {
          success: false,
          synced: 0,
          error: String(error),
        };
      }
    }),

    /**
     * List grant entries with filters and pagination
     */
    list: publicProcedure
      .input(
        z.object({
          search: z.string().optional(),
          category: z.string().optional(),
          startDate: z.string().optional(),
          endDate: z.string().optional(),
          page: z.number().default(1),
          pageSize: z.number().default(20),
        })
      )
      .query(async ({ input }) => {
        const offset = (input.page - 1) * input.pageSize;
        
        const filters = {
          search: input.search,
          category: input.category,
          startDate: input.startDate ? new Date(input.startDate) : undefined,
          endDate: input.endDate ? new Date(input.endDate) : undefined,
        };

        const [entries, total] = await Promise.all([
          getGrantEntries({
            ...filters,
            limit: input.pageSize,
            offset,
          }),
          countGrantEntries(filters),
        ]);

        return {
          entries,
          total,
          page: input.page,
          pageSize: input.pageSize,
          totalPages: Math.ceil(total / input.pageSize),
        };
      }),

    /**
     * Get a single grant entry by slug
     */
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const entry = await getGrantEntryBySlug(input.slug);
        return entry || null;
      }),

    /**
     * Get available categories
     */
    categories: publicProcedure.query(async () => {
      // Return the 6 defined categories
      return [
        "Governance & Treasury",
        "Grant Programs",
        "Funding Opportunities",
        "Incentives",
        "Research & Analysis",
        "Tools & Infrastructure",
      ];
    }),

    /**
     * Get most recent grant entries
     */
    recent: publicProcedure
      .input(z.object({ limit: z.number().default(3) }))
      .query(async ({ input }) => {
        const entries = await getGrantEntries({
          limit: input.limit,
          offset: 0,
        });
        return entries;
      }),
  }),

  /**
   * Messages archive (search-first interface for 3000+ entries)
   */
  messages: router({
    /**
     * Search messages with summaries
     * Supports cursor-based pagination for "Load More"
     */
    search: publicProcedure
      .input(
        z.object({
          query: z.string().optional(),
          category: z.string().optional(),
          cursor: z.number().optional(),
          limit: z.number().default(20),
        })
      )
      .query(async ({ input }) => {
        return await searchMessages({
          query: input.query,
          category: input.category,
          cursor: input.cursor,
          limit: input.limit,
        });
      }),

    /**
     * Get categories with message counts
     */
    categories: publicProcedure.query(async () => {
      return await getCategories();
    }),

    /**
     * Get total message count
     */
    count: publicProcedure.query(async () => {
      return await getTotalMessageCount();
    }),
  }),

  /**
   * Contact form submission
   */
  contact: router({
    submit: publicProcedure
      .input(
        z.object({
          name: z.string().min(1),
          email: z.string().email(),
          message: z.string().min(10),
        })
      )
      .mutation(async ({ input }) => {
        // For now, just log the submission
        // In production, this could send an email or store in database
        console.log("[Contact] Submission received:", input);
        
        return {
          success: true,
          message: "Thank you for your submission!",
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
