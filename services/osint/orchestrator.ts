import { logger } from '@/lib/logger'
import { getOSINTRegistry } from './registry'
import { getOSINTCache } from './cache'
import { getOSINTNormalizer } from './normalizer'
import { OSINTConnectorResult, OSINTNormalizedResult } from './types'

/**
 * OSINT Orchestrator
 * Coordinates OSINT connector execution and result aggregation
 */
export class OSINTOrchestrator {
  private registry = getOSINTRegistry()
  private cache = getOSINTCache()
  private normalizer = getOSINTNormalizer()

  /**
   * Execute OSINT investigation on a target
   */
  async investigate(target: string, targetType: string, options?: any): Promise<{
    results: OSINTNormalizedResult[]
    summary: {
      totalResults: number
      totalTime: number
      connectorsExecuted: string[]
      successCount: number
      errorCount: number
    }
  }> {
    const startTime = Date.now()

    try {
      logger.info('OSINT investigation started', { target, targetType })

      // Get connectors that support this target type
      const connectors = this.registry.getBySupportedType(targetType)

      if (connectors.length === 0) {
        logger.warn('No connectors support target type', { targetType })
        return {
          results: [],
          summary: {
            totalResults: 0,
            totalTime: 0,
            connectorsExecuted: [],
            successCount: 0,
            errorCount: 0,
          },
        }
      }

      logger.debug(`Found ${connectors.length} connectors for target type`, {
        targetType,
        connectorNames: connectors.map((c) => c.name),
      })

      // Execute connectors in parallel
      const results = await Promise.allSettled(
        connectors.map((connector) =>
          this.executeConnector(connector.name, target, targetType, options?.useCache !== false)
        )
      )

      // Process results
      const allResults: OSINTConnectorResult[] = []
      let successCount = 0
      let errorCount = 0

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          if (result.value) {
            allResults.push(result.value)
            if (result.value.status === 'success') {
              successCount++
            } else {
              errorCount++
            }
          }
        } else {
          errorCount++
          logger.error(`Connector ${connectors[index].name} execution failed`, result.reason)
        }
      })

      // Normalize results
      const normalizedResults = this.normalizer.normalizeMany(allResults)

      const totalTime = Date.now() - startTime

      logger.info('OSINT investigation completed', {
        target,
        targetType,
        resultCount: normalizedResults.length,
        successCount,
        errorCount,
        totalTime,
      })

      return {
        results: normalizedResults,
        summary: {
          totalResults: normalizedResults.length,
          totalTime,
          connectorsExecuted: connectors.map((c) => c.name),
          successCount,
          errorCount,
        },
      }
    } catch (error) {
      logger.error('OSINT investigation error', error)
      throw error
    }
  }

  /**
   * Execute a single connector with cache support
   */
  private async executeConnector(
    connectorName: string,
    target: string,
    targetType: string,
    useCache: boolean
  ): Promise<OSINTConnectorResult | null> {
    try {
      // Check cache first
      if (useCache) {
        const cached = this.cache.get(connectorName, target)
        if (cached) {
          logger.debug(`Using cached result for connector`, {
            connector: connectorName,
            target,
          })
          return cached
        }
      }

      // Get connector
      const connector = this.registry.get(connectorName)
      if (!connector) {
        logger.error(`Connector not found: ${connectorName}`)
        return null
      }

      logger.debug(`Executing connector: ${connectorName}`, { target })

      // Execute connector
      const result = await connector.execute({
        target,
        targetType,
        config: {},
      })

      // Cache result
      if (useCache && result.status === 'success') {
        this.cache.set(connectorName, target, result, 3600) // 1 hour cache
      }

      return result
    } catch (error) {
      logger.error(`Connector execution error: ${connectorName}`, error)
      return null
    }
  }

  /**
   * Clear cache for a specific connector or target
   */
  clearCache(connectorName?: string, target?: string): void {
    this.cache.clear(connectorName, target)
    logger.info('Cache cleared', { connectorName, target })
  }

  /**
   * Get registry statistics
   */
  getStats() {
    return this.registry.getStats()
  }

  /**
   * Verify all connectors are available
   */
  async verifyConnectors(): Promise<Record<string, boolean>> {
    logger.info('Verifying OSINT connectors')
    const availability = await this.registry.verifyAvailability()
    logger.info('Connector verification complete', availability)
    return availability
  }
}

// Global orchestrator instance
let orchestratorInstance: OSINTOrchestrator | null = null

export function getOSINTOrchestrator(): OSINTOrchestrator {
  if (!orchestratorInstance) {
    orchestratorInstance = new OSINTOrchestrator()
  }
  return orchestratorInstance
}
