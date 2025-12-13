import { Client } from "@notionhq/client";

// Initialize Notion client
// Note: NOTION_API_KEY and NOTION_DATABASE_ID will be provided via environment variables
let notionClient: Client | null = null;

function getNotionClient() {
  if (!notionClient && process.env.NOTION_API_KEY) {
    notionClient = new Client({
      auth: process.env.NOTION_API_KEY,
    });
  }
  return notionClient;
}

export interface NotionEntry {
  id: string;
  title: string;
  category?: string;
  content?: string;
  sourceUrl?: string;
  publishedAt?: Date;
}

/**
 * Fetch all entries from the Notion database
 */
export async function fetchNotionEntries(): Promise<NotionEntry[]> {
  const client = getNotionClient();
  if (!client || !process.env.NOTION_DATABASE_ID) {
    console.warn("[Notion] API key or database ID not configured");
    return [];
  }

  try {
    // Use the new data sources API endpoint
    const response: any = await fetch(
      `https://api.notion.com/v1/data_sources/${process.env.NOTION_DATABASE_ID}/query`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.NOTION_API_KEY}`,
          "Notion-Version": "2025-09-03",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sorts: [
            {
              property: "Date Added",
              direction: "descending",
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      // Fallback to old API if new API fails
      const legacyResponse: any = await fetch(
        `https://api.notion.com/v1/databases/${process.env.NOTION_DATABASE_ID}/query`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.NOTION_API_KEY}`,
            "Notion-Version": "2022-06-28",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sorts: [
              {
                property: "Date Added",
                direction: "descending",
              },
            ],
          }),
        }
      );

      if (!legacyResponse.ok) {
        throw new Error(`Notion API error: ${legacyResponse.status}`);
      }

      const data = await legacyResponse.json();
      return parseNotionResults(data.results);
    }

    const data = await response.json();
    return parseNotionResults(data.results);
  } catch (error) {
    console.error("[Notion] Failed to fetch entries:", error);
    return [];
  }
}

/**
 * Parse Notion API results into NotionEntry objects
 */
function parseNotionResults(results: any[]): NotionEntry[] {
  return results.map((page: any) => {
    const properties = page.properties;
    
    // Extract title
    const titleProp = properties.Name || properties.Title || properties.title;
    let title = "Untitled";
    if (titleProp?.title && titleProp.title.length > 0) {
      title = titleProp.title.map((t: any) => t.plain_text).join("");
    }

    // Extract category
    let category: string | undefined;
    if (properties.Category?.select?.name) {
      category = properties.Category.select.name;
    }

    // Extract source URL
    let sourceUrl: string | undefined;
    if (properties.Link?.url) {
      sourceUrl = properties.Link.url;
    }

    // Extract date
    let publishedAt: Date | undefined;
    if (properties["Date Added"]?.date?.start) {
      publishedAt = new Date(properties["Date Added"].date.start);
    } else if (properties["Date Added"]?.created_time) {
      publishedAt = new Date(properties["Date Added"].created_time);
    } else if (page.created_time) {
      publishedAt = new Date(page.created_time);
    }

    return {
      id: page.id,
      title,
      category,
      sourceUrl,
      publishedAt,
      content: title, // Use title as content for now
    };
  });
}

/**
 * Fetch a single page content from Notion
 */
export async function fetchNotionPage(pageId: string): Promise<{ content: string } | null> {
  const client = getNotionClient();
  if (!client) {
    console.warn("[Notion] API key not configured");
    return null;
  }

  try {
    // Fetch page blocks
    const blocks = await client.blocks.children.list({
      block_id: pageId,
    });

    // Extract text content from blocks
    const content = blocks.results
      .map((block: any) => {
        if (block.type === "paragraph" && block.paragraph?.rich_text) {
          return block.paragraph.rich_text.map((t: any) => t.plain_text).join("");
        }
        return "";
      })
      .filter(Boolean)
      .join("\n\n");

    return { content };
  } catch (error) {
    console.error("[Notion] Failed to fetch page:", error);
    return null;
  }
}

/**
 * Generate URL-friendly slug from title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 200);
}
