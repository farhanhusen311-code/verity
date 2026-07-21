import {
  SearchTarget,
  InvestigationContext,
  InvestigationConfig,
  InvestigationStatus,
  IConnector,
} from './types'
import { InvestigationPipeline } from './pipeline'
import { ResultHandler } from './result'
import { logger } from '@/lib/logger'
import prisma from '@/lib/prisma'

export class InvestigationOrchestrator {
  private pipeline: InvestigationPipeline

  constructor(private connectors: IConnector[]) {
    this.pipeline = new InvestigationPipeline()
  }

  /**
   * Validate search targets - at least one must be provided
   */
  private validateTargets(targets: SearchTarget[]): boolean {
    if (!targets || targets.length === 0) {
      logger.warn('Validation failed: No search targets provided')
      return false
    }

    return targets.every((target) => target.value && target.value.trim().length > 0)
  }

  /**
   * Determine which targets to search based on investigation data
   */
  private determineSearchTargets(investigationData: any): SearchTarget[] {
    const targets: SearchTarget[] = []

    if (investigationData.email) {
      targets.push({ type: 'email', value: investigationData.email })
    }
    if (investigationData.username) {
      targets.push({ type: 'username', value: investigationData.username })
    }
    if (investigationData.phone) {
      targets.push({ type: 'phone', value: investigationData.phone })
    }
    if (investigationData.fullName) {
      targets.push({ type: 'fullname', value: investigationData.fullName })
    }
    if (investigationData.domain) {
      targets.push({ type: 'domain', value: investigationData.domain })
    }
    if (investigationData.website) {
      targets.push({ type: 'website', value: investigationData.website })
    }
    if (investigationData.ip) {
      targets.push({ type: 'ip', value: investigationData.ip })
    }

    return targets
  }

  /**
   * Create investigation context
   */
  private createContext(
    investigationId: string,
    targets: SearchTarget[],
    config: InvestigationConfig
  ): InvestigationContext {
    return {
      investigationId,
      targets,
      config,
      startTime: new Date(),
      results: [],
      errors: [],
      status: 'RUNNING',
      logs: [
        {
          timestamp: new Date().toISOString(),
          level: 'INFO',
          message: 'Start Investigation',
          module: 'Orchestrator',
          data: { targetCount: targets.length },
        },
      ],
    }
  }

  /**
   * Execute complete investigation workflow
   */
  async executeInvestigation(investigationId: string): Promise<{
    success: boolean
    context: InvestigationContext
  }> {
    try {
      logger.info('Starting investigation execution', { investigationId })

      // Step 1: Fetch investigation from database
      const investigation = await prisma.investigation.findUnique({
        where: { id: investigationId },
      })

      if (!investigation) {
        throw new Error(`Investigation with ID ${investigationId} not found`)
      }

      // Step 2: Determine search targets
      const targets = this.determineSearchTargets(investigation)
      logger.info('Search targets determined', { targetCount: targets.length })

      // Step 3: Validate targets
      if (!this.validateTargets(targets)) {
        throw new Error('No valid search targets provided')
      }

      // Step 4: Create investigation config
      const config: InvestigationConfig = {
        includeOsint: investigation.includeOsint,
        includeLeakDetection: investigation.includeLeakDetection,
        includeDomainIntelligence: investigation.includeDomainIntelligence,
        includeSocialMedia: investigation.includeSocialMedia,
      }

      // Step 5: Create investigation context
      const context = this.createContext(investigationId, targets, config)

      // Step 6: Build investigation pipeline
      this.pipeline.clearStages()
      this.pipeline.buildStages(context, this.connectors)
      logger.info('Investigation pipeline built', { stageCount: this.pipeline.getStages().length })

      // Step 7: Update investigation status to RUNNING
      await prisma.investigation.update({
        where: { id: investigationId },
        data: { status: 'RUNNING' },
      })

      context.logs.push({
        timestamp: new Date().toISOString(),
        level: 'INFO',
        message: 'Investigation status updated to RUNNING',
        module: 'Orchestrator',
      })

      // Step 8: Execute investigation pipeline
      await this.pipeline.execute(context)

      // Step 9: Normalize results
      const normalizedResults = ResultHandler.normalizeResults(context.results)
      context.results = normalizedResults
      logger.info('Results normalized', { count: normalizedResults.length })

      // Step 10: Store results
      const storedCount = await ResultHandler.storeResults(investigationId, normalizedResults)
      logger.info('Results stored', { count: storedCount })

      context.logs.push({
        timestamp: new Date().toISOString(),
        level: 'INFO',
        message: `Results stored: ${storedCount} records`,
        module: 'Orchestrator',
      })

      // Step 11: Calculate statistics and risk level
      const statistics = ResultHandler.calculateStatistics(context)
      const riskLevel = ResultHandler.determineRiskLevel(context)
      logger.info('Statistics calculated', { ...statistics })

      // Step 12: Update investigation with final results
      context.status = 'COMPLETED'
      await prisma.investigation.update({
        where: { id: investigationId },
        data: {
          status: 'COMPLETED',
          risk: riskLevel,
          notes: investigation.notes
            ? `${investigation.notes}\n\nInvestigation completed with ${normalizedResults.length} findings. Risk level: ${riskLevel}`
            : `Investigation completed with ${normalizedResults.length} findings. Risk level: ${riskLevel}`,
        },
      })

      context.logs.push({
        timestamp: new Date().toISOString(),
        level: 'INFO',
        message: 'Finish Investigation',
        module: 'Orchestrator',
        data: {
          status: 'COMPLETED',
          riskLevel,
          resultCount: normalizedResults.length,
          executionTime: `${statistics.executionTime}ms`,
        },
      })

      logger.info('Investigation execution completed successfully', {
        investigationId,
        resultCount: normalizedResults.length,
        riskLevel,
      })

      return {
        success: true,
        context,
      }
    } catch (error) {
      logger.error('Investigation execution failed', error)

      // Update investigation to FAILED status
      try {
        await prisma.investigation.update({
          where: { id: investigationId },
          data: {
            status: 'FAILED',
            notes: `Investigation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        })
      } catch (updateError) {
        logger.error('Failed to update investigation status', updateError)
      }

      throw error
    }
  }

  /**
   * Get investigation status and results
   */
  async getInvestigationResults(investigationId: string) {
    try {
      const investigation = await prisma.investigation.findUnique({
        where: { id: investigationId },
        include: {
          results: {
            orderBy: { createdAt: 'desc' },
          },
        },
      })

      if (!investigation) {
        throw new Error(`Investigation with ID ${investigationId} not found`)
      }

      return investigation
    } catch (error) {
      logger.error('Failed to fetch investigation results', error)
      throw error
    }
  }
}
