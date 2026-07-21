import { NextRequest, NextResponse } from 'next/server'
import { investigationService } from '@/services/investigation.service'
import { getApiResponse, getApiError } from '@/lib/api-response'
import { logger } from '@/lib/logger'
import { z } from 'zod'

// Validation schema
const QuerySchema = z.object({
  investigationId: z.string().min(1, 'Investigation ID is required'),
})

export async function GET(request: NextRequest) {
  try {
    // Get query parameter
    const searchParams = request.nextUrl.searchParams
    const investigationId = searchParams.get('investigationId')

    // Validate input
    const validation = QuerySchema.safeParse({ investigationId })
    if (!validation.success) {
      logger.warn('Validation failed for results request', { errors: validation.error.errors })
      return NextResponse.json(
        getApiError(400, 'Invalid request data', validation.error.errors),
        { status: 400 }
      )
    }

    const { investigationId: id } = validation.data

    logger.info('Fetching investigation results', { investigationId: id })

    // Get results
    const results = await investigationService.getInvestigationResults(id)

    logger.info('Investigation results fetched successfully', {
      investigationId: id,
      resultCount: results.results?.length || 0,
    })

    return NextResponse.json(
      getApiResponse(results, 'Investigation results retrieved successfully'),
      { status: 200 }
    )
  } catch (error) {
    logger.error('Error fetching investigation results', error)

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
