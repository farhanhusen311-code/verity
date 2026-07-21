import { logger } from '@/lib/logger'
import { prisma } from '@/lib/prisma'
import { EntityExtractor, entityExtractor } from './entityExtractor'
import { RelationshipBuilder, relationshipBuilder } from './relationshipBuilder'
import { GraphBuilder, graphBuilder } from './graphBuilder'
import { EntityNormalizer, entityNormalizer } from './normalizer'
import { ConfidenceCalculator, confidenceCalculator } from './confidence'
import {
  CorrelationEntity,
  CorrelationRelationship,
  CorrelationGraph,
  GraphStatistics,
  CorrelationContext,
  CorrelationLog,
} from './types'

export class CorrelationEngine {
  private entityExtractor: EntityExtractor
  private relationshipBuilder: RelationshipBuilder
  private graphBuilder: GraphBuilder
  private normalizer: EntityNormalizer
  private confidenceCalculator: ConfidenceCalculator

  constructor() {
    this.entityExtractor = entityExtractor
    this.relationshipBuilder = relationshipBuilder
    this.graphBuilder = graphBuilder
    this.normalizer = entityNormalizer
    this.confidenceCalculator = confidenceCalculator
  }

  /**
   * Execute complete correlation workflow
   */
  async correlate(investigationId: string, results: any[]): Promise<{
    graph: CorrelationGraph
    statistics: GraphStatistics
    context: CorrelationContext
  }> {
    try {
      const context: CorrelationContext = {
        investigationId,
        entities: new Map(),
        relationships: [],
        logs: [],
        errors: [],
      }

      this.log(context, 'INFO', 'Starting correlation analysis', { resultCount: results.length })

      // Step 1: Extract entities
      this.log(context, 'INFO', 'Entity extraction started')
      let entities = await this.entityExtractor.extract(investigationId, results)
      this.log(context, 'INFO', 'Entity extraction completed', { extractedCount: entities.length })

      // Step 2: Deduplicate entities
      this.log(context, 'INFO', 'Entity deduplication started')
      entities = this.deduplicateEntities(context, entities)
      this.log(context, 'INFO', 'Entity deduplication completed', { uniqueCount: entities.length })

      // Store entities in map for quick access
      for (const entity of entities) {
        context.entities.set(entity.normalizedHash, entity)
      }

      // Step 3: Build relationships
      this.log(context, 'INFO', 'Relationship building started')
      let relationships = await this.relationshipBuilder.build(entities, results)
      this.log(context, 'INFO', 'Relationship building completed', { relationshipCount: relationships.length })

      // Step 4: Deduplicate relationships
      this.log(context, 'INFO', 'Relationship deduplication started')
      relationships = this.deduplicateRelationships(context, relationships)
      this.log(context, 'INFO', 'Relationship deduplication completed', { uniqueCount: relationships.length })

      context.relationships = relationships

      // Step 5: Build graph
      this.log(context, 'INFO', 'Graph building started')
      const graph = this.graphBuilder.build(entities, relationships)
      this.log(context, 'INFO', 'Graph building completed')

      // Step 6: Calculate statistics
      this.log(context, 'INFO', 'Statistics calculation started')
      const statistics = this.graphBuilder.calculateStatistics(graph)
      this.log(context, 'INFO', 'Statistics calculation completed', {
        entities: statistics.totalEntities,
        relationships: statistics.totalRelationships,
        components: statistics.connectedComponents,
      })

      // Step 7: Persist to database
      this.log(context, 'INFO', 'Persisting to database started')
      await this.persistGraph(investigationId, entities, relationships)
      this.log(context, 'INFO', 'Persisting to database completed')

      this.log(context, 'INFO', 'Correlation analysis completed successfully')

      return {
        graph,
        statistics,
        context,
      }
    } catch (error) {
      logger.error('Error during correlation analysis', { investigationId, error })
      throw error
    }
  }

  /**
   * Deduplicate entities
   */
  private deduplicateEntities(context: CorrelationContext, entities: CorrelationEntity[]): CorrelationEntity[] {
    try {
      const seen = new Map<string, CorrelationEntity>()
      let duplicatesRemoved = 0

      for (const entity of entities) {
        if (seen.has(entity.normalizedHash)) {
          // Update confidence if higher
          const existing = seen.get(entity.normalizedHash)!
          if (entity.confidence > existing.confidence) {
            existing.confidence = entity.confidence
          }
          duplicatesRemoved++
          this.log(context, 'DEBUG', 'Duplicate entity removed', {
            type: entity.type,
            value: entity.value,
          })
        } else {
          seen.set(entity.normalizedHash, entity)
        }
      }

      this.log(context, 'INFO', `Removed ${duplicatesRemoved} duplicate entities`)
      return Array.from(seen.values())
    } catch (error) {
      logger.warn('Error deduplicating entities', { error })
      return entities
    }
  }

