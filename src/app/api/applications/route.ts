import { Prisma } from "@/generated/prisma";
import { NextResponse } from "next/server";

import {
  APPLICATION_STATUS_OPTIONS,
  normalizeApplicationStatus,
} from "@/lib/application-status";
import { prisma } from "@/lib/prisma";

const handlePrismaError = (error: unknown) => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // P2002 = unique constraint, P2025 = record not found, etc.
    console.error("[prisma] known error", error.code, error.message);
    return NextResponse.json(
      { error: "Database request failed.", code: error.code },
      { status: 409 },
    );
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    console.error("[prisma] initialization error", error.message);
    return NextResponse.json(
      { error: "Database unavailable. Please try again later." },
      { status: 503 },
    );
  }

  console.error("[prisma] unexpected error", error);
  return NextResponse.json(
    { error: "An unexpected error occurred." },
    { status: 500 },
  );
};

type CreateApplicationPayload = {
  company?: unknown;
  role?: unknown;
  status?: unknown;
  location?: unknown;
  source?: unknown;
  salary?: unknown;
  jobUrl?: unknown;
  dateApplied?: unknown;
  notes?: unknown;
  resumeId?: unknown;
};

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const parseOptionalString = (value: unknown) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
};

const parseOptionalSalary = (value: unknown) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (typeof value === "number" && Number.isInteger(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsedValue = Number.parseInt(value, 10);

    if (Number.isInteger(parsedValue)) {
      return parsedValue;
    }
  }

  return Number.NaN;
};

const parseDateApplied = (value: unknown) => {
  if (!isNonEmptyString(value)) {
    return null;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
};

export async function GET() {
  try {
    const applications = await prisma.application.findMany({
      orderBy: [{ dateApplied: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(applications);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function POST(request: Request) {
  let payload: CreateApplicationPayload;

  try {
    payload = (await request.json()) as CreateApplicationPayload;
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  if (
    !isNonEmptyString(payload.company) ||
    !isNonEmptyString(payload.role) ||
    !isNonEmptyString(payload.status)
  ) {
    return NextResponse.json(
      { error: "company, role, and status are required." },
      { status: 400 },
    );
  }

  const normalizedStatus = normalizeApplicationStatus(payload.status);

  if (!normalizedStatus) {
    return NextResponse.json(
      {
        error: `status must be one of: ${APPLICATION_STATUS_OPTIONS.map((option) => option.label).join(", ")}.`,
      },
      { status: 400 },
    );
  }

  const dateApplied = parseDateApplied(payload.dateApplied);

  if (!dateApplied) {
    return NextResponse.json(
      { error: "dateApplied must be a valid date string." },
      { status: 400 },
    );
  }

  const salary = parseOptionalSalary(payload.salary);

  if (Number.isNaN(salary)) {
    return NextResponse.json(
      { error: "salary must be an integer when provided." },
      { status: 400 },
    );
  }

  try {
    const companyName = payload.company.trim();
    const companyRecord = await prisma.company.upsert({
      where: { name: companyName },
      update: {},
      create: { name: companyName },
    });

    const application = await prisma.application.create({
      data: {
        company: companyName,
        role: payload.role.trim(),
        status: normalizedStatus,
        location: parseOptionalString(payload.location),
        source: parseOptionalString(payload.source),
        salary,
        jobUrl: parseOptionalString(payload.jobUrl),
        dateApplied,
        notes: parseOptionalString(payload.notes),
        companyId: companyRecord.id,
        resumeId: parseOptionalString(payload.resumeId),
      },
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function PATCH(request: Request) {
  let payload: { id?: unknown; status?: unknown };

  try {
    payload = (await request.json()) as { id?: unknown; status?: unknown };
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  if (!isNonEmptyString(payload.id) || !isNonEmptyString(payload.status)) {
    return NextResponse.json(
      { error: "id and status are required." },
      { status: 400 },
    );
  }

  const normalizedStatus = normalizeApplicationStatus(payload.status);

  if (!normalizedStatus) {
    return NextResponse.json(
      {
        error: `status must be one of: ${APPLICATION_STATUS_OPTIONS.map((option) => option.label).join(", ")}.`,
      },
      { status: 400 },
    );
  }

  try {
    const updated = await prisma.application.update({
      where: { id: payload.id.trim() },
      data: {
        status: normalizedStatus,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function DELETE(request: Request) {
  let payload: { id?: unknown };

  try {
    payload = (await request.json()) as { id?: unknown };
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  if (!isNonEmptyString(payload.id)) {
    return NextResponse.json(
      { error: "id is required." },
      { status: 400 },
    );
  }

  try {
    await prisma.application.delete({
      where: { id: payload.id.trim() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handlePrismaError(error);
  }
}