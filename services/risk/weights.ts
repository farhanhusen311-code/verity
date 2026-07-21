// ==================== Risk Weight Configuration ====================
//
// Weights are kept in a dedicated, isolated configuration so they can be
// tuned (or later learned by an ML model) without touching rule logic.
//
// Each rule references a RiskCategory and inherits that category's weight.

import { RiskCategory } from './types'

/**
 * Base weight per category (points contributed to the risk score when a
 * rule in that category is triggered).
 */
export const RISK_WEIGHTS: Record<RiskCategory, number> = {
  LEAK_DETECTION: 25,
  MULTIPLE_ALIAS: 20,
  HIDDEN_WHOIS: 15,
  SUSPICIOUS_DOMAIN: 15,
  WEAK_SSL: 10,
  MISSING_SECURITY_HEADER: 10,
  OTHER: 5,
}

/**
 * The maximum possible risk score. The engine caps the total at this value.
 */
export const MAX_RISK_SCORE = 100

/**
 * Human readable labels for each category (used in reasoning / UI).
 */
export const CATEGORY_LABELS: Record<RiskCategory, string> = {
  LEAK_DETECTION: 'Leak Detection',
  MULTIPLE_ALIAS: 'Multiple Alias',
  HIDDEN_WHOIS: 'Hidden WHOIS',
  SUSPICIOUS_DOMAIN: 'Suspicious Domain',
  WEAK_SSL: 'Weak SSL',
  MISSING_SECURITY_HEADER: 'Missing Security Header',
  OTHER: 'Other',
}

/**
 * Resolve the weight for a category.
 */
export function getWeight(category: RiskCategory): number {
  return RISK_WEIGHTS[category] ?? RISK_WEIGHTS.OTHER
}
