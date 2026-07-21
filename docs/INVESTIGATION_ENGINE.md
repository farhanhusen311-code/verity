# Investigation Engine Documentation

## Overview

The Investigation Engine is a sophisticated orchestrator that manages the entire investigation workflow for the Digital Investigation System. It coordinates data collection, normalizes results, and computes risk levels without connecting to external services.

## Architecture

### Core Components

```
Investigation Engine
    ├── Orchestrator (Investigation Workflow Manager)
    ├── Pipeline (Modular Execution Framework)
    ├── Connectors (Data Collection Modules)
    ├── Result Handler (Result Processing & Storage)
    └── Types (Standardized Data Models)
```

## Investigation Workflow

The engine executes a 10-step workflow for each investigation:

### 1. **Validate Input**
- Ensures at least one search target is provided
- Validates target format and values
- Returns error if validation fails

### 2. **Create Investigation Record**
- Records investigation in database
- Sets status to PENDING
- Initializes tracking metadata

### 3. **Determine Search Targets**
Identifies which targets to investigate:
- Email addresses
- Usernames
- Phone numbers
- Full names
- Domains
- Website URLs
- IP addresses

### 4. **Build Investigation Pipeline**
Creates modular pipeline stages:
- EmailConnector (Email analysis)
- UsernameConnector (Username tracking)
- DomainConnector (Domain/Website analysis)
- PhoneConnector (Phone number lookup)
- IPConnector (IP analysis)
- FullNameConnector (Person search)

### 5. **Execute Connectors**
- Each connector executes for relevant targets
- Returns standardized results
- Handles errors gracefully
- Simulates realistic delays

### 6. **Collect Results**
- Aggregates results from all connectors
- Maintains investigation context
- Records execution logs

### 7. **Normalize Results**
- Standardizes all result formats
- Ensures consistent schema
- Validates confidence scores (0-100)

### 8. **Store Results**
- Saves normalized results to database
- Creates InvestigationResult records
- Associates results with investigation

### 9. **Calculate Statistics**
- Counts results by source
- Counts results by category
- Calculates average confidence
- Tracks module execution times

### 10. **Update Investigation Status**
- Determines risk level
- Sets status to COMPLETED or FAILED
- Updates investigation record
- Records investigation logs

## Search Targets

The engine supports 7 search target types:

| Target Type | Description | Supported Connectors |
|------------|-------------|-------------------|
| email | Email addresses | EmailConnector, PhoneConnector |
| username | Social media/forum usernames | UsernameConnector |
| phone | Phone numbers | PhoneConnector |
| fullname | Person full names | FullNameConnector |
| domain | Domain names | DomainConnector |
| website | Website URLs | DomainConnector |
| ip | IP addresses (v4/v6) | IPConnector |

## Investigation Statuses

```
PENDING  → Investigation queued
RUNNING  → Investigation in progress
COMPLETED → Investigation finished successfully
FAILED   → Investigation encountered errors
```

## Result Object

Every connector returns standardized result objects:

```typescript
interface InvestigationEngineResult {
  source: string              // e.g., 'breach-database', 'whois'
  category: string            // e.g., 'breach', 'infrastructure', 'reputation'
  title: string               // Human-readable finding title
  description?: string        // Detailed description
  confidence: number          // 0-100 confidence score
  metadata: Record<string, any> // Additional data
  timestamp: string           // ISO timestamp
  url?: string               // Optional reference URL
}
```

### Result Categories

- **breach** - Data breach findings
- **reputation** - Reputation/risk assessments
- **infrastructure** - DNS, WHOIS, SSL data
- **security** - Security-related findings
- **social-media** - Social media presence
- **activity** - Historical activity
- **identity** - Identity/person information
- **information** - General information

## Risk Level Determination

Risk levels are calculated based on investigation results:

```
CRITICAL  - Multiple breaches or extreme findings
HIGH      - Data breach found or multiple high-confidence findings
MEDIUM    - 2+ high-confidence results or reputation issues
LOW       - Generic findings or no concerning results
```

### Risk Calculation Logic

```typescript
if (breachResults.length > 0 && highConfidenceResults.length > 2) {
  return 'CRITICAL'
}

if (breachResults.length > 0 || (highConfidenceResults.length > 4 && reputationResults.length > 0)) {
  return 'HIGH'
}

if (highConfidenceResults.length > 2 || reputationResults.length > 1) {
  return 'MEDIUM'
}

return 'LOW'
```

## Investigation Logging

Every investigation is logged with detailed tracking:

### Log Levels
- **INFO** - Normal operation events
- **WARN** - Warning conditions
- **ERROR** - Error conditions
- **DEBUG** - Detailed debugging information

### Log Events

1. **Start Investigation** - Investigation begins
2. **Module Executed** - Connector module started
3. **Module Finished** - Connector module completed
4. **Module Error** - Connector module failed
5. **Finish Investigation** - Investigation completed

