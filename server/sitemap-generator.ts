import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getGrantEntries } from './db';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = process.env.VITE_PUBLIC_APP_URL || 'https://cryptograntwire.com';

export async function generateSitemap() {
    console.log('[Sitemap] Generating sitemap...');

    try {
        const entries = await getGrantEntries({ limit: 10000 });
        console.log(`[Sitemap] Found ${entries.length} grant entries.`);

        const staticPages = [
            '',
            '/archive',
            '/contact',
        ];

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map(page => `  <url>
    <loc>${BASE_URL}${page}</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
${entries.map(entry => `  <url>
    <loc>${BASE_URL}/archive/${entry.slug}</loc>
    <lastmod>${entry.updatedAt ? new Date(entry.updatedAt).toISOString() : (entry.publishedAt ? new Date(entry.publishedAt).toISOString() : new Date().toISOString())}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`).join('\n')}
</urlset>`;

        // In production, write to dist/public (where static files are served from)
        // In development, write to client/public
        const isProduction = process.env.NODE_ENV === 'production';
        const publicDir = isProduction
            ? path.resolve(__dirname, '../dist/public')
            : path.resolve(__dirname, '../client/public');

        if (!fs.existsSync(publicDir)) {
            console.log(`[Sitemap] Creating directory: ${publicDir}`);
            fs.mkdirSync(publicDir, { recursive: true });
        }

        const outputPath = path.join(publicDir, 'sitemap.xml');
        fs.writeFileSync(outputPath, xml);
        console.log(`[Sitemap] Generated at ${outputPath}`);
    } catch (error) {
        console.error('[Sitemap] Error generating sitemap:', error);
    }
}

// Run as standalone script if executed directly
const isMainModule = process.argv[1]?.includes('sitemap-generator');
if (isMainModule) {
    generateSitemap().then(() => process.exit(0)).catch(() => process.exit(1));
}
