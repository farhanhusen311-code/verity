# OSINT Connector Layer - Complete Guide

## Overview

The OSINT Connector Layer provides a modular, extensible system for gathering open-source intelligence from various public sources. Each connector handles a specific type of information independently and can be added or removed without affecting the core Investigation Engine.

## Architecture

```
Investigation Engine
        ↓
   Orchestrator
        ↓
   Registry (connector discovery)
        ↓
   [WHOIS] [DNS] [SSL] [HTTP] [Metadata] [Robots] [Security.txt]
        ↓
   Cache Layer (memoization)
        ↓
   Normalizer (standardization)
        ↓
   Database Storage
```

## Available Connectors

### 1. WHOIS Connector
**Priority:** 90  
**Target Types:** domain, website  
**Purpose:** Retrieves domain registration information

**Returns:**
- Registrar information
- Creation, update, expiration dates
- Registrant country (if publicly available)
- Domain status
- Nameservers
- Days until expiry

**Example Result:**
```json
{
  "source": "WHOIS",
  "category": "infrastructure",
  "data": {
    "registrar": "GoDaddy",
    "created": "2020-01-15",
    "expires": "2025-01-15",
    "status": "active",
    "nameservers": ["ns1.example.com", "ns2.example.com"]
  },
  "confidence": 95
}
```

### 2. DNS Connector
**Priority:** 85  
**Target Types:** domain, website  
**Purpose:** Resolves DNS records for a domain

**Returns:**
- A records (IPv4 addresses)
- AAAA records (IPv6 addresses)
- MX records (mail servers)
- TXT records (SPF, DKIM, verification)
- NS records (nameservers)
- CNAME records (aliases)
- SOA record details

**Example Result:**
```json
{
  "source": "DNS",
  "category": "infrastructure",
  "data": {
    "A": ["93.184.216.34"],
    "MX": [{"priority": 10, "host": "mail.example.com"}],
    "TXT": ["v=spf1 include:_spf.google.com ~all"],
    "NS": ["ns1.example.com", "ns2.example.com"]
  },
  "confidence": 90
}
```

### 3. SSL Certificate Connector
**Priority:** 80  
**Target Types:** domain, website  
**Purpose:** Analyzes SSL/TLS certificate information

**Returns:**
- Certificate issuer
- Subject information
- Validity dates (from/until)
- Signature algorithm
- Public key information
- Serial number
- Alternative names (SANs)
- Days until expiry

**Example Result:**
```json
{
  "source": "SSL",
  "category": "security",
  "data": {
    "issuer": "Let's Encrypt",
    "subject": "CN=example.com",
    "validFrom": "2024-01-15",
    "validUntil": "2025-01-15",
    "signatureAlgorithm": "sha256WithRSAEncryption",
    "isValid": true
  },
  "confidence": 95
}
```

### 4. HTTP Header Connector
**Priority:** 75  
**Target Types:** domain, website  
**Purpose:** Analyzes HTTP response headers and security configuration

**Returns:**
- HTTP status code
- Server software version
- Content-Type
- Security headers:
  - Content-Security-Policy
  - Strict-Transport-Security
  - X-Frame-Options
  - X-Content-Type-Options
  - X-XSS-Protection
- Cache-Control directives
- Last-Modified information

**Example Result:**
```json
{
  "source": "HTTP-Header",
  "category": "security",
  "data": {
    "statusCode": 200,
    "server": "nginx/1.21.0",
    "securityHeaders": {
      "contentSecurityPolicy": "default-src 'self'",
      "strictTransportSecurity": "max-age=31536000",
      "xFrameOptions": "DENY"
    }
  },
  "confidence": 90
}
```

### 5. Website Metadata Connector
**Priority:** 70  
**Target Types:** domain, website  
**Purpose:** Extracts page metadata and SEO information

**Returns:**
- Page title
- Meta description
- Keywords
- Language
- Canonical URL
- Open Graph tags (og:title, og:description, og:image)
- Twitter Card information
- Generator/CMS information
- Author information
- Theme color

**Example Result:**
```json
{
  "source": "Metadata",
  "category": "metadata",
  "data": {
    "title": "Example Domain",
    "description": "Explore our comprehensive platform",
    "keywords": "technology, innovation, digital",
    "language": "en-US",
    "generator": "Next.js"
  },
  "confidence": 85
}
```

### 6. Robots.txt Connector
**Priority:** 65  
**Target Types:** domain, website  
**Purpose:** Analyzes robots.txt file for SEO and crawling information

**Returns:**
- robots.txt existence and content
- User-agent rules (allow/disallow)
- Crawl delay settings
- Request-rate limits
- Sitemap references
- Insights about crawling restrictions

**Example Result:**
```json
{
  "source": "Robots.txt",
  "category": "infrastructure",
  "data": {
    "status": "found",
    "rules": [
      {
        "userAgent": "*",
        "allow": ["/"],
        "disallow": ["/admin/", "/private/"]
      }
    ],
    "sitemaps": ["https://example.com/sitemap.xml"]
  },
  "confidence": 95
}
```

