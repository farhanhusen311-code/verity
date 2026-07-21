import { logger } from '@/lib/logger'
import { CorrelationEntity, CorrelationRelationship, RelationshipTypeStr } from './types'
import { confidenceCalculator } from './confidence'

export class RelationshipBuilder {
  /**
   * Build relationships between entities
   */
  async build(entities: CorrelationEntity[], results: any[]): Promise<CorrelationRelationship[]> {
    try {
      logger.info('Building relationships', { entityCount: entities.length, resultCount: results.length })

      const relationships: CorrelationRelationship[] = []
      const entityMap = new Map(entities.map((e) => [e.normalizedHash, e]))

      // Build relationships from each result
      for (const result of results) {
        const resultRelationships = this.buildFromResult(result, entityMap)
        relationships.push(...resultRelationships)
      }

      // Build inter-entity relationships
      const interRelationships = this.buildInterEntityRelationships(entities, entityMap)
      relationships.push(...interRelationships)

      logger.info('Relationships built', { relationshipCount: relationships.length })
      return relationships
    } catch (error) {
      logger.error('Error building relationships', { error })
      throw error
    }
  }

  /**
   * Build relationships from a single result
   */
  private buildFromResult(result: any, entityMap: Map<string, CorrelationEntity>): CorrelationRelationship[] {
    const relationships: CorrelationRelationship[] = []

    if (!result.metadata) return relationships

    const metadata = result.metadata
    const source = result.source

    // Domain RESOLVES_TO IP
    if (metadata.domain && metadata.ip) {
      const domainEntity = this.findEntity(entityMap, 'DOMAIN', metadata.domain)
      const ipEntity = this.findEntity(entityMap, 'IP_ADDRESS', metadata.ip)

      if (domainEntity && ipEntity) {
        relationships.push(
          this.buildRelationship(domainEntity, ipEntity, 'RESOLVES_TO', 100, 'DNS Resolution')
        )
      }
    }

    // Domain REGISTERED_TO Registrar
    if (metadata.domain && metadata.registrar) {
      const domainEntity = this.findEntity(entityMap, 'DOMAIN', metadata.domain)
      const registrarEntity = this.findEntity(entityMap, 'REGISTRAR', metadata.registrar)

      if (domainEntity && registrarEntity) {
        relationships.push(
          this.buildRelationship(domainEntity, registrarEntity, 'REGISTERED_TO', 95, 'Domain Registration')
        )
      }
    }

    // Domain HOSTED_ON IP/Organization
    if (metadata.domain && metadata.ip) {
      const domainEntity = this.findEntity(entityMap, 'DOMAIN', metadata.domain)
      const ipEntity = this.findEntity(entityMap, 'IP_ADDRESS', metadata.ip)

      if (domainEntity && ipEntity) {
        relationships.push(
          this.buildRelationship(domainEntity, ipEntity, 'HOSTED_ON', 90, 'Web Hosting')
        )
      }
    }

    // Certificate issued for Domain
    if (metadata.subject && metadata.domain) {
      const certEntity = this.findEntity(entityMap, 'SSL_CERTIFICATE', `${metadata.issuer}:${metadata.subject}`)
      const domainEntity = this.findEntity(entityMap, 'DOMAIN', metadata.domain)

      if (certEntity && domainEntity) {
        relationships.push(
          this.buildRelationship(certEntity, domainEntity, 'BELONGS_TO', 100, 'SSL Certificate')
        )
      }
    }

    // User OWNS Domain
    if (metadata.username && metadata.domain) {
      const userEntity = this.findEntity(entityMap, 'USERNAME', metadata.username)
      const domainEntity = this.findEntity(entityMap, 'DOMAIN', metadata.domain)

      if (userEntity && domainEntity) {
        relationships.push(
          this.buildRelationship(userEntity, domainEntity, 'OWNS', 80, 'User Association')
        )
      }
    }

    // Email USES Domain
    if (metadata.email && metadata.domain) {
      const emailEntity = this.findEntity(entityMap, 'EMAIL', metadata.email)
      const domainEntity = this.findEntity(entityMap, 'DOMAIN', metadata.domain)

      if (emailEntity && domainEntity) {
        relationships.push(
          this.buildRelationship(emailEntity, domainEntity, 'USES', 85, 'Email Domain')
        )
      }
    }

    // Person ASSOCIATED_WITH organization
    if (metadata.fullname && metadata.organization) {
      const personEntity = this.findEntity(entityMap, 'FULL_NAME', metadata.fullname)
      const orgEntity = this.findEntity(entityMap, 'ORGANIZATION', metadata.organization)

      if (personEntity && orgEntity) {
        relationships.push(
          this.buildRelationship(personEntity, orgEntity, 'ASSOCIATED_WITH', 75, 'Organization Association')
        )
      }
    }

    // IP BELONGS_TO ASN
    if (metadata.ip && metadata.asn) {
      const ipEntity = this.findEntity(entityMap, 'IP_ADDRESS', metadata.ip)
      const asnEntity = this.findEntity(entityMap, 'ASN', metadata.asn)

      if (ipEntity && asnEntity) {
        relationships.push(
          this.buildRelationship(ipEntity, asnEntity, 'BELONGS_TO', 100, 'IP-ASN Mapping')
        )
      }
    }

    // IP RESOLVES_TO Hostname
    if (metadata.ip && metadata.hostname) {
      const ipEntity = this.findEntity(entityMap, 'IP_ADDRESS', metadata.ip)
      const hostEntity = this.findEntity(entityMap, 'DOMAIN', metadata.hostname)

      if (ipEntity && hostEntity) {
        relationships.push(
          this.buildRelationship(ipEntity, hostEntity, 'RESOLVES_TO', 90, 'Reverse DNS')
        )
      }
    }

    return relationships
  }

