import { getCurrentUserRecord } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

export type DashboardApplication = {
  id: string;
  company: string;
  role: string;
  status: string;
  createdAt: string;
};

export async function getApplications(): Promise<DashboardApplication[]> {
  const currentUser = await getCurrentUserRecord();

  if (!currentUser) {
    return [];
  }

  const applications = await prisma.application.findMany({
    where: { ownerId: currentUser.user.id },
    select: {
      id: true,
      company: true,
      role: true,
      status: true,
      createdAt: true,
    },
    orderBy: [{ createdAt: "desc" }],
  });

  return applications.map((application) => ({
    id: application.id,
    company: application.company,
    role: application.role,
    status: application.status,
    createdAt: application.createdAt.toISOString(),
  }));
}

export function getDashboardStats(applications: DashboardApplication[]) {
  return [
    {
      label: "Total tracked",
      value: applications.length,
    },
    {
      label: "Active pipeline",
      value: applications.filter(
        (application) =>
          !["offer", "rejected", "withdrawn"].includes(application.status),
      ).length,
    },
    {
      label: "Interviewing",
      value: applications.filter(
        (application) => application.status === "interview",
      ).length,
    },
    {
      label: "Offers",
      value: applications.filter((application) => application.status === "offer")
        .length,
    },
  ];
}

export async function getPendingImportsCount() {
  const currentUser = await getCurrentUserRecord();

  if (!currentUser) {
    return 0;
  }

  return prisma.importedEmail.count({
    where: {
      reviewed: false,
      ownerId: currentUser.user.id,
    },
  });
}
