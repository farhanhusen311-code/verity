import { InvestigationEngineResult, InvestigationContext, InvestigationStatistics } from './types'
import { logger } from '@/lib/logger'
import prisma from '@/lib/prisma'

export class ResultHandler {
  /**
   * Normalize results to standardized format
   */
  static normalizeResults(results: any[]): InvestigationEngineResult[] {
    return results.map((result) => ({
      source: result.source || 'unknown',
      category: result.category || 'general',
      title: result.title || 'Untitled Finding',
      description: result.description,
      confidence: Math.min(Math.max(result.confidence || 0, 0), 100), // 0-100
      metadata: result.metadata || {},
      timestamp: result.timestamp || new Date().toISOString(),
      url: result.url,
    }))
  }

  /**
   * Store results in database
   */
  static async storeResults(
    investigationId: string,
    results: InvestigationEngineResult[]
  ): Promise<number> {
    try {
      logger.info('Storing investigation results', { investigationId, count: results.length })

      const stored = await Promise.all(
        results.map((result) =>
          prisma.investigationResult.create({
            data: {
              investigationId,
              source: result.source,
              category: result.category,
              title: result.title,
              description: result.description || null,
              url: result.url || null,
              confidence: result.confidence,
              // Store metadata as JSON string
              createdAt: new Date(result.timestamp),
            },
          })
        )
      )

      logger.info('Results stored successfully', { count: stored.length })
      return stored.length
    } catch (error) {
      logger.error('Failed to store investigation results', error)
      throw error
    }
  }

  /**
   * Calculate investigation statistics
   */
  static calculateStatistics(context: InvestigationContext): InvestigationStatistics {
    const executionTime = Date.now() - context.startTime.getTime()
    const resultsBySource: Record<string, number> = {}
    const resultsByCategory: Record<string, number> = {}
    let totalConfidence = 0

    context.results.forEach((result) => {
      resultsBySource[result.source] = (resultsBySource[result.source] || 0) + 1
      resultsByCategory[result.category] = (resultsByCategory[result.category] || 0) + 1
      totalConfidence += result.confidence
    })

    const averageConfidence =
      context.results.length > 0 ? totalConfidence / context.results.length : 0

    return {
      totalResults: context.results.length,
      resultsBySource,
      resultsByCategory,
      averageConfidence: Math.round(averageConfidence * 100) / 100,
      executionTime,
      modulesExecuted: context.logs
        .filter((log) => log.message.includes('Module Executed'))
        .map((log) => log.module)
        .filter((m, i, arr) => arr.indexOf(m) === i), // unique
    }
  }

  /**
   * Determine risk level based on results
   */
  static determineRiskLevel(context: InvestigationContext): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (context.results.length === 0) {
      return 'LOW'
    }

    // Count high-confidence findings
    const highConfidenceResults = context.results.filter((r) => r.confidence >= 80)
    const breachResults = context.results.filter((r) => r.category === 'breach')
    const reputationResults = context.results.filter((r) => r.category === 'reputation')

    // Risk determination logic
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
  }

  /**
   * Format results for API response
   */
  static formatForResponse(context: InvestigationContext): {
    results: InvestigationEngineResult[]
    statistics: InvestigationStatistics
    riskLevel: string
  } {
    const statistics = this.calculateStatistics(context)
    const riskLevel = this.determineRiskLevel(context)

    return {
      results: context.results,
      statistics,
      riskLevel,
    }
  }
}
