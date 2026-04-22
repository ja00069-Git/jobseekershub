import "dotenv/config";
import { PrismaClient } from "@prisma/client";

if (
  (!process.env.DATABASE_URL || process.env.DATABASE_URL === '""') &&
  process.env.DATABASE_URL_UNPOOLED
) {
  process.env.DATABASE_URL = process.env.DATABASE_URL_UNPOOLED.replace(/^"|"$/g, "");
}

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    orderBy: { email: "asc" },
    select: {
      id: true,
      email: true,
      _count: {
        select: {
          companies: true,
          resumes: true,
          applications: true,
          importedEmails: true,
        },
      },
    },
  });

  const orphanCounts = await prisma.$queryRaw`
    select
      (select count(*)::int from "Company" where "ownerId" is null) as companies,
      (select count(*)::int from "Resume" where "ownerId" is null) as resumes,
      (select count(*)::int from "Application" where "ownerId" is null) as applications,
      (select count(*)::int from "ImportedEmail" where "ownerId" is null) as "importedEmails"
  `;

  const orphanSummary = Array.isArray(orphanCounts) ? orphanCounts[0] : orphanCounts;

  console.log(JSON.stringify({
    users: users.map((user) => ({
      email: user.email,
      companies: user._count.companies,
      resumes: user._count.resumes,
      applications: user._count.applications,
      importedEmails: user._count.importedEmails,
    })),
    orphans: {
      companies: orphanSummary.companies,
      resumes: orphanSummary.resumes,
      applications: orphanSummary.applications,
      importedEmails: orphanSummary.importedEmails,
    },
  }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });