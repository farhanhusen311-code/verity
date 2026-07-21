import { ApiResponse, ApiError } from '@/types'

export function successResponse<T>(
  data: T,
  message: string = 'Success'
): ApiResponse<T> {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  }
}

export function errorResponse(
  message: string,
  error?: string
): ApiError {
  return {
    success: false,
    message,
    error,
    timestamp: new Date().toISOString(),
  }
}

export function validationErrorResponse(errors: Record<string, string[]>): ApiError {
  const errorMessages = Object.entries(errors)
    .map(([field, msgs]) => `${field}: ${msgs.join(', ')}`)
    .join('; ')

  return errorResponse('Validation error', errorMessages)
}
