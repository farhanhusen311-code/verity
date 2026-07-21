import { EntityTypeStr, RelationshipTypeStr } from './types'

export class ConfidenceCalculator {
  /**
   * Calculate relationship confidence score (0-100)
   * Based on relationship type and metadata
   */
  calculateRelationshipConfidence(type: RelationshipTypeStr, metadata: Record<string, any> = {}): number {
    let baseConfidence: number

    switch (type) {
      // Very high confidence relationships
      case 'REGISTERED_TO':
      case 'RESOLVES_TO':
      case 'OWNS':
        baseConfidence = 100
        break

      // High confidence relationships
      case 'HOSTED_ON':
      case 'BELONGS_TO':
        baseConfidence = 95
        break

      // Medium-high confidence relationships
      case 'USES':
      case 'ASSOCIATED_WITH':
        baseConfidence = 90
        break

      // Medium confidence relationships
      case 'LINKED_TO':
      case 'CONNECTED_TO':
        baseConfidence = 80
        break

      // Lower confidence relationships
      case 'MENTIONED_IN':
        baseConfidence = 70
        break

      default:
        baseConfidence = 75
    }

    // Adjust based on metadata evidence
    let confidence = baseConfidence

    if (metadata.source === 'official' || metadata.verified) {
      confidence = Math.min(100, confidence + 5)
    }

    if (metadata.multiple_sources) {
      confidence = Math.min(100, confidence + 10)
    }

    if (metadata.suspicious || metadata.flagged) {
      confidence = Math.max(0, confidence - 10)
    }

    return Math.round(confidence)
  }

  /**
   * Calculate entity confidence score (0-100)
   * Based on entity type and source
   */
  calculateEntityConfidence(type: EntityTypeStr, source: string = ''): number {
    let baseConfidence: number

    switch (type) {
      // Very high confidence entities
      case 'IP_ADDRESS':
      case 'DOMAIN':
      case 'EMAIL':
        baseConfidence = 100
        break

      // High confidence entities
      case 'SSL_CERTIFICATE':
      case 'DNS_RECORD':
      case 'ASN':
        baseConfidence = 95
        break

      // Medium-high confidence
      case 'ORGANIZATION':
      case 'REGISTRAR':
        baseConfidence = 90
        break

      // Medium confidence
      case 'USERNAME':
      case 'SUBDOMAIN':
      case 'IPV6':
        baseConfidence = 85
        break

      // Lower confidence entities
      case 'PHONE_NUMBER':
      case 'FULL_NAME':
      case 'COUNTRY':
      case 'CITY':
        baseConfidence = 80
        break

      // Social media and personal accounts
      case 'SOCIAL_MEDIA_ACCOUNT':
      case 'GITHUB_ACCOUNT':
      case 'LINKEDIN_ACCOUNT':
      case 'FACEBOOK_ACCOUNT':
      case 'INSTAGRAM_ACCOUNT':
      case 'X_ACCOUNT':
        baseConfidence = 75
        break

      // Website related
      case 'WEBSITE_URL':
        baseConfidence = 85
        break

      default:
        baseConfidence = 80
    }

    // Adjust based on source
    if (source === 'official' || source === 'verified') {
      baseConfidence = Math.min(100, baseConfidence + 10)
    } else if (source === 'user_provided') {
      baseConfidence = Math.max(0, baseConfidence - 5)
    } else if (source === 'inferred') {
      baseConfidence = Math.max(0, baseConfidence - 15)
    }

    return Math.round(baseConfidence)
  }

  /**
   * Get confidence level description
   */
  getConfidenceLevel(score: number): string {
    if (score >= 95) return 'VERY_HIGH'
    if (score >= 85) return 'HIGH'
    if (score >= 70) return 'MEDIUM'
    if (score >= 50) return 'LOW'
    return 'VERY_LOW'
  }

  /**
   * Calculate combined confidence when multiple sources agree
   */
  combinedConfidence(confidences: number[]): number {
    if (confidences.length === 0) return 0
    if (confidences.length === 1) return confidences[0]

    // Average confidence with boost for multiple agreeing sources
    const average = confidences.reduce((a, b) => a + b, 0) / confidences.length
    const boost = Math.min(10, (confidences.length - 1) * 2)

    return Math.round(Math.min(100, average + boost))
  }

  /**
   * Calculate entity match confidence (0-100) for deduplication
   */
  calculateMatchConfidence(
    entity1Type: EntityTypeStr,
    entity1Value: string,
    entity2Type: EntityTypeStr,
    entity2Value: string
  ): number {
    // Different types
    if (entity1Type !== entity2Type) {
      return 0
    }

    // Exact match
    if (entity1Value === entity2Value) {
      return 100
    }

    // Case-insensitive match for certain types
    if (
      entity1Type === 'EMAIL' ||
      entity1Type === 'DOMAIN' ||
      entity1Type === 'USERNAME'
    ) {
      if (entity1Value.toLowerCase() === entity2Value.toLowerCase()) {
        return 100
      }
    }

    // Similarity scoring for fuzzy matching
    const similarity = this.stringSimilarity(entity1Value, entity2Value)
    return Math.round(similarity * 100)
  }

  /**
   * Simple Levenshtein similarity calculation (0-1)
   */
  private stringSimilarity(a: string, b: string): number {
    const longer = a.length > b.length ? a : b
    const shorter = a.length > b.length ? b : a

    if (longer.length === 0) return 1.0

    const editDistance = this.levenshteinDistance(longer, shorter)
    return (longer.length - editDistance) / longer.length
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private levenshteinDistance(s1: string, s2: string): number {
    const costs = []
    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i
      for (let j = 0; j <= s2.length; j++) {
        if (i === 0) {
          costs[j] = j
        } else if (j > 0) {
          let newValue = costs[j - 1]
          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1
          }
          costs[j - 1] = lastValue
          lastValue = newValue
        }
      }
      if (i > 0) costs[s2.length] = lastValue
    }
    return costs[s2.length]
  }
}

export const confidenceCalculator = new ConfidenceCalculator()
