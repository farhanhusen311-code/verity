import { NextRequest, NextResponse } from 'next/server'
import { investigationService } from '@/services/investigation.service'
import { CreateInvestigationSchema } from '@/lib/validation'
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/api-response'
import { logger } from '@/lib/logger'
import { ZodError } from 'zod'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    logger.info('POST /api/investigations', { body })

    // Validate input
    const validatedData = CreateInvestigationSchema.parse(body)

    // Create investigation
    const investigation = await investigationService.createInvestigation(validatedData)

    logger.info('Investigation created successfully', { id: investigation.id })

    return NextResponse.json(
      successResponse(investigation, 'Investigation created successfully'),
      { status: 201 }
    )
  } catch (error) {
    logger.error('POST /api/investigations error', error)

    if (error instanceof ZodError) {
      const fieldErrors = error.flatten().fieldErrors as Record<string, string[]>
      return NextResponse.json(
        validationErrorResponse(fieldErrors),
        { status: 400 }
      )
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        errorResponse('Invalid JSON in request body'),
        { status: 400 }
      )
    }

    return NextResponse.json(
      errorResponse('Failed to create investigation', error instanceof Error ? error.message : 'Unknown error'),
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)

    logger.info('GET /api/investigations', { page, limit })

    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        errorResponse('Invalid pagination parameters'),
        { status: 400 }
      )
    }

    const result = await investigationService.getInvestigations(page, limit)

    logger.info('Investigations fetched successfully', { total: result.total })

    return NextResponse.json(
      successResponse(result, 'Investigations retrieved successfully'),
      { status: 200 }
    )
  } catch (error) {
    logger.error('GET /api/investigations error', error)

    return NextResponse.json(
      errorResponse('Failed to fetch investigations', error instanceof Error ? error.message : 'Unknown error'),
      { status: 500 }
    )
  }
}
