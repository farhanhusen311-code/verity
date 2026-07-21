# Correlation Engine - Documentation

## Overview

The Correlation Engine is the knowledge graph builder for the Digital Investigation System. It takes investigation results and builds a sophisticated knowledge graph that connects entities and relationships discovered during the investigation.

## Architecture

```
Investigation Results
        ↓
   Entity Extractor
        ↓
 Entity Deduplication
        ↓
Relationship Builder
        ↓
Relationship Deduplication
        ↓
   Graph Builder
        ↓
  Graph Statistics
        ↓
   Database Persistence
```

## Core Components

### 1. Entity Extractor (`entityExtractor.ts`)
Extracts entities from investigation results.

**Supported Entity Types:**
- EMAIL
- USERNAME
- PHONE_NUMBER
- FULL_NAME
- WEBSITE_URL
- DOMAIN
- SUBDOMAIN
- IP_ADDRESS
- IPV6
- ASN
- DNS_RECORD
- SSL_CERTIFICATE
- ORGANIZATION
- REGISTRAR
- COUNTRY
- CITY
- SOCIAL_MEDIA_ACCOUNT
- GITHUB_ACCOUNT
- LINKEDIN_ACCOUNT
- FACEBOOK_ACCOUNT
- INSTAGRAM_ACCOUNT
- X_ACCOUNT

**Features:**
- Regex-based email extraction
- URL pattern matching
- IP address detection
- Automatic confidence scoring

### 2. Normalizer (`normalizer.ts`)
Normalizes entity values for consistent comparison.

**Normalization Rules:**

| Type | Rule |
|------|------|
| EMAIL | Lowercase, trim |
| DOMAIN | Remove protocol, remove www, lowercase, no trailing slash |
| WEBSITE_URL | Add https://, lowercase, no trailing slash |
| USERNAME | Lowercase, trim |
| PHONE_NUMBER | Remove separators, international format |
| IP_ADDRESS | Lowercase, trim |
| IPV6 | Lowercase, trim |

**Deduplication:**
- SHA256 hash of `type:normalized_value`
- Prevents duplicate entity creation
- Merges confidence scores from duplicates

### 3. Relationship Builder (`relationshipBuilder.ts`)
Builds relationships between entities.

**Supported Relationship Types:**
- OWNS - Entity owns another
- USES - Entity uses another
- REGISTERED_TO - Domain registered to registrar
- HOSTED_ON - Domain hosted on server
- RESOLVES_TO - Domain resolves to IP
- BELONGS_TO - Entity belongs to another
- ASSOCIATED_WITH - Entities associated
- LINKED_TO - Entities linked
- MENTIONED_IN - Entity mentioned in source
- CONNECTED_TO - Entities connected

**Relationship Examples:**
```
Domain RESOLVES_TO IP Address (100% confidence)
Domain REGISTERED_TO Registrar (95% confidence)
Domain HOSTED_ON IP Address (90% confidence)
Email USES Domain (85% confidence)
Username OWNS Domain (80% confidence)
Person ASSOCIATED_WITH Organization (75% confidence)
IP BELONGS_TO ASN (100% confidence)
Social Media Accounts CONNECTED_TO (85% confidence)
```

### 4. Confidence Calculator (`confidence.ts`)
Calculates confidence scores for entities and relationships.

**Entity Confidence Base Scores:**
- VERY HIGH (95-100): IP_ADDRESS, DOMAIN, EMAIL, SSL_CERTIFICATE, DNS_RECORD, ASN
- HIGH (85-90): ORGANIZATION, REGISTRAR, USERNAME, SUBDOMAIN, IPV6, WEBSITE_URL
- MEDIUM (75-80): PHONE_NUMBER, FULL_NAME, COUNTRY, CITY, SOCIAL_MEDIA_ACCOUNT

**Relationship Confidence Base Scores:**
- VERY HIGH (100): REGISTERED_TO, RESOLVES_TO, OWNS
- HIGH (95): HOSTED_ON, BELONGS_TO
- MEDIUM-HIGH (90): USES, ASSOCIATED_WITH
- MEDIUM (80): LINKED_TO, CONNECTED_TO
- LOWER (70): MENTIONED_IN

**Confidence Adjustments:**
- Multiple sources: +10%
- Verified/official: +5%
- Suspicious/flagged: -10%
- User provided: -5%
- Inferred: -15%

### 5. Graph Builder (`graphBuilder.ts`)
Constructs knowledge graph with analysis.

**Graph Structures:**
```
Nodes: CorrelationEntity[]
Edges: CorrelationRelationship[]
Adjacency List: Map<entityId, neighborIds[]>
Adjacency Matrix: number[][] (weighted)
```

