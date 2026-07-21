// ==================== Risk Scoring Engine Types ====================
//
// These types define the contract for the Risk Scoring Engine.
//
// IMPORTANT (future-proofing):
// The engine is designed so the underlying scoring strategy can be swapped
// (e.g. from the current Rule-Based engine to a Machine Learning model)
// WITHOUT changing the public API, the database models, or the consumers.
// Any new strategy only has to implement the `IRiskScorer` interface.

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export type ScoringMethod = 'RULE_BASED' | 'AI_MODEL' | 'HYBRID'

export type RecommendationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

/**
 * Weight categories. Each rule belongs to exactly one category and the
 * category determines its base weight (see weights.ts).
 */
export type RiskCategory =
  | 'LEAK_DETECTION'
  | 'WEAK_SSL'
  | 'HIDDEN_WHOIS'
  | 'MULTIPLE_ALIAS'
  | 'SUSPICIOUS_DOMAIN'
  | 'MISSING_SECURITY_HEADER'
  | 'OTHER'

/**
 * A single raw investigation result passed into the engine.
 * Mirrors the InvestigationResult model plus an optional structured `data`
 * payload for richer future signals.
 */
export interface RiskResultInput {
  source: string
  category: string
  title: string
  description?: string | null
  url?: string | null
  confidence?: number | null
  data?: Record<string, any>
}

/**
 * Minimal investigation shape needed for scoring.
 */
export interface RiskInvestigationInput {
  id: string
  email?: string | null
  username?: string | null
  domain?: string | null
  website?: string | null
  ip?: string | null
}

/**
 * Derived, normalized signals extracted from the raw results.
 * Rules read from these signals rather than parsing raw results directly,
 * which keeps rules small and testable. A signal that could not be
 * determined is left `undefined` and rules treat it as "not evaluable".
 */
export interface RiskSignals {
  emailSourceCount?: number
  usernamePlatformCount?: number
  domainAgeDays?: number
  sslValid?: boolean
  securityHeadersComplete?: boolean
  hasHttps?: boolean
  hasMxRecord?: boolean
  registrarRisky?: boolean
  ipDomainCount?: number
  whoisHidden?: boolean
}

/**
 * The context handed to every rule during evaluation.
 */
export interface RiskContext {
  investigationId: string
  investigation: RiskInvestigationInput
  results: RiskResultInput[]
  signals: RiskSignals
  logs: RiskLog[]
}

/**
 * The outcome of evaluating a single rule.
 */
export interface RuleResult {
  triggered: boolean // true = risk detected (rule "failed")
  evidence: string[]
  reasoning: string
}

/**
 * A modular rule definition.
 */
export interface Rule {
  id: string
  name: string
  description: string
  category: RiskCategory
  weight: number
  enabled: boolean
  evaluate(context: RiskContext): RuleResult
}

/**
 * A rule evaluation enriched with scoring information (what actually
 * happened when the rule ran).
 */
export interface EvaluatedRule {
  ruleId: string
  name: string
  description: string
  category: RiskCategory
  weight: number
  triggered: boolean
  score: number // points contributed to the total (0 if not triggered)
  evidence: string[]
  reasoning: string
}

/**
 * A generated recommendation.
 */
export interface RiskRecommendation {
  code: string
  title: string
  description: string
  priority: RecommendationPriority
}

/**
 * The complete result returned by any scoring strategy.
 */
export interface RiskScoreResult {
  score: number // 0 - 100
  level: RiskLevel
  method: ScoringMethod
  summary: string
  reasoning: string
  rules: EvaluatedRule[]
  recommendations: RiskRecommendation[]
}

/**
 * The strategy contract. Swap this implementation to change how risk is
 * computed (rule-based today, ML model tomorrow) without touching the
 * engine, API, or database layers.
 */
export interface IRiskScorer {
  readonly method: ScoringMethod
  score(context: RiskContext): Promise<RiskScoreResult> | RiskScoreResult
}

export interface RiskLog {
  timestamp: string
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG'
  message: string
  data?: Record<string, any>
}
