import "dotenv/config";
import { PrismaClient } from "@prisma/client";

if (
  (!process.env.DATABASE_URL || process.env.DATABASE_URL === '""') &&
  process.env.DATABASE_URL_UNPOOLED
) {
  process.env.DATABASE_URL = process.env.DATABASE_URL_UNPOOLED.replace(/^"|"$/g, "");
}

const prisma = new PrismaClient();

function getArg(flag) {
  const index = process.argv.indexOf(flag);

  if (index === -1) {
    return null;
  }

  return process.argv[index + 1] ?? null;
}

async function getRequiredUser(email, label) {
  const normalizedEmail = email?.trim().toLowerCase();

  if (!normalizedEmail) {
    throw new Error(`Missing ${label}. Use ${label === "source email" ? "--from" : "--to"} user@example.com.`);
  }

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true, email: true },
  });

  if (!user) {
    throw new Error(`No user found for ${normalizedEmail}.`);
  }

  return user;
}

async function main() {
  const fromArg = getArg("--from");
  const toArg = getArg("--to");
  const apply = process.argv.includes("--apply");

  const fromUser = await getRequiredUser(fromArg, "source email");
  const toUser = await getRequiredUser(toArg, "target email");

  if (fromUser.id === toUser.id) {
    throw new Error("Source and target users must be different.");
  }

  const counts = {
    companies: await prisma.company.count({ where: { ownerId: fromUser.id } }),
    resumes: await prisma.resume.count({ where: { ownerId: fromUser.id } }),
    applications: await prisma.application.count({ where: { ownerId: fromUser.id } }),
    importedEmails: await prisma.importedEmail.count({ where: { ownerId: fromUser.id } }),
  };

  if (!apply) {
    console.log(JSON.stringify({
      mode: "dry-run",
      from: fromUser.email,
      to: toUser.email,
      moving: counts,
      nextStep: "Re-run with --apply to perform the reassignment.",
    }, null, 2));
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.company.updateMany({
      where: { ownerId: fromUser.id },
      data: { ownerId: toUser.id },
    });

    await tx.resume.updateMany({
      where: { ownerId: fromUser.id },
      data: { ownerId: toUser.id },
    });

    await tx.application.updateMany({
      where: { ownerId: fromUser.id },
      data: { ownerId: toUser.id },
    });

    await tx.importedEmail.updateMany({
      where: { ownerId: fromUser.id },
      data: { ownerId: toUser.id },
    });
  });

  console.log(JSON.stringify({
    mode: "applied",
    from: fromUser.email,
    to: toUser.email,
    moved: counts,
  }, null, 2));
}

main()
  .catch((error) => {
    console.error(error.message || error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });