/**
 * @fileoverview RSS/Atom Feed Generation
 *
 * Generates syndication feeds for Crypto Grant Wire content.
 * Supports both RSS 2.0 and Atom 1.0 formats.
 *
 * Feed types:
 * - Main feed: Latest 50 funding updates
 * - Category feeds: Updates filtered by category
 *
 * @module server/feeds
 */

import { Feed } from "feed";
import { searchMessages, getCategories, type MessageWithSummary } from "./db";

/** Base URL for the site (used in feed links) */
const SITE_URL = process.env.SITE_URL || "https://cryptograntwire.com";

/** Default number of items in feeds */
const FEED_LIMIT = 50;

/**
 * Creates a new Feed instance with site metadata.
 *
 * @param options - Optional overrides for feed metadata
 * @returns Configured Feed instance
 */
function createBaseFeed(options?: {
  title?: string;
  description?: string;
  feedUrl?: string;
}): Feed {
  return new Feed({
    title: options?.title || "Crypto Grant Wire",
    description:
      options?.description ||
      "Curated funding updates from the crypto ecosystem. Grants, treasuries, and funding opportunities.",
    id: SITE_URL,
    link: SITE_URL,
    language: "en",
    image: `${SITE_URL}/favicon.svg`,
    favicon: `${SITE_URL}/favicon.ico`,
    copyright: `All rights reserved ${new Date().getFullYear()}, Crypto Grant Wire`,
    updated: new Date(),
    generator: "Crypto Grant Wire Feed Generator",
    feedLinks: {
      rss: options?.feedUrl || `${SITE_URL}/api/feeds/messages.rss`,
      atom: options?.feedUrl?.replace(".rss", ".atom") || `${SITE_URL}/api/feeds/messages.atom`,
    },
  });
}

/**
 * Extracts the first URL from an array of extracted URLs.
 *
 * @param extractedUrls - Array of URLs extracted from the message
 * @returns The first URL or null if none exist
 */
function getSourceUrl(extractedUrls: string[] | null): string | null {
  if (!extractedUrls || extractedUrls.length === 0) return null;
  return extractedUrls[0];
}

/**
 * Converts a message to a feed item.
 *
 * @param msg - Message with summary data
 * @returns Feed item object
 */
function messageToFeedItem(msg: MessageWithSummary): Parameters<Feed["addItem"]>[0] {
  const sourceUrl = getSourceUrl(msg.extractedUrls);
  const link = sourceUrl || `${SITE_URL}/archive`;

  return {
    title: msg.title || "Funding Update",
    id: `${SITE_URL}/message/${msg.id}`,
    link,
    description: msg.summary || msg.rawContent?.substring(0, 500) || "",
    content: msg.summary || undefined,
    date: new Date(msg.timestamp),
    category: msg.categoryName ? [{ name: msg.categoryName }] : [],
  };
}

/**
 * Generates the main feed with latest messages.
 *
 * @param format - Output format: "rss" or "atom"
 * @returns Feed content as string
 */
export async function generateMainFeed(format: "rss" | "atom"): Promise<string> {
  const { messages } = await searchMessages({ limit: FEED_LIMIT });

  const feed = createBaseFeed();

  // Set updated to most recent message timestamp
  if (messages.length > 0) {
    feed.options.updated = new Date(messages[0].timestamp);
  }

  // Add items
  for (const msg of messages) {
    feed.addItem(messageToFeedItem(msg));
  }

  return format === "rss" ? feed.rss2() : feed.atom1();
}

/**
 * Generates a category-specific feed.
 *
 * @param categoryName - Name of the category to filter by
 * @param format - Output format: "rss" or "atom"
 * @returns Feed content as string, or null if category not found
 */
export async function generateCategoryFeed(
  categoryName: string,
  format: "rss" | "atom"
): Promise<string | null> {
  // Verify category exists
  const categories = await getCategories();
  const category = categories.find(
    (c) => c.name.toLowerCase() === categoryName.toLowerCase()
  );

  if (!category) {
    return null;
  }

  const { messages } = await searchMessages({
    category: category.name,
    limit: FEED_LIMIT,
  });

  const slug = category.name.toLowerCase().replace(/\s+/g, "-").replace(/&/g, "and");
  const feed = createBaseFeed({
    title: `Crypto Grant Wire - ${category.name}`,
    description: `${category.name} updates from Crypto Grant Wire`,
    feedUrl: `${SITE_URL}/api/feeds/category/${slug}.rss`,
  });

  // Set updated to most recent message timestamp
  if (messages.length > 0) {
    feed.options.updated = new Date(messages[0].timestamp);
  }

  // Add items
  for (const msg of messages) {
    feed.addItem(messageToFeedItem(msg));
  }

  return format === "rss" ? feed.rss2() : feed.atom1();
}

/**
 * Gets available feed URLs for all categories.
 *
 * @returns Array of feed metadata objects
 */
export async function getAvailableFeeds(): Promise<
  Array<{ name: string; slug: string; rssUrl: string; atomUrl: string; count: number }>
> {
  const categories = await getCategories();

  const feeds = [
    {
      name: "All Updates",
      slug: "messages",
      rssUrl: `${SITE_URL}/api/feeds/messages.rss`,
      atomUrl: `${SITE_URL}/api/feeds/messages.atom`,
      count: categories.reduce((sum, c) => sum + c.count, 0),
    },
  ];

  for (const category of categories) {
    const slug = category.name.toLowerCase().replace(/\s+/g, "-").replace(/&/g, "and");
    feeds.push({
      name: category.name,
      slug,
      rssUrl: `${SITE_URL}/api/feeds/category/${slug}.rss`,
      atomUrl: `${SITE_URL}/api/feeds/category/${slug}.atom`,
      count: category.count,
    });
  }

  return feeds;
}
