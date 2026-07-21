# Quick Start Guide - Digital Investigation System

## 5-Minute Setup

### Step 1: Environment Variable
```bash
# Create .env.local
echo "DATABASE_URL=postgresql://user:password@host/db?sslmode=require" > .env.local
```

### Step 2: Database Setup
```bash
pnpm db:push          # Create tables
pnpm db:seed          # Add test data
```

### Step 3: Start Server
```bash
pnpm dev
```

### Step 4: Test API
```bash
# Get investigations
curl http://localhost:3000/api/investigations

# Create investigation
curl -X POST http://localhost:3000/api/investigations \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","domain":"example.com"}'
```

---

## Common Commands

```bash
# Database
pnpm db:push              # Sync schema to database
pnpm db:migrate           # Create versioned migration
pnpm db:seed              # Populate with test data
pnpm db:studio            # Open visual database inspector

# Development
pnpm dev                  # Start dev server
pnpm build                # Build for production

# Prisma
pnpm prisma generate      # Regenerate client (after schema changes)
pnpm prisma format        # Format schema
```

---

## API Endpoints

```bash
# Investigations
POST   /api/investigations              # Create
GET    /api/investigations              # List (paginated)
GET    /api/investigations/[id]         # Get one
PATCH  /api/investigations/[id]         # Update
DELETE /api/investigations/[id]         # Delete
```

---

## Response Format

```json
{
  "success": true,
  "message": "Success message",
  "data": { /* payload */ },
  "timestamp": "2026-07-21T19:22:56.723Z"
}
```

---

## Repositories

```typescript
// Import any repository
import { investigationRepository } from '@/repositories/investigation.repository'
import { userRepository } from '@/repositories/user.repository'
import { investigationResultRepository } from '@/repositories/investigation-result.repository'
import { reportRepository } from '@/repositories/report.repository'
import { activityLogRepository } from '@/repositories/activity-log.repository'

// Use basic CRUD
const item = await repository.findById(id)
const items = await repository.findAll(skip, take)
const created = await repository.create(data)
const updated = await repository.update(id, data)
await repository.delete(id)
```

---

## Models

### User
- **Fields**: id, name, email, password, role, createdAt, updatedAt
- **Roles**: ADMIN | INVESTIGATOR | ANALYST

### Investigation
- **Fields**: id, email, username, phone, fullName, website, domain, ip, status, risk, notes, createdBy, createdAt, updatedAt
- **Status**: PENDING | RUNNING | COMPLETED | FAILED
- **Risk**: LOW | MEDIUM | HIGH | CRITICAL

### InvestigationResult
- **Fields**: id, investigationId, userId, source, category, title, description, url, confidence, createdAt

### Report
- **Fields**: id, investigationId, summary, recommendation, pdfUrl, createdAt

### ActivityLog
- **Fields**: id, userId, action, target, createdAt

---

## Documentation

- [DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md) - Complete schema reference
- [SUPABASE_SETUP.md](./docs/SUPABASE_SETUP.md) - Setup guide
- [INVESTIGATION_API.md](./docs/INVESTIGATION_API.md) - API endpoints
- [BACKEND_ARCHITECTURE.md](./docs/BACKEND_ARCHITECTURE.md) - Design patterns
- [SUPABASE_INTEGRATION_COMPLETE.md](./docs/SUPABASE_INTEGRATION_COMPLETE.md) - Complete overview

---

## Troubleshooting

**DATABASE_URL not found?**
```bash
# Ensure .env.local exists with DATABASE_URL set
cat .env.local | grep DATABASE_URL
```

**Tables not created?**
```bash
pnpm db:push
```

**Seed failed?**
```bash
# First ensure tables exist
pnpm db:push
# Then seed
pnpm db:seed
```

**Type errors?**
```bash
pnpm prisma generate
```

---

## Architecture

```
HTTP Request
    ↓
Route Handler (/api/...)
    ↓
Service Layer (business logic)
    ↓
Repository (data access)
    ↓
Prisma ORM
    ↓
Supabase PostgreSQL
```

---

## Key Features

✅ Complete Prisma schema with 5 models
✅ CRUD repositories for all models
✅ Standardized API responses
✅ Input validation with Zod
✅ Comprehensive logging
✅ TypeScript throughout
✅ Cascade deletes for data integrity
✅ Strategic indexes for performance

---

For more details, see `docs/` directory.
