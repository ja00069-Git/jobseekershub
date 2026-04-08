import { prisma } from "@/lib/prisma";

export type DashboardApplication = {
  id: string;
  company: string;
  role: string;
  status: string;
  location: string | null;
  createdAt: string;
};

export async function getApplications(): Promise<DashboardApplication[]> {
  const applications = await prisma.application.findMany({
    orderBy: [{ createdAt: "desc" }],
  });

  return applications.map((application) => ({
    id: application.id,
    company: application.company,
    role: application.role,
    status: application.status,
    location: application.location,
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
      value: applications.filter((application) =>
        ["phone", "interview"].includes(application.status),
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
  return prisma.importedEmail.count({
    where: { reviewed: false },
  });
}
