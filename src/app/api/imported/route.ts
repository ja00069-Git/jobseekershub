import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

function detectImportSource(from: string) {
  const lower = from.toLowerCase();

  if (lower.includes("indeed")) return "Indeed";
  if (lower.includes("linkedin")) return "LinkedIn";
  if (lower.includes("workday")) return "Workday";

  return "Email";
}

function extractLocation(subject: string, snippet: string) {
  const text = `${subject}\n${snippet}`;
  const patterns = [
    /\bin\s+([A-Z][A-Za-z .'-]+,\s*[A-Z]{2}(?:\s+\d{5})?)(?=\s+and\s+\d+\s+more\s+new\s+jobs|\s*\(|$)/i,
    /[·-]\s*([A-Z][A-Za-z .'-]+,\s*[A-Z]{2}(?:\s+\d{5})?)(?=\s|$)/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      return match[1].replace(/\s+/g, " ").trim();
    }
  }

  return null;
}

export async function GET() {
  try {
    const data = await prisma.importedEmail.findMany({
      where: { reviewed: false },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      data.map((email) => ({
        ...email,
        location: extractLocation(email.subject, email.snippet),
      })),
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to load imports.",
      },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      id?: string;
      company?: string;
      role?: string;
    };

    if (!body.id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const email = await prisma.importedEmail.findUnique({
      where: { id: body.id },
    });

    if (!email) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = await prisma.importedEmail.update({
      where: { id: body.id },
      data: {
        company: body.company?.trim() || email.company,
        role: body.role?.trim() || email.role,
      },
    });

    const existingApplication = updated.gmailId
      ? await prisma.application.findUnique({
          where: { gmailId: updated.gmailId },
        })
      : null;

    if (!existingApplication) {
      const location = extractLocation(email.subject, email.snippet);
      const companyName = updated.company?.trim() || "Unknown";
      const companyRecord =
        companyName !== "Unknown"
          ? await prisma.company.upsert({
              where: { name: companyName },
              update: {},
              create: { name: companyName },
            })
          : null;

      await prisma.application.create({
        data: {
          company: companyName,
          role: updated.role || "Unknown Role",
          status: updated.status || "applied",
          location: location || undefined,
          source: updated.source || detectImportSource(updated.from),
          dateApplied: new Date(),
          gmailId: updated.gmailId,
          companyId: companyRecord?.id,
          notes: `Imported from Gmail: ${email.subject} (score: ${email.score})`,
        },
      });
    }

    await prisma.importedEmail.update({
      where: { id: body.id },
      data: { reviewed: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to approve import.",
      },
      { status: 500 },
    );
  }
}
