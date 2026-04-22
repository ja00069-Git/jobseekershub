import { NextResponse } from "next/server";

import { normalizeApplicationStatus } from "@/lib/application-status";
import { getCurrentUserRecord } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit } from "@/lib/rate-limit";
import { validateTrustedOrigin } from "@/lib/request-security";

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

function detectImportSource(from: string) {
  const lower = from.toLowerCase();

  if (lower.includes("indeed")) return "Indeed";
  if (lower.includes("linkedin")) return "LinkedIn";
  if (lower.includes("workday")) return "Workday";

  return "Email";
}

export async function GET() {
  const currentUser = await getCurrentUserRecord();

  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const data = await prisma.importedEmail.findMany({
      where: {
        reviewed: false,
        ownerId: currentUser.user.id,
      },
      orderBy: { createdAt: "desc" },
    });

    const normalizedData = data.map((email) => ({
      ...email,
      status: normalizeApplicationStatus(email.status) ?? null,
    }));

    return NextResponse.json(normalizedData);
  } catch {
    return NextResponse.json(
      {
        error: "Failed to load imports.",
      },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  const currentUser = await getCurrentUserRecord();

  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const originError = validateTrustedOrigin(req);
  if (originError) return originError;

  const rateLimitError = enforceRateLimit({
    key: `imports:approve:${currentUser.user.id}`,
    limit: 60,
    windowMs: 60_000,
  });
  if (rateLimitError) return rateLimitError;

  try {
    const body = (await req.json()) as {
      id?: string;
      company?: string;
      role?: string;
      status?: string;
    };

    if (!isNonEmptyString(body.id)) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const trimmedId = body.id.trim();

    if (body.company !== undefined && !isNonEmptyString(body.company)) {
      return NextResponse.json({ error: "Company is required." }, { status: 400 });
    }

    if (body.role !== undefined && !isNonEmptyString(body.role)) {
      return NextResponse.json({ error: "Role is required." }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      const email = await tx.importedEmail.findFirst({
        where: {
          id: trimmedId,
          ownerId: currentUser.user.id,
        },
      });

      if (!email) {
        throw new Error("NOT_FOUND");
      }

      const nextStatus =
        normalizeApplicationStatus(body.status) ??
        normalizeApplicationStatus(email.status) ??
        "applied";

      const updated = await tx.importedEmail.update({
        where: { id: trimmedId },
        data: {
          company: body.company?.trim() || email.company,
          role: body.role?.trim() || email.role,
          status: nextStatus,
          reviewed: true,
        },
      });

      const existingApplication = updated.gmailId
        ? await tx.application.findFirst({
            where: {
              ownerId: currentUser.user.id,
              gmailId: updated.gmailId,
            },
          })
        : null;

      if (existingApplication) {
        return;
      }

      const companyName = updated.company?.trim() || "Unknown";
      const companyRecord =
        companyName !== "Unknown"
          ? await tx.company.upsert({
              where: {
                ownerId_name: {
                  ownerId: currentUser.user.id,
                  name: companyName,
                },
              },
              update: {},
              create: {
                name: companyName,
                ownerId: currentUser.user.id,
              },
            })
          : null;

      await tx.application.create({
        data: {
          company: companyName,
          role: updated.role || "Unknown Role",
          status: nextStatus,
          source: updated.source || detectImportSource(updated.from),
          dateApplied: updated.appliedAt ?? updated.createdAt,
          gmailId: updated.gmailId,
          ownerId: currentUser.user.id,
          companyId: companyRecord?.id,
          notes: `Imported from Gmail: ${email.subject} (score: ${email.score})`,
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        error: "Failed to approve import.",
      },
      { status: 500 },
    );
  }
}
