import { InvestigationOrchestrator } from './orchestrator'
import { initializeConnectors } from './connectors'
import { logger } from '@/lib/logger'

/**
 * Investigation Engine - Main entry point for investigation orchestration
 *
 * The Investigation Engine is responsible for:
 * 1. Orchestrating the entire investigation workflow
 * 2. Managing the investigation pipeline
 * 3. Coordinating data collection from multiple sources
 * 4. Normalizing and storing results
 * 5. Computing risk levels and statistics
 */

class InvestigationEngine {
  private orchestrator: InvestigationOrchestrator
  private isInitialized = false

  constructor() {
    this.orchestrator = new InvestigationOrchestrator([])
  }

  /**
   * Initialize the investigation engine with connectors
   */
  async initialize(): Promise<void> {
    try {
      logger.info('Initializing Investigation Engine...')

      // Initialize all available connectors
      const connectors = initializeConnectors()
      logger.info(`Initialized ${connectors.length} connectors`, {
        connectors: connectors.map((c) => c.name),
      })

      // Create new orchestrator with connectors
      this.orchestrator = new InvestigationOrchestrator(connectors)
      this.isInitialized = true

      logger.info('Investigation Engine initialized successfully')
    } catch (error) {
      logger.error('Failed to initialize Investigation Engine', error)
      throw error
    }
  }

  /**
   * Start an investigation
   */
  async startInvestigation(investigationId: string): Promise<any> {
    try {
      if (!this.isInitialized) {
        await this.initialize()
      }

      logger.info('Starting investigation', { investigationId })

      const result = await this.orchestrator.executeInvestigation(investigationId)

      logger.info('Investigation started successfully', {
        investigationId,
        resultCount: result.context.results.length,
      })

      return result
    } catch (error) {
      logger.error('Failed to start investigation', error)
      throw error
    }
  }

  /**
   * Get investigation results
   */
  async getResults(investigationId: string): Promise<any> {
    try {
      logger.info('Fetching investigation results', { investigationId })

      const results = await this.orchestrator.getInvestigationResults(investigationId)

      logger.info('Investigation results fetched successfully', {
        investigationId,
        resultCount: results.results?.length || 0,
      })

      return results
    } catch (error) {
      logger.error('Failed to fetch investigation results', error)
      throw error
    }
  }

  /**
   * Check if engine is initialized
   */
  isReady(): boolean {
    return this.isInitialized
  }
}

// Singleton instance
let investigationEngine: InvestigationEngine | null = null

/**
 * Get or create the investigation engine instance
 */
export function getInvestigationEngine(): InvestigationEngine {
  if (!investigationEngine) {
    investigationEngine = new InvestigationEngine()
  }
  return investigationEngine
}

/**
 * Initialize investigation engine on module load
 */
export async function initializeEngine(): Promise<void> {
  const engine = getInvestigationEngine()
  await engine.initialize()
}

export { InvestigationEngine }