### Log Example

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "level": "INFO",
  "message": "Module Executed: EmailConnector",
  "module": "EmailConnector",
  "data": {
    "targetCount": 1
  }
}
```

## Connectors (Dummy Implementation)

All connectors return realistic dummy data without external connections:

### EmailConnector
- Returns dummy breach database results
- Simulates email reputation checks
- Confidence: 60-100%

### UsernameConnector
- Returns dummy social media findings
- Simulates forum history
- Confidence: 50-100%

### DomainConnector
- Returns dummy WHOIS data
- Simulates DNS lookups
- Simulates SSL certificate checks
- Confidence: 60-95%

### PhoneConnector
- Returns dummy breach check results
- Simulates carrier lookup
- Confidence: 70-85%

### IPConnector
- Returns dummy geolocation data
- Simulates IP reputation checks
- Simulates reverse DNS lookup
- Confidence: 60-95%

### FullNameConnector
- Returns dummy person search results
- Simulates professional profile findings
- Confidence: 50-70%

## API Integration

### Trigger Investigation

```bash
POST /api/investigations/trigger
Content-Type: application/json

{
  "investigationId": "investigation-uuid"
}

Response:
{
  "success": true,
  "message": "Investigation triggered successfully",
  "data": {
    "investigationId": "investigation-uuid",
    "status": "RUNNING",
    "results": [...],
    "statistics": {...}
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Get Results

```bash
GET /api/investigations/results?investigationId=investigation-uuid

Response:
{
  "success": true,
  "message": "Investigation results retrieved successfully",
  "data": {
    "id": "investigation-uuid",
    "status": "COMPLETED",
    "risk": "MEDIUM",
    "results": [
      {
        "source": "breach-database",
        "category": "breach",
        "title": "Email found in data breach",
        "confidence": 85,
        ...
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Engine Statistics

After each investigation, statistics are calculated:

```typescript
interface InvestigationStatistics {
  totalResults: number              // Total findings
  resultsBySource: Record<string, number>  // Count per source
  resultsByCategory: Record<string, number> // Count per category
  averageConfidence: number         // Average confidence (0-100)
  executionTime: number             // Time in milliseconds
  modulesExecuted: string[]         // List of executed modules
}
```

## Usage Example

```typescript
import { getInvestigationEngine } from '@/services/investigation/engine'

// Initialize engine
const engine = getInvestigationEngine()
await engine.initialize()

// Start investigation
const result = await engine.startInvestigation('investigation-id')

// Get results
const investigation = await engine.getResults('investigation-id')

console.log(`Investigation Status: ${investigation.status}`)
console.log(`Risk Level: ${investigation.risk}`)
console.log(`Total Findings: ${investigation.results.length}`)
```

## Service Integration

The InvestigationService automatically triggers the engine:

```typescript
// Creating investigation automatically triggers engine (background)
const investigation = await investigationService.createInvestigation({
  email: 'user@example.com'
})

// Manually trigger investigation
const result = await investigationService.triggerInvestigation(investigationId)

// Get investigation results
const results = await investigationService.getInvestigationResults(investigationId)
```

## Performance Considerations

- **Parallel Execution**: Each connector executes sequentially but can be optimized to run in parallel
- **Result Normalization**: Standardizes all results to consistent format
- **Database Indexing**: Results indexed by source and category for fast retrieval
- **Logging**: All operations logged for audit trail and debugging

## Future Enhancements

1. **Real Connectors**: Replace dummy connectors with real data sources
2. **Parallel Execution**: Execute connectors in parallel for faster results
3. **Caching**: Cache results to avoid duplicate lookups
4. **Advanced Risk Scoring**: ML-based risk level determination
5. **Custom Connectors**: Support for custom connector plugins
6. **Rate Limiting**: Implement rate limiting for external APIs
7. **Result Deduplication**: Automatically merge duplicate findings
8. **Enrichment Pipeline**: Add result enrichment and correlation

## Error Handling

The engine handles errors gracefully:

- **Validation Errors**: Invalid targets return 400 Bad Request
- **Not Found**: Missing investigation returns 404
- **Connector Errors**: Failed connectors log errors but continue execution
- **Database Errors**: Caught and logged with proper error messages

## Logging Examples

```
[INFO] Starting investigation execution (id: inv-123)
[INFO] Search targets determined (count: 2)
[INFO] Investigation pipeline built (stages: 3)
[INFO] Investigation status updated to RUNNING
[INFO] Module Executed: EmailConnector
[DEBUG] EmailConnector: Executing for target (value: test@example.com)
[INFO] Module Finished: EmailConnector (resultCount: 2)
[INFO] Results normalized (count: 2)
[INFO] Results stored (count: 2)
[INFO] Statistics calculated (totalResults: 2, averageConfidence: 82.5)
[INFO] Investigation execution completed successfully
[INFO] Finish Investigation (status: COMPLETED, riskLevel: MEDIUM, resultCount: 2)
```
