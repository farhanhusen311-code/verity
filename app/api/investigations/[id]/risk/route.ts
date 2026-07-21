import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { logger } from '@/lib/logger'
import { successResponse, errorResponse } from '@/lib/api-response'
import { getRiskEngine } from '@/services/risk/engine'

const paramsSchema = z.object({
  id: z.string().min(1),
})

/**
 * GET /api/investigations/{id}/risk
 *
 * Returns the latest risk assessment for an investigation. If no assessment
 * exists yet, one is computed on demand.
 *
 * Query params:
 *   ?recompute=true  -> force a fresh evaluation instead of the cached one.
 *
 * Response data:
 *   { score, level, method, summary, reasoning, rules, recommendations }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const { id } = paramsSchema.parse(resolvedParams)

    const recompute = request.nextUrl.searchParams.get('recompute') === 'true'

    logger.info('GET /api/investigations/[id]/risk', { id, recompute })

    const engine = getRiskEngine()
    const result = recompute
      ? await engine.assess(id)
      : await engine.getLatestAssessment(id)

    if (!result) {
      logger.warn('Risk assessment: investigation not found', { id })
      return NextResponse.json(
        errorResponse('Investigation not found'),
        { status: 404 }
      )
    }

    logger.info('Risk assessment retrieved', { id, score: result.score, level: result.level })

    return NextResponse.json(
      successResponse(
        {
          score: result.score,
          level: result.level,
          method: result.method,
          summary: result.summary,
          reasoning: result.reasoning,
          rules: result.rules,
          recommendations: result.recommendations,
        },
        'Risk assessment retrieved successfully'
      ),
      { status: 200 }
    )
  } catch (error) {
    logger.error('GET /api/investigations/[id]/risk error', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        errorResponse('Invalid investigation ID', JSON.stringify(error.errors)),
        { status: 400 }
      )
    }

    return NextResponse.json(
      errorResponse('Failed to compute risk assessment', error instanceof Error ? error.message : 'Unknown error'),
      { status: 500 }
    )
  }
}
