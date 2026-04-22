import { del } from "@vercel/blob";
import { NextResponse } from "next/server";

import {
  badRequestResponse,
  handleRouteError,
  notFoundResponse,
  unauthorizedResponse,
} from "@/lib/api-error";
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
    return unauthorizedResponse();
  }

  try {
    const resumes = await prisma.resume.findMany({
      where: { ownerId: currentUser.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(resumes);
  } catch (error) {
    return handleRouteError(error, {
      label: "resumes.list",
      fallbackMessage: "Failed to load resumes.",
      fallbackCode: "resumes_load_failed",
    });
  }
}

export async function POST(request: Request) {
  const currentUser = await getCurrentUserRecord();

  if (!currentUser) {
    return unauthorizedResponse();
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
    return badRequestResponse("Request body must be valid JSON.", "invalid_json");
  }

  const fileUrl = parseSafeHttpUrl(payload.fileUrl);

  if (!isNonEmptyString(payload.name) || !fileUrl) {
    return badRequestResponse(
      "name and a valid http/https fileUrl are required.",
      "invalid_resume_payload",
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
  } catch (error) {
    return handleRouteError(error, {
      label: "resumes.create",
      fallbackMessage: "Failed to save resume.",
      fallbackCode: "resume_create_failed",
    });
  }
}

export async function DELETE(request: Request) {
  const currentUser = await getCurrentUserRecord();

  if (!currentUser) {
    return unauthorizedResponse();
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
    return badRequestResponse("Request body must be valid JSON.", "invalid_json");
  }

  if (!isNonEmptyString(payload.id)) {
    return badRequestResponse("id is required.", "missing_id");
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
      return notFoundResponse();
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
      return notFoundResponse();
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleRouteError(error, {
      label: "resumes.delete",
      fallbackMessage: "Failed to delete resume.",
      fallbackCode: "resume_delete_failed",
    });
  }
}