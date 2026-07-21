# Quick Reference - Backend API

## Setup in 3 Steps

```bash
# 1. Set DATABASE_URL in .env.local
DATABASE_URL="postgresql://..."

# 2. Run migration
pnpm prisma migrate dev --name init

# 3. Start server
pnpm dev
```

## API Endpoints Quick Reference

### Create Investigation
```
POST /api/investigations
Content-Type: application/json

{
  "email": "john@example.com",
  "username": "johndoe",
  "domain": "example.com",
  "includeOsint": true,
  "notes": "optional"
}
```

### Get All (Paginated)
```
GET /api/investigations?page=1&limit=10
```

### Get Single
```
GET /api/investigations/clm9z5h4k0000qz088f8j9k4m
```

### Update
```
PATCH /api/investigations/clm9z5h4k0000qz088f8j9k4m
Content-Type: application/json

{
  "status": "COMPLETED",
  "risk": "HIGH",
  "findings": "data breach found"
}
```

### Delete
```
DELETE /api/investigations/clm9z5h4k0000qz088f8j9k4m
```

## Response Format

```json
{
  "success": true,
  "message": "Investigation created successfully",
  "data": {
    "id": "clm9z5h4k0000qz088f8j9k4m",
    "email": "john@example.com",
    "status": "PENDING",
    "risk": "LOW",
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Valid Enum Values

**Status**: PENDING, RUNNING, COMPLETED, FAILED

**Risk**: LOW, MEDIUM, HIGH, CRITICAL

## Validation Rules

| Field | Rules |
|-------|-------|
| email | Valid email format (optional) |
| username | 1-255 characters (optional) |
| phone | Digits, +, -, spaces (optional) |
| fullName | 1-255 characters (optional) |
| website | Valid URL (optional) |
| domain | 1-255 characters (optional) |
| ipAddress | IPv4 or IPv6 (optional) |
| **Required** | **At least one identifier** |

## Useful Commands

```bash
# Database management
pnpm prisma generate          # Generate Prisma Client
pnpm prisma studio           # Open GUI at localhost:5555
pnpm prisma migrate dev       # Create new migration
pnpm prisma migrate deploy    # Apply migrations (prod)
pnpm prisma migrate reset     # Reset db (dev only)

# Development
pnpm dev                      # Start dev server
pnpm build                    # Build for production
pnpm lint                     # Run linter

# View logs
pnpm dev                      # Server logs in terminal
```

## File Locations

| File | Location |
|------|----------|
| API Endpoints | `app/api/investigations/` |
| Services | `services/investigation.service.ts` |
| Repositories | `repositories/investigation.repository.ts` |
| Validation | `lib/validation.ts` |
| Logger | `lib/logger.ts` |
| Database Schema | `prisma/schema.prisma` |

## Common Errors

| Error | Solution |
|-------|----------|
| `DATABASE_URL not found` | Set in `.env.local` |
| `Port 3000 in use` | Kill process: `lsof -i :3000` or change port |
| `Migration conflict` | Run `pnpm prisma migrate reset` |
| `Prisma Client error` | Run `pnpm prisma generate` |

## Testing with cURL

```bash
# Create
curl -X POST http://localhost:3000/api/investigations \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","domain":"example.com"}'

# List
curl http://localhost:3000/api/investigations

# Get specific
curl http://localhost:3000/api/investigations/[ID]

# Update
curl -X PATCH http://localhost:3000/api/investigations/[ID] \
  -H "Content-Type: application/json" \
  -d '{"status":"COMPLETED"}'

# Delete
curl -X DELETE http://localhost:3000/api/investigations/[ID]
```

## Testing with JavaScript/Fetch

```javascript
// Create
const response = await fetch('/api/investigations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    domain: 'example.com'
  })
});
const data = await response.json();

// List
const res = await fetch('/api/investigations?page=1&limit=10');
const { data } = await res.json();

// Get specific
const res = await fetch('/api/investigations/[ID]');
const { data } = await res.json();

// Update
const res = await fetch('/api/investigations/[ID]', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    status: 'COMPLETED',
    risk: 'HIGH'
  })
});

// Delete
const res = await fetch('/api/investigations/[ID]', {
  method: 'DELETE'
});
```

## Architecture Layers

```
Route Handlers (HTTP handling)
    ↓
Services (Business logic)
    ↓
Repositories (Data access)
    ↓
Prisma + Database
```

## Database Tables

### Investigation
- Identifiers: email, username, phone, fullName, website, domain, ipAddress
- Metadata: status, risk, findings, notes
- Config: includeOsint, includeLeakDetection, includeDomainIntelligence, includeSocialMedia
- Timestamps: createdAt, updatedAt

## Documentation Links

- Full API Reference: `docs/INVESTIGATION_API.md`
- Architecture Details: `docs/BACKEND_ARCHITECTURE.md`
- Getting Started: `docs/GETTING_STARTED.md`
- Migration Setup: `docs/MIGRATION_SETUP.md`
- Backend Summary: `docs/BACKEND_SUMMARY.md`

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK (GET, PATCH, DELETE success) |
| 201 | Created (POST success) |
| 400 | Bad Request (validation error) |
| 404 | Not Found |
| 500 | Server Error |
