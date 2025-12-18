import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getGrantEntries } from './db';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = process.env.VITE_PUBLIC_APP_URL || 'https://cryptograntwire.com';

async function generateSitemap() {
    console.log('Generating sitemap...');

    try {
        const entries = await getGrantEntries({ limit: 10000 });
        console.log(`Found ${entries.length} grant entries.`);

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

        // Target client/public/sitemap.xml
        // We are in server/, so client is ../client
        const publicDir = path.resolve(__dirname, '../client/public');

        if (!fs.existsSync(publicDir)) {
            console.log(`Creating directory: ${publicDir}`);
            fs.mkdirSync(publicDir, { recursive: true });
        }

        const outputPath = path.join(publicDir, 'sitemap.xml');
        fs.writeFileSync(outputPath, xml);
        console.log(`✅ Sitemap generated at ${outputPath}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error generating sitemap:', error);
        process.exit(1);
    }
}

generateSitemap();
