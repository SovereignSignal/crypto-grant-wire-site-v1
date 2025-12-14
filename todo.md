# Crypto Grant Wire - Project TODO

## Setup & Configuration
- [x] Install Notion API client dependency
- [x] Configure Notion API integration with database ID
- [x] Set up database schema for caching Notion entries
- [x] Copy generated hero images to project public folder
- [x] Configure Google Fonts (Space Grotesk, Inter)

## Backend Development
- [x] Create Notion API helper functions
- [x] Build tRPC procedures for fetching archive entries
- [x] Implement search and filter logic
- [x] Add ISR caching mechanism (database caching implemented)
- [x] Create slug generation utility

## Frontend Pages
- [x] Home page with hero section and satellite imagery
- [x] Category grid with 6 categories
- [x] Distribution channels section (Substack + Telegram)
- [x] Archive page with search and filters
- [x] Individual entry pages at /archive/[slug]
- [x] Contact page with bio and social links
- [x] Submit tip form implementation

## Design & Styling
- [x] Configure dark theme with custom color palette
- [x] Set up Space Grotesk and Inter fonts
- [x] Create reusable UI components
- [x] Implement responsive mobile-first design
- [x] Add satellite imagery backgrounds

## SEO & Meta
- [x] Add meta tags and Open Graph tags
- [x] Implement JSON-LD structured data
- [ ] Generate sitemap.xml
- [ ] Optimize images with alt text
- [ ] Configure semantic HTML structure

## Integrations
- [x] Embed Substack signup form
- [x] Add social links (X, Telegram, Substack)
- [x] Create footer with attribution

## Testing & Deployment
- [x] Test Notion API integration
- [x] Verify search and filter functionality
- [x] Test responsive design on mobile
- [x] Validate SEO implementation
- [x] Create deployment checkpoint

## Design Refinements (User Feedback)
- [x] Replace satellite array background with cosmic space theme
- [x] Integrate CGW logo (full and solo versions)
- [x] Redesign hero section - remove large buttons for cleaner look
- [x] Update navigation to use logo
- [x] Test new design across all pages
- [x] Add randomized images from Notion collection to archive entries

## Bug Fixes
- [x] Fix nested anchor tag errors in navigation components

## UI Improvements
- [x] Remove emojis from category cards
- [x] Add category definitions from Notion site
- [x] Remove duplicate newsletter subscription section from home page
- [x] Fix nested anchor tag error on archive page
- [x] Investigate and fix remaining nested anchor error on archive page (header/footer)
- [x] Replace contact form with Notion submission form link
- [x] Remove entry count from archive page subtitle
- [x] Redesign archive page to use grid tile layout instead of full-width cards
- [x] Update hero page typography to match logo font style for consistency
- [x] Update archive pagination to show 27 entries per page (3x9 grid)
- [x] Add tags field to database schema and Notion sync
- [x] Display tags on archive entry cards
- [x] Change View button to link directly to source URL instead of entry page
- [x] Remove unused Entry page component and route
- [x] Change pagination from 27 to 9 entries per page (3x3 grid)
- [x] Redesign hero section with logo-centric layout and new background
- [x] Increase logo size in hero section for better prominence
- [x] Remove gray tagline text from hero section
- [x] Add "Latest Grant Wires" section to home page showing 3 most recent entries
- [x] Remove Weekly Report, Real-Time Feed, and Browse Archive links from hero section
