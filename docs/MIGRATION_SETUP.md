# Prisma Migration Setup

This document explains how to set up the database migrations for the Digital Investigation System.

## Prerequisites

1. Supabase project is created and configured
2. `DATABASE_URL` environment variable is set with your Supabase PostgreSQL connection string
3. All dependencies are installed: `pnpm install`

## Setup Steps

### 1. Create Initial Migration

Run this command to create the initial migration for the Investigation schema:

```bash
pnpm prisma migrate dev --name init
```

This will:
- Create a migration file in `prisma/migrations/`
- Apply the migration to your database
- Generate the Prisma Client

### 2. Verify Database Tables

You can verify the tables are created by running:

```bash
pnpm prisma studio
```

This opens a GUI where you can see all tables and their data.

### 3. Run Migrations in Production

For production deployments, use:

```bash
pnpm prisma migrate deploy
```

This applies all pending migrations without generating a new one.

## Database Schema

The schema creates two tables:

### Investigation Table
- `id` (String): Unique identifier (CUID)
- `email` (String, optional): Email address to investigate
- `username` (String, optional): Username to investigate
- `phone` (String, optional): Phone number to investigate
- `fullName` (String, optional): Full name to investigate
- `website` (String, optional): Website to investigate
- `domain` (String, optional): Domain to investigate
- `ipAddress` (String, optional): IP address to investigate
- `status` (Enum): PENDING, RUNNING, COMPLETED, FAILED
- `risk` (Enum): LOW, MEDIUM, HIGH, CRITICAL
- `findings` (String, optional): JSON findings (stored as text)
- `notes` (String, optional): Investigation notes
- `includeOsint` (Boolean): Include OSINT search
- `includeLeakDetection` (Boolean): Include leak detection
- `includeDomainIntelligence` (Boolean): Include domain intelligence
- `includeSocialMedia` (Boolean): Include social media search
- `createdAt` (DateTime): Creation timestamp
- `updatedAt` (DateTime): Last update timestamp

### Indexes
- Email, Username, Domain, Status, CreatedAt

## Troubleshooting

### DATABASE_URL Not Set

If you see an error about DATABASE_URL:

1. Go to your Supabase dashboard
2. Find your project settings
3. Copy the PostgreSQL connection string
4. Set it in your `.env.local` file:

```
DATABASE_URL="postgresql://[user]:[password]@[host]:[port]/[database]"
```

### Migration Conflicts

If you get migration conflicts:

```bash
pnpm prisma migrate resolve --rolled-back [migration_name]
```

### Reset Database (Development Only)

To reset the entire database and start fresh:

```bash
pnpm prisma migrate reset
```

This will:
- Delete all data
- Delete all tables
- Run all migrations from scratch

## Next Steps

After setup:

1. The API endpoints are ready at `/api/investigations`
2. Start the dev server: `pnpm dev`
3. Test the endpoints using the examples in INVESTIGATION_API.md
