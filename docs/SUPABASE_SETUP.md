# Supabase PostgreSQL Setup Guide

## Prerequisites

- Supabase account (free tier available at https://supabase.com)
- v0 project with Supabase integration connected
- Prisma 5.x installed

## Step 1: Get Supabase Connection String

1. Go to your Supabase project dashboard
2. Click **Settings** → **Database**
3. Copy the **Connection String** (URI format)
4. Look for the section that shows the connection string starting with `postgresql://`

The string should look like:
```
postgresql://postgres.[project_id]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?sslmode=require
```

## Step 2: Set Environment Variable

Add to `.env.local`:

```env
DATABASE_URL=postgresql://postgres.[project_id]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?sslmode=require
```

**Important:**
- Replace `[password]` with your actual database password
- Keep this file in `.gitignore`
- Never commit this to version control

## Step 3: Generate Prisma Client

```bash
pnpm prisma generate
```

This creates the TypeScript types from your schema.

## Step 4: Create Database Tables

```bash
# Option 1: Using db push (faster for development)
pnpm db:push

# Option 2: Using migrations (recommended for production)
pnpm prisma migrate dev --name init
```

**db push vs migrate:**
- `db push`: Syncs Prisma schema directly with database, good for rapid development
- `prisma migrate`: Creates versioned migrations, better for production/team collaboration

## Step 5: Seed Database with Dummy Data

```bash
pnpm db:seed
```

This populates your database with:
- 1 Admin user
- 2 Additional users (Investigator, Analyst)
- 20 Investigations
- 50 Investigation results
- 10 Reports
- 30 Activity logs

## Step 6: Verify Connection

```bash
# Open Prisma Studio to inspect database
pnpm db:studio
```

This opens a web UI where you can:
- Browse all tables
- Create/edit/delete records
- View relationships
- Test queries

## Step 7: Start Backend Server

```bash
pnpm dev
```

The API should now be accessible at `http://localhost:3000/api/investigations`

## Testing the API

### Create Investigation
```bash
curl -X POST http://localhost:3000/api/investigations \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "domain": "example.com"
  }'
```

### Get Investigations
```bash
curl http://localhost:3000/api/investigations
```

### Get Investigation by ID
```bash
curl http://localhost:3000/api/investigations/[id]
```

## Troubleshooting

### Connection Error: "Can't reach database server"

1. Verify DATABASE_URL is correct in `.env.local`
2. Check if Supabase project is running (not paused)
3. Ensure IP is whitelisted in Supabase (usually automatic)
4. Test connection:
   ```bash
   pnpm prisma db execute --stdin < /dev/null
   ```

### Migration Failed

1. Check Prisma schema for syntax errors
2. Verify database permissions
3. Try resetting (⚠️ this deletes all data):
   ```bash
   pnpm prisma migrate reset
   ```

### Seed Failed

1. Ensure schema is migrated first: `pnpm db:push`
2. Check for duplicate email constraint
3. Verify user IDs in seed match CUID format
4. Check database logs in Supabase dashboard

### Type Errors After Schema Change

1. Regenerate Prisma client:
   ```bash
   pnpm prisma generate
   ```
2. Restart dev server

## Database Backup

### Manual Backup
```bash
# Export to file
pg_dump $DATABASE_URL > backup.sql

# Restore from file
psql $DATABASE_URL < backup.sql
```

### Supabase Automatic Backups
- Supabase automatically backs up your database daily
- Access via Dashboard → Settings → Backups

## Performance Optimization

### Add Indexes (already in schema)
```sql
CREATE INDEX idx_investigation_status ON "Investigation"("status");
CREATE INDEX idx_investigation_created_at ON "Investigation"("createdAt");
```

### Monitor Slow Queries
```bash
pnpm prisma studio
```

Look at the SQL logs tab to see query performance.

### Cache Configuration
```bash
# Connect pooler mode (optional)
# Use "connection pooler" in Supabase settings for better performance
```

## Production Checklist

- [ ] DATABASE_URL is secure (never hardcode)
- [ ] Backups are enabled in Supabase
- [ ] Row-level security policies are configured (if needed)
- [ ] Indexes are optimized for query patterns
- [ ] Monitoring is set up
- [ ] Connection limits are appropriate
- [ ] Regular maintenance schedule exists

## Next Steps

1. Read [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) for complete schema reference
2. Check [INVESTIGATION_API.md](./INVESTIGATION_API.md) for API documentation
3. Review [BACKEND_ARCHITECTURE.md](./BACKEND_ARCHITECTURE.md) for design patterns
