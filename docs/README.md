# Digital Investigation System - Documentation Index

Welcome to the Digital Investigation System documentation. This folder contains comprehensive guides for both the frontend and backend of the application.

## Quick Navigation

### For Getting Started
- **[GETTING_STARTED.md](./GETTING_STARTED.md)** - Quick start guide (5 min read)
- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - API endpoints at a glance

### Backend Documentation

#### API Reference
- **[INVESTIGATION_API.md](./INVESTIGATION_API.md)** - Complete API reference with examples
  - All 5 endpoints documented
  - Request/response examples
  - Error codes and validation rules
  - cURL and JavaScript examples

#### Architecture & Design
- **[BACKEND_ARCHITECTURE.md](./BACKEND_ARCHITECTURE.md)** - Deep dive into architecture
  - Repository Pattern explanation
  - Layer responsibilities
  - Data flow diagrams
  - Type system and design decisions
  - Security and scalability considerations

#### Setup & Deployment
- **[MIGRATION_SETUP.md](./MIGRATION_SETUP.md)** - Database migration guide
  - Environment setup
  - Running migrations
  - Troubleshooting database issues
  - Production deployment

#### Summary
- **[BACKEND_SUMMARY.md](./BACKEND_SUMMARY.md)** - Overview of what was built
  - Feature list
  - Technology stack
  - File structure
  - Setup instructions

### Frontend Documentation

#### Investigation Page
- **[INVESTIGATION_PAGE.md](../docs/INVESTIGATION_PAGE.md)** - Investigation UI components
  - Search form component
  - Results table component
  - Right sidebar component
  - Professional SOC-style UI

## Documentation by Task

### "I want to..."

