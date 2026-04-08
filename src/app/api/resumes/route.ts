import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

export async function GET() {
  try {
    const resumes = await prisma.resume.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(resumes);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to load resumes.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  let payload: { name?: unknown; fileUrl?: unknown };

  try {
    payload = (await request.json()) as { name?: unknown; fileUrl?: unknown };
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  if (!isNonEmptyString(payload.name) || !isNonEmptyString(payload.fileUrl)) {
    return NextResponse.json(
      { error: "name and fileUrl are required." },
      { status: 400 },
    );
  }

  try {
    const resume = await prisma.resume.create({
      data: {
        name: payload.name.trim(),
        fileUrl: payload.fileUrl.trim(),
      },
    });

    return NextResponse.json(resume, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to save resume.",
      },
      { status: 500 },
    );
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
    return NextResponse.json({ error: "id is required." }, { status: 400 });
  }

  try {
    await prisma.resume.delete({
      where: { id: payload.id.trim() },
    });

    await prisma.application.updateMany({
      where: { resumeId: payload.id.trim() },
      data: { resumeId: null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete resume.",
      },
      { status: 500 },
    );
  }
}