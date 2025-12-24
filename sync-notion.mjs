#!/usr/bin/env node
/**
 * Sync script to fetch entries from Notion and populate the local database
 * Run with: node sync-notion.mjs
 */

import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { grantEntries } from './drizzle/schema.js';

// Load environment variables
config();

// Simple Notion API client
async function fetchNotionEntries() {
  if (!process.env.NOTION_API_KEY || !process.env.NOTION_DATABASE_ID) {
    console.error('❌ NOTION_API_KEY and NOTION_DATABASE_ID must be set');
    process.exit(1);
  }

  console.log('📡 Fetching entries from Notion...');

  try {
    // Try new API first
    let response = await fetch(
      `https://api.notion.com/v1/data_sources/${process.env.NOTION_DATABASE_ID}/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NOTION_API_KEY}`,
          'Notion-Version': '2025-09-03',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sorts: [
            {
              property: 'Date Added',
              direction: 'descending',
            },
          ],
        }),
      }
    );

    // Fallback to old API if needed
    if (!response.ok) {
      console.log('⚠️  New API failed, trying legacy API...');
      response = await fetch(
        `https://api.notion.com/v1/databases/${process.env.NOTION_DATABASE_ID}/query`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.NOTION_API_KEY}`,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sorts: [
              {
                property: 'Date Added',
                direction: 'descending',
              },
            ],
          }),
        }
      );
    }

    if (!response.ok) {
      throw new Error(`Notion API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('❌ Failed to fetch from Notion:', error);
    throw error;
  }
}

function parseNotionEntry(page) {
  const properties = page.properties;
  
  // Extract title
  const titleProp = properties.Name || properties.Title || properties.title;
  let title = 'Untitled';
  if (titleProp?.title && titleProp.title.length > 0) {
    title = titleProp.title.map(t => t.plain_text).join('');
  }

  // Extract category
  let category = null;
  if (properties.Category?.select?.name) {
    category = properties.Category.select.name;
  }

  // Extract source URL
  let sourceUrl = null;
  if (properties.Link?.url) {
    sourceUrl = properties.Link.url;
  }

  // Extract tags
  let tags = null;
  if (properties.Tags?.multi_select) {
    tags = properties.Tags.multi_select.map(tag => tag.name).join(', ');
  }

  // Extract date
  let publishedAt = null;
  if (properties['Date Added']?.date?.start) {
    publishedAt = new Date(properties['Date Added'].date.start);
  } else if (properties['Date Added']?.created_time) {
    publishedAt = new Date(properties['Date Added'].created_time);
  } else if (page.created_time) {
    publishedAt = new Date(page.created_time);
  }

  // Generate slug
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 200);

  return {
    externalId: page.id,
    title,
    slug,
    category,
    content: title,
    sourceUrl,
    tags,
    publishedAt,
  };
}

async function syncToDatabase(entries) {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL must be set');
    process.exit(1);
  }

  console.log('💾 Syncing to database...');

  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const db = drizzle(pool);

  let synced = 0;
  for (const entry of entries) {
    try {
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
      synced++;
      process.stdout.write(`\r✓ Synced ${synced}/${entries.length} entries`);
    } catch (error) {
      console.error(`\n❌ Failed to sync entry "${entry.title}":`, error.message);
    }
  }

  await pool.end();
  console.log(`\n✅ Sync complete! ${synced} entries synced.`);
}

// Main execution
async function main() {
  console.log('🚀 Starting Notion sync...\n');

  try {
    const notionResults = await fetchNotionEntries();
    console.log(`✓ Fetched ${notionResults.length} entries from Notion\n`);

    const parsedEntries = notionResults.map(parseNotionEntry);
    
    await syncToDatabase(parsedEntries);
    
    console.log('\n🎉 Sync completed successfully!');
  } catch (error) {
    console.error('\n❌ Sync failed:', error);
    process.exit(1);
  }
}

main();
