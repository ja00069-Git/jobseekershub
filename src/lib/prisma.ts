import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma";

const globalForPrisma = globalThis as {
  prisma?: PrismaClient;
};

const createPrismaClient = () => {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  return new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });
};

const hasExpectedModels = (
  client: PrismaClient | undefined,
): client is PrismaClient => {
  if (!client) {
    return false;
  }

  const prismaWithModels = client as PrismaClient & {
    importedEmail?: unknown;
    company?: unknown;
    resume?: unknown;
  };

  return (
    typeof client.application !== "undefined" &&
    typeof prismaWithModels.importedEmail !== "undefined" &&
    typeof prismaWithModels.company !== "undefined" &&
    typeof prismaWithModels.resume !== "undefined"
  );
};

const prismaClient = hasExpectedModels(globalForPrisma.prisma)
  ? globalForPrisma.prisma
  : createPrismaClient();

export const prisma: PrismaClient = prismaClient;

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}