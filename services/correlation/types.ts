// Correlation Engine Types

export type EntityTypeStr = 
  | 'EMAIL' | 'USERNAME' | 'PHONE_NUMBER' | 'FULL_NAME' | 'WEBSITE_URL' 
  | 'DOMAIN' | 'SUBDOMAIN' | 'IP_ADDRESS' | 'IPV6' | 'ASN' 
  | 'DNS_RECORD' | 'SSL_CERTIFICATE' | 'ORGANIZATION' | 'REGISTRAR' 
  | 'COUNTRY' | 'CITY' | 'SOCIAL_MEDIA_ACCOUNT' | 'GITHUB_ACCOUNT' 
  | 'LINKEDIN_ACCOUNT' | 'FACEBOOK_ACCOUNT' | 'INSTAGRAM_ACCOUNT' | 'X_ACCOUNT'

export type RelationshipTypeStr = 
  | 'OWNS' | 'USES' | 'REGISTERED_TO' | 'HOSTED_ON' | 'RESOLVES_TO' 
  | 'BELONGS_TO' | 'ASSOCIATED_WITH' | 'LINKED_TO' | 'MENTIONED_IN' | 'CONNECTED_TO'

export interface CorrelationEntity {
  id?: string
  type: EntityTypeStr
  value: string
  originalValue?: string
  normalizedHash: string
  confidence: number // 0-100
  source?: string
  metadata?: Record<string, any>
  investigationId?: string
}

export interface CorrelationRelationship {
  id?: string
  type: RelationshipTypeStr
  fromEntityId: string
  toEntityId: string
  confidence: number // 0-100
  evidence?: string
  metadata?: Record<string, any>
  weight: number
  investigationId?: string
}

export interface CorrelationGraph {
  nodes: CorrelationEntity[]
  edges: CorrelationRelationship[]
  adjacencyList: Map<string, string[]>
  adjacencyMatrix: number[][]
}

export interface GraphStatistics {
  totalEntities: number
  totalRelationships: number
  connectedComponents: number
  averageDegree: number
  highestConnectedEntity: {
    id: string
    value: string
    degree: number
  }
  entityTypeDistribution: Record<EntityTypeStr, number>
  relationshipTypeDistribution: Record<RelationshipTypeStr, number>
  averageConfidence: number
}

export interface ExtractionResult {
  entities: CorrelationEntity[]
  relationships: CorrelationRelationship[]
  errors: string[]
}

export interface NormalizationRule {
  test: (value: string) => boolean
  apply: (value: string) => string
}

export interface ConfidenceCalculator {
  calculateRelationshipConfidence(type: RelationshipTypeStr, metadata: Record<string, any>): number
  calculateEntityConfidence(type: EntityTypeStr, source: string): number
}

export interface EntityExtractor {
  extract(investigationId: string, data: any): Promise<CorrelationEntity[]>
  extractFromResult(result: any): CorrelationEntity | null
}

export interface RelationshipBuilder {
  build(entities: CorrelationEntity[], data: any): Promise<CorrelationRelationship[]>
  buildRelationship(fromEntity: CorrelationEntity, toEntity: CorrelationEntity, type: RelationshipTypeStr, confidence: number): CorrelationRelationship
}

export interface GraphBuilder {
  build(entities: CorrelationEntity[], relationships: CorrelationRelationship[]): CorrelationGraph
  calculateStatistics(graph: CorrelationGraph): GraphStatistics
}

export interface CorrelationLog {
  timestamp: string
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG'
  message: string
  data?: Record<string, any>
}

export interface CorrelationContext {
  investigationId: string
  entities: Map<string, CorrelationEntity>
  relationships: CorrelationRelationship[]
  logs: CorrelationLog[]
  errors: string[]
}
