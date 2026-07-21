import { logger } from '@/lib/logger'
import { OSINTCacheEntry, OSINTConnectorResult } from './types'

/**
 * Simple in-memory cache for OSINT results
 * Can be extended to use Redis or database
 */
export class OSINTCache {
  private cache: Map<string, OSINTCacheEntry> = new Map()
  private defaultTTL: number = 3600 // 1 hour in seconds

  private getCacheKey(connector: string, target: string): string {
    return `${connector}:${target}`.toLowerCase()
  }

  get(connector: string, target: string): OSINTConnectorResult | null {
    const key = this.getCacheKey(connector, target)
    const entry = this.cache.get(key)

    if (!entry) {
      logger.debug('Cache miss', { connector, target })
      return null
    }

    // Check if cache has expired
    if (new Date() > entry.expiresAt) {
      logger.debug('Cache expired', { connector, target })
      this.cache.delete(key)
      return null
    }

    logger.debug('Cache hit', { connector, target })
    return entry.data
  }

  set(
    connector: string,
    target: string,
    data: OSINTConnectorResult,
    ttl: number = this.defaultTTL
  ): void {
    const key = this.getCacheKey(connector, target)
    const now = new Date()
    const expiresAt = new Date(now.getTime() + ttl * 1000)

    this.cache.set(key, {
      connector,
      target,
      data,
      cachedAt: now,
      expiresAt,
    })

    logger.debug('Cache set', { connector, target, ttl })
  }

  clear(connector?: string, target?: string): void {
    if (!connector && !target) {
      this.cache.clear()
      logger.info('Cache cleared completely')
      return
    }

    if (connector && target) {
      const key = this.getCacheKey(connector, target)
      this.cache.delete(key)
      logger.debug('Cache entry deleted', { connector, target })
      return
    }

    // Clear by connector
    for (const [key] of this.cache) {
      if (key.startsWith(connector!.toLowerCase())) {
        this.cache.delete(key)
      }
    }
    logger.debug('Cache cleared for connector', { connector })
  }

  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    }
  }
}

// Global cache instance
let cacheInstance: OSINTCache | null = null

export function getOSINTCache(): OSINTCache {
  if (!cacheInstance) {
    cacheInstance = new OSINTCache()
  }
  return cacheInstance
}
