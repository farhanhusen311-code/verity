/**
 * Shapes returned by GET /api/investigations/{id}/graph.
 * These mirror the API route response — the frontend only visualizes them.
 */

export interface GraphNodeData {
  id: string
  type: string
  value: string
  originalValue?: string
  confidence: number
  source?: string
  metadata?: Record<string, unknown> | null
}

export interface GraphEdgeData {
  id: string
  type: string
  fromEntityId: string
  toEntityId: string
  confidence: number
  evidence?: string | null
  weight: number
  metadata?: Record<string, unknown> | null
}

export interface GraphStatisticsData {
  totalEntities: number
  totalRelationships: number
  connectedComponents: number
  averageDegree: number
  averageConfidence: number
  highestConnectedEntity: {
    id: string
    value: string
    degree: number
  } | null
  entityTypeDistribution: Record<string, number>
  relationshipTypeDistribution: Record<string, number>
}

export interface GraphResponseData {
  nodes: GraphNodeData[]
  edges: GraphEdgeData[]
  statistics: GraphStatisticsData
}

export interface GraphApiResponse {
  success: boolean
  data?: GraphResponseData
  error?: string
}

/** Custom node payload passed into React Flow nodes. */
export interface FlowNodePayload extends Record<string, unknown> {
  entity: GraphNodeData
  degree: number
  dimmed: boolean
  highlighted: boolean
}

export interface GraphFilters {
  search: string
  entityTypes: string[]
  relationshipTypes: string[]
  minConfidence: number
}
