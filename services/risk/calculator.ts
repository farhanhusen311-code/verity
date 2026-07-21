// ==================== Rule-Based Risk Calculator ====================
//
// The default scoring strategy. It:
//   1. Derives normalized signals from raw investigation results.
//   2. Runs every enabled rule against those signals.
//   3. Sums the weights of triggered rules (capped at MAX_RISK_SCORE).
//   4. Classifies the score into a RiskLevel.
//   5. Generates recommendations and an explainable reasoning trail.
//
// This class implements `IRiskScorer`. To move to an ML model later, create a
// new class that implements the same interface and inject it into the engine.

import {
  IRiskScorer,
  RiskContext,
  RiskResultInput,
  RiskScoreResult,
  RiskSignals,
  EvaluatedRule,
  ScoringMethod,
} from './types'
import { getEnabledRules } from './rules'
import { generateRecommendations } from './recommendation'
import { classifyScore } from './classification'
import { MAX_RISK_SCORE, CATEGORY_LABELS } from './weights'

/** Registrars commonly associated with abuse (illustrative list). */
const RISKY_REGISTRARS = ['namesilo', 'namecheap-reseller', 'reg.ru', 'webnic', 'todaynic', 'r01']

function truthy(value: any): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') return ['true', 'yes', 'valid', 'present', '1'].includes(value.toLowerCase())
  if (typeof value === 'number') return value > 0
  return false
}

function text(result: RiskResultInput): string {
  return `${result.source} ${result.category} ${result.title} ${result.description ?? ''}`.toLowerCase()
}

function findByCategory(results: RiskResultInput[], ...categories: string[]): RiskResultInput | undefined {
  const set = categories.map((c) => c.toLowerCase())
  return results.find((r) => set.includes((r.category ?? '').toLowerCase()))
}

/**
 * Derive normalized signals from raw results. Every signal is optional:
 * when a value cannot be determined it is left undefined and the associated
 * rule treats it as "not evaluable".
 */
export function buildSignals(context: {
  investigation: RiskContext['investigation']
  results: RiskResultInput[]
}): RiskSignals {
  const { results } = context
  const signals: RiskSignals = {}

  // --- Leak / breach exposure (email across sources) ---
  const leakResults = results.filter(
    (r) => /breach|leak|dump|exposure|paste/.test(text(r))
  )
  if (leakResults.length > 0) {
    signals.emailSourceCount = new Set(leakResults.map((r) => r.source)).size
  }

  // --- Username footprint across platforms ---
  const socialResults = results.filter(
    (r) => /social|platform|account|profile/.test(text(r))
  )
  if (socialResults.length > 0) {
    signals.usernamePlatformCount = new Set(socialResults.map((r) => r.source)).size
  }

  // --- WHOIS derived signals (domain age, registrar, privacy) ---
  const whois = findByCategory(results, 'whois')
  if (whois) {
    const data = whois.data ?? {}
    const t = text(whois)

    // Domain age
    if (typeof data.domainAgeDays === 'number') {
      signals.domainAgeDays = data.domainAgeDays
    } else if (data.creationDate || data.createdDate) {
      const created = new Date(data.creationDate ?? data.createdDate)
      if (!Number.isNaN(created.getTime())) {
        signals.domainAgeDays = Math.floor((Date.now() - created.getTime()) / 86_400_000)
      }
    }

    // WHOIS privacy / redaction
    if (typeof data.privacyEnabled === 'boolean') {
      signals.whoisHidden = data.privacyEnabled
    } else if (typeof data.hidden === 'boolean') {
      signals.whoisHidden = data.hidden
    } else if (/redacted|privacy|whoisguard|data protected|not disclosed/.test(t)) {
      signals.whoisHidden = true
    }

    // Registrar reputation
    const registrar = String(data.registrar ?? '').toLowerCase()
    if (registrar) {
      signals.registrarRisky = RISKY_REGISTRARS.some((r) => registrar.includes(r))
    } else if (typeof data.registrarRisky === 'boolean') {
      signals.registrarRisky = data.registrarRisky
    }
  }

  // --- SSL signals ---
  const ssl = findByCategory(results, 'ssl', 'ssl_certificate', 'certificate')
  if (ssl) {
    const data = ssl.data ?? {}
    const t = text(ssl)
    if (typeof data.valid === 'boolean') {
      signals.sslValid = data.valid
    } else if (/invalid|expired|self-signed|untrusted|no ssl/.test(t)) {
      signals.sslValid = false
    } else if (/valid|trusted/.test(t)) {
      signals.sslValid = true
    }

    if (typeof data.https === 'boolean') {
      signals.hasHttps = data.https
    } else if (signals.sslValid !== undefined) {
      signals.hasHttps = signals.sslValid
    }
  }

  // --- Security headers ---
  const headers = findByCategory(results, 'http_header', 'security_txt', 'security', 'headers')
  if (headers) {
    const data = headers.data ?? {}
    const t = text(headers)
    if (typeof data.complete === 'boolean') {
      signals.securityHeadersComplete = data.complete
    } else if (Array.isArray(data.missing)) {
      signals.securityHeadersComplete = data.missing.length === 0
    } else if (/missing|incomplete|not set|absent/.test(t)) {
      signals.securityHeadersComplete = false
    } else if (/complete|all present/.test(t)) {
      signals.securityHeadersComplete = true
    }
  }

  // --- DNS / MX ---
  const dns = findByCategory(results, 'dns', 'dns_record')
  if (dns) {
    const data = dns.data ?? {}
    const t = text(dns)
    if (Array.isArray(data.mxRecords)) {
      signals.hasMxRecord = data.mxRecords.length > 0
    } else if (typeof data.hasMxRecord === 'boolean') {
      signals.hasMxRecord = data.hasMxRecord
    } else if (/no mx|missing mx|mx not/.test(t)) {
      signals.hasMxRecord = false
    } else if (/mx record/.test(t)) {
      signals.hasMxRecord = true
    }
  }

  // --- IP co-hosting ---
  const ip = findByCategory(results, 'reputation', 'ip', 'ip_address', 'geolocation')
  if (ip) {
    const data = ip.data ?? {}
    if (typeof data.domainCount === 'number') {
      signals.ipDomainCount = data.domainCount
    } else if (Array.isArray(data.domains)) {
      signals.ipDomainCount = data.domains.length
    }
  }

  return signals
}

