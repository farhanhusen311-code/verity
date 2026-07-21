// OSINT Connector Types and Interfaces

export interface OSINTConnectorResult {
  source: string
  category: string
  title: string
  description?: string
  data: Record<string, any>
  confidence: number // 0-100
  error?: string
  executionTime: number // milliseconds
  timestamp: string
  status: 'success' | 'error' | 'timeout' | 'not_found'
}

export interface OSINTConnectorConfig {
  timeout?: number
  retries?: number
  useCache?: boolean
  cacheTTL?: number // seconds
}

export interface OSINTConnectorContext {
  target: string
  targetType: string
  config: OSINTConnectorConfig
  userId?: string
  investigationId?: string
}

export interface IOSINTConnector {
  name: string
  description: string
  supported: string[] // target types like 'domain', 'email', etc
  priority: number // execution priority (0-100, higher = sooner)
  
  execute(context: OSINTConnectorContext): Promise<OSINTConnectorResult>
  validate(target: string): boolean
  isAvailable(): Promise<boolean>
}

export interface OSINTCacheEntry {
  connector: string
  target: string
  data: OSINTConnectorResult
  cachedAt: Date
  expiresAt: Date
}

export interface OSINTConnectorRegistry {
  register(connector: IOS INTConnector): void
  unregister(name: string): void
  get(name: string): IOS INTConnector | null
  getAll(): IOS INTConnector[]
  getBySupportedType(type: string): IOS INTConnector[]
}

export interface OSINTNormalizedResult {
  source: string
  category: string
  type: string // whois, dns, ssl, http_header, metadata, robots, security_txt
  title: string
  description?: string
  findings: Record<string, any>
  confidence: number
  timestamp: string
  url?: string
  tags: string[]
}
