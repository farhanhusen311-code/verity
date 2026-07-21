// ==================== Risk Rules ====================
//
// Each rule is a small, self-contained, modular unit. A rule reads from the
// normalized `signals` on the context and decides whether a risk condition
// is present (`triggered = true`). Rules never mutate state and never persist
// anything — they are pure functions of the context, which makes them easy to
// test and to later replace with / augment by an ML model.
//
// To add a rule: define it here and add it to `RISK_RULES`.
// To disable a rule: set `enabled: false` (kept in code for transparency).

import { Rule, RiskContext, RuleResult } from './types'
import { getWeight } from './weights'

const NEW_DOMAIN_THRESHOLD_DAYS = 180

/**
 * Small helper to build a "not triggered" result with an explanation.
 */
function pass(reasoning: string): RuleResult {
  return { triggered: false, evidence: [], reasoning }
}

/**
 * Small helper to build a "triggered" result.
 */
function fail(evidence: string[], reasoning: string): RuleResult {
  return { triggered: true, evidence, reasoning }
}

/**
 * The registry of all rules. Order here is the display order.
 */
export const RISK_RULES: Rule[] = [
  {
    id: 'leak.email-multiple-sources',
    name: 'Email found in multiple sources',
    description: 'The target email address was discovered across more than one data source or breach.',
    category: 'LEAK_DETECTION',
    weight: getWeight('LEAK_DETECTION'),
    enabled: true,
    evaluate(ctx: RiskContext): RuleResult {
      const count = ctx.signals.emailSourceCount
      if (count === undefined) return pass('No email exposure signal available.')
      if (count > 1) {
        return fail(
          [`Email appears in ${count} distinct sources.`],
          `The email was found in ${count} sources, indicating potential exposure or leakage.`
        )
      }
      return pass(`Email appears in ${count} source(s); below the exposure threshold.`)
    },
  },
  {
    id: 'alias.username-multiple-platforms',
    name: 'Username present on multiple platforms',
    description: 'The username was found on several platforms, suggesting a linkable digital footprint.',
    category: 'MULTIPLE_ALIAS',
    weight: getWeight('MULTIPLE_ALIAS'),
    enabled: true,
    evaluate(ctx: RiskContext): RuleResult {
      const count = ctx.signals.usernamePlatformCount
      if (count === undefined) return pass('No username footprint signal available.')
      if (count > 1) {
        return fail(
          [`Username found on ${count} platforms.`],
          `The same username was found on ${count} platforms, increasing correlation and exposure risk.`
        )
      }
      return pass(`Username found on ${count} platform(s); below the correlation threshold.`)
    },
  },
  {
    id: 'domain.newly-created',
    name: 'Recently created domain',
    description: `The domain was registered less than ${NEW_DOMAIN_THRESHOLD_DAYS} days ago.`,
    category: 'SUSPICIOUS_DOMAIN',
    weight: getWeight('SUSPICIOUS_DOMAIN'),
    enabled: true,
    evaluate(ctx: RiskContext): RuleResult {
      const age = ctx.signals.domainAgeDays
      if (age === undefined) return pass('No domain age signal available.')
      if (age < NEW_DOMAIN_THRESHOLD_DAYS) {
        return fail(
          [`Domain age is ${age} days (< ${NEW_DOMAIN_THRESHOLD_DAYS}).`],
          `The domain is only ${age} days old, which is commonly associated with disposable or malicious infrastructure.`
        )
      }
      return pass(`Domain age is ${age} days; considered established.`)
    },
  },
  {
    id: 'ssl.invalid-certificate',
    name: 'Invalid SSL certificate',
    description: 'The SSL/TLS certificate is invalid, expired, or untrusted.',
    category: 'WEAK_SSL',
    weight: getWeight('WEAK_SSL'),
    enabled: true,
    evaluate(ctx: RiskContext): RuleResult {
      const valid = ctx.signals.sslValid
      if (valid === undefined) return pass('No SSL certificate signal available.')
      if (valid === false) {
        return fail(
          ['SSL certificate is invalid or untrusted.'],
          'The SSL certificate could not be validated, exposing traffic to interception risks.'
        )
      }
      return pass('SSL certificate is valid.')
    },
  },
  {
    id: 'header.incomplete-security-headers',
    name: 'Incomplete security headers',
    description: 'One or more recommended HTTP security headers are missing.',
    category: 'MISSING_SECURITY_HEADER',
    weight: getWeight('MISSING_SECURITY_HEADER'),
    enabled: true,
    evaluate(ctx: RiskContext): RuleResult {
      const complete = ctx.signals.securityHeadersComplete
      if (complete === undefined) return pass('No security header signal available.')
      if (complete === false) {
        return fail(
          ['Recommended HTTP security headers are missing.'],
          'Missing security headers (e.g. HSTS, CSP, X-Frame-Options) weaken the site against common web attacks.'
        )
      }
      return pass('Security headers are complete.')
    },
  },
  {
    id: 'ssl.no-https',
    name: 'Website does not use HTTPS',
    description: 'The website is served over plain HTTP without HTTPS.',
    category: 'WEAK_SSL',
    weight: getWeight('WEAK_SSL'),
    enabled: true,
    evaluate(ctx: RiskContext): RuleResult {
      const hasHttps = ctx.signals.hasHttps
      if (hasHttps === undefined) return pass('No HTTPS availability signal available.')
      if (hasHttps === false) {
        return fail(
          ['Website is not reachable over HTTPS.'],
          'The site does not serve content over HTTPS, so traffic is transmitted in clear text.'
        )
      }
      return pass('Website is served over HTTPS.')
    },
  },
  {
    id: 'dns.missing-mx-record',
    name: 'MX record not available',
    description: 'The domain has no MX record configured.',
    category: 'OTHER',
    weight: getWeight('OTHER'),
    enabled: true,
    evaluate(ctx: RiskContext): RuleResult {
      const hasMx = ctx.signals.hasMxRecord
      if (hasMx === undefined) return pass('No MX record signal available.')
      if (hasMx === false) {
        return fail(
          ['No MX record found for the domain.'],
          'The absence of an MX record can indicate a misconfigured or non-operational mail setup.'
        )
      }
      return pass('MX record is present.')
    },
  },
  {
    id: 'domain.risky-registrar',
    name: 'Domain uses a risky registrar',
    description: 'The domain is registered with a registrar frequently associated with abuse.',
    category: 'SUSPICIOUS_DOMAIN',
    weight: getWeight('SUSPICIOUS_DOMAIN'),
    enabled: true,
    evaluate(ctx: RiskContext): RuleResult {
      const risky = ctx.signals.registrarRisky
      if (risky === undefined) return pass('No registrar reputation signal available.')
      if (risky === true) {
        return fail(
          ['Domain registrar is flagged as high-risk.'],
          'The domain uses a registrar with a poor abuse reputation, raising the likelihood of malicious use.'
        )
      }
      return pass('Domain registrar is not flagged.')
    },
  },
  {
    id: 'ip.shared-by-multiple-domains',
    name: 'IP address shared by multiple domains',
    description: 'The IP address has hosted several distinct domains.',
    category: 'OTHER',
    weight: getWeight('OTHER'),
    enabled: true,
    evaluate(ctx: RiskContext): RuleResult {
      const count = ctx.signals.ipDomainCount
      if (count === undefined) return pass('No IP co-hosting signal available.')
      if (count > 1) {
        return fail(
          [`IP address is associated with ${count} domains.`],
          `The IP hosts ${count} domains, which may indicate shared or bulletproof hosting.`
        )
      }
      return pass(`IP address is associated with ${count} domain(s).`)
    },
  },
  {
    id: 'whois.hidden',
    name: 'WHOIS information is hidden',
    description: 'The WHOIS registration data is redacted or protected by a privacy service.',
    category: 'HIDDEN_WHOIS',
    weight: getWeight('HIDDEN_WHOIS'),
    enabled: true,
    evaluate(ctx: RiskContext): RuleResult {
      const hidden = ctx.signals.whoisHidden
      if (hidden === undefined) return pass('No WHOIS privacy signal available.')
      if (hidden === true) {
        return fail(
          ['WHOIS registrant details are redacted or hidden.'],
          'Hidden WHOIS information reduces accountability and is common among suspicious registrations.'
        )
      }
      return pass('WHOIS information is publicly available.')
    },
  },
]

/**
 * Return only the rules that are currently enabled.
 */
export function getEnabledRules(): Rule[] {
  return RISK_RULES.filter((rule) => rule.enabled)
}