export class RuleBasedScorer implements IRiskScorer {
  readonly method: ScoringMethod = 'RULE_BASED'

  score(context: RiskContext): RiskScoreResult {
    const rules = getEnabledRules()
    const evaluated: EvaluatedRule[] = []
    let total = 0

    for (const rule of rules) {
      const result = rule.evaluate(context)
      const contributed = result.triggered ? rule.weight : 0
      total += contributed

      evaluated.push({
        ruleId: rule.id,
        name: rule.name,
        description: rule.description,
        category: rule.category,
        weight: rule.weight,
        triggered: result.triggered,
        score: contributed,
        evidence: result.evidence,
        reasoning: result.reasoning,
      })
    }

    const score = Math.min(MAX_RISK_SCORE, total)
    const level = classifyScore(score)
    const recommendations = generateRecommendations(evaluated, level)

    const triggered = evaluated.filter((r) => r.triggered)
    const summary =
      triggered.length === 0
        ? `No risk indicators detected. Risk level: ${level} (${score}/100).`
        : `${triggered.length} risk indicator(s) detected across ${
            new Set(triggered.map((r) => r.category)).size
          } categories. Risk level: ${level} (${score}/100).`

    const reasoning = this.buildReasoning(evaluated, score, level)

    return {
      score,
      level,
      method: this.method,
      summary,
      reasoning,
      rules: evaluated,
      recommendations,
    }
  }

  private buildReasoning(rules: EvaluatedRule[], score: number, level: string): string {
    const triggered = rules.filter((r) => r.triggered)
    if (triggered.length === 0) {
      return `The rule-based engine evaluated ${rules.length} rules and none were triggered, resulting in a score of ${score}/100 (${level}).`
    }
    const lines = triggered.map(
      (r) => `- [${CATEGORY_LABELS[r.category]}] ${r.name} (+${r.score}): ${r.reasoning}`
    )
    return [
      `The rule-based engine evaluated ${rules.length} rules; ${triggered.length} were triggered.`,
      `Total score ${score}/100 classified as ${level}.`,
      'Triggered rules:',
      ...lines,
    ].join('\n')
  }
}

export const ruleBasedScorer = new RuleBasedScorer()
