import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return NextResponse.json(
      { error: "Unauthorized. Sign in with Google first." },
      { status: 401 },
    );
  }

  const listResponse = await fetch(
    "https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=5",
    {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      cache: "no-store",
    },
  );

  const listData = (await listResponse.json()) as {
    messages?: Array<{ id: string }>;
    error?: unknown;
  };

  if (!listResponse.ok) {
    return NextResponse.json(listData, { status: listResponse.status });
  }

  const messages = await Promise.all(
    (listData.messages ?? []).map(async (message) => {
      const response = await fetch(
        `https://www.googleapis.com/gmail/v1/users/me/messages/${message.id}`,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
          cache: "no-store",
        },
      );

      return response.json();
    }),
  );

  function extractHeader(
    headers: Array<{ name?: string; value?: string }>,
    name: string,
  ) {
    return headers.find((header) => header.name === name)?.value || "";
  }

  function detectJobEmail(subject: string) {
    const normalizedSubject = subject.toLowerCase();

    if (normalizedSubject.includes("interview")) return "interview";
    if (normalizedSubject.includes("offer")) return "offer";
    if (normalizedSubject.includes("application received")) return "applied";
    if (normalizedSubject.includes("rejected")) return "rejected";

    return null;
  }

  const parsed = messages.map((message: {
    id?: string;
    snippet?: string;
    payload?: { headers?: Array<{ name?: string; value?: string }> };
  }) => {
    const headers = message.payload?.headers ?? [];
    const subject = extractHeader(headers, "Subject");

    return {
      id: message.id,
      subject,
      from: extractHeader(headers, "From"),
      snippet: message.snippet ?? "",
      detectedStatus: detectJobEmail(subject),
    };
  });

  return NextResponse.json(parsed);
}
