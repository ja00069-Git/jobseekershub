import { NextResponse } from "next/server";

import type { Status } from "@/generated/prisma";
import { getCurrentUserRecord } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit } from "@/lib/rate-limit";
import { validateTrustedOrigin } from "@/lib/request-security";

type GmailHeader = {
  name?: string;
  value?: string;
};

type GmailMessage = {
  id?: string;
  snippet?: string;
  payload?: {
    headers?: GmailHeader[];
  };
};

type GmailListResponse = {
  messages?: Array<{ id: string }>;
};

/**
 * HELPERS
 */
function extractHeader(headers: GmailHeader[], name: string) {
  return headers.find((h) => h.name === name)?.value || "";
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function toTitleCase(value: string) {
  return value
    .split(/\s+/)
    .map((word) =>
      word === word.toUpperCase() && word.length > 1
        ? word
        : capitalize(word.toLowerCase())
    )
    .join(" ");
}

/**
 * PROVIDER DETECTION
 */
function detectSource(from: string) {
  const lower = from.toLowerCase();

  if (lower.includes("indeed")) return "indeed";
  if (lower.includes("linkedin")) return "linkedin";
  if (lower.includes("workday")) return "workday";

  return "unknown";
}

/**
 * FILTER — REMOVE JOB ALERTS
 */
function isJobAlert(subject: string, snippet: string) {
  const text = `${subject} ${snippet}`.toLowerCase();

  return (
    text.includes("is hiring") ||
    text.includes("job alert") ||
    text.includes("new jobs") ||
    text.includes("recommended jobs") ||
    text.includes("more jobs") ||
    /\b\d+\s+(new|more)\s+jobs\b/.test(text)
  );
}

/**
 * DETECT REAL APPLICATIONS (GENERIC)
 */
function isRealApplicationEmail(subject: string, snippet: string) {
  const text = `${subject} ${snippet}`.toLowerCase();

  return (
    subject.toLowerCase().startsWith("indeed application:") ||
    text.includes("application submitted") ||
    text.includes("your application was sent") ||
    text.includes("thank you for applying") ||
    text.includes("application received")
  );
}

/**
 * PROVIDER PARSERS
 */
function parseIndeedEmail(subject: string, snippet: string) {
  const roleMatch = subject.match(/^Indeed Application:\s*(.+)/i);

  const role = roleMatch
    ? toTitleCase(roleMatch[1])
    : "Unknown Role";

  const companyMatch = snippet.match(
    /sent to\s+([A-Z][A-Za-z0-9&.,'\- ]+?)\./i
  );

  return {
    role,
    company: companyMatch?.[1] || "Unknown",
  };
}

function parseLinkedInEmail(subject: string, snippet: string) {
  const text = `${subject}\n${snippet}`;

  const companyMatch = text.match(/sent to\s+([A-Z][A-Za-z0-9&.,'\- ]+)/i);

  const roleMatch = text.match(
    /\n([A-Z][A-Za-z0-9/&+\- ]*(Engineer|Developer|Intern|Manager|Associate))\n/
  );

  return {
    company: companyMatch?.[1] || "Unknown",
    role: roleMatch?.[1] || "Unknown Role",
  };
}

function parseWorkdayEmail(subject: string) {
  const roleMatch = subject.match(/applying for (.+?) at/i);
  const companyMatch = subject.match(/at\s+([A-Z][A-Za-z0-9& ]+)/);

  return {
    role: roleMatch ? toTitleCase(roleMatch[1]) : "Unknown Role",
    company: companyMatch ? companyMatch[1].trim() : "Unknown",
  };
}

/**
 * GENERIC FALLBACK PARSING
 */
function extractRole(subject: string, snippet: string) {
  const text = `${subject}\n${snippet}`;

  // generic role patterns
  const match = text.match(
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,5})\b/
  );

  return match?.[1] || "Unknown Role";
}

function extractCompany(from: string, subject: string) {
  // try subject first
  const subjectMatch = subject.match(/at\s+([A-Z][A-Za-z0-9& ]+)/);
  if (subjectMatch?.[1]) {
    return subjectMatch[1].trim();
  }

  // fallback: domain
  const match = from.match(/@([a-zA-Z0-9-]+)\.com/i);

  if (match) {
    return toTitleCase(match[1].replace(/[-_]+/g, " "));
  }

  return "Unknown";
}

function calculateAccuracyScore({
  source,
  subject,
  snippet,
  company,
  role,
}: {
  source: string;
  subject: string;
  snippet: string;
  company: string;
  role: string;
}) {
  const text = `${subject} ${snippet}`.toLowerCase();

  let score = 30;

  if (source !== "unknown") score += 20;

  if (
    text.includes("application submitted") ||
    text.includes("your application was sent") ||
    text.includes("thank you for applying") ||
    text.includes("application received")
  ) {
    score += 20;
  }

  if (subject.toLowerCase().startsWith("indeed application:")) {
    score += 10;
  }

  if (company !== "Unknown") score += 10;
  if (role !== "Unknown Role") score += 10;

  return Math.min(score, 100);
}

/**
 * STATUS
 */
function detectStatus(text: string): Status {
  if (text.includes("rejected") || text.includes("not moving forward"))
    return "rejected";

  if (text.includes("offer")) return "offer";

  if (text.includes("interview") || text.includes("phone screen"))
    return "interview";

  return "applied";
}

/**
 * MAIN
 */
export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUserRecord();

    if (!currentUser?.session.accessToken) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const originError = validateTrustedOrigin(request);
    if (originError) return originError;

    const ownerId = currentUser.user.id;

    const rateLimitError = enforceRateLimit({
      key: `gmail:sync:${ownerId}`,
      limit: 10,
      windowMs: 5 * 60_000,
    });
    if (rateLimitError) return rateLimitError;

    const query = encodeURIComponent(
      '(application OR "thank you for applying" OR "application submitted" OR "your application was sent")'
    );

    const listRes = await fetch(
      `https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=50&q=${query}`,
      {
        headers: {
          Authorization: `Bearer ${currentUser.session.accessToken}`,
        },
        cache: "no-store",
      }
    );

    if (!listRes.ok) {
      return NextResponse.json(
        { error: "Gmail sync failed." },
        { status: 502 },
      );
    }

    const listData = (await listRes.json()) as GmailListResponse;

    const messages = await Promise.all(
      (listData.messages ?? []).map(async (m) => {
        const res = await fetch(
          `https://www.googleapis.com/gmail/v1/users/me/messages/${m.id}`,
          {
            headers: {
              Authorization: `Bearer ${currentUser.session.accessToken}`,
            },
            cache: "no-store",
          }
        );
        return res.json();
      })
    );

    const parsed = await Promise.all(
      messages.map(async (message: GmailMessage) => {
        if (!message.id) return null;

        const headers = message.payload?.headers ?? [];
        const subject = extractHeader(headers, "Subject");
        const from = extractHeader(headers, "From");
        const snippet = message.snippet ?? "";

        // 🔥 FILTERS
        if (isJobAlert(subject, snippet)) return null;
        if (!isRealApplicationEmail(subject, snippet)) return null;

        const source = detectSource(from);

        let company = "Unknown";
        let role = "Unknown Role";

        // provider parsing
        if (source === "indeed") {
          const p = parseIndeedEmail(subject, snippet);
          company = p.company;
          role = p.role;
        } else if (source === "linkedin") {
          const p = parseLinkedInEmail(subject, snippet);
          company = p.company;
          role = p.role;
        } else if (source === "workday") {
          const p = parseWorkdayEmail(subject);
          company = p.company;
          role = p.role;
        }

        // fallback
        if (company === "Unknown") {
          company = extractCompany(from, subject);
        }

        if (role === "Unknown Role") {
          role = extractRole(subject, snippet);
        }

        const existingApp = await prisma.application.findFirst({
          where: {
            ownerId,
            gmailId: message.id,
          },
        });

        if (existingApp) return null;

        const status = detectStatus(`${subject} ${from} ${snippet}`.toLowerCase());
        const score = calculateAccuracyScore({
          source,
          subject,
          snippet,
          company,
          role,
        });
        const sourceLabel = source === "unknown" ? "Email" : capitalize(source);

        const imported = await prisma.importedEmail.upsert({
          where: {
            ownerId_gmailId: {
              ownerId,
              gmailId: message.id,
            },
          },
          update: {
            subject,
            from,
            snippet,
            company,
            role,
            source: sourceLabel,
            status,
            score,
          },
          create: {
            gmailId: message.id,
            subject,
            from,
            snippet,
            company,
            role,
            source: sourceLabel,
            status,
            score,
            ownerId,
          },
        });

        return imported;
      })
    );

    return NextResponse.json(parsed.filter(Boolean));
  } catch {
    return NextResponse.json(
      {
        error: "Gmail sync failed.",
      },
      { status: 500 }
    );
  }
}