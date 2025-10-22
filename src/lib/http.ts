import { NextResponse } from "next/server";
import type { ZodError } from "zod";

type ErrorResponse = {
  error: string;
  details?: Record<string, string[]>;
};

function normalizeDetails(error: ZodError): Record<string, string[]> {
  const { fieldErrors, formErrors } = error.flatten();
  const details: Record<string, string[]> = {};

  for (const [field, errors] of Object.entries(fieldErrors)) {
    if (errors && errors.length > 0) {
      details[field] = errors.filter((value): value is string => Boolean(value));
    }
  }

  if (formErrors.length > 0) {
    details._root = formErrors;
  }

  return details;
}

export function unauthorized(message = "Unauthorized") {
  return NextResponse.json<ErrorResponse>({ error: message }, { status: 401 });
}

export function forbidden(message = "Forbidden") {
  return NextResponse.json<ErrorResponse>({ error: message }, { status: 403 });
}

export function notFound(message = "Resource not found") {
  return NextResponse.json<ErrorResponse>({ error: message }, { status: 404 });
}

export function badRequest(message: string, details?: Record<string, string[]>) {
  return NextResponse.json<ErrorResponse>(
    details ? { error: message, details } : { error: message },
    { status: 400 }
  );
}

export function validationError(error: ZodError, message = "Validation failed") {
  return badRequest(message, normalizeDetails(error));
}

export function json<T>(payload: T, init?: ResponseInit) {
  return NextResponse.json(payload, init);
}
