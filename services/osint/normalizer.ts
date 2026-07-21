import { logger } from '@/lib/logger'
import { OSINTConnectorResult, OSINTNormalizedResult } from './types'

/**
 * Normalizes OSINT connector results to a standard format
 */
export class OSINTNormalizer {
  /**
   * Normalize a connector result to standard format
   */
  normalize(result: OSINTConnectorResult): OSINTNormalizedResult {
    try {
      const tags = this.extractTags(result.source, result.category)
      const type = this.mapSourceToType(result.source)

      const normalized: OSINTNormalizedResult = {
        source: result.source,
        category: result.category,
        type,
        title: result.title,
        description: result.description,
        findings: this.normalizeFindings(result.data, type),
        confidence: Math.max(0, Math.min(100, result.confidence)),
        timestamp: result.timestamp,
        tags,
      }

      logger.debug('Result normalized', { source: result.source, type })
      return normalized
    } catch (error) {
      logger.error('Error normalizing result', error)
      throw error
    }
  }

  /**
   * Normalize multiple results
   */
  normalizeMany(results: OSINTConnectorResult[]): OSINTNormalizedResult[] {
    return results.map((result) => this.normalize(result))
  }

  /**
   * Map connector source to standardized type
   */
  private mapSourceToType(
    source: string
  ): 'whois' | 'dns' | 'ssl' | 'http_header' | 'metadata' | 'robots' | 'security_txt' | 'other' {
    const lowerSource = source.toLowerCase()

    if (lowerSource.includes('whois')) return 'whois'
    if (lowerSource.includes('dns')) return 'dns'
    if (lowerSource.includes('ssl') || lowerSource.includes('certificate')) return 'ssl'
    if (lowerSource.includes('header') || lowerSource.includes('http')) return 'http_header'
    if (lowerSource.includes('metadata') || lowerSource.includes('title')) return 'metadata'
    if (lowerSource.includes('robots')) return 'robots'
    if (lowerSource.includes('security.txt')) return 'security_txt'

    return 'other'
  }

  /**
   * Normalize findings based on connector type
   */
  private normalizeFindings(data: Record<string, any>, type: string): Record<string, any> {
    const normalized: Record<string, any> = {}

    switch (type) {
      case 'whois':
        normalized.registrar = data.registrar
        normalized.creationDate = data.created || data.creationDate
        normalized.expirationDate = data.expires || data.expirationDate
        normalized.updatedDate = data.updated || data.updatedDate
        normalized.registrantCountry = data.registrantCountry || data.country
        normalized.status = data.status || data.domainStatus
        break

      case 'dns':
        normalized.aRecords = data.aRecords || data.A || []
        normalized.aaaaRecords = data.aaaaRecords || data.AAAA || []
        normalized.mxRecords = data.mxRecords || data.MX || []
        normalized.txtRecords = data.txtRecords || data.TXT || []
        normalized.nsRecords = data.nsRecords || data.NS || []
        normalized.cnameRecords = data.cnameRecords || data.CNAME || []
        break

      case 'ssl':
        normalized.issuer = data.issuer
        normalized.subject = data.subject
        normalized.validFrom = data.validFrom || data.notBefore
        normalized.validUntil = data.validUntil || data.notAfter
        normalized.signatureAlgorithm = data.signatureAlgorithm || data.algorithm
        break

      case 'http_header':
        normalized.statusCode = data.statusCode || data.status
        normalized.server = data.server
        normalized.contentType = data.contentType
        normalized.securityHeaders = {
          contentSecurityPolicy: data.csp,
          strictTransportSecurity: data.hsts,
          xFrameOptions: data.xFrameOptions,
          xContentTypeOptions: data.xContentTypeOptions,
        }
        break

      case 'metadata':
        normalized.title = data.title
        normalized.description = data.description
        normalized.keywords = data.keywords
        normalized.language = data.language
        normalized.generator = data.generator
        normalized.canonicalUrl = data.canonicalUrl
        break

      case 'robots':
        normalized.status = data.status || 'found'
        normalized.content = data.content
        normalized.rules = data.rules || []
        break

      case 'security_txt':
        normalized.status = data.status || 'found'
        normalized.contact = data.contact
        normalized.policy = data.policy
        normalized.encryption = data.encryption
        normalized.acknowledgements = data.acknowledgements
        break

      default:
        normalized.raw = data
    }

    return normalized
  }

  /**
   * Extract tags for categorization
   */
  private extractTags(source: string, category: string): string[] {
    const tags = new Set<string>()

    // Add source tag
    tags.add(`source:${source.toLowerCase().replace(/[^a-z0-9-]/g, '-')}`)

    // Add category tag
    tags.add(`category:${category.toLowerCase()}`)

    // Add semantic tags
    if (category.includes('security') || category.includes('ssl')) {
      tags.add('security')
    }
    if (category.includes('infrastructure') || category.includes('dns')) {
      tags.add('infrastructure')
    }
    if (category.includes('reputation') || category.includes('breach')) {
      tags.add('reputation')
    }
    if (category.includes('identity') || category.includes('person')) {
      tags.add('identity')
    }

    return Array.from(tags)
  }
}

// Global normalizer instance
let normalizerInstance: OSINTNormalizer | null = null

export function getOSINTNormalizer(): OSINTNormalizer {
  if (!normalizerInstance) {
    normalizerInstance = new OSINTNormalizer()
  }
  return normalizerInstance
}
