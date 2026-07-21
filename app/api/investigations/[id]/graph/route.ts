import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { logger } from '@/lib/logger'
import { getCorrelationEngine } from '@/services/correlation/engine'

const paramsSchema = z.object({
  id: z.string().min(1),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const { id } = paramsSchema.parse(resolvedParams)

    logger.info('API: Fetching correlation graph', { investigationId: id })

    const engine = getCorrelationEngine()
    const result = await engine.getGraph(id)

    if (!result) {
      logger.warn('API: No graph found for investigation', { investigationId: id })
      return NextResponse.json(
        {
          success: false,
          error: 'Graph not found for this investigation',
        },
        { status: 404 }
      )
    }

    const { graph, statistics } = result

    // Format response
    const response = {
      success: true,
      data: {
        nodes: graph.nodes.map((node) => ({
          id: node.id || node.normalizedHash,
          type: node.type,
          value: node.value,
          originalValue: node.originalValue,
          confidence: node.confidence,
          source: node.source,
          metadata: node.metadata,
        })),
        edges: graph.edges.map((edge) => ({
          id: edge.id,
          type: edge.type,
          fromEntityId: edge.fromEntityId,
          toEntityId: edge.toEntityId,
          confidence: edge.confidence,
          evidence: edge.evidence,
          weight: edge.weight,
          metadata: edge.metadata,
        })),
        statistics: {
          totalEntities: statistics.totalEntities,
          totalRelationships: statistics.totalRelationships,
          connectedComponents: statistics.connectedComponents,
          averageDegree: statistics.averageDegree,
          averageConfidence: statistics.averageConfidence,
          highestConnectedEntity: statistics.highestConnectedEntity,
          entityTypeDistribution: statistics.entityTypeDistribution,
          relationshipTypeDistribution: statistics.relationshipTypeDistribution,
        },
      },
    }

    logger.info('API: Graph fetched successfully', {
      investigationId: id,
      nodeCount: statistics.totalEntities,
      edgeCount: statistics.totalRelationships,
    })

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    logger.error('API: Error fetching graph', { error })

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid investigation ID',
          details: error.errors,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch correlation graph',
      },
      { status: 500 }
    )
  }
}
