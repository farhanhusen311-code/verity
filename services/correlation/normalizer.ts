import crypto from 'crypto'
import { logger } from '@/lib/logger'
import { NormalizationRule } from './types'

export class EntityNormalizer {
  private normalizationRules: Map<string, NormalizationRule[]> = new Map()

  constructor() {
    this.initializeRules()
  }

  private initializeRules(): void {
    // Email normalization rules
    this.normalizationRules.set('EMAIL', [
      {
        test: (value) => typeof value === 'string',
        apply: (value) => value.toLowerCase().trim(),
      },
    ])

    // Domain normalization rules
    this.normalizationRules.set('DOMAIN', [
      {
        test: (value) => typeof value === 'string',
        apply: (value) => {
          let normalized = value.toLowerCase().trim()
          // Remove protocol if present
          normalized = normalized.replace(/^https?:\/\//i, '')
          // Remove www prefix
          normalized = normalized.replace(/^www\./, '')
          // Remove trailing slash
          normalized = normalized.replace(/\/$/, '')
          return normalized
        },
      },
    ])

    // Website URL normalization rules
    this.normalizationRules.set('WEBSITE_URL', [
      {
        test: (value) => typeof value === 'string',
        apply: (value) => {
          let normalized = value.toLowerCase().trim()
          // Ensure http:// or https:// prefix
          if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
            normalized = 'https://' + normalized
          }
          // Remove trailing slash
          normalized = normalized.replace(/\/$/, '')
          return normalized
        },
      },
    ])

    // Username normalization rules
    this.normalizationRules.set('USERNAME', [
      {
        test: (value) => typeof value === 'string',
        apply: (value) => value.toLowerCase().trim(),
      },
    ])

    // Phone number normalization rules
    this.normalizationRules.set('PHONE_NUMBER', [
      {
        test: (value) => typeof value === 'string',
        apply: (value) => {
          // Remove common separators
          let normalized = value.replace(/[\s\-().]/g, '')
          // Remove leading 0 if international format
          if (normalized.startsWith('0') && !normalized.startsWith('00')) {
            // Could be local number
            return normalized
          }
          // Ensure + prefix for international
          if (!normalized.startsWith('+') && normalized.startsWith('00')) {
            normalized = '+' + normalized.substring(2)
          }
          return normalized
        },
      },
    ])

    // IP address normalization
    this.normalizationRules.set('IP_ADDRESS', [
      {
        test: (value) => typeof value === 'string',
        apply: (value) => value.toLowerCase().trim(),
      },
    ])

    // IPv6 normalization
    this.normalizationRules.set('IPV6', [
      {
        test: (value) => typeof value === 'string',
        apply: (value) => value.toLowerCase().trim(),
      },
    ])
  }

  /**
   * Normalize entity value based on type
   */
  normalize(entityType: string, value: string): string {
    try {
      const rules = this.normalizationRules.get(entityType) || []
      let normalized = value

      for (const rule of rules) {
        if (rule.test(normalized)) {
          normalized = rule.apply(normalized)
        }
      }

      logger.debug('Entity normalized', {
        type: entityType,
        original: value,
        normalized,
      })

      return normalized
    } catch (error) {
      logger.warn('Error normalizing entity', { entityType, value, error })
      return value
    }
  }

  /**
   * Generate normalized hash for deduplication
   */
  generateHash(entityType: string, value: string): string {
    const normalized = this.normalize(entityType, value)
    const hash = crypto.createHash('sha256').update(`${entityType}:${normalized}`).digest('hex')
    return hash
  }

  /**
   * Check if two entities are likely the same
   */
  isSameEntity(
    type1: string,
    value1: string,
    hash1: string,
    type2: string,
    value2: string,
    hash2: string
  ): boolean {
    // Same hash = same entity
    if (hash1 === hash2) {
      return true
    }

    // Different types cannot be same
    if (type1 !== type2) {
      return false
    }

    // Normalized comparison as fallback
    const norm1 = this.normalize(type1, value1)
    const norm2 = this.normalize(type2, value2)

    return norm1 === norm2
  }

  /**
   * Add custom normalization rule
   */
  addRule(entityType: string, rule: NormalizationRule): void {
    if (!this.normalizationRules.has(entityType)) {
      this.normalizationRules.set(entityType, [])
    }
    this.normalizationRules.get(entityType)!.push(rule)
  }
}

export const entityNormalizer = new EntityNormalizer()