  /**
   * Build relationships between similar entities (e.g., same person on different social networks)
   */
  private buildInterEntityRelationships(
    entities: CorrelationEntity[],
    entityMap: Map<string, CorrelationEntity>
  ): CorrelationRelationship[] {
    const relationships: CorrelationRelationship[] = []

    // Connect social media accounts that likely belong to same person
    const socialMediaTypes = ['GITHUB_ACCOUNT', 'LINKEDIN_ACCOUNT', 'FACEBOOK_ACCOUNT', 'INSTAGRAM_ACCOUNT', 'X_ACCOUNT']

    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) {
        const e1 = entities[i]
        const e2 = entities[j]

        // Same username across platforms
        if (
          socialMediaTypes.includes(e1.type as string) &&
          socialMediaTypes.includes(e2.type as string) &&
          e1.value === e2.value
        ) {
          relationships.push(
            this.buildRelationship(e1, e2, 'CONNECTED_TO', 85, 'Same Username Across Platforms')
          )
        }

        // Same domain across different contexts
        if (e1.type === 'DOMAIN' && e2.type === 'SUBDOMAIN' && e2.value.endsWith(e1.value)) {
          relationships.push(
            this.buildRelationship(e2, e1, 'BELONGS_TO', 100, 'Subdomain-Domain Relationship')
          )
        }

        // Same organization in different contexts
        if (e1.type === 'ORGANIZATION' && e2.type === 'ORGANIZATION' && e1.value === e2.value) {
          relationships.push(
            this.buildRelationship(e1, e2, 'LINKED_TO', 100, 'Same Organization')
          )
        }
      }
    }

    return relationships
  }

  /**
   * Build a single relationship
   */
  buildRelationship(
    fromEntity: CorrelationEntity,
    toEntity: CorrelationEntity,
    type: RelationshipTypeStr,
    confidence: number,
    evidence: string = ''
  ): CorrelationRelationship {
    const relConfidence = confidenceCalculator.calculateRelationshipConfidence(type, { evidence })
    const finalConfidence = Math.min(100, Math.round((confidence + relConfidence) / 2))

    const relationship: CorrelationRelationship = {
      type,
      fromEntityId: fromEntity.id || fromEntity.normalizedHash,
      toEntityId: toEntity.id || toEntity.normalizedHash,
      confidence: finalConfidence,
      evidence,
      weight: finalConfidence / 100,
      metadata: {
        createdAt: new Date().toISOString(),
        fromType: fromEntity.type,
        toType: toEntity.type,
      },
    }

    logger.debug('Relationship created', {
      type,
      from: `${fromEntity.type}:${fromEntity.value}`,
      to: `${toEntity.type}:${toEntity.value}`,
      confidence: finalConfidence,
      evidence,
    })

    return relationship
  }

  /**
   * Find entity in map by type and value
   */
  private findEntity(
    entityMap: Map<string, CorrelationEntity>,
    type: string,
    value: string
  ): CorrelationEntity | null {
    for (const entity of entityMap.values()) {
      if (entity.type === type && entity.value === value) {
        return entity
      }
    }
    return null
  }
}

export const relationshipBuilder = new RelationshipBuilder()
