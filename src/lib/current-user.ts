import { Prisma } from "@prisma/client";
import { getServerSession, type Session } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type CurrentUserContext = {
  session: Session;
  user: {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
  };
};

const globalForUserAdoption = globalThis as {
  __jobHuntDatabaseWarningShown?: boolean;
};

function isDatabaseUnavailableError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  return (
    error instanceof Prisma.PrismaClientInitializationError ||
    error.message.includes("User was denied access on the database") ||
    error.message.includes("Can't reach database server")
  );
}

function logDatabaseWarning(error: Error) {
  if (globalForUserAdoption.__jobHuntDatabaseWarningShown) {
    return;
  }

  globalForUserAdoption.__jobHuntDatabaseWarningShown = true;
  console.error(
    "Database access is unavailable. Falling back to an empty user context until DATABASE_URL credentials are fixed.",
    error,
  );
}

export async function getCurrentUserRecord(): Promise<CurrentUserContext | null> {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.trim().toLowerCase();

  if (!session?.user || !email) {
    return null;
  }

  try {
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name: session.user.name ?? null,
        image: session.user.image ?? null,
      },
      create: {
        email,
        name: session.user.name ?? null,
        image: session.user.image ?? null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
      },
    });

    return {
      session,
      user,
    };
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      logDatabaseWarning(error as Error);
      return null;
    }

    throw error;
  }
}
