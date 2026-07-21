# Backend Architecture - Digital Investigation System

## Overview

This document describes the architecture and design patterns used in the Digital Investigation System backend.

## Architecture Pattern: Repository Pattern

The backend implements a clean, layered architecture with clear separation of concerns:

```
Route Handler (API Layer)
        ↓
   Service Layer
        ↓
   Repository Layer
        ↓
   Database Layer (Prisma + Supabase)
```

### Layer Responsibilities

#### 1. Route Handler (`app/api/investigations/route.ts`)
- Handles HTTP requests and responses
- Input validation using Zod schemas
- Error handling and status codes
- Request/response formatting

#### 2. Service Layer (`services/investigation.service.ts`)
- Business logic
- Data orchestration
- Service-to-service communication
- Validation enforcement

#### 3. Repository Layer (`repositories/investigation.repository.ts`)
- Data access abstraction
- Prisma query builder
- Database operations (CRUD)
- DTO mapping

#### 4. Database Layer
- Prisma ORM
- Supabase PostgreSQL
- Schema definitions in `prisma/schema.prisma`

## Directory Structure

```
app/
  api/
    investigations/
      route.ts           # POST/GET handlers
      [id]/
        route.ts         # GET/PATCH/DELETE handlers

services/
  investigation.service.ts    # Business logic

repositories/
  investigation.repository.ts # Data access

lib/
  validation.ts          # Zod schemas
  logger.ts             # Logging utility
  prisma.ts             # Prisma singleton
  api-response.ts       # Response formatting

types/
  index.ts              # TypeScript interfaces

prisma/
  schema.prisma         # Database schema
```

## File Responsibilities

### `app/api/investigations/route.ts`
- Handles POST request to create investigation
- Handles GET request to retrieve all investigations
- Validates request body with Zod
- Returns standardized API responses

### `app/api/investigations/[id]/route.ts`
- Handles GET request for specific investigation
- Handles PATCH request to update investigation
- Handles DELETE request to remove investigation
- Returns appropriate error codes

### `services/investigation.service.ts`
- `createInvestigation()`: Orchestrates investigation creation
- `getInvestigations()`: Handles pagination and retrieval
- `getInvestigationById()`: Fetches specific investigation
- `updateInvestigation()`: Updates investigation and verifies existence
- `deleteInvestigation()`: Deletes investigation and verifies existence

### `repositories/investigation.repository.ts`
- `create()`: Inserts new investigation
- `findAll()`: Retrieves paginated investigations
- `findById()`: Finds investigation by ID
- `update()`: Updates investigation fields
- `delete()`: Removes investigation
- `mapToDto()`: Converts database model to API response DTO

## Data Flow Example

### Creating an Investigation

```
1. User sends POST request with JSON body
   POST /api/investigations
   { email: "test@example.com", domain: "example.com" }

2. Route Handler (route.ts)
   - Parses request body
   - Validates with CreateInvestigationSchema
   - Calls investigationService.createInvestigation()

3. Service Layer (investigation.service.ts)
   - Calls investigationRepository.create()
   - Logs operation
   - Returns created investigation

4. Repository Layer (investigation.repository.ts)
   - Calls prisma.investigation.create()
   - Maps database record to DTO
   - Returns InvestigationData

5. Route Handler formats response
   - Success status: 201 Created
   - Returns standardized ApiResponse<InvestigationData>
```

## Validation & Error Handling

### Input Validation (Zod)

```typescript
CreateInvestigationSchema
├─ Email: must be valid email format (optional)
├─ Username: 1-255 chars (optional)
├─ Phone: numeric with +/- (optional)
├─ FullName: 1-255 chars (optional)
├─ Website: valid URL format (optional)
├─ Domain: 1-255 chars (optional)
├─ IP Address: valid IPv4/IPv6 (optional)
└─ Refinement: At least one identifier required
```

### Error Responses

| Status | Condition | Example |
|--------|-----------|---------|
| 201 | Successfully created | `{ success: true, data: {...} }` |
| 200 | Success (GET/PATCH/DELETE) | `{ success: true, data: {...} }` |
| 400 | Validation error | `{ success: false, error: "field errors" }` |
| 404 | Not found | `{ success: false, message: "Not found" }` |
| 500 | Server error | `{ success: false, error: "details" }` |

## Logging

The system uses a custom logger with levels: info, warn, error, debug

