/**
 * @fileoverview tRPC Router and Procedure Setup
 *
 * Configures the tRPC instance with:
 * - SuperJSON transformer for rich data serialization
 * - Three procedure types with different auth levels:
 *   - publicProcedure: No authentication required
 *   - protectedProcedure: Requires authenticated user
 *   - adminProcedure: Requires user with admin role
 *
 * @example
 * // Creating a public endpoint
 * router({
 *   hello: publicProcedure.query(() => 'Hello World'),
 * })
 *
 * @example
 * // Creating a protected endpoint
 * router({
 *   profile: protectedProcedure.query(({ ctx }) => ctx.user),
 * })
 */

import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from '@shared/const';
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";

/**
 * Initialize tRPC with context type and SuperJSON transformer.
 * SuperJSON allows serialization of Dates, Maps, Sets, etc.
 */
const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

/**
 * Creates a new tRPC router.
 * Use this to group related procedures together.
 */
export const router = t.router;

/**
 * Public procedure - no authentication required.
 * Use for endpoints that should be accessible to everyone.
 *
 * @example
 * publicProcedure.query(() => ({ message: 'Hello' }))
 */
export const publicProcedure = t.procedure;

/**
 * Middleware that requires an authenticated user.
 * Throws UNAUTHORIZED if no user is present in context.
 */
const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

/**
 * Protected procedure - requires authenticated user.
 * Throws UNAUTHORIZED (401) if user is not logged in.
 *
 * @example
 * protectedProcedure.query(({ ctx }) => {
 *   // ctx.user is guaranteed to be non-null here
 *   return { userId: ctx.user.id };
 * })
 */
export const protectedProcedure = t.procedure.use(requireUser);

/**
 * Admin procedure - requires authenticated user with admin role.
 * Throws FORBIDDEN (403) if user is not an admin.
 *
 * @example
 * adminProcedure.mutation(({ input }) => {
 *   // Only admins can execute this
 *   return deleteUser(input.userId);
 * })
 */
export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || ctx.user.role !== 'admin') {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  }),
);
