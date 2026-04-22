import { NextResponse } from "next/server";

import { handleRouteError } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      status: "ok",
      database: "up",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    handleRouteError(error, {
      label: "health.check",
      fallbackMessage: "Health check failed.",
      fallbackCode: "health_check_failed",
      fallbackStatus: 503,
    });

    return NextResponse.json(
      {
        status: "degraded",
        database: "down",
        code: "database_unavailable",
      },
      { status: 503 },
    );
  }
}
