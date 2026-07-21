// ==================== Risk Recommendation Generator ====================
//
// Turns triggered rules into concrete, actionable recommendations.
// The mapping is data-driven so it can evolve independently of rule logic.

import { EvaluatedRule, RiskRecommendation, RecommendationPriority, RiskLevel } from './types'

interface RecommendationTemplate {
  code: string
  title: string
  description: string
  priority: RecommendationPriority
}

/**
 * Maps a rule id to one or more recommendation templates.
 */
const RULE_RECOMMENDATIONS: Record<string, RecommendationTemplate[]> = {
  'leak.email-multiple-sources': [
    {
      code: 'ENABLE_MFA',
      title: 'Enable MFA',
      description: 'Enable multi-factor authentication on all accounts tied to the exposed email.',
      priority: 'HIGH',
    },
    {
      code: 'CHANGE_PASSWORD',
      title: 'Change Password',
      description: 'Reset passwords for accounts associated with the leaked email address.',
      priority: 'HIGH',
    },
  ],
  'alias.username-multiple-platforms': [
    {
      code: 'REVIEW_DIGITAL_FOOTPRINT',
      title: 'Review Digital Footprint',
      description: 'Audit accounts sharing this username and reduce cross-platform linkability.',
      priority: 'MEDIUM',
    },
  ],
  'domain.newly-created': [
    {
      code: 'MONITOR_DOMAIN',
      title: 'Monitor Domain',
      description: 'Continuously monitor this recently registered domain for malicious activity.',
      priority: 'MEDIUM',
    },
  ],
  'ssl.invalid-certificate': [
    {
      code: 'RENEW_SSL',
      title: 'Renew SSL Certificate',
      description: 'Reissue or renew the SSL/TLS certificate with a trusted certificate authority.',
      priority: 'HIGH',
    },
  ],
  'header.incomplete-security-headers': [
    {
      code: 'HARDEN_SECURITY_HEADERS',
      title: 'Harden Security Headers',
      description: 'Add missing HTTP security headers such as HSTS, CSP, and X-Frame-Options.',
      priority: 'MEDIUM',
    },
  ],
  'ssl.no-https': [
    {
      code: 'ENFORCE_HTTPS',
      title: 'Enforce HTTPS',
      description: 'Serve all traffic over HTTPS and redirect HTTP requests to HTTPS.',
      priority: 'HIGH',
    },
  ],
  'dns.missing-mx-record': [
    {
      code: 'REVIEW_DNS',
      title: 'Review DNS Configuration',
      description: 'Verify and correct the domain DNS records, including the missing MX record.',
      priority: 'MEDIUM',
    },
  ],
  'domain.risky-registrar': [
    {
      code: 'MONITOR_DOMAIN',
      title: 'Monitor Domain',
      description: 'Keep the domain under close observation due to its high-risk registrar.',
      priority: 'MEDIUM',
    },
  ],
  'ip.shared-by-multiple-domains': [
    {
      code: 'REVIEW_HOSTING',
      title: 'Review Hosting',
      description: 'Investigate the shared hosting environment and neighboring domains on this IP.',
      priority: 'LOW',
    },
  ],
  'whois.hidden': [
    {
      code: 'REVIEW_WHOIS',
      title: 'Review WHOIS Information',
      description: 'Attempt to obtain registrant details through historical or authoritative WHOIS sources.',
      priority: 'MEDIUM',
    },
  ],
}

/**
 * Baseline recommendations added based on the overall risk level, ensuring
 * the engine always returns actionable guidance even when few rules trigger.
 */
const LEVEL_BASELINE: Record<RiskLevel, RecommendationTemplate[]> = {
  LOW: [],
  MEDIUM: [
    {
      code: 'CONTINUE_MONITORING',
      title: 'Continue Monitoring',
      description: 'Maintain periodic monitoring of the investigated target for changes.',
      priority: 'LOW',
    },
  ],
  HIGH: [
    {
      code: 'ESCALATE_REVIEW',
      title: 'Escalate for Review',
      description: 'Escalate this case to a senior analyst for a detailed manual review.',
      priority: 'HIGH',
    },
  ],
  CRITICAL: [
    {
      code: 'IMMEDIATE_ACTION',
      title: 'Take Immediate Action',
      description: 'Trigger incident response procedures and remediate the highest-severity findings now.',
      priority: 'CRITICAL',
    },
  ],
}

const PRIORITY_ORDER: Record<RecommendationPriority, number> = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
}

/**
 * Generate a de-duplicated, priority-sorted list of recommendations from the
 * triggered rules and the overall risk level.
 */
export function generateRecommendations(
  rules: EvaluatedRule[],
  level: RiskLevel
): RiskRecommendation[] {
  const byCode = new Map<string, RiskRecommendation>()

  const add = (template: RecommendationTemplate) => {
    const existing = byCode.get(template.code)
    // Keep the highest-priority variant if the same code appears twice.
    if (!existing || PRIORITY_ORDER[template.priority] < PRIORITY_ORDER[existing.priority]) {
      byCode.set(template.code, { ...template })
    }
  }

  for (const rule of rules) {
    if (!rule.triggered) continue
    const templates = RULE_RECOMMENDATIONS[rule.ruleId] ?? []
    templates.forEach(add)
  }

  LEVEL_BASELINE[level].forEach(add)

  return Array.from(byCode.values()).sort(
    (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
  )
}