### 7. Security.txt Connector
**Priority:** 60  
**Target Types:** domain, website  
**Purpose:** Retrieves security contact and vulnerability disclosure information

**Returns:**
- Security contact information
- Vulnerability disclosure policy URL
- Bug bounty information
- PGP key information
- Response timeframe
- Encryption capabilities
- Acknowledgements page

**Example Result:**
```json
{
  "source": "Security.txt",
  "category": "security",
  "data": {
    "status": "found",
    "contact": "security@example.com",
    "policy": "https://example.com/security/policy",
    "responsesTimeframe": "72 hours"
  },
  "confidence": 95
}
```

## Usage

### Basic Investigation

```typescript
import { getOSINTOrchestrator } from '@/services/osint/orchestrator'

const orchestrator = getOSINTOrchestrator()

const results = await orchestrator.investigate('example.com', 'domain')
// Returns: { results: [], summary: {...} }
```

### With Caching

```typescript
// Results are cached by default (1 hour TTL)
const results1 = await orchestrator.investigate('example.com', 'domain')
const results2 = await orchestrator.investigate('example.com', 'domain')
// results2 will use cached data

// Disable caching
const results3 = await orchestrator.investigate('example.com', 'domain', { useCache: false })
```

### Clear Cache

```typescript
// Clear all cache
orchestrator.clearCache()

// Clear specific connector cache
orchestrator.clearCache('WHOIS')

// Clear specific target cache
orchestrator.clearCache(undefined, 'example.com')
```

### Get Statistics

```typescript
const stats = orchestrator.getStats()
// {
//   totalConnectors: 7,
//   connectorNames: ['WHOIS', 'DNS', 'SSL', ...],
//   supportedTypes: ['domain', 'website']
// }
```

## Creating Custom Connectors

To add a new OSINT connector:

```typescript
import { IOSINTConnector, OSINTConnectorResult, OSINTConnectorContext } from '../types'

export class MyConnector implements IOSINTConnector {
  name = 'MyConnector'
  description = 'Describes what this connector does'
  supported = ['domain'] // target types
  priority = 50 // higher = executed sooner

  async execute(context: OSINTConnectorContext): Promise<OSINTConnectorResult> {
    const startTime = Date.now()
    
    try {
      // Perform investigation
      const data = await this.performInvestigation(context.target)
      
      return {
        source: this.name,
        category: 'your-category',
        title: 'Your Title',
        data,
        confidence: 85,
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        status: 'success'
      }
    } catch (error) {
      return {
        source: this.name,
        category: 'your-category',
        title: 'Your Title',
        data: {},
        confidence: 0,
        error: String(error),
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        status: 'error'
      }
    }
  }

  validate(target: string): boolean {
    // Validation logic
    return true
  }

  async isAvailable(): Promise<boolean> {
    // Check if connector is available
    return true
  }

  private async performInvestigation(target: string) {
    // Your logic here
  }
}
```

Then register it:

```typescript
import { getOSINTRegistry } from '@/services/osint/registry'

const registry = getOSINTRegistry()
registry.register(new MyConnector())
```

## Result Normalization

All results are normalized to a standard format:

```typescript
interface OSINTNormalizedResult {
  source: string           // connector name
  category: string         // result category
  type: string             // whois|dns|ssl|http_header|metadata|robots|security_txt|other
  title: string            // human-readable title
  description?: string     // optional description
  findings: Record<string, any>  // normalized findings
  confidence: number       // 0-100
  timestamp: string        // ISO 8601
  tags: string[]           // categorization tags
  url?: string             // source URL if available
}
```

## Caching Strategy

- **Default TTL:** 1 hour (3600 seconds)
- **Storage:** In-memory (can be extended to Redis/Database)
- **Key Format:** `connector-name:target`
- **Benefits:** Reduces API calls, faster response times, lower latency

## Error Handling

Each connector handles its own errors gracefully:

- **Timeout:** Returns error status with timeout message
- **Network Error:** Retries or returns error status
- **Invalid Domain:** Validates input before execution
- **Not Found:** Returns "not_found" status
- **API Unavailable:** Falls back to default/dummy data

## Performance Metrics

Each result includes execution time:

```json
{
  "executionTime": 450,  // milliseconds
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Dependency Injection

Connectors are registered and retrieved through the registry, allowing easy testing and mocking:

```typescript
// In tests, register a mock connector
registry.register(mockConnector)

// Perform investigation
const results = await orchestrator.investigate('example.com', 'domain')

// Unregister when done
registry.unregister('MockConnector')
```

## Future Enhancements

- Real DNS resolution instead of dummy data
- Integration with WHOIS APIs
- SSL certificate validation from certificate transparency logs
- Metadata extraction from actual HTTP requests
- Security.txt parsing from real endpoints
- Custom connector marketplace
- Distributed connector execution
- Real-time updates and monitoring
