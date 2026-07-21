import {
  InvestigationContext,
  SearchTarget,
  PipelineStage,
  ConnectorResult,
  SearchTargetType,
  IConnector,
} from './types'
import { logger } from '@/lib/logger'

export class InvestigationPipeline {
  private stages: PipelineStage[] = []

  /**
   * Build pipeline stages based on targets and available connectors
   */
  buildStages(context: InvestigationContext, connectors: IConnector[]): void {
    logger.info('Building investigation pipeline', {
      targetCount: context.targets.length,
      connectorCount: connectors.length,
    })

    const processedConnectors = new Set<string>()

    // For each target, find matching connectors
    context.targets.forEach((target) => {
      const matchingConnectors = connectors.filter((connector) =>
        connector.supports.includes(target.type)
      )

      matchingConnectors.forEach((connector) => {
        const stageKey = `${connector.name}-${target.type}`

        // Avoid duplicate stages
        if (!processedConnectors.has(stageKey)) {
          this.stages.push({
            name: `${connector.name} (${target.type})`,
            connector,
            targets: context.targets.filter((t) => t.type === target.type),
          })

          processedConnectors.add(stageKey)
        }
      })
    })

    logger.info('Pipeline stages built', { stageCount: this.stages.length })
  }

  /**
   * Execute all pipeline stages
   */
  async execute(context: InvestigationContext): Promise<void> {
    logger.info('Starting pipeline execution', { stageCount: this.stages.length })

    for (const stage of this.stages) {
      try {
        logger.info('Executing pipeline stage', { stage: stage.name })
        context.logs.push({
          timestamp: new Date().toISOString(),
          level: 'INFO',
          message: `Module Executed: ${stage.connector.name}`,
          module: stage.connector.name,
        })

        // Execute connector for each target
        for (const target of stage.targets) {
          try {
            const results = await stage.connector.execute(target, context.config)

            // Add results to context
            context.results.push(
              ...results.map((r) => ({
                source: r.source,
                category: r.category,
                title: r.title,
                description: r.description,
                confidence: r.confidence,
                metadata: r.metadata,
                timestamp: r.timestamp,
                url: r.url,
              }))
            )

            logger.info(`Module Finished: ${stage.connector.name}`, { resultCount: results.length })
            context.logs.push({
              timestamp: new Date().toISOString(),
              level: 'INFO',
              message: `Module Finished: ${stage.connector.name}`,
              module: stage.connector.name,
              data: { resultCount: results.length, target: target.value },
            })
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error'
            logger.error(`Error in connector for target ${target.value}`, error)

            context.errors.push({
              module: stage.connector.name,
              message: errorMsg,
              timestamp: new Date().toISOString(),
            })

            context.logs.push({
              timestamp: new Date().toISOString(),
              level: 'ERROR',
              message: `Module Error: ${stage.connector.name}`,
              module: stage.connector.name,
              data: { error: errorMsg },
            })
          }
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        logger.error(`Error executing pipeline stage ${stage.name}`, error)

        context.errors.push({
          module: stage.name,
          message: errorMsg,
          timestamp: new Date().toISOString(),
        })
      }
    }

    logger.info('Pipeline execution completed', {
      resultCount: context.results.length,
      errorCount: context.errors.length,
    })
  }

  getStages(): PipelineStage[] {
    return this.stages
  }

  clearStages(): void {
    this.stages = []
  }
}
