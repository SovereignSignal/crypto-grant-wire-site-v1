/**
 * @fileoverview tRPC Context Module
 *
 * Creates the request context for tRPC procedures. The context includes:
 * - Express request/response objects
 * - Authenticated user (if any)
 *
 * This context is available to all tRPC procedures and middleware.
 */

import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";

/**
 * The context type available to all tRPC procedures.
 *
 * @property req - Express request object
 * @property res - Express response object
 * @property user - Authenticated user or null for anonymous requests
 */
export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

/**
 * Creates the tRPC context for each request.
 *
 * Attempts to authenticate the user from the request cookies/headers.
 * If authentication fails, the user is set to null (anonymous access).
 * This allows public procedures to work without authentication while
 * protected procedures can check for user presence.
 *
 * @param opts - Express request/response from tRPC adapter
 * @returns Promise resolving to the request context
 *
 * @example
 * // In a tRPC procedure:
 * .query(({ ctx }) => {
 *   if (!ctx.user) throw new Error('Unauthorized');
 *   return ctx.user.name;
 * })
 */
export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
