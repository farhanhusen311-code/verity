// Investigation Engine Types

export type SearchTargetType = 'email' | 'username' | 'phone' | 'fullname' | 'domain' | 'website' | 'ip'

export type InvestigationStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED'

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface SearchTarget {
  type: SearchTargetType
  value: string
}

export interface InvestigationConfig {
  includeOsint: boolean
  includeLeakDetection: boolean
  includeDomainIntelligence: boolean
  includeSocialMedia: boolean
}

// Result from individual connector/module
export interface ConnectorResult {
  source: string // e.g., 'email-breach', 'whois', 'dns-lookup'
  category: string // e.g., 'breach', 'reputation', 'infrastructure'
  title: string
  description?: string
  confidence: number // 0-100
  metadata: Record<string, any>
  timestamp: string
  url?: string
}

// Standardized result object from investigation engine
export interface InvestigationEngineResult {
  source: string
  category: string
  title: string
  description?: string
  confidence: number
  metadata: Record<string, any>
  timestamp: string
  url?: string
}

// Investigation engine context
export interface InvestigationContext {
  investigationId: string
  targets: SearchTarget[]
  config: InvestigationConfig
  startTime: Date
  results: InvestigationEngineResult[]
  errors: InvestigationError[]
  status: InvestigationStatus
  logs: InvestigationLog[]
}

// Investigation error
export interface InvestigationError {
  module: string
  message: string
  timestamp: string
  stack?: string
}

// Investigation log entry
export interface InvestigationLog {
  timestamp: string
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG'
  message: string
  module: string
  data?: Record<string, any>
}

// Connector interface for modules
export interface IConnector {
  name: string
  supports: SearchTargetType[]
  execute(target: SearchTarget, config: InvestigationConfig): Promise<ConnectorResult[]>
}

// Pipeline stage
export interface PipelineStage {
  name: string
  connector: IConnector
  targets: SearchTarget[]
}

// Engine statistics
export interface InvestigationStatistics {
  totalResults: number
  resultsBySource: Record<string, number>
  resultsByCategory: Record<string, number>
  averageConfidence: number
  executionTime: number // in milliseconds
  modulesExecuted: string[]
}
