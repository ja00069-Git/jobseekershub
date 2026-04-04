import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/index.js";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const sampleApplications = [
  {
    company: "Stripe",
    role: "Backend Engineer",
    status: "applied",
    location: "Remote",
    salary: 180000,
    dateApplied: new Date("2026-04-03"),
    notes: "Strong fit for distributed systems and API infrastructure.",
  },
  {
    company: "Notion",
    role: "Full Stack Engineer",
    status: "interview",
    location: "San Francisco, CA",
    salary: 175000,
    dateApplied: new Date("2026-03-28"),
    notes: "Recruiter screen completed; awaiting technical round.",
  },
  {
    company: "Vercel",
    role: "Developer Experience Engineer",
    status: "phone",
    location: "Remote",
    salary: 165000,
    dateApplied: new Date("2026-03-25"),
    notes: "Strong alignment with frontend platform and DX work.",
  },
  {
    company: "Linear",
    role: "Product Engineer",
    status: "wishlist",
    location: "Remote",
    salary: 170000,
    dateApplied: new Date("2026-03-20"),
    notes: "Target company for next outreach wave.",
  },
  {
    company: "OpenAI",
    role: "Software Engineer",
    status: "offer",
    location: "San Francisco, CA",
    salary: 220000,
    dateApplied: new Date("2026-03-10"),
    notes: "Offer received; comparing package and timing.",
  },
];

async function main() {
  let createdCount = 0;
  let updatedCount = 0;

  for (const application of sampleApplications) {
    const existingApplication = await prisma.application.findFirst({
      where: {
        company: application.company,
        role: application.role,
        dateApplied: application.dateApplied,
      },
    });

    if (existingApplication) {
      await prisma.application.update({
        where: { id: existingApplication.id },
        data: application,
      });
      updatedCount += 1;
      continue;
    }

    await prisma.application.create({
      data: application,
    });
    createdCount += 1;
  }

  const count = await prisma.application.count();
  console.log(
    `Seeded sample applications. Created: ${createdCount}, updated: ${updatedCount}, total records: ${count}`,
  );
}

main()
  .catch((error) => {
    console.error("Failed to seed sample data:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
