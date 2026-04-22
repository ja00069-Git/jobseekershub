import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { reportServerError } from "@/lib/server-monitoring";

type ErrorResponseOptions = {
  status: number;
  code: string;
  message: string;
  headers?: HeadersInit;
  requestId?: string;
};

type HandleRouteErrorOptions = {
  label: string;
  fallbackMessage: string;
  fallbackCode?: string;
  fallbackStatus?: number;
};

export class HttpError extends Error {
  status: number;
  code: string;
  headers?: HeadersInit;

  constructor(status: number, code: string, message: string, headers?: HeadersInit) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.code = code;
    this.headers = headers;
  }
}

export function errorResponse({
  status,
  code,
  message,
  headers,
  requestId,
}: ErrorResponseOptions) {
  return NextResponse.json(
    {
      error: message,
      code,
      ...(requestId ? { requestId } : {}),
    },
    { status, headers },
  );
}

export function badRequestResponse(message: string, code = "bad_request") {
  return errorResponse({ status: 400, code, message });
}

export function unauthorizedResponse(message = "Unauthorized.") {
  return errorResponse({ status: 401, code: "unauthorized", message });
}

export function forbiddenResponse(message: string, code = "forbidden") {
  return errorResponse({ status: 403, code, message });
}

export function notFoundResponse(message = "Not found.", code = "not_found") {
  return errorResponse({ status: 404, code, message });
}

export function conflictResponse(message: string, code = "conflict") {
  return errorResponse({ status: 409, code, message });
}

export function serviceUnavailableResponse(
  message: string,
  code = "service_unavailable",
) {
  return errorResponse({ status: 503, code, message });
}

export function rateLimitResponse(message: string, retryAfterSeconds: number) {
  return errorResponse({
    status: 429,
    code: "rate_limited",
    message,
    headers: {
      "Retry-After": String(retryAfterSeconds),
    },
  });
}

export function invalidJsonResponse() {
  return badRequestResponse("Request body must be valid JSON.", "invalid_json");
}

function mapPrismaError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        return conflictResponse("A record with those values already exists.", "unique_conflict");
      case "P2003":
        return conflictResponse("The requested related record is invalid.", "invalid_relation");
      case "P2025":
        return notFoundResponse("The requested record was not found.", "record_not_found");
      default:
        return conflictResponse("Database request failed.", error.code.toLowerCase());
    }
  }

  if (
    error instanceof Prisma.PrismaClientInitializationError ||
    error instanceof Prisma.PrismaClientValidationError
  ) {
    return serviceUnavailableResponse(
      "Database unavailable. Please try again later.",
      "database_unavailable",
    );
  }

  if (error instanceof Error) {
    if (
      error.message.includes("Can't reach database server") ||
      error.message.includes("User was denied access on the database")
    ) {
      return serviceUnavailableResponse(
        "Database unavailable. Please try again later.",
        "database_unavailable",
      );
    }
  }

  return null;
}

export function handleRouteError(
  error: unknown,
  {
    label,
    fallbackMessage,
    fallbackCode = "internal_error",
    fallbackStatus = 500,
  }: HandleRouteErrorOptions,
) {
  if (error instanceof HttpError) {
    return errorResponse({
      status: error.status,
      code: error.code,
      message: error.message,
      headers: error.headers,
    });
  }

  const prismaResponse = mapPrismaError(error);
  if (prismaResponse) {
    reportServerError({ label, error });
    return prismaResponse;
  }

  const requestId = crypto.randomUUID();
  reportServerError({ label, error, requestId });

  return errorResponse({
    status: fallbackStatus,
    code: fallbackCode,
    message: fallbackMessage,
    requestId,
  });
}