```typescript
logger.info('Investigation created', { id: investigation.id })
logger.error('Failed to create investigation', error)
logger.debug('Creating investigation', data)
logger.warn('Investigation not found', { id })
```

Production logging outputs JSON, development outputs formatted text.

## Database Schema

### Investigation Table

```sql
CREATE TABLE "Investigation" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT,
  "username" TEXT,
  "phone" TEXT,
  "fullName" TEXT,
  "website" TEXT,
  "domain" TEXT,
  "ipAddress" TEXT,
  "status" TEXT DEFAULT 'PENDING',
  "risk" TEXT DEFAULT 'LOW',
  "findings" TEXT,
  "notes" TEXT,
  "includeOsint" BOOLEAN DEFAULT true,
  "includeLeakDetection" BOOLEAN DEFAULT true,
  "includeDomainIntelligence" BOOLEAN DEFAULT true,
  "includeSocialMedia" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP
);

CREATE INDEX "Investigation_email_idx" ON "Investigation"("email");
CREATE INDEX "Investigation_username_idx" ON "Investigation"("username");
CREATE INDEX "Investigation_domain_idx" ON "Investigation"("domain");
CREATE INDEX "Investigation_status_idx" ON "Investigation"("status");
CREATE INDEX "Investigation_createdAt_idx" ON "Investigation"("createdAt");
```

## Type System

### Core Types

```typescript
// API Response wrapper
ApiResponse<T> {
  success: boolean
  message: string
  data?: T
  timestamp: string
}

// Investigation data (from database)
InvestigationData {
  id: string
  email: string | null
  username: string | null
  phone: string | null
  fullName: string | null
  website: string | null
  domain: string | null
  ipAddress: string | null
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED'
  risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  findings: string | null
  notes: string | null
  includeOsint: boolean
  includeLeakDetection: boolean
  includeDomainIntelligence: boolean
  includeSocialMedia: boolean
  createdAt: string
  updatedAt: string
}

// Input types
CreateInvestigationInput { email?, username?, ... }
UpdateInvestigationInput { status?, risk?, findings?, notes? }
```

## Key Design Decisions

### 1. Repository Pattern
- Abstraction of data access layer
- Easy testing with mock repositories
- Database flexibility (could switch from Prisma to another ORM)

### 2. Prisma ORM
- Type-safe database queries
- Automatic client generation
- Migration system
- Works with any SQL database (PostgreSQL, MySQL, SQLite, etc.)

### 3. Supabase PostgreSQL
- Fully managed PostgreSQL
- Real-time capabilities
- Built-in authentication (future)
- RESTful API (secondary option)

### 4. Zod Validation
- Runtime type safety
- Clear error messages
- Shareable schemas
- Better than manual validation

### 5. Standardized API Response
- Consistent format across all endpoints
- Makes client implementation predictable
- Easier error handling

## Scalability Considerations

### Current Implementation
- Single Prisma Client instance (cached in development)
- Connection pooling via Prisma
- Database indexes for common queries
- Pagination support (default 10 items/page)

### Future Improvements
- Add request rate limiting
- Implement authentication/authorization
- Add response caching
- Database query optimization
- Implement soft deletes
- Add audit logging
- Implement bulk operations

## Security Considerations

### Current Implementation
- Input validation with Zod
- SQL injection prevention (Prisma parameterized queries)
- Type safety with TypeScript

### Not Implemented (For Future)
- Authentication (no user identification)
- Authorization (no role-based access)
- API key management
- Request signing
- CORS configuration
- Rate limiting
- HTTPS enforcement

## Testing Strategy

Manual testing steps:

1. Create investigation: `POST /api/investigations`
2. List investigations: `GET /api/investigations`
3. Get specific: `GET /api/investigations/:id`
4. Update status: `PATCH /api/investigations/:id`
5. Delete: `DELETE /api/investigations/:id`
6. Test validation errors
7. Test 404 responses

See INVESTIGATION_API.md for examples.

## Deployment Checklist

- [ ] Set DATABASE_URL environment variable
- [ ] Run `pnpm prisma migrate deploy`
- [ ] Run `pnpm build`
- [ ] Set production environment variables
- [ ] Configure error tracking (Sentry)
- [ ] Set up logging aggregation
- [ ] Enable API monitoring
- [ ] Set up CORS (if needed)
- [ ] Implement authentication
- [ ] Add rate limiting
- [ ] Enable HTTPS
- [ ] Set up backup strategy
