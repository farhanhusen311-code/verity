// ==================== Risk Scoring Engine ====================
//
// The public entry point for risk scoring. It orchestrates:
//   fetch data -> build context -> run scoring strategy -> persist -> return.
//
// The scoring strategy is injected via the `IRiskScorer` interface. Today it
// defaults to the rule-based `RuleBasedScorer`. To adopt an ML model in the
// future, implement `IRiskScorer` and pass it to the constructor (or call
// `setScorer`) — nothing else in the app (API, DB, UI) needs to change.

import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import {
  IRiskScorer,
  RiskContext,
  RiskResultInput,
  RiskScoreResult,
  RiskLog,
} from './types'
import { ruleBasedScorer, buildSignals } from './calculator'

export class RiskEngine {
  private scorer: IRiskScorer

  constructor(scorer: IRiskScorer = ruleBasedScorer) {
    this.scorer = scorer
  }

  /**
   * Swap the scoring strategy at runtime (e.g. rule-based -> ML model).
   */
  setScorer(scorer: IRiskScorer): void {
    this.scorer = scorer
  }

  /**
   * Compute the risk assessment for an investigation, persist it, and return
   * the full result.
   */
  async assess(investigationId: string): Promise<RiskScoreResult> {
    const logs: RiskLog[] = []
    try {
      this.log(logs, 'INFO', 'Risk assessment started', { investigationId, method: this.scorer.method })

      const investigation = await prisma.investigation.findUnique({
        where: { id: investigationId },
      })

      if (!investigation) {
        throw new Error(`Investigation with ID ${investigationId} not found`)
      }

      const dbResults = await prisma.investigationResult.findMany({
        where: { investigationId },
        orderBy: { createdAt: 'desc' },
      })

      const results: RiskResultInput[] = dbResults.map((r) => ({
        source: r.source,
        category: r.category,
        title: r.title,
        description: r.description,
        url: r.url,
        confidence: r.confidence,
      }))

      const signals = buildSignals({
        investigation: {
          id: investigation.id,
          email: investigation.email,
          username: investigation.username,
          domain: investigation.domain,
          website: investigation.website,
          ip: investigation.ip,
        },
        results,
      })

      const context: RiskContext = {
        investigationId,
        investigation: {
          id: investigation.id,
          email: investigation.email,
          username: investigation.username,
          domain: investigation.domain,
          website: investigation.website,
          ip: investigation.ip,
        },
        results,
        signals,
        logs,
      }

      this.log(logs, 'INFO', 'Rule evaluation started', { resultCount: results.length })
      const result = await this.scorer.score(context)

      // Per-rule execution logging.
      for (const rule of result.rules) {
        this.log(logs, 'DEBUG', 'Rule Executed', { ruleId: rule.ruleId, category: rule.category })
        if (rule.triggered) {
          this.log(logs, 'INFO', 'Rule Failed', { ruleId: rule.ruleId, score: rule.score })
        } else {
          this.log(logs, 'DEBUG', 'Rule Passed', { ruleId: rule.ruleId })
        }
      }

      this.log(logs, 'INFO', 'Risk Calculated', {
        investigationId,
        score: result.score,
        level: result.level,
        method: result.method,
      })

      await this.persist(investigationId, result)

      // Keep the Investigation.risk column in sync with the latest assessment.
      await prisma.investigation.update({
        where: { id: investigationId },
        data: { risk: result.level },
      })

      this.log(logs, 'INFO', 'Risk assessment completed', { investigationId })
      return result
    } catch (error) {
      logger.error('Error during risk assessment', { investigationId, error })
      throw error
    }
  }

  /**
   * Persist the assessment plus its rule evaluations and recommendations.
   */
  private async persist(investigationId: string, result: RiskScoreResult): Promise<void> {
    await prisma.riskAssessment.create({
      data: {
        investigationId,
        score: result.score,
        level: result.level as any,
        method: result.method as any,
        summary: result.summary,
        reasoning: result.reasoning,
        ruleEvaluations: {
          create: result.rules.map((rule) => ({
            ruleId: rule.ruleId,
            name: rule.name,
            description: rule.description,
            category: rule.category,
            weight: rule.weight,
            triggered: rule.triggered,
            score: rule.score,
            evidence: JSON.stringify(rule.evidence),
            reasoning: rule.reasoning,
          })),
        },
        recommendations: {
          create: result.recommendations.map((rec) => ({
            code: rec.code,
            title: rec.title,
            description: rec.description,
            priority: rec.priority as any,
          })),
        },
      },
    })

    logger.info('Risk assessment persisted', { investigationId, score: result.score, level: result.level })
  }

  /**
   * Fetch the latest persisted assessment for an investigation. If none
   * exists yet, it computes one on demand.
   */
  async getLatestAssessment(investigationId: string): Promise<RiskScoreResult | null> {
    const investigation = await prisma.investigation.findUnique({
      where: { id: investigationId },
    })
    if (!investigation) {
      return null
    }

    const latest = await prisma.riskAssessment.findFirst({
      where: { investigationId },
      orderBy: { createdAt: 'desc' },
      include: {
        ruleEvaluations: true,
        recommendations: { orderBy: { createdAt: 'asc' } },
      },
    })

    if (!latest) {
      // No assessment stored yet — compute (and persist) one now.
      return this.assess(investigationId)
    }

    return {
      score: latest.score,
      level: latest.level as any,
      method: latest.method as any,
      summary: latest.summary ?? '',
      reasoning: latest.reasoning ?? '',
      rules: latest.ruleEvaluations.map((r) => ({
        ruleId: r.ruleId,
        name: r.name,
        description: r.description ?? '',
        category: r.category as any,
        weight: r.weight,
        triggered: r.triggered,
        score: r.score,
        evidence: r.evidence ? safeParseArray(r.evidence) : [],
        reasoning: r.reasoning ?? '',
      })),
      recommendations: latest.recommendations.map((rec) => ({
        code: rec.code,
        title: rec.title,
        description: rec.description ?? '',
        priority: rec.priority as any,
      })),
    }
  }

  private log(logs: RiskLog[], level: RiskLog['level'], message: string, data?: Record<string, any>): void {
    const entry: RiskLog = { timestamp: new Date().toISOString(), level, message, data }
    logs.push(entry)

    switch (level) {
      case 'ERROR':
        logger.error(message, data)
        break
      case 'WARN':
        logger.warn(message, data)
        break
      case 'DEBUG':
        logger.debug(message, data)
        break
      default:
        logger.info(message, data)
    }
  }
}

function safeParseArray(value: string): string[] {
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

let instance: RiskEngine | null = null

export function getRiskEngine(): RiskEngine {
  if (!instance) {
    instance = new RiskEngine()
  }
  return instance
}
