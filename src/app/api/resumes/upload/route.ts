import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

import {
  badRequestResponse,
  handleRouteError,
  unauthorizedResponse,
} from "@/lib/api-error";
import { getCurrentUserRecord } from "@/lib/current-user";
import { enforceRateLimit } from "@/lib/rate-limit";
import { validateTrustedOrigin } from "@/lib/request-security";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const allowedExtensions = new Set(["pdf", "doc", "docx"]);

function sanitizeFileName(value: string) {
  return value
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .toLowerCase();
}

function getFileExtension(name: string) {
  const parts = name.split(".");
  return parts.length > 1 ? parts.at(-1)?.toLowerCase() ?? "" : "";
}

export async function POST(request: Request) {
  const currentUser = await getCurrentUserRecord();

  if (!currentUser) {
    return unauthorizedResponse();
  }

  const originError = validateTrustedOrigin(request);
  if (originError) return originError;

  const rateLimitError = enforceRateLimit({
    key: `resumes:upload:${currentUser.user.id}`,
    limit: 20,
    windowMs: 60_000,
  });
  if (rateLimitError) return rateLimitError;

  try {
    const formData = await request.formData();
    const uploadedFile = formData.get("file");

    if (!(uploadedFile instanceof File)) {
      return badRequestResponse("A file is required.", "missing_file");
    }

    if (uploadedFile.size === 0) {
      return badRequestResponse("File cannot be empty.", "empty_file");
    }

    if (uploadedFile.size > MAX_FILE_SIZE_BYTES) {
      return badRequestResponse("File must be 10MB or smaller.", "file_too_large");
    }

    const extension = getFileExtension(uploadedFile.name);

    if (!allowedExtensions.has(extension)) {
      return badRequestResponse(
        "Only .pdf, .doc, and .docx files are allowed.",
        "invalid_file_type",
      );
    }

    const safeName = sanitizeFileName(uploadedFile.name || "resume.pdf");
    const pathname = `resumes/${currentUser.user.id}/${Date.now()}-${safeName}`;

    const blob = await put(pathname, uploadedFile, {
      access: "private",
      addRandomSuffix: false,
    });

    const fileUrl =
      "downloadUrl" in blob && typeof blob.downloadUrl === "string"
        ? blob.downloadUrl
        : blob.url;

    return NextResponse.json(
      {
        fileUrl,
        fileName: uploadedFile.name,
        pathname: blob.pathname,
      },
      { status: 201 },
    );
  } catch (error) {
    return handleRouteError(error, {
      label: "resumes.upload",
      fallbackMessage: "Failed to upload file.",
      fallbackCode: "resume_upload_failed",
    });
  }
}