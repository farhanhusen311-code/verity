import { NextRequest, NextResponse } from 'next/server'
import { investigationService } from '@/services/investigation.service'
import { getApiResponse, getApiError } from '@/lib/api-response'
import { logger } from '@/lib/logger'
import { z } from 'zod'

// Validation schema
const TriggerSchema = z.object({
  investigationId: z.string().min(1, 'Investigation ID is required'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validation = TriggerSchema.safeParse(body)
    if (!validation.success) {
      logger.warn('Validation failed for trigger request', { errors: validation.error.errors })
      return NextResponse.json(
        getApiError(400, 'Invalid request data', validation.error.errors),
        { status: 400 }
      )
    }

    const { investigationId } = validation.data

    logger.info('Triggering investigation execution', { investigationId })

    // Trigger investigation
    const result = await investigationService.triggerInvestigation(investigationId)

    logger.info('Investigation triggered successfully', { investigationId })

    return NextResponse.json(
      getApiResponse(result, 'Investigation triggered successfully'),
      { status: 200 }
    )
  } catch (error) {
    logger.error('Error triggering investigation', error)

    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        getApiError(404, 'Investigation not found'),
        { status: 404 }
      )
    }

    return NextResponse.json(
      getApiError(500, 'Internal server error'),
      { status: 500 }
    )
  }
}