  /**
   * Deduplicate relationships
   */
  private deduplicateRelationships(
    context: CorrelationContext,
    relationships: CorrelationRelationship[]
  ): CorrelationRelationship[] {
    try {
      const seen = new Map<string, CorrelationRelationship>()
      let duplicatesRemoved = 0

      for (const rel of relationships) {
        const key = `${rel.fromEntityId}:${rel.toEntityId}:${rel.type}`

        if (seen.has(key)) {
          // Keep relationship with higher confidence
          const existing = seen.get(key)!
          if (rel.confidence > existing.confidence) {
            seen.set(key, rel)
          }
          duplicatesRemoved++
          this.log(context, 'DEBUG', 'Duplicate relationship removed', {
            type: rel.type,
          })
        } else {
          seen.set(key, rel)
        }
      }

      this.log(context, 'INFO', `Removed ${duplicatesRemoved} duplicate relationships`)
      return Array.from(seen.values())
    } catch (error) {
      logger.warn('Error deduplicating relationships', { error })
      return relationships
    }
  }

  /**
   * Persist graph to database
   */
  private async persistGraph(
    investigationId: string,
    entities: CorrelationEntity[],
    relationships: CorrelationRelationship[]
  ): Promise<void> {
    try {
      // Save entities
      for (const entity of entities) {
        await prisma.entity.upsert({
          where: { normalizedHash: entity.normalizedHash },
          update: {
            confidence: entity.confidence,
            metadata: entity.metadata ? JSON.stringify(entity.metadata) : null,
          },
          create: {
            type: entity.type as any,
            value: entity.value,
            originalValue: entity.originalValue,
            normalizedHash: entity.normalizedHash,
            confidence: entity.confidence,
            source: entity.source,
            metadata: entity.metadata ? JSON.stringify(entity.metadata) : null,
            investigationId,
          },
        })
      }

      // Save relationships
      for (const rel of relationships) {
        await prisma.relationship.upsert({
          where: {
            fromEntityId_toEntityId_type: {
              fromEntityId: rel.fromEntityId,
              toEntityId: rel.toEntityId,
              type: rel.type as any,
            },
          },
          update: {
            confidence: rel.confidence,
            evidence: rel.evidence,
            metadata: rel.metadata ? JSON.stringify(rel.metadata) : null,
            weight: rel.weight,
          },
          create: {
            type: rel.type as any,
            fromEntityId: rel.fromEntityId,
            toEntityId: rel.toEntityId,
            confidence: rel.confidence,
            evidence: rel.evidence,
            metadata: rel.metadata ? JSON.stringify(rel.metadata) : null,
            weight: rel.weight,
            investigationId,
          },
        })
      }

      logger.info('Graph persisted to database', {
        investigationId,
        entityCount: entities.length,
        relationshipCount: relationships.length,
      })
    } catch (error) {
      logger.error('Error persisting graph to database', { investigationId, error })
      throw error
    }
  }

  /**
   * Get saved graph for investigation
   */
  async getGraph(investigationId: string): Promise<{
    graph: CorrelationGraph
    statistics: GraphStatistics
  } | null> {
    try {
      // Fetch entities and relationships from database
      const entities = await prisma.entity.findMany({
        where: { investigationId },
      })

      const relationships = await prisma.relationship.findMany({
        where: { investigationId },
      })

      if (entities.length === 0) {
        return null
      }

      // Convert DB entities to CorrelationEntity
      const correlationEntities: CorrelationEntity[] = entities.map((e) => ({
        id: e.id,
        type: e.type as any,
        value: e.value,
        originalValue: e.originalValue || undefined,
        normalizedHash: e.normalizedHash,
        confidence: e.confidence,
        source: e.source || undefined,
        metadata: e.metadata ? JSON.parse(e.metadata) : undefined,
        investigationId: e.investigationId || undefined,
      }))

      // Convert DB relationships to CorrelationRelationship
      const correlationRelationships: CorrelationRelationship[] = relationships.map((r) => ({
        id: r.id,
        type: r.type as any,
        fromEntityId: r.fromEntityId,
        toEntityId: r.toEntityId,
        confidence: r.confidence,
        evidence: r.evidence || undefined,
        metadata: r.metadata ? JSON.parse(r.metadata) : undefined,
        weight: r.weight,
        investigationId: r.investigationId || undefined,
      }))

      // Build graph
      const graph = this.graphBuilder.build(correlationEntities, correlationRelationships)
      const statistics = this.graphBuilder.calculateStatistics(graph)

      return { graph, statistics }
    } catch (error) {
      logger.error('Error fetching graph from database', { investigationId, error })
      return null
    }
  }

  /**
   * Add log entry
   */
  private log(context: CorrelationContext, level: string, message: string, data?: Record<string, any>): void {
    const logEntry: CorrelationLog = {
      timestamp: new Date().toISOString(),
      level: level as any,
      message,
      data,
    }

    context.logs.push(logEntry)

    if (level === 'ERROR') {
      context.errors.push(message)
    }

    logger.log(level.toLowerCase(), message, data)
  }
}

let instance: CorrelationEngine | null = null

export function getCorrelationEngine(): CorrelationEngine {
  if (!instance) {
    instance = new CorrelationEngine()
  }
  return instance
}
