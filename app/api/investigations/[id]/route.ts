import { NextRequest, NextResponse } from 'next/server'
import { investigationService } from '@/services/investigation.service'
import { UpdateInvestigationSchema } from '@/lib/validation'
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/api-response'
import { logger } from '@/lib/logger'
import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params

    logger.info('GET /api/investigations/[id]', { id })

    if (!id) {
      return NextResponse.json(
        errorResponse('Investigation ID is required'),
        { status: 400 }
      )
    }

    const investigation = await investigationService.getInvestigationById(id)

    if (!investigation) {
      logger.warn('Investigation not found', { id })
      return NextResponse.json(
        errorResponse('Investigation not found'),
        { status: 404 }
      )
    }

    logger.info('Investigation retrieved successfully', { id })

    return NextResponse.json(
      successResponse(investigation, 'Investigation retrieved successfully'),
      { status: 200 }
    )
  } catch (error) {
    logger.error('GET /api/investigations/[id] error', error)

    return NextResponse.json(
      errorResponse('Failed to fetch investigation', error instanceof Error ? error.message : 'Unknown error'),
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params
    const body = await request.json()

    logger.info('PATCH /api/investigations/[id]', { id, body })

    if (!id) {
      return NextResponse.json(
        errorResponse('Investigation ID is required'),
        { status: 400 }
      )
    }

    // Validate input
    const validatedData = UpdateInvestigationSchema.parse(body)

    // Check if investigation exists
    const investigation = await investigationService.getInvestigationById(id)
    if (!investigation) {
      logger.warn('Investigation not found', { id })
      return NextResponse.json(
        errorResponse('Investigation not found'),
        { status: 404 }
      )
    }

    // Update investigation
    const updated = await investigationService.updateInvestigation(id, validatedData)

    logger.info('Investigation updated successfully', { id })

    return NextResponse.json(
      successResponse(updated, 'Investigation updated successfully'),
      { status: 200 }
    )
  } catch (error) {
    logger.error('PATCH /api/investigations/[id] error', error)

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

    // Handle Prisma "not found" error
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          errorResponse('Investigation not found'),
          { status: 404 }
        )
      }
    }

    return NextResponse.json(
      errorResponse('Failed to update investigation', error instanceof Error ? error.message : 'Unknown error'),
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params

    logger.info('DELETE /api/investigations/[id]', { id })

    if (!id) {
      return NextResponse.json(
        errorResponse('Investigation ID is required'),
        { status: 400 }
      )
    }

    // Check if investigation exists
    const investigation = await investigationService.getInvestigationById(id)
    if (!investigation) {
      logger.warn('Investigation not found', { id })
      return NextResponse.json(
        errorResponse('Investigation not found'),
        { status: 404 }
      )
    }

    // Delete investigation
    await investigationService.deleteInvestigation(id)

    logger.info('Investigation deleted successfully', { id })

    return NextResponse.json(
      successResponse(null, 'Investigation deleted successfully'),
      { status: 200 }
    )
  } catch (error) {
    logger.error('DELETE /api/investigations/[id] error', error)

    // Handle Prisma "not found" error
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          errorResponse('Investigation not found'),
          { status: 404 }
        )
      }
    }

    return NextResponse.json(
      errorResponse('Failed to delete investigation', error instanceof Error ? error.message : 'Unknown error'),
      { status: 500 }
    )
  }
}