**Analysis Functions:**
- `calculateStatistics()` - Graph metrics
- `findShortestPath()` - BFS pathfinding
- `findConnectedComponent()` - Connected entity groups
- `calculateCentrality()` - Node importance scores

### 6. Correlation Engine (`engine.ts`)
Main orchestrator managing the complete workflow.

**Workflow:**
1. Extract entities from results
2. Deduplicate entities
3. Build relationships
4. Deduplicate relationships
5. Build knowledge graph
6. Calculate statistics
7. Persist to database

## Database Schema

### Entity Model
```prisma
model Entity {
  id              String
  type            EntityType
  value           String
  originalValue   String?
  normalizedHash  String @unique
  confidence      Int
  source          String?
  metadata        String? (JSON)
  investigationId String?
  investigation   Investigation?
}
```

### Relationship Model
```prisma
model Relationship {
  id              String
  type            RelationshipType
  fromEntityId    String
  toEntityId      String
  confidence      Int
  evidence        String?
  metadata        String? (JSON)
  weight          Float
  investigationId String?
}
```

## Graph Statistics

The system calculates comprehensive statistics:

```typescript
{
  totalEntities: 156
  totalRelationships: 423
  connectedComponents: 3
  averageDegree: 5.42
  averageConfidence: 87
  highestConnectedEntity: {
    id: "entity:123"
    value: "example.com"
    degree: 34
  }
  entityTypeDistribution: {
    DOMAIN: 25,
    IP_ADDRESS: 18,
    EMAIL: 42,
    USERNAME: 15,
    ...
  }
  relationshipTypeDistribution: {
    RESOLVES_TO: 45,
    USES: 34,
    BELONGS_TO: 28,
    ...
  }
}
```

## API Endpoints

### Get Investigation Graph
```http
GET /api/investigations/{id}/graph
```

**Response:**
```json
{
  "success": true,
  "data": {
    "nodes": [
      {
        "id": "entity:123",
        "type": "DOMAIN",
        "value": "example.com",
        "confidence": 95,
        "source": "whois",
        "metadata": {}
      }
    ],
    "edges": [
      {
        "id": "rel:123",
        "type": "RESOLVES_TO",
        "fromEntityId": "entity:123",
        "toEntityId": "entity:124",
        "confidence": 100,
        "evidence": "DNS Resolution",
        "weight": 1.0
      }
    ],
    "statistics": {
      "totalEntities": 156,
      "totalRelationships": 423,
      "connectedComponents": 3,
      "averageDegree": 5.42,
      "averageConfidence": 87,
      "highestConnectedEntity": {...},
      "entityTypeDistribution": {...},
      "relationshipTypeDistribution": {...}
    }
  }
}
```

## Usage Examples

### Basic Correlation

```typescript
import { getCorrelationEngine } from '@/services/correlation/engine'

const engine = getCorrelationEngine()

const results = await investigationEngine.getResults(investigationId)
const { graph, statistics, context } = await engine.correlate(investigationId, results)

console.log(`Found ${statistics.totalEntities} entities`)
console.log(`Created ${statistics.totalRelationships} relationships`)
console.log(`Confidence: ${statistics.averageConfidence}%`)
```

### Finding Connected Entities

```typescript
const { graph } = await engine.getGraph(investigationId)

// Find all entities connected to a specific domain
const componentEntities = graphBuilder.findConnectedComponent(
  graph,
  'entity:domain-hash'
)

// Find shortest path between entities
const path = graphBuilder.findShortestPath(
  graph,
  'entity:user-hash',
  'entity:ip-hash'
)
```

### Centrality Analysis

```typescript
const { graph } = await engine.getGraph(investigationId)

const centrality = graphBuilder.calculateCentrality(graph)

// Find most important entities
const sorted = Array.from(centrality.entries())
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
```

## Logging

All correlation activities are logged:

- Entity Extracted
- Entity Deduplicated  
- Relationship Created
- Relationship Deduplicated
- Graph Generated
- Statistics Calculated
- Data Persisted

## Performance Considerations

- Entity normalization: O(n)
- Relationship building: O(n*m) where n=entities, m=relationships
- Graph statistics: O(n+e) BFS for components
- Centrality: O(n)

## Future Enhancements

1. **Advanced Analysis**
   - Anomaly detection in entity patterns
   - Community detection algorithms
   - Influence propagation modeling

2. **Performance**
   - Incremental graph updates
   - Caching of statistics
   - Batch processing optimization

3. **Visualization**
   - Force-directed graph layout
   - Interactive exploration
   - Timeline visualization

4. **Export**
   - GraphML export
   - JSON-LD export
   - PDF report generation
