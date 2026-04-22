import { NextResponse } from "next/server";

import {
  handleRouteError,
  notFoundResponse,
  unauthorizedResponse,
} from "@/lib/api-error";
import { getCurrentUserRecord } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit } from "@/lib/rate-limit";
import { validateTrustedOrigin } from "@/lib/request-security";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  void req;

  const currentUser = await getCurrentUserRecord();

  if (!currentUser) {
    return unauthorizedResponse();
  }

  const originError = validateTrustedOrigin(req);
  if (originError) return originError;

  const rateLimitError = enforceRateLimit({
    key: `imports:delete:${currentUser.user.id}`,
    limit: 60,
    windowMs: 60_000,
  });
  if (rateLimitError) return rateLimitError;

  const { id } = await params;

  try {
    const deleted = await prisma.importedEmail.deleteMany({
      where: {
        id,
        ownerId: currentUser.user.id,
      },
    });

    if (deleted.count === 0) {
      return notFoundResponse();
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleRouteError(error, {
      label: "imports.delete",
      fallbackMessage: "Failed to delete import.",
      fallbackCode: "import_delete_failed",
    });
  }
}
