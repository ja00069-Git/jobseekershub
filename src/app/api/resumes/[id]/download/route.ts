import { get } from "@vercel/blob";
import { NextResponse } from "next/server";

import {
  badRequestResponse,
  handleRouteError,
  notFoundResponse,
  unauthorizedResponse,
} from "@/lib/api-error";
import { getCurrentUserRecord } from "@/lib/current-user";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function isBlobUrl(value: string) {
  return value.includes(".blob.vercel-storage.com/");
}

function isPrivateBlobUrl(value: string) {
  return value.includes(".private.blob.vercel-storage.com/");
}

export async function GET(_request: Request, context: RouteContext) {
  const currentUser = await getCurrentUserRecord();

  if (!currentUser) {
    return unauthorizedResponse();
  }

  const { id } = await context.params;

  if (!id?.trim()) {
    return badRequestResponse("id is required.", "missing_id");
  }

  const { prisma } = await import("@/lib/prisma");

  const resume = await prisma.resume.findFirst({
    where: {
      id: id.trim(),
      ownerId: currentUser.user.id,
    },
    select: {
      fileUrl: true,
      name: true,
    },
  });

  if (!resume) {
    return notFoundResponse();
  }

  if (!isBlobUrl(resume.fileUrl)) {
    return NextResponse.redirect(resume.fileUrl);
  }

  try {
    const result = await get(resume.fileUrl, {
      access: isPrivateBlobUrl(resume.fileUrl) ? "private" : "public",
    });

    if (!result || result.statusCode !== 200 || !result.stream) {
      return notFoundResponse("File not found.", "file_not_found");
    }

    return new Response(result.stream, {
      status: 200,
      headers: {
        "Content-Type": result.blob.contentType || "application/octet-stream",
        "Content-Disposition": result.blob.contentDisposition || "attachment",
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    return handleRouteError(error, {
      label: "resumes.download",
      fallbackMessage: "Failed to load file.",
      fallbackCode: "resume_download_failed",
    });
  }
}
