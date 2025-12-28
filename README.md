# CryptoGrantWire

A curated archive of cryptocurrency and blockchain grant opportunities, governance proposals, and funding updates. Browse 3000+ entries from across the Web3 ecosystem.

## Features

- **Search-First Archive**: Full-text search across 3000+ funding updates
- **Category Filtering**: Filter by Governance & Treasury, Grant Programs, Funding Opportunities, Incentives, Research & Analysis, and Tools & Infrastructure
- **AI-Generated Summaries**: Each entry includes an AI-generated summary and title
- **Real-Time Updates**: Data synced from Telegram channels and processed with AI
- **Review Queue**: Entries requiring verification are excluded until reviewed

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Express + tRPC for type-safe APIs
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS + Radix UI components
- **Deployment**: Railway

## Project Structure

```
crypto-grant-wire-site-v1/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components (Home, Archive, Contact)
│   │   ├── lib/            # Utilities and tRPC client
│   │   └── App.tsx         # Main app with routing
│   └── public/             # Static assets
├── server/                 # Express backend
│   ├── _core/              # Core server setup
│   │   ├── index.ts        # Server entry point
│   │   ├── trpc.ts         # tRPC router setup
│   │   ├── context.ts      # Request context
│   │   ├── oauth.ts        # OAuth routes
│   │   └── env.ts          # Environment config
│   ├── routers.ts          # API route definitions
│   ├── db.ts               # Database queries
│   └── notion.ts           # Notion sync (optional)
├── drizzle/                # Database schema
│   └── schema.ts           # Table definitions
└── shared/                 # Shared types and constants
```

## Database Schema

### Core Tables

| Table | Description |
|-------|-------------|
| `messages` | Raw Telegram messages with timestamps and URLs |
| `summaries` | AI-generated summaries, titles, and entities |
| `categories` | 6 predefined categories for classification |
| `review_queue` | Entries pending manual review |
| `grant_entries` | Curated entries (legacy, from Notion sync) |
| `users` | User accounts for admin access |

### Key Relationships

```
messages (1) ──── (1) summaries
                      │
                      └── (N:1) categories

summaries (1) ──── (0..1) review_queue
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- PostgreSQL database

### Installation

```bash
# Clone the repository
git clone https://github.com/SovereignSignal/crypto-grant-wire-site-v1.git
cd crypto-grant-wire-site-v1

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your values

# Run database migrations
pnpm run db:migrate

# Start development server
pnpm run dev
```

### Environment Variables

See `.env.example` for all required and optional environment variables.

## API Endpoints

The API uses tRPC for type-safe communication. Key procedures:

### Messages Router (`/api/trpc/messages.*`)

| Procedure | Description |
|-----------|-------------|
| `messages.search` | Search messages with pagination and filters |
| `messages.categories` | Get categories with entry counts |
| `messages.count` | Get total message count |

### Grants Router (`/api/trpc/grants.*`)

| Procedure | Description |
|-----------|-------------|
| `grants.list` | List grant entries (legacy) |
| `grants.getBySlug` | Get single entry by slug |
| `grants.sync` | Sync from Notion (if configured) |

## Development

```bash
# Start dev server with hot reload
pnpm run dev

# Build for production
pnpm run build

# Type checking
pnpm run check

# Database migrations
pnpm run db:migrate
pnpm run db:generate
```

## Deployment

The site is deployed on Railway with automatic deployments from the `main` branch.

### Required Railway Variables

- `DATABASE_URL` - PostgreSQL connection string
- `NODE_ENV` - Set to `production`
- `PORT` - Automatically set by Railway

### Optional Variables

- `NOTION_API_KEY` - For Notion sync feature
- `NOTION_DATABASE_ID` - Notion database to sync from

## Architecture Notes

### Message Processing Pipeline

1. **Ingestion**: Telegram messages are collected and stored in `messages` table
2. **AI Processing**: External service generates summaries, extracts entities, and categorizes
3. **Review Queue**: Entries with issues are flagged for manual review
4. **Archive Display**: Only verified entries (not in pending review) are shown

### Search Implementation

- Full-text search using PostgreSQL `ILIKE` on summary and raw content
- Cursor-based pagination for efficient "Load More" functionality
- Category filtering via JOIN with categories table
- Entries in `review_queue` with `status='pending'` are automatically excluded

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT
