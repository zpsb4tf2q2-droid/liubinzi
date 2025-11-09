import { NextRequest, NextResponse } from "next/server"
import { isAppError, AppError } from "./errors"
import { logError, logInfo } from "./logger"
import { ZodError } from "zod"

type RouteHandler = (
  req: NextRequest,
  context?: { params?: Record<string, string> }
) => Promise<NextResponse | Response>

interface ErrorResponse {
  error: string
  message: string
  details?: any
  statusCode: number
}

export function apiHandler(handler: RouteHandler): RouteHandler {
  return async (req: NextRequest, context?: { params?: Record<string, string> }) => {
    try {
      logInfo("API Request", {
        method: req.method,
        url: req.url,
        params: context?.params,
      })

      const response = await handler(req, context)

      logInfo("API Response", {
        method: req.method,
        url: req.url,
        status: response.status,
      })

      return response
    } catch (error) {
      return handleApiError(error, req)
    }
  }
}

function handleApiError(error: unknown, req: NextRequest): NextResponse<ErrorResponse> {
  if (isAppError(error)) {
    logError(`API Error: ${error.message}`, error, {
      method: req.method,
      url: req.url,
      statusCode: error.statusCode,
      context: error.context,
    })

    return NextResponse.json<ErrorResponse>(
      {
        error: error.name,
        message: error.message,
        details: error.context,
        statusCode: error.statusCode,
      },
      { status: error.statusCode }
    )
  }

  if (error instanceof ZodError) {
    logError("Validation Error", error, {
      method: req.method,
      url: req.url,
      issues: error.issues,
    })

    return NextResponse.json<ErrorResponse>(
      {
        error: "ValidationError",
        message: "Request validation failed",
        details: error.issues,
        statusCode: 400,
      },
      { status: 400 }
    )
  }

  if (error instanceof Error) {
    logError("Unexpected API Error", error, {
      method: req.method,
      url: req.url,
    })

    return NextResponse.json<ErrorResponse>(
      {
        error: "InternalServerError",
        message: process.env.NODE_ENV === "production" 
          ? "An unexpected error occurred" 
          : error.message,
        statusCode: 500,
      },
      { status: 500 }
    )
  }

  logError("Unknown API Error", error, {
    method: req.method,
    url: req.url,
  })

  return NextResponse.json<ErrorResponse>(
    {
      error: "InternalServerError",
      message: "An unexpected error occurred",
      statusCode: 500,
    },
    { status: 500 }
  )
}

export function createSuccessResponse<T = any>(data: T, status: number = 200): NextResponse {
  return NextResponse.json(data, { status })
}

export function createErrorResponse(
  message: string,
  statusCode: number = 500,
  details?: any
): NextResponse<ErrorResponse> {
  return NextResponse.json<ErrorResponse>(
    {
      error: "Error",
      message,
      details,
      statusCode,
    },
    { status: statusCode }
  )
}
