import { NextResponse } from 'next/server'

export function successResponse<T>(data: T, status: number = 200) {
  return NextResponse.json(data, { status })
}

export function errorResponse(message: string, status: number = 500, details?: unknown) {
  const body: { error: string; details?: unknown } = { error: message }
  if (details) {
    body.details = details
  }
  return NextResponse.json(body, { status })
}

export function validationErrorResponse(errors: unknown) {
  return errorResponse('Validation failed', 400, errors)
}

export function unauthorizedResponse(message: string = 'Unauthorized') {
  return errorResponse(message, 401)
}

export function notFoundResponse(message: string = 'Not found') {
  return errorResponse(message, 404)
}
