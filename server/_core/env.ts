/**
 * @fileoverview Environment Configuration
 *
 * Centralized access to environment variables with defaults.
 * All environment variables should be accessed through this module
 * rather than directly from process.env.
 *
 * @see .env.example for documentation of each variable
 */

/**
 * Environment configuration object.
 * All values default to empty string if not set.
 *
 * @property appId - Application identifier (VITE_APP_ID)
 * @property cookieSecret - Secret for signing cookies (JWT_SECRET)
 * @property databaseUrl - PostgreSQL connection string (DATABASE_URL)
 * @property oAuthServerUrl - OAuth server endpoint (OAUTH_SERVER_URL)
 * @property ownerOpenId - Admin user's Open ID (OWNER_OPEN_ID)
 * @property isProduction - True if NODE_ENV is "production"
 * @property forgeApiUrl - Forge API endpoint (BUILT_IN_FORGE_API_URL)
 * @property forgeApiKey - Forge API authentication key (BUILT_IN_FORGE_API_KEY)
 */
export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
};