#### ...setup the backend quickly
1. Read [GETTING_STARTED.md](./GETTING_STARTED.md)
2. Refer to [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
3. Test with examples in [INVESTIGATION_API.md](./INVESTIGATION_API.md)

#### ...understand the architecture
1. Start with [BACKEND_SUMMARY.md](./BACKEND_SUMMARY.md)
2. Deep dive into [BACKEND_ARCHITECTURE.md](./BACKEND_ARCHITECTURE.md)
3. Check code in `services/` and `repositories/`

#### ...use the API
1. Check [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) for quick overview
2. Reference [INVESTIGATION_API.md](./INVESTIGATION_API.md) for details
3. Use provided cURL or JavaScript examples

#### ...set up the database
1. Follow [GETTING_STARTED.md](./GETTING_STARTED.md)
2. See [MIGRATION_SETUP.md](./MIGRATION_SETUP.md) for advanced topics
3. Troubleshoot with provided solutions

#### ...deploy to production
1. Read [MIGRATION_SETUP.md](./MIGRATION_SETUP.md) - Production Deployment section
2. Review [BACKEND_ARCHITECTURE.md](./BACKEND_ARCHITECTURE.md) - Security Considerations
3. Set up monitoring and error tracking

## Project Structure

```
docs/
├── README.md                    # This file
├── QUICK_REFERENCE.md          # API quick reference
├── GETTING_STARTED.md          # 5-minute setup guide
├── INVESTIGATION_API.md        # Complete API documentation
├── BACKEND_ARCHITECTURE.md     # Architecture deep dive
├── MIGRATION_SETUP.md          # Database setup guide
├── BACKEND_SUMMARY.md          # What was built
└── INVESTIGATION_PAGE.md       # Frontend UI documentation

app/
├── api/investigations/         # API endpoints
│   ├── route.ts               # POST/GET handlers
│   └── [id]/route.ts          # GET/PATCH/DELETE handlers
├── dashboard/
│   └── investigation/         # Frontend investigation page
│       └── page.tsx           # Main investigation UI
└── ...

services/
└── investigation.service.ts   # Business logic

repositories/
└── investigation.repository.ts # Data access layer

lib/
├── validation.ts              # Zod schemas
├── logger.ts                  # Logger
├── prisma.ts                  # Prisma client
└── api-response.ts           # Response formatting

types/
└── index.ts                   # TypeScript types

prisma/
├── schema.prisma              # Database schema
└── migrations/                # Migration files
```

## Key Concepts

### Repository Pattern
The backend uses a clean, layered architecture:
```
HTTP Request → Route Handler → Service → Repository → Database
```

### API Response Format
All responses follow this format:
```json
{
  "success": true,
  "message": "Description",
  "data": { /* payload */ },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Validation
Input validation uses Zod with:
- Field-level validation (email format, URL, IP, etc.)
- Custom refinements (at least one identifier required)
- Automatic TypeScript type inference

### Logging
Four logging levels (info, warn, error, debug):
- Development: Formatted text output
- Production: JSON output for aggregation

## Technology Stack

### Backend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Database ORM**: Prisma 5
- **Database**: Supabase PostgreSQL
- **Validation**: Zod
- **Package Manager**: pnpm

### Frontend
- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Icons**: Lucide React

## Common Tasks

### Create Investigation
```bash
curl -X POST http://localhost:3000/api/investigations \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","domain":"example.com"}'
```

### List Investigations
```bash
curl http://localhost:3000/api/investigations?page=1&limit=10
```

### Update Investigation Status
```bash
curl -X PATCH http://localhost:3000/api/investigations/[ID] \
  -H "Content-Type: application/json" \
  -d '{"status":"COMPLETED"}'
```

### View Database GUI
```bash
pnpm prisma studio
```
Opens Prisma Studio at http://localhost:5555

### Reset Database (Development Only)
```bash
pnpm prisma migrate reset
```

## Troubleshooting Quick Links

- **DATABASE_URL not set** → See [GETTING_STARTED.md](./GETTING_STARTED.md#troubleshooting)
- **Port already in use** → See [GETTING_STARTED.md](./GETTING_STARTED.md#troubleshooting)
- **Migration errors** → See [MIGRATION_SETUP.md](./MIGRATION_SETUP.md#troubleshooting)
- **API errors** → See [INVESTIGATION_API.md](./INVESTIGATION_API.md#error-response-format)

## Key Files Overview

| File | Purpose |
|------|---------|
| `app/api/investigations/route.ts` | POST/GET handlers |
| `app/api/investigations/[id]/route.ts` | GET/PATCH/DELETE handlers |
| `services/investigation.service.ts` | Business logic layer |
| `repositories/investigation.repository.ts` | Data access layer |
| `lib/validation.ts` | Input validation schemas |
| `prisma/schema.prisma` | Database schema definition |

## API Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/investigations` | Create investigation |
| GET | `/api/investigations` | List investigations |
| GET | `/api/investigations/:id` | Get single investigation |
| PATCH | `/api/investigations/:id` | Update investigation |
| DELETE | `/api/investigations/:id` | Delete investigation |

## Response Status Codes

| Code | Meaning | When |
|------|---------|------|
| 200 | OK | GET, PATCH, DELETE success |
| 201 | Created | POST success |
| 400 | Bad Request | Validation error |
| 404 | Not Found | Investigation doesn't exist |
| 500 | Server Error | Internal error |

## Getting Help

1. **Check the relevant documentation** - Use the navigation above
2. **Review examples** - [INVESTIGATION_API.md](./INVESTIGATION_API.md) has many examples
3. **Check troubleshooting** - Most common issues are documented
4. **Review code** - Comments explain complex logic
5. **Check logs** - Enable debug logging: `NODE_ENV=development pnpm dev`

## What's Next?

1. ✅ Set up backend with [GETTING_STARTED.md](./GETTING_STARTED.md)
2. ✅ Test API with [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
3. ✅ Learn architecture from [BACKEND_ARCHITECTURE.md](./BACKEND_ARCHITECTURE.md)
4. ⬜ Implement authentication (future feature)
5. ⬜ Add OSINT search functionality (future feature)
6. ⬜ Connect frontend to backend API
7. ⬜ Deploy to production

## Version Info

- **Backend Version**: 1.0.0
- **API Version**: v1
- **Node.js**: 18+
- **Next.js**: 16.2.6
- **Prisma**: 5.22.0
- **TypeScript**: 5.7.3

## License

This project is part of the Digital Investigation System.

---

**Last Updated**: January 2024

For questions or issues, refer to the relevant documentation above or review the code comments.
