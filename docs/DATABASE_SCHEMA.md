# Digital Investigation System - Database Schema

## Overview

The Digital Investigation System uses Prisma ORM with Supabase PostgreSQL as the primary database. The schema supports complete investigation workflows with user management, investigation tracking, result collection, and comprehensive activity logging.

## Complete Schema Diagram

```
User (ADMIN, INVESTIGATOR, ANALYST)
  ├─ investigations → Investigation
  └─ activityLogs → ActivityLog

Investigation
  ├─ results → InvestigationResult
  ├─ reports → Report
  └─ createdBy (User ID)

InvestigationResult
  ├─ investigation → Investigation
  └─ user → User (analyst who found it)

Report
  └─ investigation → Investigation

ActivityLog
  ├─ user → User
  └─ tracks actions on investigations
```

## Models & Fields

### 1. User Model

```prisma
model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  password  String
  role      UserRole @default(ANALYST)
  
  investigations InvestigationResult[]
  activityLogs   ActivityLog[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Fields:**
- `id`: Unique identifier (CUID)
- `name`: User full name
- `email`: Unique email address
- `password`: Hashed password
- `role`: ADMIN | INVESTIGATOR | ANALYST (default: ANALYST)
- `createdAt`: Account creation timestamp
- `updatedAt`: Last update timestamp

**Indexes:**
- email (UNIQUE)
- role

---

### 2. Investigation Model

```prisma
model Investigation {
  id        String   @id @default(cuid())
  
  // Search targets (at least one required)
  email     String?
  username  String?
  phone     String?
  fullName  String?
  website   String?
  domain    String?
  ip        String?
  
  // Metadata
  status    InvestigationStatus @default(PENDING)
  risk      RiskLevel           @default(LOW)
  notes     String?
  createdBy String?
  
  // Search options
  includeOsint              Boolean @default(true)
  includeLeakDetection      Boolean @default(true)
  includeDomainIntelligence Boolean @default(true)
  includeSocialMedia        Boolean @default(true)
  
  results InvestigationResult[]
  reports Report[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Fields:**
- `email`: Potential email address to investigate
- `username`: Social media or account username
- `phone`: Phone number
- `fullName`: Full name of person
- `website`: Website URL
- `domain`: Domain name
- `ip`: IP address (IPv4 or IPv6)
- `status`: PENDING | RUNNING | COMPLETED | FAILED
- `risk`: LOW | MEDIUM | HIGH | CRITICAL
- `notes`: Additional investigation notes
- `createdBy`: User ID who initiated investigation

**Indexes:**
- email
- username
- domain
- ip
- status
- risk
- createdAt

---

### 3. InvestigationResult Model

```prisma
model InvestigationResult {
  id                String   @id @default(cuid())
  
  investigationId   String
  investigation     Investigation @relation(...)
  
  userId            String?
  user              User? @relation(...)
  
  source            String   // e.g., "email-breach"
  category          String   // e.g., "breach", "whois", "dns"
  title             String
  description       String?
  url               String?
  confidence        Int?     // 0-100
  
  createdAt DateTime @default(now())
}
```

**Fields:**
- `source`: Data source type (email-breach, domain-whois, etc.)
- `category`: Result category (breach, whois, dns, ssl, etc.)
- `title`: Result title/summary
- `description`: Detailed description
- `url`: Reference URL
- `confidence`: Confidence level (0-100)
- `userId`: Analyst who found this result
- `investigationId`: Related investigation

**Indexes:**
- investigationId (FK)
- userId (FK)
- source
- category
- createdAt

---

### 4. Report Model

```prisma
model Report {
  id                String   @id @default(cuid())
  
  investigationId   String
  investigation     Investigation @relation(...)
  
  summary           String
  recommendation    String?
  pdfUrl            String?
  
  createdAt DateTime @default(now())
}
```

**Fields:**
- `summary`: Investigation summary
- `recommendation`: Recommended actions
- `pdfUrl`: Link to PDF report
- `investigationId`: Related investigation

**Indexes:**
- investigationId (FK)
- createdAt

---

### 5. ActivityLog Model

```prisma
model ActivityLog {
  id        String   @id @default(cuid())
  
  userId    String
  user      User @relation(...)
  
  action    String   // "created", "updated", "deleted", "viewed"
  target    String   // "investigation:123"
  
  createdAt DateTime @default(now())
}
```

**Fields:**
- `action`: Action performed (created, updated, deleted, viewed, exported)
- `target`: Target of action (e.g., investigation:uuid)
- `userId`: User who performed action

**Indexes:**
- userId (FK)
- action
- createdAt

---

## Enums

### UserRole
```prisma
enum UserRole {
  ADMIN        // Full system access
  INVESTIGATOR // Can create/manage investigations
  ANALYST      // Can view/comment on investigations
}
```

### InvestigationStatus
```prisma
enum InvestigationStatus {
  PENDING    // Waiting to start
  RUNNING    // Currently processing
  COMPLETED  // Finished successfully
  FAILED     // Completed with errors
}
```

### RiskLevel
```prisma
enum RiskLevel {
  LOW        // 0-25% risk
  MEDIUM     // 26-50% risk
  HIGH       // 51-75% risk
  CRITICAL   // 76-100% risk
}
```

---

## Relationships

### One-to-Many
- **User → InvestigationResult**: One user can find many results
- **User → ActivityLog**: One user generates many activity logs
- **Investigation → InvestigationResult**: One investigation has many results
- **Investigation → Report**: One investigation has many reports

### Delete Cascade
- **Investigation → InvestigationResult**: Deleting investigation deletes results
- **Investigation → Report**: Deleting investigation deletes reports
- **User → ActivityLog**: Deleting user deletes activity logs
- **User → InvestigationResult**: Deleting user sets userId to NULL

---

## Seed Data

The database includes default seed data:

- **1 Admin User**: admin@example.com
- **2 Additional Users**: john@example.com (Investigator), jane@example.com (Analyst)
- **20 Investigations**: Mixed statuses and risk levels
- **50 Investigation Results**: Distributed across investigations
- **10 Reports**: One per 2 investigations
- **30 Activity Logs**: User activity tracking

### Running Seed

```bash
# Via npm script
pnpm db:seed

# Or direct Prisma command
pnpm prisma db seed
```

---

## Database Operations

### Create Investigation
```typescript
const investigation = await prisma.investigation.create({
  data: {
    email: 'user@example.com',
    domain: 'example.com',
    status: 'PENDING',
    risk: 'LOW',
    createdBy: adminId,
  },
})
```

### Find with Relations
```typescript
const investigation = await prisma.investigation.findUnique({
  where: { id: '...' },
  include: {
    results: true,      // Include all results
    reports: true,      // Include all reports
  },
})
```

### Count by Status
```typescript
const running = await prisma.investigation.count({
  where: { status: 'RUNNING' },
})
```

### Search
```typescript
const results = await prisma.investigation.findMany({
  where: {
    OR: [
      { email: { contains: 'test', mode: 'insensitive' } },
      { domain: { contains: 'test', mode: 'insensitive' } },
    ],
  },
})
```

---

## Performance Tips

1. **Always include relations when needed**: Use `include` to fetch related data in single query
2. **Use pagination**: Always implement skip/take for list queries
3. **Index frequently searched fields**: Already implemented for email, username, domain, status
4. **Batch operations**: Use Promise.all for independent queries
5. **Archive old logs**: Consider moving old activity logs to archive table

---

## Migration Commands

```bash
# Create new migration
pnpm prisma migrate dev --name add_feature

# Apply pending migrations
pnpm prisma migrate deploy

# Create migration from schema
pnpm prisma migrate resolve --rolled-back migration_name

# Reset database (⚠️ deletes all data)
pnpm prisma migrate reset
```

---

## Environment Setup

Required environment variable in `.env.local`:

```
DATABASE_URL=postgresql://user:password@host:5432/database
```

For Supabase:
```
DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[database]?sslmode=require
```

---

## CRUD Repositories

Complete CRUD repositories available for:

- **UserRepository** (`repositories/user.repository.ts`)
- **InvestigationRepository** (`repositories/investigation.repository.ts`)
- **InvestigationResultRepository** (`repositories/investigation-result.repository.ts`)
- **ReportRepository** (`repositories/report.repository.ts`)
- **ActivityLogRepository** (`repositories/activity-log.repository.ts`)

Each repository provides:
- `create(data)` - Insert new record
- `findById(id)` - Find by primary key
- `findAll(skip, take)` - List with pagination
- `update(id, data)` - Update record
- `delete(id)` - Delete record
- Model-specific finder methods (e.g., `findByStatus`, `findByInvestigationId`)
