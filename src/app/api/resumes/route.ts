import { del } from "@vercel/blob";
import { NextResponse } from "next/server";

import { getCurrentUserRecord } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit } from "@/lib/rate-limit";
import { validateTrustedOrigin } from "@/lib/request-security";

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const parseSafeHttpUrl = (value: unknown) => {
  if (!isNonEmptyString(value)) {
    return null;
  }

  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
};

const parseOptionalString = (value: unknown) => {
  if (!isNonEmptyString(value)) {
    return null;
  }

  return value.trim();
};

function getBlobPathnameFromUrl(value: string) {
  if (!value.includes(".blob.vercel-storage.com/")) {
    return null;
  }

  try {
    const url = new URL(value);
    const pathname = url.pathname.replace(/^\//, "").trim();
    return pathname ? decodeURIComponent(pathname) : null;
  } catch {
    return null;
  }
}

export async function GET() {
  const currentUser = await getCurrentUserRecord();

  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const resumes = await prisma.resume.findMany({
      where: { ownerId: currentUser.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(resumes);
  } catch {
    return NextResponse.json(
      {
        error: "Failed to load resumes.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const currentUser = await getCurrentUserRecord();

  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const originError = validateTrustedOrigin(request);
  if (originError) return originError;

  const rateLimitError = enforceRateLimit({
    key: `resumes:create:${currentUser.user.id}`,
    limit: 20,
    windowMs: 60_000,
  });
  if (rateLimitError) return rateLimitError;

  let payload: { name?: unknown; fileUrl?: unknown; blobPathname?: unknown };

  try {
    payload = (await request.json()) as {
      name?: unknown;
      fileUrl?: unknown;
      blobPathname?: unknown;
    };
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const fileUrl = parseSafeHttpUrl(payload.fileUrl);

  if (!isNonEmptyString(payload.name) || !fileUrl) {
    return NextResponse.json(
      { error: "name and a valid http/https fileUrl are required." },
      { status: 400 },
    );
  }

  try {
    const resume = await prisma.resume.create({
      data: {
        name: payload.name.trim(),
        fileUrl,
        blobPathname: parseOptionalString(payload.blobPathname),
        ownerId: currentUser.user.id,
      },
    });

    return NextResponse.json(resume, { status: 201 });
  } catch {
    return NextResponse.json(
      {
        error: "Failed to save resume.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const currentUser = await getCurrentUserRecord();

  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const originError = validateTrustedOrigin(request);
  if (originError) return originError;

  const rateLimitError = enforceRateLimit({
    key: `resumes:delete:${currentUser.user.id}`,
    limit: 20,
    windowMs: 60_000,
  });
  if (rateLimitError) return rateLimitError;

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
    const targetId = payload.id.trim();

    const resume = await prisma.resume.findFirst({
      where: {
        id: targetId,
        ownerId: currentUser.user.id,
      },
      select: {
        id: true,
        blobPathname: true,
        fileUrl: true,
      },
    });

    if (!resume) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    const blobPathname = resume.blobPathname || getBlobPathnameFromUrl(resume.fileUrl);

    if (blobPathname) {
      await del(blobPathname);
    }

    const deleted = await prisma.$transaction(async (tx) => {
      await tx.application.updateMany({
        where: {
          resumeId: targetId,
          ownerId: currentUser.user.id,
        },
        data: { resumeId: null },
      });

      return tx.resume.deleteMany({
        where: {
          id: targetId,
          ownerId: currentUser.user.id,
        },
      });
    });

    if (deleted.count === 0) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      {
        error: "Failed to delete resume.",
      },
      { status: 500 },
    );
  }
}