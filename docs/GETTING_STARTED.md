# Getting Started - Digital Investigation System Backend

## Quick Start

### 1. Setup Supabase Connection

The backend requires a PostgreSQL database. We'll use Supabase for this.

#### Get your Supabase Connection String

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Click "Settings" in the left sidebar
4. Go to "Database"
5. Copy the "Connection string" (URI format with password)

The connection string looks like:
```
postgresql://postgres:[PASSWORD]@[PROJECT_ID].postgres.supabase.co:5432/postgres
```

#### Set Environment Variable

Create or edit `.env.local` in the project root:

```bash
DATABASE_URL="postgresql://postgres:[PASSWORD]@[PROJECT_ID].postgres.supabase.co:5432/postgres"
```

Replace:
- `[PASSWORD]` - Your database password
- `[PROJECT_ID]` - Your Supabase project ID

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Generate Prisma Client

```bash
pnpm prisma generate
```

### 4. Create Database Tables

Run the initial migration:

```bash
pnpm prisma migrate dev --name init
```

This will:
- Create all tables in your Supabase database
- Generate the Prisma Client
- Create a migration file

### 5. Start Development Server

```bash
pnpm dev
```

The server will start on `http://localhost:3000`

### 6. Test the API

Create an investigation:

```bash
curl -X POST http://localhost:3000/api/investigations \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "domain": "example.com"
  }'
```

Get all investigations:

```bash
curl http://localhost:3000/api/investigations
```

## Project Structure

```
app/api/investigations/           # API endpoints
services/investigation.service.ts # Business logic
repositories/investigation.repository.ts # Data access
lib/                             # Utilities
  - validation.ts  # Zod schemas
  - logger.ts      # Logger
  - prisma.ts      # Prisma client
  - api-response.ts # Response formatter
types/index.ts                   # TypeScript types
prisma/schema.prisma             # Database schema
docs/                            # Documentation
```

## API Endpoints

### Create Investigation
```
POST /api/investigations
```

### Get All Investigations
```
GET /api/investigations?page=1&limit=10
```

### Get Investigation
```
GET /api/investigations/:id
```

### Update Investigation
```
PATCH /api/investigations/:id
```

### Delete Investigation
```
DELETE /api/investigations/:id
```

See `INVESTIGATION_API.md` for detailed endpoint documentation.

## Available Commands

```bash
# Development
pnpm dev              # Start dev server on port 3000

# Build
pnpm build            # Build for production
pnpm start            # Start production server

# Database
pnpm prisma migrate dev     # Create and run migration
pnpm prisma migrate deploy  # Run migrations (production)
pnpm prisma generate        # Generate Prisma Client
pnpm prisma studio         # Open Prisma Studio GUI

# Linting
pnpm lint             # Run ESLint

# Type checking
pnpm tsc --noEmit     # Check TypeScript (if added to scripts)
```

## Troubleshooting

### DATABASE_URL Not Set

Error: `error: Environment variable not found: DATABASE_URL`

**Solution:**
1. Copy your Supabase connection string
2. Create `.env.local` file in project root
3. Add: `DATABASE_URL="postgresql://..."`
4. Restart dev server

### Migration Errors

If you get migration errors:

```bash
# Reset everything (⚠️ Deletes all data)
pnpm prisma migrate reset

# Then run again
pnpm prisma migrate dev --name init
```

### Connection Timeout

If Supabase connection times out:

1. Check your internet connection
2. Verify DATABASE_URL is correct
3. Check Supabase project is active
4. Try connecting from [Supabase Dashboard](https://app.supabase.com) first

### Port Already in Use

If port 3000 is in use:

```bash
# On macOS/Linux
lsof -i :3000
kill -9 <PID>

# On Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

Then restart: `pnpm dev`

## Next Steps

1. ✅ Set up DATABASE_URL
2. ✅ Run migrations
3. ✅ Start dev server
4. ✅ Test API endpoints
5. Read `INVESTIGATION_API.md` for API details
6. Read `BACKEND_ARCHITECTURE.md` for architecture overview
7. Read `MIGRATION_SETUP.md` for database setup details

## Useful Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Zod Documentation](https://zod.dev/)
- [Next.js Documentation](https://nextjs.org/docs)

## Development Notes

### Logging

The system uses a custom logger. In development, it outputs formatted text. In production, it outputs JSON.

```typescript
import { logger } from '@/lib/logger'

logger.info('Message', { data: 'value' })
logger.error('Error', error)
logger.debug('Debug info', data)
logger.warn('Warning', info)
```

### Database Schema

View the database schema in `prisma/schema.prisma`.

Key tables:
- `Investigation` - Main investigations table with search targets and metadata

To view data in the database:

```bash
pnpm prisma studio
```

This opens a GUI at `http://localhost:5555`

## Production Deployment

Before deploying:

1. Set `DATABASE_URL` in production environment
2. Run `pnpm build` and fix any errors
3. Run `pnpm prisma migrate deploy` on first deploy
4. Set `NODE_ENV=production`
5. Configure error tracking (Sentry, etc.)

## Support

For issues:
1. Check the error message and troubleshooting section above
2. Review the API documentation
3. Check Supabase dashboard for database status
4. Review Next.js dev server logs
