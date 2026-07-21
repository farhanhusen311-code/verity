import { logger } from '@/lib/logger'
import { CorrelationEntity, EntityTypeStr } from './types'
import { entityNormalizer } from './normalizer'
import { confidenceCalculator } from './confidence'

export class EntityExtractor {
  /**
   * Extract entities from investigation results
   */
  async extract(investigationId: string, results: any[]): Promise<CorrelationEntity[]> {
    try {
      logger.info('Extracting entities', { investigationId, resultCount: results.length })

      const entities: CorrelationEntity[] = []

      for (const result of results) {
        const extracted = this.extractFromResult(result)
        if (extracted) {
          extracted.investigationId = investigationId
          entities.push(extracted)
        }
      }

      logger.info('Entities extracted', { investigationId, entityCount: entities.length })
      return entities
    } catch (error) {
      logger.error('Error extracting entities', { investigationId, error })
      throw error
    }
  }

  /**
   * Extract single entity from a result
   */
  extractFromResult(result: any): CorrelationEntity | null {
    try {
      if (!result || !result.metadata) return null

      const metadata = result.metadata
      const source = result.source
      const category = result.category

      // Extract email
      if (metadata.email) {
        return this.createEntity('EMAIL', metadata.email, source)
      }

      // Extract domain
      if (metadata.domain) {
        return this.createEntity('DOMAIN', metadata.domain, source)
      }

      // Extract subdomains
      if (metadata.subdomain) {
        return this.createEntity('SUBDOMAIN', metadata.subdomain, source)
      }

      // Extract IP addresses
      if (metadata.ip) {
        return this.createEntity('IP_ADDRESS', metadata.ip, source)
      }

      if (metadata.ipv6) {
        return this.createEntity('IPV6', metadata.ipv6, source)
      }

      // Extract ASN
      if (metadata.asn) {
        return this.createEntity('ASN', metadata.asn, source)
      }

      // Extract DNS records
      if (category === 'dns' && metadata.record) {
        return this.createEntity('DNS_RECORD', `${metadata.record.type}:${metadata.record.value}`, source)
      }

      // Extract SSL certificate
      if (category === 'ssl' && metadata.issuer) {
        return this.createEntity('SSL_CERTIFICATE', `${metadata.issuer}:${metadata.subject}`, source)
      }

      // Extract organization
      if (metadata.organization) {
        return this.createEntity('ORGANIZATION', metadata.organization, source)
      }

      // Extract registrar
      if (metadata.registrar) {
        return this.createEntity('REGISTRAR', metadata.registrar, source)
      }

      // Extract country
      if (metadata.country) {
        return this.createEntity('COUNTRY', metadata.country, source)
      }

      // Extract city
      if (metadata.city) {
        return this.createEntity('CITY', metadata.city, source)
      }

      // Extract username
      if (metadata.username) {
        return this.createEntity('USERNAME', metadata.username, source)
      }

      // Extract phone
      if (metadata.phone) {
        return this.createEntity('PHONE_NUMBER', metadata.phone, source)
      }

      // Extract full name
      if (metadata.fullname || metadata.full_name) {
        return this.createEntity('FULL_NAME', metadata.fullname || metadata.full_name, source)
      }

      // Extract URL
      if (metadata.url) {
        return this.createEntity('WEBSITE_URL', metadata.url, source)
      }

      // Extract social media accounts
      if (metadata.github_username) {
        return this.createEntity('GITHUB_ACCOUNT', metadata.github_username, source)
      }

      if (metadata.linkedin_profile) {
        return this.createEntity('LINKEDIN_ACCOUNT', metadata.linkedin_profile, source)
      }

      if (metadata.facebook_profile) {
        return this.createEntity('FACEBOOK_ACCOUNT', metadata.facebook_profile, source)
      }

      if (metadata.instagram_profile) {
        return this.createEntity('INSTAGRAM_ACCOUNT', metadata.instagram_profile, source)
      }

      if (metadata.x_account) {
        return this.createEntity('X_ACCOUNT', metadata.x_account, source)
      }

      return null
    } catch (error) {
      logger.warn('Error extracting entity from result', { result, error })
      return null
    }
  }

  /**
   * Create entity with normalization
   */
  private createEntity(type: EntityTypeStr, value: string, source: string = ''): CorrelationEntity {
    if (!value || typeof value !== 'string') {
      throw new Error(`Invalid entity value for type ${type}`)
    }

    const originalValue = value
    const normalizedValue = entityNormalizer.normalize(type, value)
    const normalizedHash = entityNormalizer.generateHash(type, value)
    const confidence = confidenceCalculator.calculateEntityConfidence(type, source)

    logger.debug('Entity created', {
      type,
      original: originalValue,
      normalized: normalizedValue,
      hash: normalizedHash,
      confidence,
      source,
    })

    return {
      type,
      value: normalizedValue,
      originalValue,
      normalizedHash,
      confidence,
      source: source || 'unknown',
      metadata: {
        extractedAt: new Date().toISOString(),
        confidence,
      },
    }
  }

  /**
   * Extract all email addresses from metadata
   */
  extractEmails(metadata: Record<string, any>): CorrelationEntity[] {
    const emails: CorrelationEntity[] = []
    const emailRegex = /[^\s@]+@[^\s@]+\.[^\s@]+/g

    for (const [key, value] of Object.entries(metadata)) {
      if (typeof value === 'string') {
        const matches = value.match(emailRegex) || []
        for (const email of matches) {
          emails.push(this.createEntity('EMAIL', email, 'extracted'))
        }
      }
    }

    return emails
  }

  /**
   * Extract all URLs from metadata
   */
  extractURLs(metadata: Record<string, any>): CorrelationEntity[] {
    const urls: CorrelationEntity[] = []
    const urlRegex = /https?:\/\/[^\s]+/g

    for (const [key, value] of Object.entries(metadata)) {
      if (typeof value === 'string') {
        const matches = value.match(urlRegex) || []
        for (const url of matches) {
          urls.push(this.createEntity('WEBSITE_URL', url, 'extracted'))
        }
      }
    }

    return urls
  }

  /**
   * Extract all IP addresses from metadata
   */
  extractIPAddresses(metadata: Record<string, any>): CorrelationEntity[] {
    const ips: CorrelationEntity[] = []
    const ipRegex = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g

    for (const [key, value] of Object.entries(metadata)) {
      if (typeof value === 'string') {
        const matches = value.match(ipRegex) || []
        for (const ip of matches) {
          ips.push(this.createEntity('IP_ADDRESS', ip, 'extracted'))
        }
      }
    }

    return ips
  }
}

export const entityExtractor = new EntityExtractor()
